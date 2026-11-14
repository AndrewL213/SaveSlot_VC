// api/xbox/_xbox.js · Piezas compartidas de Xbox (empieza con "_": Vercel no la publica como dirección).
// La usan api/xbox/auth.js (vincular y desvincular) y api/xbox/data.js (juegos y logros).
//
// Cómo se llega a los datos de Xbox (Xbox Live):
//   1) Cuenta de Microsoft (OAuth, aplicación "SaveSlot" de Azure, solo cuentas personales)
//      → access_token y refresh_token con el permiso XboxLive.signin.
//   2) user.auth.xboxlive.com: el access_token se cambia por un token de Xbox Live.
//   3) xsts.auth.xboxlive.com: ese token se cambia por el XSTS, que trae el gamertag, el número
//      de la cuenta (xuid) y lo que va en la cabecera "XBL3.0 x=<uhs>;<token>" de cada consulta.
// El refresh_token se guarda en la tabla usuarios_xbox (solo el servidor la ve), para volver a pedir
// los datos sin pedirle a la persona que entre otra vez.
//
// Variables de entorno en Vercel: XBOX_CLIENT_SECRET (el secret de la aplicación de Azure) y
// SUPABASE_SERVICE_ROLE_KEY. El Client ID (Application ID) es público.

const crypto = require("crypto");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzshrfiezzysbkzdsjzf.supabase.co";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const CLIENT_ID = process.env.XBOX_CLIENT_ID || "dd86ff2c-7da5-4275-9175-c1a3433dd380";
const CLIENT_SECRET = process.env.XBOX_CLIENT_SECRET;
const MS_AUTORIZAR = "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";
const MS_TOKEN = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
const PERMISOS = "XboxLive.signin offline_access";

function falta() {
  return [!SERVICE_ROLE && "SUPABASE_SERVICE_ROLE_KEY", !CLIENT_SECRET && "XBOX_CLIENT_SECRET"].filter(Boolean);
}

/* ---------- Datos firmados (permiso para vincular y estado de la vuelta) ---------- */
const firmar = (texto) => crypto.createHmac("sha256", SERVICE_ROLE).update(texto).digest("base64url");
function empacar(datos) {
  const base = Buffer.from(JSON.stringify(Object.assign({ e: Date.now() + 10 * 60 * 1000 }, datos))).toString("base64url");
  return `${base}.${firmar(base)}`;
}
function desempacar(texto) {
  const [base, firma] = String(texto || "").split(".");
  if (!base || !firma) return null;
  const a = Buffer.from(firmar(base)), b = Buffer.from(firma);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  const datos = JSON.parse(Buffer.from(base, "base64url").toString("utf8"));
  return datos.e > Date.now() ? datos : null;
}

/* ---------- Supabase (con la llave secreta del servidor) ---------- */
const cabeceras = (extra) => Object.assign({ apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json" }, extra);

async function cuentaDeLaSesion(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${token}` } }).catch(() => null);
  const u = r && r.ok ? await r.json() : null;
  return u && u.id && !u.is_anonymous ? u : null;
}

async function rest(ruta, opciones = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${ruta}`, Object.assign({ headers: cabeceras(opciones.extra) }, opciones));
  if (!r.ok) throw new Error(`Supabase ${ruta.split("?")[0]} ${r.status}: ${await r.text()}`);
  return r.status === 204 ? null : r.json().catch(() => null);
}

const leerVinculo = async (idCuenta) => ((await rest(`usuarios_xbox?id=eq.${idCuenta}&select=*`)) || [])[0] || null;
const vinculoDeXuid = async (xuid) => ((await rest(`usuarios_xbox?xuid=eq.${encodeURIComponent(xuid)}&select=id`)) || [])[0] || null;
function guardarVinculo(fila) {
  return rest("usuarios_xbox?on_conflict=id", {
    method: "POST", body: JSON.stringify(fila),
    extra: { Prefer: "resolution=merge-duplicates,return=minimal" },
  });
}

/* ---------- Microsoft y Xbox Live ---------- */
async function pedirTokenMicrosoft(params) {
  const r = await fetch(MS_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(Object.assign({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, scope: PERMISOS }, params)).toString(),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok || !d.access_token) throw new Error(`Microsoft token ${r.status}: ${d.error || ""} ${d.error_description || ""}`.slice(0, 300));
  return d; // { access_token, refresh_token, ... }
}

// access_token de Microsoft → token XSTS de Xbox Live, con gamertag y xuid
async function xstsDesde(accessToken) {
  const r1 = await fetch("https://user.auth.xboxlive.com/user/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "x-xbl-contract-version": "1" },
    body: JSON.stringify({
      RelyingParty: "http://auth.xboxlive.com", TokenType: "JWT",
      Properties: { AuthMethod: "RPS", SiteName: "user.auth.xboxlive.com", RpsTicket: `d=${accessToken}` },
    }),
  });
  const usuario = await r1.json().catch(() => ({}));
  if (!r1.ok || !usuario.Token) throw new Error(`Xbox user ${r1.status}`);
  const r2 = await fetch("https://xsts.auth.xboxlive.com/xsts/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", "x-xbl-contract-version": "1" },
    body: JSON.stringify({ RelyingParty: "http://xboxlive.com", TokenType: "JWT", Properties: { SandboxId: "RETAIL", UserTokens: [usuario.Token] } }),
  });
  const xsts = await r2.json().catch(() => ({}));
  if (!r2.ok || !xsts.Token) {
    // XErr 2148916233: la cuenta de Microsoft no tiene perfil de Xbox; 2148916238: cuenta de menor sin permiso
    const error = new Error(`Xbox XSTS ${r2.status} ${xsts.XErr || ""}`);
    error.sinPerfil = String(xsts.XErr) === "2148916233";
    throw error;
  }
  const yo = (xsts.DisplayClaims && xsts.DisplayClaims.xui && xsts.DisplayClaims.xui[0]) || {};
  return { token: xsts.Token, uhs: yo.uhs, xuid: yo.xid, gamertag: yo.gtg };
}

// Consulta a un servicio de Xbox Live con el XSTS
async function xbox(xsts, url, version) {
  const r = await fetch(url, {
    headers: {
      Authorization: `XBL3.0 x=${xsts.uhs};${xsts.token}`,
      "x-xbl-contract-version": String(version || 2),
      Accept: "application/json", "Accept-Language": "es-CO",
    },
  });
  if (!r.ok) throw new Error(`Xbox ${url.split("?")[0]} ${r.status}`);
  return r.json();
}

module.exports = {
  CLIENT_ID, MS_AUTORIZAR, PERMISOS, falta, empacar, desempacar, cuentaDeLaSesion, rest,
  leerVinculo, vinculoDeXuid, guardarVinculo, pedirTokenMicrosoft, xstsDesde, xbox,
};

// api/_psn.js · Piezas de PlayStation (empieza con "_": Vercel no la publica como dirección). La usa api/playstation.js.
//
// PlayStation no tiene una API pública ni un "Iniciar sesión con PlayStation" para otras webs. Se usa la
// librería psn-api (no oficial, https://www.npmjs.com/package/psn-api), que entra a PlayStation Network con
// el NPSSO de una cuenta de PSN creada solo para SaveSlot (variable de entorno PSN_NPSSO en Vercel; es como
// una contraseña y vence cada ~2 meses: hay que volver a pegarlo). Con esa cuenta se leen los trofeos
// PÚBLICOS de cualquier persona por su ID de PSN.
//
// Para que nadie vincule el ID de otra persona, se pide poner un código de SaveSlot en el «Sobre mí»
// del perfil de PSN (api/playstation.js lo revisa). Después se puede quitar.
//
// Variables de entorno en Vercel: PSN_NPSSO y SUPABASE_SERVICE_ROLE_KEY.

const crypto = require("crypto");
const psn = require("psn-api");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzshrfiezzysbkzdsjzf.supabase.co";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NPSSO = process.env.PSN_NPSSO;

function falta() {
  return [!SERVICE_ROLE && "SUPABASE_SERVICE_ROLE_KEY", !NPSSO && "PSN_NPSSO"].filter(Boolean);
}

/* ---------- Permiso de PlayStation Network (se guarda mientras la función siga encendida) ---------- */
let permiso = null; // { accessToken, refreshToken, vence, refrescoVence }
async function autorizacion() {
  const ahora = Date.now();
  if (permiso && ahora < permiso.vence) return { accessToken: permiso.accessToken };
  let tokens;
  if (permiso && ahora < permiso.refrescoVence) {
    tokens = await psn.exchangeRefreshTokenForAuthTokens(permiso.refreshToken).catch(() => null);
  }
  if (!tokens) {
    let codigo;
    try {
      codigo = await psn.exchangeNpssoForAccessCode(NPSSO);
    } catch (e) {
      const error = new Error("El NPSSO de PlayStation venció o no es válido: hay que pegar uno nuevo en Vercel (PSN_NPSSO).");
      error.npsso = true;
      throw error;
    }
    tokens = await psn.exchangeAccessCodeForAuthTokens(codigo);
  }
  permiso = {
    accessToken: tokens.accessToken, refreshToken: tokens.refreshToken,
    vence: ahora + (tokens.expiresIn - 60) * 1000,
    refrescoVence: ahora + (tokens.refreshTokenExpiresIn - 60) * 1000,
  };
  return { accessToken: permiso.accessToken };
}

// El perfil público de un ID de PSN (o null si no existe)
async function perfilDe(onlineId) {
  const auth = await autorizacion();
  const r = await psn.getProfileFromUserName(auth, onlineId).catch((e) => {
    if (/not found|404|2105356/i.test(String(e && e.message))) return null;
    throw e;
  });
  return r && r.profile ? r.profile : null;
}

/* ---------- Código para el «Sobre mí» (prueba que el ID de PSN es tuyo) ---------- */
// Siempre el mismo para la misma cuenta de SaveSlot y el mismo ID de PSN: "SAVESLOT-7F3K2Q"
function codigoDe(idCuenta, onlineId) {
  const firma = crypto.createHmac("sha256", SERVICE_ROLE).update(`${idCuenta}:${String(onlineId).toLowerCase()}`).digest("hex");
  return "SAVESLOT-" + firma.slice(0, 6).toUpperCase();
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

const leerVinculo = async (idCuenta) => ((await rest(`usuarios_playstation?id=eq.${idCuenta}&select=*`)) || [])[0] || null;
const vinculoDeCuentaPsn = async (accountId) => ((await rest(`usuarios_playstation?account_id=eq.${encodeURIComponent(accountId)}&select=id`)) || [])[0] || null;
function guardarVinculo(fila) {
  return rest("usuarios_playstation?on_conflict=id", {
    method: "POST", body: JSON.stringify(fila),
    extra: { Prefer: "resolution=merge-duplicates,return=minimal" },
  });
}
// La fila de usuarios (el perfil de SaveSlot) de una cuenta
const filaUsuario = async (idCuenta) => ((await rest(`usuarios?auth_id=eq.${idCuenta}&select=id`)) || [])[0] || null;

module.exports = {
  psn, falta, autorizacion, perfilDe, codigoDe, cuentaDeLaSesion, rest,
  leerVinculo, vinculoDeCuentaPsn, guardarVinculo, filaUsuario,
};

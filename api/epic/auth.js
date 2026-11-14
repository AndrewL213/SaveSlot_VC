// /api/epic/auth — Entrar con Epic Games y vincularlo a una cuenta de SaveSlot (igual que api/steam/auth.js)
//
// Epic no funciona con los proveedores propios de Supabase (pide el Client ID y el secret en una cabecera
// que Supabase no manda), así que esta función habla con Epic directamente y después abre la sesión de Supabase.
//
// Entrar:
//   1) /api/epic/auth?action=login&redirect_to=https://saveslot-pi.vercel.app/pages/perfil.html?epic=1
//   2) Epic pide permiso y vuelve aquí mismo con ?code=…&state=…
//   3) Se cambia el code por el token (con la cabecera Basic que Epic exige) y se lee el nombre de la cuenta.
//   4) Si esa cuenta de Epic ya está en una cuenta de SaveSlot (tabla usuarios_epic), se abre esa;
//      si no, se crea una cuenta nueva (correo interno epic-<id>@saveslot.invalid).
//   5) Vuelve a redirect_to con ?token_hash=… y la app abre la sesión (supabase.auth.verifyOtp).
// Vincular Epic a la cuenta abierta:
//   POST ?action=preparar con "Authorization: Bearer <sesión>" → { estado } (firmado, vale 10 minutos)
//   y después ?action=login&vincular=<estado>: Epic se guarda en ESA cuenta y vuelve con ?vinculada=1
//   (o ?error=epic_en_otra_cuenta si esa cuenta de Epic ya es de otra cuenta de SaveSlot).
// Desvincular: POST ?action=desvincular con la sesión.
//
// Variables de entorno en Vercel: EPIC_CLIENT_SECRET (el secret del cliente "SaveSlot" del portal de Epic)
// y SUPABASE_SERVICE_ROLE_KEY. El Client ID es público. En el portal de Epic, la dirección de regreso
// del cliente debe ser exactamente https://saveslot-pi.vercel.app/api/epic/auth

const crypto = require("crypto");

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzshrfiezzysbkzdsjzf.supabase.co";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EPIC_ID = process.env.EPIC_CLIENT_ID || "xyza78918IL9n7gQlFiZU9EYjR6sLLD1";
const EPIC_SECRET = process.env.EPIC_CLIENT_SECRET;
const EPIC_AUTORIZAR = "https://www.epicgames.com/id/authorize";
const EPIC_TOKEN = "https://api.epicgames.dev/epic/oauth/v2/token";
const EPIC_CUENTAS = "https://api.epicgames.dev/epic/id/v2/accounts";
const ALLOWED_REDIRECTS = (process.env.ALLOWED_REDIRECTS || "https://saveslot-pi.vercel.app")
  .split(",").map((s) => s.trim()).filter(Boolean);
const DIEZ_MINUTOS = 10 * 60 * 1000;

// Solo se vuelve a páginas de la app (o a localhost para probar)
function permitido(url) {
  try {
    const u = new URL(url);
    if (["localhost", "127.0.0.1"].includes(u.hostname)) return true;
    return ALLOWED_REDIRECTS.some((a) => new URL(a).origin === u.origin);
  } catch { return false; }
}

// Datos firmados con la llave secreta (que nunca sale del servidor): nadie los puede inventar ni cambiar
const firmar = (texto) => crypto.createHmac("sha256", SERVICE_ROLE).update(texto).digest("base64url");
function empacar(datos) {
  const base = Buffer.from(JSON.stringify(Object.assign({ e: Date.now() + DIEZ_MINUTOS }, datos))).toString("base64url");
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

const cabecerasAdmin = (extra) => Object.assign({ apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json" }, extra);
async function gotrue(ruta, cuerpo, metodo = "POST") {
  const r = await fetch(`${SUPABASE_URL}/auth/v1${ruta}`, {
    method: metodo, headers: cabecerasAdmin(), body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  return { ok: r.ok, status: r.status, data: await r.json().catch(() => ({})) };
}

// Fila de usuarios_epic con esa cuenta de Epic (o null)
async function filaEpic(epicId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_epic?epic_id=eq.${encodeURIComponent(epicId)}&select=id`, { headers: cabecerasAdmin() }).catch(() => null);
  const filas = r && r.ok ? await r.json() : [];
  return filas[0] || null;
}
async function anotarEpic(idUsuario, epicId, nombre) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_epic?on_conflict=id`, {
    method: "POST",
    headers: cabecerasAdmin({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify({ id: idUsuario, epic_id: epicId, epic_nombre: nombre, sincronizado_el: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`usuarios_epic ${r.status}: ${await r.text()}`);
}

// La cuenta de Supabase de quien manda "Authorization: Bearer <sesión>" (o null)
async function cuentaDeLaSesion(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer /, "");
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${token}` } }).catch(() => null);
  const u = r && r.ok ? await r.json() : null;
  return u && u.id && !u.is_anonymous ? u : null;
}

function json(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}
function ir(res, a) { res.statusCode = 302; res.setHeader("Location", a); res.end(); }
function volver(res, destino, params) {
  const u = new URL(destino);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  ir(res, u.toString());
}

module.exports = async function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const url = new URL(req.url, `${proto}://${host}`);
  const miDireccion = `${url.origin}${url.pathname}`; // la dirección de regreso registrada en Epic
  const accion = url.searchParams.get("action");

  if (!SERVICE_ROLE || !EPIC_SECRET) {
    console.error("Faltan variables de entorno: " + [!SERVICE_ROLE && "SUPABASE_SERVICE_ROLE_KEY", !EPIC_SECRET && "EPIC_CLIENT_SECRET"].filter(Boolean).join(", "));
    return json(res, 500, { error: "Epic Games no está configurado en el servidor" });
  }

  // 0) Permiso para vincular Epic a la cuenta abierta
  if (accion === "preparar") {
    const cuenta = req.method === "POST" ? await cuentaDeLaSesion(req) : null;
    if (!cuenta) return json(res, 401, { error: "Inicia sesión para vincular Epic Games" });
    return json(res, 200, { estado: empacar({ u: cuenta.id }) });
  }

  // Desvincular Epic de la cuenta abierta (si la cuenta se creó con Epic, no se puede: sería su única forma de entrar)
  if (accion === "desvincular") {
    const cuenta = req.method === "POST" ? await cuentaDeLaSesion(req) : null;
    if (!cuenta) return json(res, 401, { error: "Inicia sesión" });
    if (/^epic-.*@saveslot\.invalid$/.test(cuenta.email || "")) return json(res, 400, { error: "Esta cuenta se creó con Epic Games: es su única forma de entrar" });
    await fetch(`${SUPABASE_URL}/rest/v1/usuarios_epic?id=eq.${cuenta.id}`, { method: "DELETE", headers: cabecerasAdmin() });
    const cambio = await gotrue(`/admin/users/${cuenta.id}`, { app_metadata: { epic_id: null } }, "PUT");
    return cambio.ok ? json(res, 200, { listo: true }) : json(res, 502, { error: "No se pudo desvincular" });
  }

  // 1) Mandar a la persona a Epic
  if (accion === "login") {
    const destino = url.searchParams.get("redirect_to");
    if (!permitido(destino)) return json(res, 400, { error: "redirect_to no permitido" });
    let u = null;
    if (url.searchParams.get("vincular")) {
      const permiso = desempacar(url.searchParams.get("vincular"));
      if (!permiso || !permiso.u) return volver(res, destino, { error: "vinculo_vencido" });
      u = permiso.u;
    }
    const p = new URLSearchParams({
      client_id: EPIC_ID, response_type: "code", scope: "basic_profile",
      redirect_uri: miDireccion, state: empacar({ r: destino, u }),
    });
    return ir(res, `${EPIC_AUTORIZAR}?${p}`);
  }

  // 2) Epic vuelve aquí con ?code=… (o ?error=… si la persona no dio permiso)
  const estado = desempacar(url.searchParams.get("state"));
  if (!estado || !permitido(estado.r)) return json(res, 400, { error: "Vuelta de Epic no válida o vencida. Inténtalo de nuevo." });
  if (url.searchParams.get("error")) return volver(res, estado.r, { error: url.searchParams.get("error") });
  const code = url.searchParams.get("code");
  if (!code) return volver(res, estado.r, { error: "sin_codigo" });

  try {
    // 3) El code por el token (Epic exige el Client ID y el secret en la cabecera Basic)
    const r = await fetch(EPIC_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${EPIC_ID}:${EPIC_SECRET}`).toString("base64"),
      },
      body: new URLSearchParams({ grant_type: "authorization_code", code, redirect_uri: miDireccion }).toString(),
    });
    const token = await r.json().catch(() => ({}));
    if (!r.ok || !token.access_token || !token.account_id) {
      throw new Error(`Epic token ${r.status}: ${token.errorCode || token.error || ""} ${token.errorMessage || token.error_description || ""}`);
    }
    const epicId = token.account_id;
    // El nombre visible de la cuenta de Epic
    const cuentas = await fetch(`${EPIC_CUENTAS}?accountId=${encodeURIComponent(epicId)}`, { headers: { Authorization: `Bearer ${token.access_token}` } })
      .then((x) => (x.ok ? x.json() : [])).catch(() => []);
    const nombre = (cuentas[0] && cuentas[0].displayName) || "Jugador de Epic";
    const yaEsta = await filaEpic(epicId);

    // 4a) Vincular a la cuenta abierta
    if (estado.u) {
      if (yaEsta && yaEsta.id !== estado.u) return volver(res, estado.r, { error: "epic_en_otra_cuenta" });
      const cambio = await gotrue(`/admin/users/${estado.u}`, { app_metadata: { epic_id: epicId }, user_metadata: { epic_nombre: nombre } }, "PUT");
      if (!cambio.ok) throw new Error(`Supabase updateUser ${cambio.status}`);
      await anotarEpic(estado.u, epicId, nombre);
      return volver(res, estado.r, { vinculada: "1" });
    }

    // 4b) Entrar: la cuenta que ya tiene este Epic, o una nueva
    let correo;
    if (yaEsta) {
      const cuenta = await gotrue(`/admin/users/${yaEsta.id}`, undefined, "GET");
      correo = cuenta.ok && cuenta.data && cuenta.data.email;
    }
    if (!correo) {
      correo = `epic-${epicId}@saveslot.invalid`; // correo interno: no se envía nada aquí
      const creada = await gotrue("/admin/users", {
        email: correo, email_confirm: true,
        app_metadata: { epic_id: epicId, providers: ["epic"] },
        user_metadata: { full_name: nombre, epic_nombre: nombre },
      });
      if (!creada.ok && !/already|registered|exists/i.test(JSON.stringify(creada.data))) {
        throw new Error(`Supabase createUser ${creada.status}: ${JSON.stringify(creada.data)}`);
      }
    }
    // 5) Token de un solo uso para abrir la sesión en la app
    const link = await gotrue("/admin/generate_link", { type: "magiclink", email: correo });
    const hashed = link.data && (link.data.hashed_token || (link.data.properties && link.data.properties.hashed_token));
    if (!link.ok || !hashed) throw new Error(`Supabase generateLink ${link.status}`);
    const idUsuario = (yaEsta && yaEsta.id) || link.data.id || (link.data.user && link.data.user.id);
    if (idUsuario && !yaEsta) await anotarEpic(idUsuario, epicId, nombre);
    return volver(res, estado.r, { token_hash: hashed, type: "magiclink" });
  } catch (e) {
    console.error("Entrar con Epic falló:", e.message);
    return volver(res, estado.r, { error: "epic_fallo" });
  }
};

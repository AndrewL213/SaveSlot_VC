// /api/steam/auth  — Login con Steam (OpenID 2.0) -> sesión de Supabase
// Reemplaza la edge function "steam-auth". Corre como Serverless Function de Vercel (Node).
//
// Flujo:
//   1) Front redirige a  /api/steam/auth?action=login&redirect_to=https://tu-sitio/auth/callback
//   2) Steam vuelve a    /api/steam/auth?action=callback&redirect_to=...&openid.*=...
//   3) Verificamos con Steam, creamos/buscamos el usuario en Supabase y generamos un magic link
//   4) Redirigimos al front con ?token_hash=...&type=magiclink -> el front llama supabase.auth.verifyOtp()
//
// Vincular Steam a una cuenta que ya existe (Google, Discord, Twitch o correo):
//   0) POST /api/steam/auth?action=preparar con "Authorization: Bearer <sesión>" -> { estado }
//      (el estado dice quién es la persona, vale 10 minutos y va firmado: nadie lo puede inventar)
//   1) /api/steam/auth?action=login&vincular=<estado>&redirect_to=...
//   3) En vez de crear otra cuenta, guarda el número de Steam en ESA cuenta y vuelve con ?vinculada=1.
//      Si esa cuenta de Steam ya está en otra cuenta de SaveSlot, vuelve con ?error=steam_en_otra_cuenta.
// Después, entrar con Steam abre la cuenta a la que se vinculó.
//
// Variables de entorno (Vercel > Settings > Environment Variables):
//   STEAM_API_KEY y SUPABASE_SERVICE_ROLE_KEY (o sb_secret_...). Opcionales: SUPABASE_URL, ALLOWED_REDIRECTS

const STEAM_OPENID = "https://steamcommunity.com/openid/login";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzshrfiezzysbkzdsjzf.supabase.co";
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const STEAM_API_KEY = process.env.STEAM_API_KEY;
// Lista separada por comas de orígenes permitidos para volver después del login
const ALLOWED_REDIRECTS = (process.env.ALLOWED_REDIRECTS || "https://saveslot-pi.vercel.app")
  .split(",").map((s) => s.trim()).filter(Boolean);

// Compara el origen exacto (evita trucos como https://saveslot-pi.vercel.app.otro.com).
// localhost y 127.0.0.1 se permiten en cualquier puerto para probar en local.
function isAllowed(url) {
  try {
    const u = new URL(url);
    if (["localhost", "127.0.0.1"].includes(u.hostname)) return true;
    return ALLOWED_REDIRECTS.some((a) => new URL(a).origin === u.origin);
  } catch { return false; }
}

const crypto = require("crypto");
const DIEZ_MINUTOS = 10 * 60 * 1000;

// Estado firmado "id.vence.firma" (la firma usa la llave secreta, que nunca sale del servidor)
function firmar(texto) {
  return crypto.createHmac("sha256", SERVICE_ROLE).update(texto).digest("base64url");
}
function crearEstado(idUsuario) {
  const base = `${idUsuario}.${Date.now() + DIEZ_MINUTOS}`;
  return `${base}.${firmar(base)}`;
}
// Devuelve el id de la cuenta si el estado es válido y no ha vencido; si no, null
function leerEstado(estado) {
  const partes = String(estado || "").split(".");
  if (partes.length !== 3) return null;
  const base = `${partes[0]}.${partes[1]}`;
  const esperada = Buffer.from(firmar(base));
  const recibida = Buffer.from(partes[2]);
  if (esperada.length !== recibida.length || !crypto.timingSafeEqual(esperada, recibida)) return null;
  if (Number(partes[1]) < Date.now()) return null;
  return /^[0-9a-f-]{36}$/i.test(partes[0]) ? partes[0] : null;
}

// Fila de usuarios_steam con ese número de Steam (o null)
async function filaSteam(steamId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/usuarios_steam?steam_id64=eq.${steamId}&select=id`, {
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
  }).catch(() => null);
  const filas = r && r.ok ? await r.json() : [];
  return filas[0] || null;
}

// Llamadas a la API admin de Supabase Auth sin dependencias
async function gotrue(path, body, method = "POST") {
  const r = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method,
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

// Crea o actualiza la fila de usuarios_steam de una cuenta
async function anotarSteam(idUsuario, steamId, player) {
  await fetch(`${SUPABASE_URL}/rest/v1/usuarios_steam?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}`, "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: idUsuario, steam_id64: steamId, steam_username: player.personaname ?? null,
      steam_avatar: player.avatarfull ?? null, sincronizado_el: new Date().toISOString(),
    }),
  }).catch((e) => console.error("usuarios_steam", e));
}

function redirect(res, to) {
  res.statusCode = 302;
  res.setHeader("Location", to);
  res.end();
}

function back(res, redirectTo, params) {
  const u = new URL(redirectTo);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  redirect(res, u.toString());
}

module.exports = async function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const url = new URL(req.url, `${proto}://${host}`);
  const selfUrl = `${url.origin}${url.pathname}`;

  const action = url.searchParams.get("action");
  const redirectTo = url.searchParams.get("redirect_to");

  // 0) Preparar la vinculación: confirma con Supabase quién tiene la sesión y devuelve el estado firmado
  if (action === "preparar") {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    const token = (req.headers.authorization || "").replace(/^Bearer /, "");
    const r = token ? await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${token}` } }).catch(() => null) : null;
    const user = r && r.ok ? await r.json() : null;
    if (req.method !== "POST" || !user?.id || user.is_anonymous) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: "Inicia sesión para vincular Steam" }));
    }
    return res.end(JSON.stringify({ estado: crearEstado(user.id) }));
  }

  if (!isAllowed(redirectTo)) {
    res.statusCode = 400;
    return res.end("redirect_to no permitido");
  }

  // 1) Mandar al usuario a Steam
  if (action === "login") {
    const vincular = url.searchParams.get("vincular");
    const returnTo = `${selfUrl}?action=callback&redirect_to=${encodeURIComponent(redirectTo)}` +
      (vincular ? `&vincular=${encodeURIComponent(vincular)}` : "");
    const p = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": returnTo,
      "openid.realm": url.origin,
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });
    return redirect(res, `${STEAM_OPENID}?${p}`);
  }

  // 2) Steam vuelve aquí
  if (action === "callback") {
    try {
      // Verificar la firma con Steam
      const verify = new URLSearchParams();
      for (const [k, v] of url.searchParams) if (k.startsWith("openid.")) verify.set(k, v);
      verify.set("openid.mode", "check_authentication");

      const check = await fetch(STEAM_OPENID, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: verify,
      }).then((r) => r.text());
      if (!check.includes("is_valid:true")) throw new Error("Firma OpenID inválida");

      const claimed = url.searchParams.get("openid.claimed_id") ?? "";
      const m = claimed.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d{17})$/);
      if (!m) throw new Error("SteamID no encontrado");
      const steamId = m[1];

      // Perfil público de Steam
      const sum = await fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`,
      ).then((r) => r.json()).catch(() => null);
      const player = sum?.response?.players?.[0] ?? {};

      // ¿Ya hay una cuenta de SaveSlot con esta cuenta de Steam?
      const yaEsta = await filaSteam(steamId);

      // Vincular a la cuenta que ya tiene sesión
      if (url.searchParams.get("vincular")) {
        const idCuenta = leerEstado(url.searchParams.get("vincular"));
        if (!idCuenta) throw new Error("vinculo_vencido");
        if (yaEsta && yaEsta.id !== idCuenta) return back(res, redirectTo, { error: "steam_en_otra_cuenta" });
        // app_metadata solo lo cambia el servidor; Supabase lo mezcla con lo que ya tenía
        const cambio = await gotrue(`/admin/users/${idCuenta}`, {
          app_metadata: { steam_id: steamId },
          user_metadata: { steam_nombre: player.personaname ?? null, steam_foto: player.avatarfull ?? null, steam_profile: player.profileurl ?? null },
        }, "PUT");
        if (!cambio.ok) throw new Error(`Supabase updateUser ${cambio.status}`);
        await anotarSteam(idCuenta, steamId, player);
        return back(res, redirectTo, { vinculada: "1" });
      }

      // Entrar: si Steam está vinculada a una cuenta (por ejemplo de Google), se abre esa cuenta
      if (yaEsta) {
        const cuenta = await gotrue(`/admin/users/${yaEsta.id}`, undefined, "GET");
        if (cuenta.ok && cuenta.data?.email && !/@saveslot\.invalid$/.test(cuenta.data.email)) {
          const link = await gotrue("/admin/generate_link", { type: "magiclink", email: cuenta.data.email });
          const hashed = link.data?.hashed_token ?? link.data?.properties?.hashed_token;
          if (!link.ok || !hashed) throw new Error(`Supabase generateLink ${link.status}`);
          await anotarSteam(yaEsta.id, steamId, player);
          return back(res, redirectTo, { token_hash: hashed, type: "magiclink" });
        }
      }

      // Email interno (no se envía nada a este correo)
      const email = `steam-${steamId}@saveslot.invalid`;

      // Crear usuario si no existe. app_metadata solo lo puede editar el servidor.
      const created = await gotrue("/admin/users", {
        email,
        email_confirm: true,
        app_metadata: { steam_id: steamId, providers: ["steam"] },
        user_metadata: {
          full_name: player.personaname ?? null,
          avatar_url: player.avatarfull ?? null,
          steam_profile: player.profileurl ?? null,
        },
      });
      const msg = JSON.stringify(created.data);
      if (!created.ok && !/already|registered|exists/i.test(msg)) {
        throw new Error(`Supabase createUser ${created.status}: ${msg}`);
      }

      // Token de un solo uso para iniciar sesión
      const link = await gotrue("/admin/generate_link", { type: "magiclink", email });
      const hashed = link.data?.hashed_token ?? link.data?.properties?.hashed_token;
      if (!link.ok || !hashed) throw new Error(`Supabase generateLink ${link.status}`);

      // Anota la cuenta en usuarios_steam: así las reseñas de Steam saben quién tiene cuenta en SaveSlot
      const idUsuario = link.data?.id ?? link.data?.user?.id ?? created.data?.id;
      if (idUsuario) await anotarSteam(idUsuario, steamId, player);

      return back(res, redirectTo, { token_hash: hashed, type: "magiclink" });
    } catch (e) {
      console.error(e);
      return back(res, redirectTo, { error: e.message });
    }
  }

  res.statusCode = 400;
  res.end("action inválida");
};

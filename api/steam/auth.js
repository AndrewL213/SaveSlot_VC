// /api/steam/auth  — Login con Steam (OpenID 2.0) -> sesión de Supabase
// Reemplaza la edge function "steam-auth". Corre como Serverless Function de Vercel (Node).
//
// Flujo:
//   1) Front redirige a  /api/steam/auth?action=login&redirect_to=https://tu-sitio/auth/callback
//   2) Steam vuelve a    /api/steam/auth?action=callback&redirect_to=...&openid.*=...
//   3) Verificamos con Steam, creamos/buscamos el usuario en Supabase y generamos un magic link
//   4) Redirigimos al front con ?token_hash=...&type=magiclink -> el front llama supabase.auth.verifyOtp()
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

// Llamadas a la API admin de Supabase Auth sin dependencias
async function gotrue(path, body) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method: "POST",
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
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

  if (!isAllowed(redirectTo)) {
    res.statusCode = 400;
    return res.end("redirect_to no permitido");
  }

  // 1) Mandar al usuario a Steam
  if (action === "login") {
    const returnTo = `${selfUrl}?action=callback&redirect_to=${encodeURIComponent(redirectTo)}`;
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
      if (idUsuario) {
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

      return back(res, redirectTo, { token_hash: hashed, type: "magiclink" });
    } catch (e) {
      console.error(e);
      return back(res, redirectTo, { error: e.message });
    }
  }

  res.statusCode = 400;
  res.end("action inválida");
};

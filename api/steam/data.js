// /api/steam/data — biblioteca, logros, estadísticas y perfil del usuario logueado
// Reemplaza la edge function "steam-data". Corre como Serverless Function de Vercel (Node).
//
// Uso desde el front (manda el token de la sesión de Supabase):
//   const { data: { session } } = await supabase.auth.getSession();
//   fetch("/api/steam/data", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
//     body: JSON.stringify({ action: "library" }),   // "profile" | "library" | "achievements" | "stats" (+ appid)
//   }).then(r => r.json());
//
// Variables de entorno: STEAM_API_KEY. Opcionales: SUPABASE_URL, SUPABASE_ANON_KEY

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzshrfiezzysbkzdsjzf.supabase.co";
// Clave pública (la misma de js/config.js)
const ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_jEY8jb8ffoEHueH1qxhwhg_W6Kl8Y20";
const KEY = process.env.STEAM_API_KEY;
const API = "https://api.steampowered.com";

function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

const steam = (path, params) => {
  const q = new URLSearchParams({ key: KEY, format: "json" });
  for (const [k, v] of Object.entries(params)) q.set(k, String(v));
  return fetch(`${API}/${path}?${q}`).then(async (r) => {
    if (!r.ok) throw new Error(`Steam ${r.status} (¿perfil o detalles de juego privados?)`);
    return r.json();
  });
};

// Valida el JWT de Supabase y devuelve el usuario
async function getUser(authHeader) {
  if (!authHeader) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: ANON_KEY, Authorization: authHeader },
  });
  return r.ok ? r.json() : null;
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  let raw = "";
  for await (const chunk of req) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

module.exports = async function handler(req, res) {
  // CORS (por si el front vive en otro dominio, ej. GitHub Pages)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  if (req.method === "OPTIONS") return json(res, "ok");

  const user = await getUser(req.headers.authorization);
  const steamid = user?.app_metadata?.steam_id;
  if (!steamid) return json(res, { error: "Usuario sin cuenta de Steam vinculada" }, 401);

  const { action, appid } = await readBody(req).catch(() => ({}));

  try {
    switch (action) {
      case "profile": {
        const [sum, recent] = await Promise.all([
          steam("ISteamUser/GetPlayerSummaries/v2/", { steamids: steamid }),
          steam("IPlayerService/GetRecentlyPlayedGames/v1/", { steamid, count: 5 }),
        ]);
        const p = sum.response.players[0];
        return json(res, {
          ...p,
          playing_now: p.gameextrainfo ? { name: p.gameextrainfo, appid: p.gameid } : null,
          recent_games: recent.response.games ?? [],
        });
      }

      case "library": {
        const d = await steam("IPlayerService/GetOwnedGames/v1/", {
          steamid, include_appinfo: 1, include_played_free_games: 1,
        });
        const games = (d.response.games ?? []).map((g) => ({
          appid: g.appid,
          name: g.name,
          hours: Math.round((g.playtime_forever / 60) * 10) / 10,
          last_played: g.rtime_last_played,
          cover: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/library_600x900.jpg`,
          header: `https://cdn.cloudflare.steamstatic.com/steam/apps/${g.appid}/header.jpg`,
        }));
        return json(res, { count: d.response.game_count ?? 0, games });
      }

      case "achievements": {
        if (!appid) return json(res, { error: "Falta appid" }, 400);
        const [player, schema] = await Promise.all([
          steam("ISteamUserStats/GetPlayerAchievements/v1/", { steamid, appid, l: "spanish" }),
          steam("ISteamUserStats/GetSchemaForGame/v2/", { appid, l: "spanish" }),
        ]);
        const defs = schema.game?.availableGameStats?.achievements ?? [];
        const unlocked = new Map((player.playerstats?.achievements ?? []).map((a) => [a.apiname, a]));
        const list = defs.map((d) => {
          const a = unlocked.get(d.name);
          return {
            id: d.name,
            name: d.displayName,
            description: d.description ?? null,
            hidden: !!d.hidden,
            achieved: a?.achieved === 1,
            unlock_time: a?.unlocktime || null,
            icon: a?.achieved === 1 ? d.icon : d.icongray,
          };
        });
        const done = list.filter((a) => a.achieved).length;
        return json(res, { appid, total: list.length, unlocked: done, achievements: list });
      }

      case "stats": {
        if (!appid) return json(res, { error: "Falta appid" }, 400);
        const d = await steam("ISteamUserStats/GetUserStatsForGame/v2/", { steamid, appid });
        return json(res, { appid, stats: d.playerstats?.stats ?? [] });
      }

      default:
        return json(res, { error: "action inválida" }, 400);
    }
  } catch (e) {
    return json(res, { error: e.message }, 502);
  }
};

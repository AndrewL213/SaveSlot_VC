// /api/steam/data — biblioteca, logros, estadísticas y perfil del usuario logueado
// Reemplaza la edge function "steam-data". Corre como Serverless Function de Vercel (Node).
//
// Uso desde el front (manda el token de la sesión de Supabase):
//   const { data: { session } } = await supabase.auth.getSession();
//   fetch("/api/steam/data", {
//     method: "POST",
//     headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
//     body: JSON.stringify({ action: "library" }),   // "profile" | "library" | "wishlist" | "my_reviews" | "achievements_summary" | "achievements" | "stats" (+ appid)
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
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

const steam = (path, params) => {
  const q = new URLSearchParams({ key: KEY, format: "json" });
  for (const [k, v] of Object.entries(params)) q.set(k, String(v));
  return fetch(`${API}/${path}?${q}`, { cache: "no-store" }).then(async (r) => {
    if (!r.ok) {
      // Steam explica el motivo en el cuerpo (ej. "Profile is not public")
      const cuerpo = await r.text().catch(() => "");
      let motivo = "";
      try { motivo = JSON.parse(cuerpo).playerstats?.error ?? ""; } catch { motivo = cuerpo.slice(0, 120); }
      throw new Error(`Steam ${r.status}${motivo ? ": " + motivo : ""}`);
    }
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
        const [sum, recent, insignias] = await Promise.all([
          steam("ISteamUser/GetPlayerSummaries/v2/", { steamids: steamid }),
          // Todos los jugados en las últimas 2 semanas
          steam("IPlayerService/GetRecentlyPlayedGames/v1/", { steamid }).catch(() => ({ response: {} })),
          // Nivel de Steam e insignias
          steam("IPlayerService/GetBadges/v1/", { steamid }).catch(() => ({ response: {} })),
        ]);
        const p = sum.response.players[0];
        return json(res, {
          ...p,
          playing_now: p.gameextrainfo ? { name: p.gameextrainfo, appid: p.gameid } : null,
          recent_games: (recent.response.games ?? []).map((g) => ({
            appid: g.appid,
            name: g.name,
            hours_2weeks: Math.round((g.playtime_2weeks / 60) * 10) / 10,
            hours: Math.round((g.playtime_forever / 60) * 10) / 10,
          })),
          steam_level: insignias.response.player_level ?? null,
          badges: (insignias.response.badges ?? []).length,
          steam_xp: insignias.response.player_xp ?? null,
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

      case "achievements_summary": {
        // Logros de los 30 juegos más jugados (los que tienen estadísticas públicas)
        const lib = await steam("IPlayerService/GetOwnedGames/v1/", {
          steamid, include_appinfo: 1, include_played_free_games: 1,
        });
        const jugados = (lib.response.games ?? [])
          .filter((g) => g.playtime_forever > 0 && g.has_community_visible_stats)
          .sort((a, b) => b.playtime_forever - a.playtime_forever)
          .slice(0, 30);
        let privados = 0;
        let motivo = "";
        const porJuego = await Promise.all(jugados.map(async (g) => {
          try {
            const d = await steam("ISteamUserStats/GetPlayerAchievements/v1/", { steamid, appid: g.appid, l: "spanish" });
            const lista = d.playerstats?.achievements ?? [];
            if (!lista.length) return null;
            return { appid: g.appid, name: g.name, total: lista.length, unlocked: lista.filter((a) => a.achieved === 1).length, lista };
          } catch (e) {
            if (/Steam 403/.test(e.message)) { privados++; motivo = motivo || e.message; }
            return null;
          }
        }));
        const games = porJuego.filter(Boolean);
        // Steam responde 403 cuando los "Detalles de juego" del perfil son privados
        if (!games.length && privados) {
          return json(res, { error: motivo, private: /not public|private/i.test(motivo) }, 403);
        }

        // Rareza: % global de jugadores que tiene cada logro (10 juegos más jugados)
        const raros = [];
        await Promise.all(games.slice(0, 10).map(async (g) => {
          try {
            const r = await fetch(`${API}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v0002/?gameid=${g.appid}`).then((x) => x.json());
            const pct = new Map((r.achievementpercentages?.achievements ?? []).map((a) => [a.name, Number(a.percent)]));
            for (const a of g.lista) {
              if (!pct.has(a.apiname)) continue;
              raros.push({
                appid: g.appid, game: g.name, name: a.name || a.apiname, description: a.description || null,
                percent: Math.round(pct.get(a.apiname) * 10) / 10, achieved: a.achieved === 1,
              });
            }
          } catch { /* sin datos globales para ese juego */ }
        }));
        raros.sort((a, b) => a.percent - b.percent);

        const unlocked = games.reduce((s, g) => s + g.unlocked, 0);
        const average = games.length
          ? Math.round(games.reduce((s, g) => s + g.unlocked / g.total, 0) / games.length * 100)
          : 0;
        return json(res, {
          summary: {
            unlocked,
            average,
            complete: games.filter((g) => g.unlocked === g.total).length,
            rare: raros.filter((a) => a.achieved && a.percent < 10).length,
          },
          games: games.map(({ lista, ...g }) => g),
          rarest: raros.slice(0, 8),
        });
      }

      case "wishlist": {
        // Lista de deseos de Steam (debe ser pública) + nombre y precio de cada juego
        const w = await steam("IWishlistService/GetWishlist/v1/", { steamid });
        const items = (w.response?.items ?? []).sort((a, b) =>
          (a.priority || 1e9) - (b.priority || 1e9) || b.date_added - a.date_added);
        const datos = new Map();
        for (let i = 0; i < items.length; i += 50) {
          const ids = items.slice(i, i + 50).map((x) => ({ appid: x.appid }));
          const r = await steam("IStoreBrowseService/GetItems/v1/", {
            input_json: JSON.stringify({ ids, context: { language: "spanish", country_code: "CO" }, data_request: {} }),
          }).catch(() => null);
          for (const it of r?.response?.store_items ?? []) datos.set(it.appid ?? it.id, it);
        }
        const games = items.map((x) => {
          const it = datos.get(x.appid) ?? {};
          const precio = it.best_purchase_option ?? {};
          return {
            appid: x.appid,
            name: it.name ?? `App ${x.appid}`,
            added: x.date_added,
            price: precio.formatted_final_price ?? (it.is_free ? "Gratis" : null),
            original_price: precio.formatted_original_price ?? null,
            discount_pct: precio.discount_pct ?? 0,
          };
        });
        return json(res, { count: games.length, games });
      }

      case "my_reviews": {
        // Tus reseñas de Steam. Steam no tiene API para esto: se leen de la página pública
        // steamcommunity.com/profiles/<id>/recommended (hasta 3 páginas de 10).
        const MESES = {
          january: 1, february: 2, march: 3, april: 4, may: 5, june: 6, july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
          enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
        };
        const limpiar = (html) => html.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&")
          .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
        const reviews = [];
        for (let pagina = 1; pagina <= 3; pagina++) {
          const html = await fetch(`https://steamcommunity.com/profiles/${steamid}/recommended/?p=${pagina}&l=english`, {
            headers: { "Accept-Language": "en-US" },
          }).then((r) => (r.ok ? r.text() : "")).catch(() => "");
          const cajas = html.split('class="review_box"').slice(1);
          for (const c of cajas) {
            const appid = Number((c.match(/recommended\/(\d+)\//) || c.match(/steamcommunity\.com\/app\/(\d+)/) || [])[1]);
            if (!appid) continue;
            const horas = Number(((c.match(/class="hours[^"]*">\s*([\d,.]+)/) || [])[1] || "0").replace(/,/g, ""));
            // La fecha llega como "Posted 8 November", "Posted November 8, 2025" o "Publicada el 8 de noviembre"
            const posted = (c.match(/class="posted[^"]*">([\s\S]*?)<\/div>/) || [])[1] || "";
            let fecha = posted.match(/(\d{1,2})\s+(?:de\s+)?([A-Za-zé]+)(?:,?\s*(?:de\s+)?(\d{4}))?/) || [];
            const us = posted.match(/([A-Za-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?/);
            if (!fecha[1] && us) fecha = [us[0], us[2], us[1], us[3]];
            const anio = fecha[3] || String(new Date().getFullYear());
            reviews.push({
              appid,
              recomienda: /icon_thumbsUp/.test(c),
              horas,
              fecha: fecha[1] && MESES[fecha[2].toLowerCase()] ? `${anio}-${String(MESES[fecha[2].toLowerCase()]).padStart(2, "0")}-${fecha[1].padStart(2, "0")}` : null,
              texto: limpiar((c.match(/class="content[^"]*">([\s\S]*?)<\/div>/) || [])[1] || ""),
              enlace: `https://steamcommunity.com/profiles/${steamid}/recommended/${appid}/`,
            });
          }
          if (cajas.length < 10) break;
        }
        // Nombre de cada juego
        if (reviews.length) {
          const r = await steam("IStoreBrowseService/GetItems/v1/", {
            input_json: JSON.stringify({ ids: reviews.map((x) => ({ appid: x.appid })), context: { language: "spanish", country_code: "CO" }, data_request: {} }),
          }).catch(() => null);
          const nombres = new Map((r?.response?.store_items ?? []).map((it) => [it.appid ?? it.id, it.name]));
          for (const x of reviews) x.name = nombres.get(x.appid) ?? `App ${x.appid}`;
        }
        return json(res, { count: reviews.length, reviews });
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

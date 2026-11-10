// api/steam/_catalogo.js · Piezas compartidas del catálogo (tabla "juegos" de Supabase).
// Empieza con "_" para que Vercel no la publique como dirección: solo la usan
// api/steam/juego.js (al abrir una ficha) y api/steam/sincronizar.js (cada día).
//
// Variables de entorno: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STEAM_API_KEY,
// TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET (las mismas de api/igdb.js).

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzshrfiezzysbkzdsjzf.supabase.co";
const SECRETA = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEY = process.env.STEAM_API_KEY;

/* ---------- Supabase (tabla juegos) ---------- */

function cabeceras(extra) {
  return Object.assign({ apikey: SECRETA, Authorization: `Bearer ${SECRETA}`, "Content-Type": "application/json" }, extra);
}

async function leerJuego(igdbId) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/juegos?igdb_id=eq.${Number(igdbId)}&select=*`, { headers: cabeceras() });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return (await r.json())[0] || null;
}

async function leerJuegosConSteam(limite) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/juegos?steam_appid=not.is.null&select=*&order=actualizado.asc&limit=${limite}`, { headers: cabeceras() });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
  return r.json();
}

// Crea o actualiza filas (por igdb_id)
async function guardarJuegos(filas) {
  if (!filas.length) return;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/juegos?on_conflict=igdb_id`, {
    method: "POST",
    headers: cabeceras({ Prefer: "resolution=merge-duplicates,return=minimal" }),
    body: JSON.stringify(filas),
  });
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${await r.text()}`);
}

/* ---------- IGDB: el número de Steam de un juego ---------- */

let permiso = null;
let permisoVence = 0;
async function permisoTwitch() {
  if (permiso && Date.now() < permisoVence) return permiso;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`, { method: "POST" });
  const d = await r.json();
  permiso = d.access_token;
  permisoVence = Date.now() + (d.expires_in - 600) * 1000;
  return permiso;
}

// IGDB guarda en "external_games" el número del juego en otras tiendas; Steam es la fuente 1
async function appidDesdeIgdb(igdbId) {
  if (!process.env.TWITCH_CLIENT_ID) return null;
  const r = await fetch("https://api.igdb.com/v4/external_games", {
    method: "POST",
    headers: { "Client-ID": process.env.TWITCH_CLIENT_ID, Authorization: "Bearer " + await permisoTwitch() },
    body: `fields uid, external_game_source, category; where game = ${Number(igdbId)} & (external_game_source = 1 | category = 1); limit 1;`,
  }).catch(() => null);
  if (!r || !r.ok) return null;
  const d = await r.json();
  return d[0] && /^\d+$/.test(d[0].uid) ? Number(d[0].uid) : null;
}

/* ---------- Steam: precio, nota, logros y jugadores ---------- */

const pedir = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);

// Datos de la tienda de varios juegos a la vez (hasta 50 por consulta)
async function datosTienda(appids) {
  const mapa = new Map();
  for (let i = 0; i < appids.length; i += 50) {
    const ids = appids.slice(i, i + 50).map((appid) => ({ appid }));
    const d = await pedir(`https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(JSON.stringify({
      ids, context: { language: "spanish", country_code: "CO" }, data_request: { include_reviews: true },
    }))}`);
    for (const it of d?.response?.store_items ?? []) mapa.set(it.appid ?? it.id, it);
  }
  return mapa;
}

async function jugandoAhora(appid) {
  const d = await pedir(`https://api.steampowered.com/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appid}`);
  return d?.response?.player_count ?? null;
}

async function totalLogros(appid) {
  if (!KEY) return null;
  const d = await pedir(`https://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?key=${KEY}&appid=${appid}`);
  return d?.game?.availableGameStats?.achievements?.length ?? null;
}

// Arma la fila de la tabla con lo que dice Steam
function filaSteam(base, item, jugando, logros) {
  const precio = item?.best_purchase_option ?? {};
  const nota = item?.reviews?.summary_filtered ?? {};
  return {
    igdb_id: base.igdb_id,
    slug: base.slug ?? null,
    nombre: base.nombre || item?.name || "Juego",
    steam_appid: base.steam_appid ?? null,
    steam_precio: precio.formatted_final_price ?? null,
    steam_precio_original: precio.formatted_original_price ?? null,
    steam_descuento: precio.discount_pct ?? 0,
    steam_gratis: !!item?.is_free,
    steam_nota: nota.review_score_label ?? null,
    steam_nota_pct: nota.percent_positive ?? null,
    steam_resenas: nota.review_count ?? null,
    steam_logros: logros ?? base.steam_logros ?? null,
    steam_jugando: jugando ?? null,
    actualizado: new Date().toISOString(),
  };
}

module.exports = { leerJuego, leerJuegosConSteam, guardarJuegos, appidDesdeIgdb, datosTienda, jugandoAhora, totalLogros, filaSteam };

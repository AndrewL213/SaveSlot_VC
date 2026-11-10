// /api/steam/resenas — reseñas públicas de Steam de un juego (no necesita sesión)
//
// Uso:
//   /api/steam/resenas?appid=1145360       → por número de Steam
//   /api/steam/resenas?nombre=Hades        → busca el juego en la tienda de Steam por su nombre
//
// Responde { appid, nombre, resumen, resenas: [...] } con las 10 reseñas en español más útiles.
// Si el juego no está en Steam: { appid: null, resenas: [] }.
// Variables de entorno: STEAM_API_KEY (para poner el nombre de cada autor).

const KEY = process.env.STEAM_API_KEY;

function json(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  // Las reseñas cambian poco: Vercel las guarda 1 hora
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  res.end(JSON.stringify(data));
}

const pedir = (url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);

// "NieR:Automata™" y "NieR: Automata" → "nierautomata"
const normalizar = (t) => String(t || "").toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

async function buscarAppid(nombre) {
  const d = await pedir(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(nombre)}&l=spanish&cc=CO`);
  const buscado = normalizar(nombre);
  const item = (d?.items ?? []).find((i) => {
    const n = normalizar(i.name);
    return n === buscado || (buscado.length > 5 && (n.startsWith(buscado) || buscado.startsWith(n)));
  });
  return item ? { appid: item.id, nombre: item.name } : null;
}

const RESUMEN = {
  "Overwhelmingly Positive": "Extremadamente positivas", "Very Positive": "Muy positivas", "Positive": "Positivas",
  "Mostly Positive": "Mayormente positivas", "Mixed": "Variadas", "Mostly Negative": "Mayormente negativas",
  "Negative": "Negativas", "Very Negative": "Muy negativas", "Overwhelmingly Negative": "Extremadamente negativas",
};

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const url = new URL(req.url, "http://localhost");
  // Diagnóstico: /api/steam/resenas?diagnostico=1 muestra qué responde Steam
  if (url.searchParams.get("diagnostico")) {
    const pruebas = {};
    for (const [k, u] of Object.entries({
      busqueda: "https://store.steampowered.com/api/storesearch/?term=Hades&l=spanish&cc=CO",
      resenas: "https://store.steampowered.com/appreviews/1145360?json=1&language=all&num_per_page=0",
    })) {
      pruebas[k] = await fetch(u).then(async (r) => ({ status: r.status, url: r.url, inicio: (await r.text()).slice(0, 200) }))
        .catch((e) => ({ error: String(e) }));
    }
    return json(res, pruebas);
  }
  let appid = Number(url.searchParams.get("appid")) || null;
  let nombre = url.searchParams.get("nombre");

  if (!appid && nombre) {
    const encontrado = await buscarAppid(nombre);
    if (encontrado) ({ appid, nombre } = encontrado);
  }
  if (!appid) return json(res, { appid: null, resenas: [] });

  const base = `https://store.steampowered.com/appreviews/${appid}?json=1&filter=all&purchase_type=all&review_type=all`;
  const [todas, es, latam] = await Promise.all([
    pedir(`${base}&language=all&num_per_page=0`),
    pedir(`${base}&language=spanish&num_per_page=10`),
    pedir(`${base}&language=latam&num_per_page=10`),
  ]);

  // Las más útiles en español (de España y de Latinoamérica), sin repetir
  const vistas = new Set();
  const lista = [...(es?.reviews ?? []), ...(latam?.reviews ?? [])]
    .filter((r) => !vistas.has(r.recommendationid) && vistas.add(r.recommendationid))
    .sort((a, b) => b.votes_up - a.votes_up)
    .slice(0, 10);

  // Nombre de cada autor
  const nombres = new Map();
  const ids = lista.map((r) => r.author.steamid).join(",");
  if (KEY && ids) {
    const d = await pedir(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${KEY}&steamids=${ids}`);
    for (const p of d?.response?.players ?? []) nombres.set(p.steamid, p.personaname);
  }

  const q = todas?.query_summary ?? {};
  return json(res, {
    appid,
    nombre,
    resumen: {
      texto: RESUMEN[q.review_score_desc] ?? q.review_score_desc ?? null,
      positivas: q.total_positive ?? 0,
      total: q.total_reviews ?? 0,
    },
    resenas: lista.map((r) => ({
      id: r.recommendationid,
      autor: nombres.get(r.author.steamid) ?? "Jugador de Steam",
      steamid: r.author.steamid,
      recomienda: r.voted_up,
      texto: r.review.length > 1200 ? r.review.slice(0, 1200) + "…" : r.review,
      horas: Math.round(((r.author.playtime_at_review ?? r.author.playtime_forever ?? 0) / 60) * 10) / 10,
      fecha: new Date(r.timestamp_created * 1000).toISOString().slice(0, 10),
      votosUtil: r.votes_up,
      enlace: `https://steamcommunity.com/profiles/${r.author.steamid}/recommended/${appid}/`,
    })),
  });
};

// /api/steam/resenas — reseñas públicas de Steam de un juego (no necesita sesión)
//
// Uso:
//   /api/steam/resenas?appid=1145360       → por número de Steam
//   /api/steam/resenas?nombre=Hades        → busca el juego en la tienda de Steam por su nombre
//
// Responde { appid, nombre, resumen, resenas: [...] } con las 10 reseñas en español más útiles.
// (El JSON oficial store.steampowered.com/appreviews ahora redirige a la tienda: ya no se puede usar.)
// Si el juego no está en Steam: { appid: null, resenas: [] }.
// No necesita claves: usa la API pública de la tienda y la página pública de reseñas de la comunidad.


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


module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  const url = new URL(req.url, "http://localhost");
  let appid = Number(url.searchParams.get("appid")) || null;
  let nombre = url.searchParams.get("nombre");

  if (!appid && nombre) {
    const encontrado = await buscarAppid(nombre);
    if (encontrado) ({ appid, nombre } = encontrado);
  }
  if (!appid) return json(res, { appid: null, resenas: [] });

  // Resumen (nota global de Steam) desde la API oficial de la tienda
  const tienda = await pedir(`https://api.steampowered.com/IStoreBrowseService/GetItems/v1/?input_json=${encodeURIComponent(JSON.stringify({
    ids: [{ appid }], context: { language: "spanish", country_code: "CO" }, data_request: { include_reviews: true },
  }))}`);
  const item = tienda?.response?.store_items?.[0] ?? {};
  const global = item.reviews?.summary_filtered ?? {};
  nombre = item.name ?? nombre;

  // Las reseñas más útiles en español. Steam ya no da un JSON público de reseñas,
  // así que se leen de la página pública de reseñas de la comunidad (steamcommunity.com/app/<id>/reviews).
  const html = await fetch(`https://steamcommunity.com/app/${appid}/homecontent/?userreviewsoffset=0&p=1&numperpage=10&browsefilter=toprated&appid=${appid}&appHubSubSection=10&l=spanish&filterLanguage=default&searchText=&maxInappropriateScore=50`)
    .then((r) => (r.ok ? r.text() : "")).catch(() => "");
  const MESES = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 };
  const limpiar = (t) => t.replace(/<div class="early_access_review">[\s\S]*?<\/div>/g, "")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
  const numero = (t) => {
    if (!t) return 0;
    const limpio = t.includes(",") && t.includes(".") ? t.replace(/,/g, "") : t.replace(",", ".");
    return Number(limpio) || 0;
  };
  const resenas = html.split('class="apphub_Card ').slice(1).map((c, i) => {
    const autor = c.match(/apphub_CardContentAuthorName[^"]*"><a href="([^"]+)">([^<]+)<\/a>/) || [];
    const fecha = c.match(/date_posted">[^0-9<]*(\d{1,2}) de ([a-záéíóú]+)(?: de (\d{4}))?/i) || [];
    const texto = limpiar((c.match(/class="date_posted">[\s\S]*?<\/div>([\s\S]*?)<\/div>/) || [])[1] || "");
    return {
      id: String(i),
      autor: limpiar(autor[2] || "Jugador de Steam"),
      perfil: autor[1] || null,
      recomienda: /thumbsUp/i.test(c.split("apphub_CardTextContent")[0]),
      texto: texto.length > 1200 ? texto.slice(0, 1200) + "…" : texto,
      horas: numero((c.match(/class="hours">\s*([\d.,]+)/) || [])[1]),
      fecha: fecha[1] ? `${fecha[3] || new Date().getFullYear()}-${String(MESES[fecha[2].toLowerCase()] || 1).padStart(2, "0")}-${fecha[1].padStart(2, "0")}` : null,
      votosUtil: Number(((c.match(/found_helpful">[^0-9<]*([\d.,]+)/) || [])[1] || "0").replace(/[.,]/g, "")),
      enlace: (c.match(/data-modal-content-url="([^"]+)"/) || [])[1] || `https://steamcommunity.com/app/${appid}/reviews/`,
    };
  }).filter((r) => r.texto);

  return json(res, {
    appid,
    nombre,
    resumen: {
      texto: global.review_score_label ?? null,
      positivas: Math.round((global.review_count ?? 0) * (global.percent_positive ?? 0) / 100),
      total: global.review_count ?? 0,
    },
    resenas,
  });
};

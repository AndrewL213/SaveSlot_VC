// api/_portadas-igdb.js · Busca la portada de IGDB de un juego por su nombre (empieza con "_": Vercel no
// la publica como dirección). La usan api/xbox/data.js y api/playstation/data.js: CLAUDE.md solo permite
// imágenes de IGDB y Steam, así que no se usan las de Xbox ni las de PlayStation.
// Usa las claves de Twitch (TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET), como api/igdb.js.

let permisoIgdb = null, permisoIgdbVence = 0;
async function permisoDeIgdb() {
  if (permisoIgdb && Date.now() < permisoIgdbVence) return permisoIgdb;
  const id = process.env.TWITCH_CLIENT_ID, secreto = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secreto) return null;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secreto)}&grant_type=client_credentials`, { method: "POST" });
  if (!r.ok) return null;
  const d = await r.json();
  permisoIgdb = d.access_token;
  permisoIgdbVence = Date.now() + (d.expires_in - 3600) * 1000;
  return permisoIgdb;
}
// "Minecraft para Android", "Forza Horizon 5 (PC)", "Halo™: MCC" → el nombre del juego para buscarlo
function nombreParaBuscar(nombre) {
  return String(nombre || "")
    .replace(/[™®©]/g, "")
    .replace(/\s*[-–:]?\s*(para|for)\s+(android|ios|iphone|windows(\s*10|\s*11)?|pc|xbox[\w\s|]*)$/i, "")
    .replace(/\s*\((pc|windows|xbox[^)]*|android|ios|ps[345](\s*[&/,]\s*ps[345])*|ps\s*vita|playstation\s*\d?)\)$/i, "")
    .replace(/\s+(trophies|trofeos)$/i, "")
    .replace(/\s*[-–:]\s*(windows 10|pocket|java|bedrock) edition$/i, "")
    .replace(/"/g, "").trim();
}
// { clave: { cover: "https://images.igdb.com/.../t_cover_big/xxx.jpg", slug: "halo-infinite" } }
// para los juegos que IGDB encuentre. El slug sirve para abrir la ficha del juego en SaveSlot.
// clave(juego) da el id del juego y nombre(juego) su nombre.
async function portadasDeIgdb(juegos, clave, nombre) {
  const permiso = await permisoDeIgdb().catch((e) => { console.error("IGDB permiso:", e.message); return null; });
  if (!permiso) { console.error("IGDB: sin permiso (¿faltan TWITCH_CLIENT_ID o TWITCH_CLIENT_SECRET?)"); return {}; }
  const portadas = {};
  // De a 4 juegos a la vez (IGDB deja 4 consultas por segundo)
  for (let i = 0; i < juegos.length; i += 4) {
    await Promise.all(juegos.slice(i, i + 4).map(async (j) => {
      const r = await fetch("https://api.igdb.com/v4/games", {
        method: "POST", headers: { "Client-ID": process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${permiso}` },
        body: `fields name, slug, cover.image_id; search "${nombreParaBuscar(nombre(j))}"; where cover != null; limit 1;`,
      }).catch(() => null);
      if (!r || !r.ok) { console.error("IGDB portada de", nombre(j), r ? r.status : "sin respuesta"); return; }
      const encontrado = ((await r.json().catch(() => [])) || [])[0];
      if (encontrado && encontrado.cover) portadas[clave(j)] = { cover: `https://images.igdb.com/igdb/image/upload/t_cover_big/${encontrado.cover.image_id}.jpg`, slug: encontrado.slug || null };
      else console.error("IGDB no encontró portada para", nombre(j), "→", nombreParaBuscar(nombre(j)));
    }));
  }
  return portadas;
}

module.exports = { portadasDeIgdb, nombreParaBuscar };

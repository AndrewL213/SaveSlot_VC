// /api/steam/juego — datos de Steam de un juego del catálogo (no necesita sesión)
//
// Uso (desde la ficha del juego):
//   /api/steam/juego?igdb=11208&slug=nier-automata&nombre=NieR:Automata
//
// 1. Busca el juego en la tabla "juegos" de Supabase. Si se actualizó hace menos de 24 h, lo devuelve.
// 2. Si no, pide a IGDB su número de Steam, trae de Steam el precio, la nota, los logros
//    y los jugadores de ahora, lo guarda en la tabla y lo devuelve.
// Si el juego no está en Steam, responde { juego: { ..., steam_appid: null } }.

const c = require("./_catalogo");

const UN_DIA = 24 * 60 * 60 * 1000;

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  const url = new URL(req.url, "http://localhost");
  const igdb = Number(url.searchParams.get("igdb"));
  if (!igdb) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: "Falta igdb (el número del juego en IGDB)" }));
  }

  try {
    const guardado = await c.leerJuego(igdb);
    if (guardado && Date.now() - new Date(guardado.actualizado).getTime() < UN_DIA) {
      res.setHeader("Cache-Control", "s-maxage=3600");
      return res.end(JSON.stringify({ juego: guardado, desde: "supabase" }));
    }

    const base = {
      igdb_id: igdb,
      slug: url.searchParams.get("slug") || guardado?.slug || null,
      nombre: url.searchParams.get("nombre") || guardado?.nombre || "",
      steam_appid: guardado?.steam_appid ?? await c.appidDesdeIgdb(igdb),
      steam_logros: guardado?.steam_logros ?? null,
    };

    let fila;
    if (base.steam_appid) {
      const [tienda, jugando, logros] = await Promise.all([
        c.datosTienda([base.steam_appid]),
        c.jugandoAhora(base.steam_appid),
        base.steam_logros == null ? c.totalLogros(base.steam_appid) : null,
      ]);
      fila = c.filaSteam(base, tienda.get(base.steam_appid), jugando, logros);
    } else {
      fila = c.filaSteam(base, null, null, null); // no está en Steam: se guarda igual para no volver a buscar hoy
    }
    await c.guardarJuegos([fila]);
    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.end(JSON.stringify({ juego: fila, desde: "steam" }));
  } catch (e) {
    console.error(e);
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: e.message }));
  }
};

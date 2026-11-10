// /api/steam/sincronizar — actualiza cada día los datos de Steam del catálogo
//
// Vercel la ejecuta sola una vez al día (ver "crons" en vercel.json).
// Recorre los juegos de la tabla "juegos" que están en Steam, empezando por los que
// llevan más tiempo sin actualizar, y guarda su precio, descuento, nota y jugadores de ahora.
//
// Seguridad: si existe la variable CRON_SECRET en Vercel, solo responde a Vercel
// (que manda "Authorization: Bearer <CRON_SECRET>").

const c = require("./_catalogo");

const POR_VEZ = 200; // juegos por ejecución

module.exports = async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.authorization !== `Bearer ${secreto}`) {
    res.statusCode = 401;
    return res.end(JSON.stringify({ error: "No autorizado" }));
  }

  try {
    const juegos = await c.leerJuegosConSteam(POR_VEZ);
    const tienda = await c.datosTienda(juegos.map((j) => j.steam_appid));
    const filas = [];
    // Jugadores de ahora: de 10 en 10 para no saturar a Steam
    for (let i = 0; i < juegos.length; i += 10) {
      const grupo = juegos.slice(i, i + 10);
      const jugando = await Promise.all(grupo.map((j) => c.jugandoAhora(j.steam_appid)));
      // Si Steam no respondió por un juego, se deja como estaba
      grupo.forEach((j, k) => { if (tienda.has(j.steam_appid)) filas.push(c.filaSteam(j, tienda.get(j.steam_appid), jugando[k], j.steam_logros)); });
    }
    await c.guardarJuegos(filas);
    return res.end(JSON.stringify({ actualizados: filas.length, en_oferta: filas.filter((f) => f.steam_descuento > 0).length }));
  } catch (e) {
    console.error(e);
    res.statusCode = 502;
    return res.end(JSON.stringify({ error: e.message }));
  }
};

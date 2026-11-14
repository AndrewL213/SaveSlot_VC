// /api/xbox/juego — datos de un juego en la tienda de Xbox (no necesita sesión ni claves)
//
// Uso (desde la ficha del juego):
//   /api/xbox/juego?tienda=9P8DL6W0JBB8&nombre=Hades
//   tienda: el número del juego en la Microsoft Store, si IGDB lo tiene (id_tienda_xbox). Si no viene,
//           se busca por nombre (solo si coincide exacto).
//
// Responde { juego: { id, nombre, enlace, precio, precio_original, descuento, gratis, nota (de 1 a 5),
//   calificaciones, pegi, game_pass: ['consola', 'pc'] } } o { juego: null } si no está en la tienda.
// Vercel guarda cada respuesta un día. Ver api/xbox/_tienda.js.

const t = require('./_tienda');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  const url = new URL(req.url, 'http://localhost');
  const tienda = (url.searchParams.get('tienda') || '').toUpperCase();
  const nombre = (url.searchParams.get('nombre') || '').slice(0, 150);
  if (!t.ES_ID.test(tienda) && !nombre) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'Falta tienda (el número del juego en la Microsoft Store) o nombre' }));
  }

  try {
    const id = await t.idDelJuego(tienda, nombre);
    const p = id ? await t.producto(id) : null;
    let juego = null;
    if (p) {
      juego = t.resumen(p);
      delete juego.descripcion; // la descripción va en la ficha de IGDB (api/igdb.js)
      // Game Pass: si la lista falla, el resto llega igual
      juego.game_pass = await t.juegosDeGamePass().then(function (lista) { return lista[juego.id] || []; }, function (e) {
        console.error('No se pudo leer Game Pass: ' + e.message);
        return [];
      });
    }
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=86400');
    return res.end(JSON.stringify({ juego: juego }));
  } catch (e) {
    console.error('Tienda de Xbox: ' + e.message);
    res.statusCode = 502;
    res.setHeader('Cache-Control', 'no-store');
    return res.end(JSON.stringify({ error: 'api' }));
  }
};

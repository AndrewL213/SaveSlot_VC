// api/xbox/_tienda.js · La tienda de Xbox (Microsoft Store) y Game Pass: datos generales de los juegos.
// Empieza con "_": Vercel no la publica como dirección. La usan api/xbox/juego.js y api/igdb.js.
//
// No usa claves ni la cuenta de nadie: son las direcciones públicas que usa la propia tienda de Microsoft.
// OJO: no son oficiales para otras apps. Si Microsoft las cambia, esto deja de traer datos (la ficha
// se ve igual, sin la línea de Xbox). Precios de Colombia (como Steam) y textos en español.
//   · Catálogo:  displaycatalog.mp.microsoft.com/v7.0/products?bigIds=<id>  (precio, nota, PEGI, descripción)
//   · Búsqueda:  displaycatalog.mp.microsoft.com/v7.0/productFamilies/autosuggest?query=<nombre>
//   · Game Pass: catalog.gamepass.com/sigls/v2?id=<lista>  (los números de los juegos incluidos)
// El número de un juego en la tienda (Big ID) tiene 12 letras y números, por ejemplo 9P8DL6W0JBB8 (Hades).

const MERCADO = 'CO';
const IDIOMA = 'es-co';
const CATALOGO = 'https://displaycatalog.mp.microsoft.com/v7.0';
const LISTAS_GAME_PASS = {
  consola: 'f6f1f99f-9b49-4ccd-b3bf-4d9767a77f5e', // "Todos los juegos de consola"
  pc: 'fdd9e2a7-0fee-49f6-ad69-4354098401ff'       // "Todos los juegos de PC"
};
const UN_DIA = 24 * 60 * 60 * 1000;

const ES_ID = /^[0-9A-Z]{12}$/;

async function pedir(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error('La tienda de Xbox respondió ' + r.status);
  return r.json();
}

function normalizar(t) {
  return String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
}

// Busca un juego por nombre. Solo sirve si el nombre coincide exacto (sin tildes, espacios ni signos).
async function buscarPorNombre(nombre) {
  if (!nombre) return null;
  const datos = await pedir(CATALOGO + '/productFamilies/autosuggest?market=' + MERCADO + '&languages=' + IDIOMA +
    '&productFamilyNames=Games&query=' + encodeURIComponent(nombre));
  const buscado = normalizar(nombre);
  for (const grupo of datos.Results || []) {
    const juego = (grupo.Products || []).find(function (p) { return p.Type === 'Game' && normalizar(p.Title) === buscado && ES_ID.test(p.ProductId); });
    if (juego) return juego.ProductId;
  }
  return null;
}

async function producto(id) {
  if (!ES_ID.test(id || '')) return null;
  const datos = await pedir(CATALOGO + '/products?bigIds=' + id + '&market=' + MERCADO + '&languages=' + IDIOMA + '&fieldsTemplate=details');
  return (datos.Products || [])[0] || null;
}

function enlaceDe(id, nombre) {
  const slug = String(nombre || 'juego').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'juego';
  return 'https://www.xbox.com/es-CO/games/store/' + slug + '/' + id;
}

function formatearPrecio(valor, moneda) {
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: moneda, maximumFractionDigits: moneda === 'COP' ? 0 : 2 }).format(valor);
  } catch (e) {
    return valor + ' ' + moneda;
  }
}

// Lo que SaveSlot usa de un producto de la tienda.
function resumen(p) {
  const textos = (p.LocalizedProperties || [])[0] || {};
  const mercado = (p.MarketProperties || [])[0] || {};
  const nota = (mercado.UsageData || []).find(function (u) { return u.AggregateTimeSpan === 'AllTime'; });
  const pegi = (mercado.ContentRatings || []).find(function (r) { return r.RatingSystem === 'PEGI'; });
  // El precio: la primera forma de compra que tenga precio
  let precio = null;
  (p.DisplaySkuAvailabilities || []).some(function (sku) {
    return (sku.Availabilities || []).some(function (a) {
      const pr = a.OrderManagementData && a.OrderManagementData.Price;
      if (pr && (a.Actions || []).indexOf('Purchase') !== -1) { precio = pr; return true; }
      return false;
    });
  });
  const descripcion = (textos.ShortDescription || '').trim() || String(textos.ProductDescription || '').split(/\n\s*\n/)[0].trim();
  return {
    id: p.ProductId,
    nombre: textos.ProductTitle || '',
    enlace: enlaceDe(p.ProductId, textos.ProductTitle),
    gratis: !!precio && precio.ListPrice === 0,
    precio: precio && precio.ListPrice > 0 ? formatearPrecio(precio.ListPrice, precio.CurrencyCode) : null,
    precio_original: precio && precio.MSRP > precio.ListPrice ? formatearPrecio(precio.MSRP, precio.CurrencyCode) : null,
    descuento: precio && precio.MSRP > precio.ListPrice ? Math.round((1 - precio.ListPrice / precio.MSRP) * 100) : null,
    nota: nota && nota.RatingCount ? nota.AverageRating : null, // de 1 a 5
    calificaciones: nota ? nota.RatingCount : 0,
    pegi: pegi ? 'PEGI ' + String(pegi.RatingId).replace(/^PEGI:/, '') : null,
    // Si la tienda no tiene el texto en español, lo manda en inglés: solo vale si dice "es"
    descripcion: /^es/i.test(textos.Language || '') ? descripcion : null
  };
}

// Los juegos de Game Pass (consola y PC). Se guardan un día mientras la función siga viva.
let gamePass = null;
let gamePassVence = 0;
async function juegosDeGamePass() {
  if (gamePass && Date.now() < gamePassVence) return gamePass;
  const listas = await Promise.all(Object.keys(LISTAS_GAME_PASS).map(function (k) {
    return pedir('https://catalog.gamepass.com/sigls/v2?id=' + LISTAS_GAME_PASS[k] + '&language=' + IDIOMA + '&market=' + MERCADO)
      .then(function (d) { return { k: k, ids: d.filter(function (x) { return x.id; }).map(function (x) { return x.id; }) }; });
  }));
  gamePass = {};
  listas.forEach(function (l) { l.ids.forEach(function (id) { gamePass[id] = (gamePass[id] || []).concat(l.k); }); });
  gamePassVence = Date.now() + UN_DIA;
  return gamePass;
}

// El número de la tienda: el que da IGDB o, si no, buscándolo por nombre.
async function idDelJuego(idIgdb, nombre) {
  if (ES_ID.test(idIgdb || '')) return idIgdb;
  return buscarPorNombre(nombre);
}

module.exports = { ES_ID, idDelJuego, buscarPorNombre, producto, resumen, juegosDeGamePass };

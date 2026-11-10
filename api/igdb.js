// api/igdb.js · Función de Vercel que consulta el catálogo de IGDB (de Twitch).
//
// La página le pregunta a /api/igdb y esta función, que corre en el servidor de Vercel,
// es la única que habla con Twitch e IGDB. Así las claves nunca llegan al navegador.
// Las claves se leen de las variables de entorno de Vercel: TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET,
// y DEEPL_API_KEY (opcional) para traducir las descripciones al español.
//
// Pedidos que acepta (solo estos tres):
//   /api/igdb?buscar=zelda   → hasta 20 juegos que coinciden con el texto
//   /api/igdb?id=hades--1    → la ficha de un juego (id = el "slug" o el número de IGDB), con la descripción en español
//   /api/igdb?populares=1    → los 10 juegos más visitados en IGDB (Mejores juegos de la semana)
//
// Responde con los juegos en el mismo formato que js/data.js. Si algo falla, responde
// { error: '…' } con el mismo nombre que las variantes de la página de error (variantesError).

const LIMITE_DE_ESPERA = 8000; // milisegundos; después se responde "tiempo"

// El permiso de acceso de Twitch dura unos 60 días: se guarda mientras la función siga viva.
let permiso = null;
let permisoVence = 0;

// Campos que se le piden a IGDB por cada juego.
const CAMPOS = 'fields name, slug, summary, first_release_date, genres.name, themes.name, platforms.name, cover.image_id, involved_companies.developer, involved_companies.company.name;';

// IGDB nombra los géneros (y algunos temas) en inglés: aquí van los que usa SaveSlot.
const GENEROS = {
  'Adventure': 'Aventura',
  'Role-playing (RPG)': 'RPG',
  'Shooter': 'Shooter',
  'Platform': 'Plataformas',
  'Sport': 'Deportes',
  'Racing': 'Carreras',
  'Fighting': 'Pelea',
  'Hack and slash/Beat \'em up': 'Acción',
  'Puzzle': 'Puzzle',
  'Strategy': 'Estrategia',
  'Real Time Strategy (RTS)': 'Estrategia',
  'Turn-based strategy (TBS)': 'Estrategia',
  'Tactical': 'Estrategia',
  'Simulator': 'Simulación',
  'Indie': 'Indie',
  // temas
  'Action': 'Acción',
  'Horror': 'Terror',
  'Survival': 'Supervivencia'
};

function plataformaDe(nombre) {
  if (/PlayStation|PS Vita/i.test(nombre)) return 'PlayStation';
  if (/Xbox/i.test(nombre)) return 'Xbox';
  if (/Nintendo|Switch|Wii|Game Boy/i.test(nombre)) return 'Nintendo';
  if (/PC|Mac|Linux/i.test(nombre)) return 'PC';
  return null;
}

function sinRepetidos(lista) {
  return lista.filter(function (x, i) { return x && lista.indexOf(x) === i; });
}

// Un error con el nombre de su variante en la página de error.
function falla(tipo, estado) {
  const e = new Error(tipo);
  e.tipo = tipo;
  e.estado = estado;
  return e;
}

async function llamar(url, opciones) {
  try {
    return await fetch(url, Object.assign({ signal: AbortSignal.timeout(LIMITE_DE_ESPERA) }, opciones));
  } catch (e) {
    if (e.name === 'TimeoutError') throw falla('tiempo', 408);
    throw falla('api', 502);
  }
}

async function pedirPermiso() {
  if (permiso && Date.now() < permisoVence) return permiso;
  const id = process.env.TWITCH_CLIENT_ID;
  const secreto = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secreto) throw falla('credenciales', 500);
  const r = await llamar('https://id.twitch.tv/oauth2/token?client_id=' + encodeURIComponent(id) +
    '&client_secret=' + encodeURIComponent(secreto) + '&grant_type=client_credentials', { method: 'POST' });
  if (!r.ok) throw falla('credenciales', 500);
  const datos = await r.json();
  permiso = datos.access_token;
  permisoVence = Date.now() + (datos.expires_in - 3600) * 1000; // se renueva una hora antes
  return permiso;
}

// Consulta IGDB. "consulta" está en el lenguaje de IGDB (Apicalypse) y la arma solo esta función.
async function consultar(seccion, consulta, reintento) {
  const r = await llamar('https://api.igdb.com/v4/' + seccion, {
    method: 'POST',
    headers: { 'Client-ID': process.env.TWITCH_CLIENT_ID, 'Authorization': 'Bearer ' + await pedirPermiso() },
    body: consulta
  });
  if (r.status === 401 && !reintento) { permiso = null; return consultar(seccion, consulta, true); }
  if (r.status === 429) throw falla('limite', 429);
  if (r.status === 401 || r.status === 403) throw falla('credenciales', 500);
  if (!r.ok) throw falla('api', 502);
  return r.json();
}

// Agrega las horas de la historia ("Time to beat" de IGDB, en segundos) a una lista de juegos.
async function conHoras(juegos) {
  if (!juegos.length) return [];
  const ids = juegos.map(function (j) { return j.id; }).join(',');
  const tiempos = await consultar('game_time_to_beats', 'fields game_id, normally; where game_id = (' + ids + '); limit 500;');
  return juegos.map(function (j) {
    const t = tiempos.find(function (x) { return x.game_id === j.id; });
    return traducir(j, t && t.normally ? Math.round(t.normally / 3600) : null);
  });
}

// Pasa un juego de IGDB al formato de js/data.js.
// Calificación, votos, dificultad y horas al 100 % salen de nuestras reseñas (Supabase), no de IGDB.
function traducir(j, horas) {
  const nombresIgdb = (j.genres || []).concat(j.themes || []).map(function (g) { return g.name; });
  const generos = sinRepetidos(nombresIgdb.map(function (n) { return GENEROS[n]; })).filter(function (g) { return g !== 'Indie'; });
  const desarrolla = (j.involved_companies || []).find(function (c) { return c.developer && c.company; });
  return {
    id: j.slug,
    idIgdb: j.id,
    nombre: j.name,
    nombreCorto: j.name,
    generos: generos,
    plataformas: sinRepetidos((j.platforms || []).map(function (p) { return plataformaDe(p.name); })),
    anio: j.first_release_date ? new Date(j.first_release_date * 1000).getUTCFullYear() : null,
    desarrolladora: desarrolla ? desarrolla.company.name : '',
    tipo: nombresIgdb.indexOf('Indie') !== -1 ? 'Indie' : 'AAA',
    horasHistoria: horas,
    descripcion: j.summary || '', // IGDB solo la tiene en inglés; la ficha (?id=) la traduce
    idiomaDescripcion: 'en',
    portada: j.cover ? 'https://images.igdb.com/igdb/image/upload/t_cover_big/' + j.cover.image_id + '.jpg' : null,
    creditoPortada: j.cover ? 'IGDB' : null,
    color: null // IGDB no tiene color: la página usa el color neutro del kit
  };
}

// Traduce la descripción al español. Si falla, queda en inglés: nunca rompe la ficha.
//   1. DeepL, si está la clave DEEPL_API_KEY en Vercel (traductor oficial).
//   2. Si no, el enlace gratis de Google Translate.
//      TEMPORAL: no es oficial (va contra las condiciones de Google y puede bloquearse).
//      Se quita cuando conectemos Supabase y guardemos cada traducción una sola vez.
async function traducirDescripcion(juego) {
  if (!juego.descripcion) return juego;
  try {
    const texto = process.env.DEEPL_API_KEY ? await conDeepl(juego.descripcion) : await conGoogle(juego.descripcion);
    if (texto) { juego.descripcion = texto; juego.idiomaDescripcion = 'es'; }
  } catch (e) {
    console.error('No se pudo traducir la descripción: ' + e.message);
  }
  return juego;
}

async function conDeepl(texto) {
  const clave = process.env.DEEPL_API_KEY;
  // Las claves del plan gratis terminan en ":fx" y usan otra dirección.
  const servidor = /:fx$/.test(clave) ? 'https://api-free.deepl.com' : 'https://api.deepl.com';
  const r = await llamar(servidor + '/v2/translate', {
    method: 'POST',
    headers: { 'Authorization': 'DeepL-Auth-Key ' + clave, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: [texto], source_lang: 'EN', target_lang: 'ES' })
  });
  if (!r.ok) throw new Error('DeepL respondió ' + r.status);
  return (await r.json()).translations[0].text;
}

async function conGoogle(texto) {
  const r = await llamar('https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: 'q=' + encodeURIComponent(texto)
  });
  if (!r.ok) throw new Error('Google Translate respondió ' + r.status);
  // Responde [[["frase traducida", "frase original", …], …], …]: se juntan las frases.
  const datos = await r.json();
  return datos[0].map(function (frase) { return frase[0]; }).join('');
}

async function buscar(texto) {
  const limpio = String(texto).replace(/["\\;]/g, ' ').trim().slice(0, 60);
  if (!limpio) return [];
  return conHoras(await consultar('games', 'search "' + limpio + '"; ' + CAMPOS + ' where version_parent = null; limit 20;'));
}

// id puede ser el slug ("hades--1", el que va en las direcciones) o el número de IGDB (113112, el de las tablas).
async function ficha(id) {
  let condicion;
  if (/^\d{1,10}$/.test(id)) condicion = 'id = ' + id;
  else if (/^[a-z0-9-]{1,100}$/.test(id)) condicion = 'slug = "' + id + '"';
  else throw falla('juego', 404);
  const juegos = await consultar('games', CAMPOS + ' where ' + condicion + '; limit 1;');
  if (!juegos.length) throw falla('juego', 404);
  return traducirDescripcion((await conHoras(juegos))[0]);
}

async function populares() {
  // popularity_type 1 = visitas a la página del juego en IGDB.
  const lista = await consultar('popularity_primitives', 'fields game_id, value; where popularity_type = 1; sort value desc; limit 10;');
  if (!lista.length) return [];
  const ids = lista.map(function (p) { return p.game_id; });
  const juegos = await consultar('games', CAMPOS + ' where id = (' + ids.join(',') + '); limit 10;');
  juegos.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
  return conHoras(juegos);
}

module.exports = async function (req, res) {
  const q = req.query || {};
  try {
    let respuesta;
    if (q.buscar !== undefined) respuesta = { juegos: await buscar(q.buscar) };
    else if (q.id !== undefined) respuesta = { juego: await ficha(String(q.id)) };
    else if (q.populares !== undefined) respuesta = { juegos: await populares() };
    else { res.status(400).json({ error: 'pedido', detalle: 'Usa ?buscar=, ?id= o ?populares=1' }); return; }
    // Vercel guarda la respuesta una hora: menos consultas a IGDB y más rápido para todos.
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(respuesta);
  } catch (e) {
    if (!e.tipo) console.error(e);
    res.status(e.estado || 500).json({ error: e.tipo || 'api' });
  }
};

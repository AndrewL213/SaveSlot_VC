// api/igdb.js · Función de Vercel que consulta el catálogo de IGDB (de Twitch).
//
// La página le pregunta a /api/igdb y esta función, que corre en el servidor de Vercel,
// es la única que habla con Twitch e IGDB. Así las claves nunca llegan al navegador.
// Las claves se leen de las variables de entorno de Vercel: TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET,
// y DEEPL_API_KEY (opcional) para traducir las descripciones al español.
//
// Pedidos que acepta (solo estos seis):
//   /api/igdb?buscar=zelda   → hasta 20 juegos que coinciden con el texto, los más conocidos primero
//   /api/igdb?id=hades--1    → la ficha de un juego (id = el "slug" o el número de IGDB), con la
//                              descripción en español y "Si te gusta, prueba" (similares)
//   /api/igdb?populares=1    → los 10 juegos más visitados en IGDB (Mejores juegos de la semana)
//   /api/igdb?explorar=1     → lista para Buscar juegos, de 24 en 24, los más conocidos primero,
//                              y cuántos hay en total (total; null si se filtra por duración).
//                              Filtros: generos=RPG,Terror · plataformas=PC,Xbox · tipo=AAA|Indie
//                              duracion=corto|medio|largo · desde=2015 · hasta=2024 · pagina=2
//   /api/igdb?random=1       → un juego al azar entre los más conocidos. genero=RPG · excepto=hades--1
//   /api/igdb?steam=1        → los 10 juegos más jugados en Steam (PC), con su pico de jugadores
//                              (jugadoresSteam); la lista viene de Steam y los datos, de IGDB
//
// Solo se muestran juegos principales, remakes, remasters y expansiones que se venden solas:
// nada de DLC, mods, packs ni ports no oficiales.
//
// Responde con los juegos en el mismo formato que js/data.js. Si algo falla, responde
// { error: '…' } con el mismo nombre que las variantes de la página de error (variantes_error, en js/data.js).

const LIMITE_DE_ESPERA = 8000; // milisegundos; después se responde "tiempo"

// El permiso de acceso de Twitch dura unos 60 días: se guarda mientras la función siga viva.
let permiso = null;
let permisoVence = 0;

// Campos que se le piden a IGDB por cada juego.
const CAMPOS = 'fields name, slug, summary, first_release_date, genres.name, themes.name, keywords.slug, platforms.name, cover.image_id, involved_companies.developer, involved_companies.company.name, total_rating_count, game_modes, external_games.uid, external_games.external_game_source, external_games.category;';

const POR_PAGINA = 24;

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

// Géneros de SaveSlot que en IGDB son palabras clave, no géneros.
const PALABRAS_CLAVE = { 'roguelike': 'Roguelike', 'roguelite': 'Roguelike', 'metroidvania': 'Metroidvania' };

// Cómo se filtra cada género de SaveSlot en IGDB (números de géneros y temas de IGDB).
const FILTRO_GENERO = {
  'Aventura': 'genres = (31)',
  'RPG': 'genres = (12)',
  'Acción': '(themes = (1) | genres = (25))',
  'Terror': 'themes = (19)',
  'Shooter': 'genres = (5)',
  'Deportes': 'genres = (14)',
  'Plataformas': 'genres = (8)',
  'Carreras': 'genres = (10)',
  'Pelea': 'genres = (4)',
  'Puzzle': 'genres = (9)',
  'Estrategia': 'genres = (11,15,16,24)',
  'Simulación': 'genres = (13)',
  'Supervivencia': 'themes = (21)',
  'Roguelike': 'palabras:roguelike,roguelite',
  'Metroidvania': 'palabras:metroidvania'
};

// Números de plataformas de IGDB por familia.
const PLATAFORMAS = {
  'PC': [6, 14, 3],
  'PlayStation': [7, 8, 9, 48, 167, 38, 46],
  'Xbox': [11, 12, 49, 169],
  'Nintendo': [130, 41, 5, 37, 20, 4, 21, 24, 33, 22, 18, 19]
};

// Qué juegos mostramos:
// - Tipos de IGDB: 0 juego principal, 4 expansión que se vende sola, 8 remake, 9 remaster,
//   10 juego ampliado. Nada de DLC, mods, packs, ports no oficiales ni ediciones de otro juego.
// - SaveSlot es solo de PC y consolas: el juego debe salir en al menos una de esas plataformas
//   (los que solo salen en celular o navegador no aparecen).
const SOLO_JUEGOS = 'version_parent = null & game_type = (0,4,8,9,10) & platforms = (' +
  [].concat(PLATAFORMAS.PC, PLATAFORMAS.PlayStation, PLATAFORMAS.Xbox, PLATAFORMAS.Nintendo).join(',') + ')';

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

// Más horas que esto no es una historia, es un juego sin fin (MMO, sandbox…): no se muestran.
const MAXIMO_DE_HORAS = 300;

// Los tiempos los reportan los jugadores en IGDB: con menos reportes que esto no son confiables.
const MINIMO_DE_REPORTES = 10;

// Agrega las horas de la historia ("Time to beat" de IGDB, en segundos) a una lista de juegos.
// Se usa "hastily" (terminar la historia principal, sin extras); si no está, "normally" (con algunos extras).
async function conHoras(juegos) {
  if (!juegos.length) return [];
  const ids = juegos.map(function (j) { return j.id; }).join(',');
  const tiempos = await consultar('game_time_to_beats', 'fields game_id, hastily, normally, count; where game_id = (' + ids + '); limit 500;');
  return juegos.map(function (j) {
    const t = tiempos.find(function (x) { return x.game_id === j.id; }) || {};
    const segundos = (t.count || 0) >= MINIMO_DE_REPORTES ? (t.hastily || t.normally) : null;
    const horas = segundos ? Math.max(1, Math.round(segundos / 3600)) : null;
    return traducir(j, horas && horas <= MAXIMO_DE_HORAS ? horas : null);
  });
}

// Pasa un juego de IGDB al formato de js/data.js.
// Calificación, votos, dificultad y horas al 100 % salen de nuestras reseñas (Supabase), no de IGDB.
function traducir(j, horas) {
  const nombresIgdb = (j.genres || []).concat(j.themes || []).map(function (g) { return g.name; });
  const palabras = (j.keywords || []).map(function (k) { return PALABRAS_CLAVE[k.slug]; });
  const generos = sinRepetidos(nombresIgdb.map(function (n) { return GENEROS[n]; }).concat(palabras)).filter(function (g) { return g !== 'Indie'; });
  const desarrolla = (j.involved_companies || []).find(function (c) { return c.developer && c.company; });
  // Número del juego en Steam (IGDB lo guarda en external_games; Steam es la fuente 1)
  const enSteam = (j.external_games || []).find(function (e) { return (e.external_game_source === 1 || e.category === 1) && /^\d+$/.test(e.uid); });
  return {
    id: j.slug,
    idIgdb: j.id,
    appidSteam: enSteam ? Number(enSteam.uid) : null, // para precio, nota y reseñas de Steam (api/steam/)
    nombre: j.name,
    nombreCorto: j.name,
    generos: generos,
    plataformas: sinRepetidos((j.platforms || []).map(function (p) { return plataformaDe(p.name); })),
    anio: j.first_release_date ? new Date(j.first_release_date * 1000).getUTCFullYear() : null,
    desarrolladora: desarrolla ? desarrolla.company.name : '',
    tipo: nombresIgdb.indexOf('Indie') !== -1 ? 'Indie' : 'AAA',
    // Solo online: tiene modos de juego y ninguno es "un jugador" (1). No tiene historia que medir.
    soloOnline: !!(j.game_modes && j.game_modes.length && j.game_modes.indexOf(1) === -1),
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

// IGDB no deja ordenar una búsqueda por popularidad: se piden 50 y se ordenan aquí.
// Primero los que se llaman igual a lo buscado; después, los que tienen más calificaciones.
async function buscar(texto) {
  const limpio = String(texto).replace(/["\\;]/g, ' ').trim().slice(0, 60);
  if (!limpio) return [];
  const juegos = await consultar('games', 'search "' + limpio + '"; ' + CAMPOS + ' where ' + SOLO_JUEGOS + '; limit 50;');
  const igual = function (j) { return comparable(j.name) === comparable(limpio) ? 1 : 0; };
  juegos.sort(function (a, b) { return igual(b) - igual(a) || (b.total_rating_count || 0) - (a.total_rating_count || 0); });
  return conHoras(juegos.slice(0, 20));
}

function comparable(texto) {
  return String(texto).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
}

// Números de las palabras clave de IGDB (roguelike, metroidvania…): se buscan una vez y se guardan.
let numerosDePalabras = null;
async function numerosDe(slugs) {
  if (!numerosDePalabras) {
    const encontradas = await consultar('keywords', 'fields id, slug; where slug = ("' + Object.keys(PALABRAS_CLAVE).join('","') + '"); limit 50;');
    numerosDePalabras = {};
    encontradas.forEach(function (k) { numerosDePalabras[k.slug] = k.id; });
  }
  return slugs.map(function (x) { return numerosDePalabras[x]; }).filter(Boolean);
}

// Arma el "where" de IGDB con los filtros de la página. Solo acepta valores conocidos.
async function condiciones(filtros) {
  const partes = [SOLO_JUEGOS];
  const generos = lista(filtros.generos).filter(function (g) { return FILTRO_GENERO[g]; });
  if (generos.length) {
    const opciones = [];
    for (const g of generos) {
      const f = FILTRO_GENERO[g];
      if (f.indexOf('palabras:') === 0) {
        const numeros = await numerosDe(f.slice(9).split(','));
        if (numeros.length) opciones.push('keywords = (' + numeros.join(',') + ')');
      } else opciones.push(f);
    }
    if (opciones.length) partes.push('(' + opciones.join(' | ') + ')');
  }
  const plataformas = [].concat.apply([], lista(filtros.plataformas).map(function (p) { return PLATAFORMAS[p] || []; }));
  if (plataformas.length) partes.push('platforms = (' + plataformas.join(',') + ')');
  if (filtros.tipo === 'Indie') partes.push('genres = (32)');
  if (filtros.tipo === 'AAA') partes.push('genres = !(32)');
  const desde = anio(filtros.desde), hasta = anio(filtros.hasta);
  if (desde) partes.push('first_release_date >= ' + Date.UTC(desde, 0, 1) / 1000);
  if (hasta) partes.push('first_release_date < ' + Date.UTC(hasta + 1, 0, 1) / 1000);
  partes.push('total_rating_count != null');
  return partes.join(' & ');
}

function lista(valor) {
  return String(valor || '').split(',').map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 10);
}

function anio(valor) {
  const n = parseInt(valor, 10);
  return n >= 1970 && n <= 2100 ? n : null;
}

// La duración no se puede filtrar en IGDB: se filtra con las horas de la historia, ya traídas.
function cumpleDuracion(juego, duracion) {
  const h = juego.horasHistoria;
  if (duracion === 'corto') return h != null && h < 10;
  if (duracion === 'medio') return h != null && h >= 10 && h <= 40;
  if (duracion === 'largo') return h != null && h > 40;
  return true;
}

async function explorar(filtros) {
  const pagina = Math.min(Math.max(parseInt(filtros.pagina, 10) || 1, 1), 50);
  const conDuracion = ['corto', 'medio', 'largo'].indexOf(filtros.duracion) !== -1;
  // Con duración se piden más, porque una parte se descarta después.
  const pedir = conDuracion ? POR_PAGINA * 3 : POR_PAGINA;
  const where = await condiciones(filtros);
  // A la vez: la página de juegos y cuántos hay en total (para "N juegos" en Buscar)
  const [juegos, cuenta] = await Promise.all([
    consultar('games', CAMPOS + ' where ' + where + '; sort total_rating_count desc; limit ' + pedir + '; offset ' + (pagina - 1) * pedir + ';'),
    conDuracion ? null : consultar('games/count', 'where ' + where + ';')
  ]);
  let traducidos = await conHoras(juegos);
  if (conDuracion) traducidos = traducidos.filter(function (j) { return cumpleDuracion(j, filtros.duracion); }).slice(0, POR_PAGINA);
  // Con duración no se sabe el total (se filtra después): total = null
  return { juegos: traducidos, pagina: pagina, hayMas: juegos.length === pedir, total: cuenta ? cuenta.count : null };
}

// Un juego al azar entre los 300 más conocidos (del género pedido, si hay).
async function random(filtros) {
  const where = await condiciones({ generos: filtros.genero });
  const total = (await consultar('games/count', 'where ' + where + ';')).count || 0;
  if (!total) return null;
  const excepto = /^[a-z0-9-]{1,100}$/.test(filtros.excepto || '') ? filtros.excepto : '';
  const tope = Math.min(total, 300);
  const posicion = Math.min(Math.floor(Math.random() * tope), Math.max(tope - 2, 0));
  const juegos = await consultar('games', CAMPOS + ' where ' + where + '; sort total_rating_count desc; limit 2; offset ' + posicion + ';');
  const elegido = juegos.find(function (j) { return j.slug !== excepto; }) || juegos[0];
  return elegido ? traducirDescripcion((await conHoras([elegido]))[0]) : null;
}

// id puede ser el slug ("hades--1", el que va en las direcciones) o el número de IGDB (113112, el de las tablas).
async function ficha(id) {
  let condicion;
  if (/^\d{1,10}$/.test(id)) condicion = 'id = ' + id;
  else if (/^[a-z0-9-]{1,100}$/.test(id)) condicion = 'slug = "' + id + '"';
  else throw falla('juego', 404);
  const juegos = await consultar('games', CAMPOS.replace(';', ', similar_games;') + ' where ' + condicion + '; limit 1;');
  if (!juegos.length) throw falla('juego', 404);
  const juego = await traducirDescripcion((await conHoras(juegos))[0]);
  juego.similares = await similares(juegos[0].similar_games);
  return juego;
}

// "Si te gusta, prueba": hasta 6 juegos parecidos que IGDB ya tiene calculados.
async function similares(ids) {
  const numeros = (ids || []).filter(function (n) { return Number.isInteger(n); }).slice(0, 12);
  if (!numeros.length) return [];
  const juegos = await consultar('games', CAMPOS + ' where id = (' + numeros.join(',') + ') & ' + SOLO_JUEGOS + '; sort total_rating_count desc; limit 6;');
  return juegos.map(function (j) { return traducir(j, null); });
}

// Mejores juegos de la semana: los que más gente marca como "jugando ahora" en IGDB.
// El número de ese tipo de popularidad se busca una vez por su nombre y se guarda.
let numeroJugando = null;
async function populares() {
  if (!numeroJugando) {
    const tipos = await consultar('popularity_types', 'fields id, name; where name = "Playing"; limit 1;');
    numeroJugando = tipos.length ? tipos[0].id : 1; // si no lo encuentra, usa las visitas (1)
  }
  const lista = await consultar('popularity_primitives', 'fields game_id, value; where popularity_type = ' + numeroJugando + '; sort value desc; limit 20;');
  if (!lista.length) return [];
  const ids = lista.map(function (p) { return p.game_id; });
  const juegos = await consultar('games', CAMPOS + ' where id = (' + ids.join(',') + ') & ' + SOLO_JUEGOS + '; limit 20;');
  juegos.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
  return conHoras(juegos.slice(0, 10));
}

// Lo más jugado en Steam: la lista pública de Steam (sin clave) con el pico de jugadores de ayer.
// Steam da solo su número de cada juego; IGDB lo traduce a sus juegos (external_games, fuente 1 = Steam).
async function masJugadosSteam() {
  let ranking;
  try {
    const r = await fetch('https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/', { signal: AbortSignal.timeout(LIMITE_DE_ESPERA) });
    if (!r.ok) throw new Error('Steam ' + r.status);
    ranking = ((await r.json()).response || {}).ranks || [];
  } catch (e) {
    console.error(e);
    throw falla('api', 502);
  }
  // Se piden 40 porque algunos (programas, herramientas) no son juegos para IGDB
  const primeros = ranking.slice(0, 40).filter(function (x) { return Number.isInteger(x.appid); });
  if (!primeros.length) return [];
  const numeros = primeros.map(function (x) { return '"' + x.appid + '"'; }).join(',');
  const enlaces = await consultar('external_games', 'fields game, uid; where uid = (' + numeros + ') & (external_game_source = 1 | category = 1); limit 100;');
  const juegoDe = {};
  enlaces.forEach(function (e) { if (!juegoDe[e.uid]) juegoDe[e.uid] = e.game; });
  const ids = primeros.map(function (x) { return juegoDe[String(x.appid)]; }).filter(Boolean);
  if (!ids.length) return [];
  const juegos = await consultar('games', CAMPOS + ' where id = (' + ids.join(',') + ') & ' + SOLO_JUEGOS + '; limit 40;');
  juegos.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
  const lista = await conHoras(juegos.slice(0, 10));
  return lista.map(function (j) {
    const puesto = primeros.find(function (x) { return x.appid === j.appidSteam; });
    j.jugadoresSteam = puesto ? puesto.peak_in_game : null; // pico de jugadores a la vez (ayer)
    return j;
  });
}

module.exports = async function (req, res) {
  const q = req.query || {};
  try {
    let respuesta;
    if (q.buscar !== undefined) respuesta = { juegos: await buscar(q.buscar) };
    else if (q.id !== undefined) respuesta = { juego: await ficha(String(q.id)) };
    else if (q.populares !== undefined) respuesta = { juegos: await populares() };
    else if (q.explorar !== undefined) respuesta = await explorar(q);
    else if (q.random !== undefined) respuesta = { juego: await random(q) };
    else if (q.steam !== undefined) respuesta = { juegos: await masJugadosSteam() };
    else { res.status(400).json({ error: 'pedido', detalle: 'Usa ?buscar=, ?id=, ?populares=1, ?explorar=1, ?random=1 o ?steam=1' }); return; }
    // Vercel guarda la respuesta una hora: menos consultas a IGDB y más rápido para todos.
    // El juego al azar no se guarda: cada pedido debe dar uno distinto.
    res.setHeader('Cache-Control', q.random !== undefined ? 'no-store' : 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(respuesta);
  } catch (e) {
    if (!e.tipo) console.error(e);
    res.status(e.estado || 500).json({ error: e.tipo || 'api' });
  }
};

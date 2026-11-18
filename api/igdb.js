// api/igdb.js · Función de Vercel que consulta el catálogo de IGDB (de Twitch).
//
// La página le pregunta a /api/igdb y esta función, que corre en el servidor de Vercel,
// es la única que habla con Twitch e IGDB. Así las claves nunca llegan al navegador.
// Las claves se leen de las variables de entorno de Vercel: TWITCH_CLIENT_ID y TWITCH_CLIENT_SECRET,
// y DEEPL_API_KEY (opcional) para traducir las descripciones al español.
// SUPABASE_SERVICE_ROLE_KEY (la llave secreta de Supabase, solo en Vercel) para guardar cada traducción
// una sola vez en la tabla traducciones. Sin ella, se traduce cada vez y no se guarda.
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
//                              (jugadores_steam); la lista viene de Steam y los datos, de IGDB
//
// Solo se muestran juegos principales, remakes, remasters y expansiones que se venden solas:
// nada de DLC, mods, packs ni ports no oficiales.
//
// Responde con los juegos en el mismo formato que js/data.js. Si algo falla, responde
// { error: '…' } con el mismo nombre que las variantes de la página de error (variantes_error, en js/data.js).

const tiendaXbox = require('./xbox/_tienda'); // la tienda de Xbox: descripción en español

const LIMITE_DE_ESPERA = 8000; // milisegundos; después se responde "tiempo"

// El permiso de acceso de Twitch dura unos 60 días: se guarda mientras la función siga viva.
let permiso = null;
let permisoVence = 0;

// Campos que se le piden a IGDB por cada juego.
const CAMPOS = 'fields name, slug, summary, first_release_date, genres.name, themes.name, keywords.slug, platforms.name, cover.image_id, involved_companies.developer, involved_companies.company.name, total_rating_count, game_modes, game_type, external_games.uid, external_games.external_game_source, external_games.category, external_games.url;';

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
  // Nombre del juego en la tienda de Epic: sale de su dirección (…/p/hades → hades)
  const enEpic = (j.external_games || []).map(function (e) { return /epicgames\.com\/(?:[a-z-]+\/)*(?:p|product)\/([a-z0-9-]{1,100})/i.exec(e.url || ''); }).find(Boolean);
  // Número del juego en la tienda de Xbox (Microsoft Store): 12 letras y números al final de su dirección
  // (o el número solo, en uid, si la fuente es Microsoft: la 11)
  const enMicrosoft = (j.external_games || []).map(function (e) {
    if ((e.external_game_source === 11 || e.category === 11) && /^[0-9A-Z]{12}$/i.test(e.uid || '')) return [e.uid, e.uid];
    return /(?:microsoft|xbox)\.com\//i.test(e.url || '') ? /\/([0-9A-Z]{12})(?:[/?#]|$)/i.exec(e.url) : null;
  }).find(Boolean);
  return {
    id: j.slug,
    id_igdb: j.id,
    appid_steam: enSteam ? Number(enSteam.uid) : null, // para precio, nota y reseñas de Steam (api/steam/)
    slug_epic: enEpic ? enEpic[1].toLowerCase() : null, // para la descripción en español de Epic
    id_tienda_xbox: enMicrosoft ? enMicrosoft[1].toUpperCase() : null, // para la tienda de Xbox (api/xbox/juego)
    nombre: j.name,
    nombre_corto: j.name,
    generos: generos,
    plataformas: sinRepetidos((j.platforms || []).map(function (p) { return plataformaDe(p.name); })),
    anio: j.first_release_date ? new Date(j.first_release_date * 1000).getUTCFullYear() : null,
    desarrolladora: desarrolla ? desarrolla.company.name : '',
    tipo: nombresIgdb.indexOf('Indie') !== -1 ? 'Indie' : 'AAA',
    // Los demás tipos del filtro de Buscar (para filtrar también los resultados de una búsqueda por nombre).
    // "Exclusivos" no va aquí: depende de la plataforma elegida y se calcula con "plataformas".
    tipos: [
      (j.keywords || []).some(function (k) { return PALABRAS_GRATIS.indexOf(k.slug) !== -1; }) ? 'Gratis' : null,
      (j.game_modes || []).some(function (m) { return MODOS_MULTIJUGADOR.indexOf(m) !== -1; }) ? 'Multijugador' : null,
      j.game_type === 8 || j.game_type === 9 ? 'Remakes' : null,
      j.first_release_date && j.first_release_date * 1000 > Date.now() ? 'Proximos' : null
    ].filter(Boolean),
    // Solo online: tiene modos de juego y ninguno es "un jugador" (1). No tiene historia que medir.
    solo_online: !!(j.game_modes && j.game_modes.length && j.game_modes.indexOf(1) === -1),
    horas_historia: horas,
    descripcion: j.summary || '', // IGDB solo la tiene en inglés; la ficha (?id=) la busca en español
    idioma_descripcion: 'en',
    fuente_descripcion: 'igdb', // de dónde sale: igdb, steam, epic, xbox o traducida
    portada: j.cover ? 'https://images.igdb.com/igdb/image/upload/t_cover_big/' + j.cover.image_id + '.jpg' : null,
    credito_portada: j.cover ? 'IGDB' : null,
    color: null // IGDB no tiene color: la página usa el color neutro del kit
  };
}

// Busca la descripción en español, en este orden (si algo falla, pasa al siguiente: nunca rompe la ficha):
//   1. La de la tienda de Steam (API oficial), si el juego está en Steam.
//   2. La de la tienda de Epic Games (dirección no oficial: puede cambiar sin aviso), si está en Epic.
//   3. La de la tienda de Xbox (dirección no oficial, api/xbox/_tienda.js), si el juego está en Xbox.
//   4. La de IGDB, traducida (traducirDescripcion). Si tampoco se puede, queda en inglés.
async function descripcionEnEspanol(juego) {
  const enXbox = juego.id_tienda_xbox || juego.plataformas.indexOf('Xbox') !== -1;
  const intentos = [
    ['steam', juego.appid_steam && function () { return descripcionDeSteam(juego.appid_steam); }],
    ['epic', juego.slug_epic && function () { return descripcionDeEpic(juego.slug_epic); }],
    ['xbox', enXbox && function () { return descripcionDeXbox(juego.id_tienda_xbox, juego.nombre); }]
  ];
  for (const [fuente, pedir] of intentos) {
    if (!pedir) continue;
    try {
      const texto = await pedir();
      if (texto) { juego.descripcion = texto; juego.idioma_descripcion = 'es'; juego.fuente_descripcion = fuente; return juego; }
    } catch (e) {
      console.error('No se pudo traer la descripción de ' + fuente + ': ' + e.message);
    }
  }
  return traducirDescripcion(juego);
}

// Las tiendas no deben demorar la ficha: si no responden en 4 segundos, se pasa a la siguiente.
function deTienda() {
  return { signal: AbortSignal.timeout(4000) };
}

// Las tiendas, si no tienen el texto en español, mandan el de inglés. Por eso se piden los dos:
// si son iguales, no hay traducción y se devuelve null.
function soloSiEstaTraducida(espanol, ingles) {
  return espanol && espanol !== ingles ? espanol : null;
}

// Steam trae "short_description", a veces con HTML (&quot;, <br>): se deja en texto simple.
async function descripcionDeSteam(appid) {
  const pedir = async function (idioma) {
    const r = await llamar('https://store.steampowered.com/api/appdetails?appids=' + appid + '&l=' + idioma + '&filters=basic', deTienda());
    if (!r.ok) throw new Error('Steam respondió ' + r.status);
    const datos = (await r.json())[appid];
    return datos && datos.success ? textoSimple(datos.data.short_description) : '';
  };
  const [espanol, ingles] = await Promise.all([pedir('spanish'), pedir('english')]);
  return soloSiEstaTraducida(espanol, ingles);
}

// Epic trae la descripción corta (shortDescription) o la larga, con formato markdown (**negrita**): se quita.
async function descripcionDeEpic(slug) {
  const pedir = async function (idioma) {
    const r = await llamar('https://store-content.ak.epicgames.com/api/' + idioma + '/content/products/' + slug, deTienda());
    if (!r.ok) throw new Error('Epic respondió ' + r.status);
    const pagina = ((await r.json()).pages || []).find(function (p) { return p.data && p.data.about; });
    const sobre = pagina ? pagina.data.about : {};
    return textoSimple((sobre.shortDescription || sobre.description || '').replace(/\*\*|__|^#+\s*/gm, ''));
  };
  const [espanol, ingles] = await Promise.all([pedir('es-ES'), pedir('en-US')]);
  return soloSiEstaTraducida(espanol, ingles);
}

// La tienda de Xbox ya dice en qué idioma viene el texto (resumen() solo lo devuelve si es español).
async function descripcionDeXbox(idTienda, nombre) {
  const id = await tiendaXbox.idDelJuego(idTienda, nombre);
  const p = id ? await tiendaXbox.producto(id) : null;
  return p ? textoSimple(tiendaXbox.resumen(p).descripcion) || null : null;
}

// Quita etiquetas HTML y cambia los códigos (&amp;, &quot;…) por su letra.
function textoSimple(texto) {
  const codigos = { amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ' };
  return String(texto || '')
    .replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '')
    .replace(/&(#\d+|[a-z]+);/gi, function (todo, c) { return c[0] === '#' ? String.fromCharCode(Number(c.slice(1))) : (codigos[c.toLowerCase()] || todo); })
    .replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}

// Traduce la descripción al español. Si falla, queda en inglés: nunca rompe la ficha.
//   0. Si ya está en la tabla traducciones de Supabase, usa esa (no se traduce otra vez).
//   1. DeepL, si está la clave DEEPL_API_KEY en Vercel (traductor oficial).
//   2. Si no, el enlace gratis de Google Translate.
//      TEMPORAL: no es oficial (va contra las condiciones de Google y puede bloquearse).
// Lo que se traduce en 1 o 2 se guarda en traducciones para la próxima vez.
async function traducirDescripcion(juego) {
  if (!juego.descripcion) return juego;
  const guardada = await leerTraduccion(juego.id_igdb);
  if (guardada) return conTraduccion(juego, guardada);
  try {
    const traductor = process.env.DEEPL_API_KEY ? 'deepl' : 'google';
    const texto = traductor === 'deepl' ? await conDeepl(juego.descripcion) : await conGoogle(juego.descripcion);
    if (texto) {
      conTraduccion(juego, texto);
      await guardarTraduccion(juego.id_igdb, texto, traductor);
    }
  } catch (e) {
    console.error('No se pudo traducir la descripción: ' + e.message);
  }
  return juego;
}

function conTraduccion(juego, texto) {
  juego.descripcion = texto;
  juego.idioma_descripcion = 'es';
  juego.fuente_descripcion = 'traducida';
  return juego;
}

/* ---------- Tabla traducciones de Supabase ----------
   Solo el servidor escribe en ella (las reglas no dejan a nadie más), con la llave secreta que está
   en Vercel. Si Supabase falla o no está la llave, se sigue sin guardar: nunca rompe la ficha. */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jzshrfiezzysbkzdsjzf.supabase.co';

function cabecerasSupabase(extra) {
  const llave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return Object.assign({ apikey: llave, Authorization: 'Bearer ' + llave, 'Content-Type': 'application/json' }, extra);
}

async function leerTraduccion(igdbId) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !Number.isInteger(igdbId)) return null;
  try {
    const r = await llamar(SUPABASE_URL + '/rest/v1/traducciones?igdb_id=eq.' + igdbId + '&idioma=eq.es&select=texto', Object.assign({ headers: cabecerasSupabase() }, deTienda()));
    if (!r.ok) throw new Error('Supabase respondió ' + r.status);
    const fila = (await r.json())[0];
    return fila ? fila.texto : null;
  } catch (e) {
    console.error('No se pudo leer la traducción guardada: ' + e.message);
    return null;
  }
}

async function guardarTraduccion(igdbId, texto, traductor) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY || !Number.isInteger(igdbId)) return;
  try {
    // Si dos visitas traducen el mismo juego a la vez, la segunda no hace nada (ignore-duplicates).
    const r = await llamar(SUPABASE_URL + '/rest/v1/traducciones?on_conflict=igdb_id,idioma', Object.assign({
      method: 'POST',
      headers: cabecerasSupabase({ Prefer: 'resolution=ignore-duplicates,return=minimal' }),
      body: JSON.stringify({ igdb_id: igdbId, idioma: 'es', texto: texto, traductor: traductor })
    }, deTienda()));
    if (!r.ok) throw new Error('Supabase respondió ' + r.status + ': ' + await r.text());
  } catch (e) {
    console.error('No se pudo guardar la traducción: ' + e.message);
  }
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
// Además del nombre principal (casi siempre en inglés), se buscan los nombres alternativos de IGDB
// (alternative_names: traducidos, abreviados o de otras regiones), para que "Plantas contra Zombis"
// encuentre Plants vs. Zombies. Las dos preguntas van a la vez; si la segunda falla, queda la primera.
async function buscar(texto) {
  const limpio = String(texto).replace(/["\\;*]/g, ' ').trim().slice(0, 60);
  if (!limpio) return [];
  const [juegos, porOtroNombre] = await Promise.all([
    consultar('games', 'search "' + limpio + '"; ' + CAMPOS + ' where ' + SOLO_JUEGOS + '; limit 50;'),
    buscarPorOtroNombre(limpio)
  ]);
  const yaEstan = new Set(juegos.map(function (j) { return j.id; }));
  porOtroNombre.juegos.forEach(function (j) { if (!yaEstan.has(j.id)) { juegos.push(j); yaEstan.add(j.id); } });
  const buscado = comparable(limpio);
  const igual = function (j) {
    return comparable(j.name) === buscado || (porOtroNombre.nombres[j.id] || []).some(function (n) { return comparable(n) === buscado; }) ? 1 : 0;
  };
  juegos.sort(function (a, b) { return igual(b) - igual(a) || (b.total_rating_count || 0) - (a.total_rating_count || 0); });
  return conHoras(juegos.slice(0, 20));
}

// Juegos con un nombre alternativo que contiene el texto. Devuelve { juegos, nombres: { id: [nombres] } }.
async function buscarPorOtroNombre(limpio) {
  try {
    const otros = await consultar('alternative_names', 'fields game, name; where name ~ *"' + limpio + '"*; limit 100;');
    const nombres = {};
    otros.forEach(function (a) { if (a.game) nombres[a.game] = (nombres[a.game] || []).concat(a.name); });
    const ids = Object.keys(nombres).slice(0, 100);
    if (!ids.length) return { juegos: [], nombres: nombres };
    const juegos = await consultar('games', CAMPOS + ' where id = (' + ids.join(',') + ') & ' + SOLO_JUEGOS + '; limit 50;');
    return { juegos: juegos, nombres: nombres };
  } catch (e) {
    console.error('No se pudo buscar por otros nombres: ' + e.message);
    return { juegos: [], nombres: {} };
  }
}

function comparable(texto) {
  return String(texto).toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '');
}

// Números de las palabras clave de IGDB (roguelike, metroidvania…): se buscan una vez y se guardan.
let numerosDePalabras = null;
async function numerosDe(slugs) {
  if (!numerosDePalabras) {
    // Las de los géneros (PALABRAS_CLAVE) y las del tipo "Gratis" (PALABRAS_GRATIS)
    const todas = Object.keys(PALABRAS_CLAVE).concat(PALABRAS_GRATIS);
    const encontradas = await consultar('keywords', 'fields id, slug; where slug = ("' + todas.join('","') + '"); limit 50;');
    numerosDePalabras = {};
    encontradas.forEach(function (k) { numerosDePalabras[k.slug] = k.id; });
  }
  return slugs.map(function (x) { return numerosDePalabras[x]; }).filter(Boolean);
}

// Arma el "where" de IGDB con los filtros de la página. Solo acepta valores conocidos.
async function condiciones(filtros, extras) {
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
  if (filtros.tipo === 'Multijugador') partes.push('game_modes = (' + MODOS_MULTIJUGADOR.join(',') + ')');
  if (filtros.tipo === 'Remakes') partes.push('game_type = (8,9)'); // 8 remake, 9 remaster
  if (filtros.tipo === 'Gratis') {
    const numeros = await numerosDe(PALABRAS_GRATIS);
    partes.push(numeros.length ? 'keywords = (' + numeros.join(',') + ')' : 'id = 0'); // sin la palabra en IGDB: ninguno
  }
  // Exclusivos necesita una sola plataforma; sin ella no hay resultados (la página pide elegirla)
  if (filtros.tipo === 'Exclusivos' && !familiaExclusiva(filtros)) partes.push('id = 0');
  if (filtros.tipo === 'Proximos') {
    const acceso = extras ? await numeroAccesoAnticipado() : null;
    partes.push('(first_release_date > ' + Math.floor(Date.now() / 1000) + (acceso ? ' | game_status = ' + acceso : '') + ')');
  }
  const desde = anio(filtros.desde), hasta = anio(filtros.hasta);
  if (desde) partes.push('first_release_date >= ' + Date.UTC(desde, 0, 1) / 1000);
  if (hasta) partes.push('first_release_date < ' + Date.UTC(hasta + 1, 0, 1) / 1000);
  // Los que no salieron todavía no tienen calificaciones: para "Próximos" no se exige
  if (filtros.tipo !== 'Proximos') partes.push('total_rating_count != null');
  return partes.join(' & ');
}

// Modos de juego de IGDB: 2 multijugador, 3 cooperativo, 4 pantalla dividida, 5 MMO, 6 battle royale
const MODOS_MULTIJUGADOR = [2, 3, 4, 5, 6];
// Palabras clave de IGDB para los juegos gratis
const PALABRAS_GRATIS = ['free-to-play'];
const CONSOLAS = ['PlayStation', 'Xbox', 'Nintendo'];

// AAA y Exclusivos son "no tiene…" (no es indie; no sale en otras plataformas). Esas condiciones
// ("!= 6", "= !(…)", "!= (…)") no funcionan de forma estable en IGDB: un día filtraban y al otro no.
// Por eso aquí IGDB trae los candidatos y nuestro código revisa cada juego (cumpleTipoPropio).

// La plataforma de los exclusivos: debe haber exactamente una elegida (PC, PlayStation, Xbox o Nintendo)
function familiaExclusiva(filtros) {
  const familias = lista(filtros.plataformas).filter(function (p) { return ['PC'].concat(CONSOLAS).indexOf(p) !== -1; });
  return familias.length === 1 ? familias[0] : null;
}

// Las plataformas de un juego tal como vienen de IGDB, agrupadas (PC, PlayStation, Xbox, Nintendo)
function familiasDe(juego) {
  return sinRepetidos((juego.platforms || []).map(function (p) { return plataformaDe(p.name); }));
}

// ¿Cumple el tipo que IGDB no puede filtrar bien?
// - Exclusivos (estrictos): sale solo en esa plataforma (un exclusivo de Xbox tampoco está en PC).
// - AAA: no es indie.
function cumpleTipoPropio(juego, filtros) {
  if (filtros.tipo === 'AAA') return !(juego.genres || []).some(function (g) { return g.name === 'Indie'; });
  if (filtros.tipo === 'Exclusivos') {
    const familias = familiasDe(juego);
    return familias.length === 1 && familias[0] === familiaExclusiva(filtros);
  }
  return true;
}
function filtraEnCodigo(filtros) {
  return filtros.tipo === 'AAA' || filtros.tipo === 'Exclusivos';
}


// Número del estado "Early Access" (acceso anticipado) en IGDB: se busca una vez por su nombre.
let numeroAcceso;
async function numeroAccesoAnticipado() {
  if (numeroAcceso !== undefined) return numeroAcceso;
  try {
    const estados = await consultar('game_statuses', 'fields id, status; limit 50;');
    const ea = estados.find(function (e) { return /early access/i.test(e.status || ''); });
    numeroAcceso = ea ? ea.id : null;
  } catch (e) {
    return null; // se intenta otra vez en el próximo pedido
  }
  return numeroAcceso;
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
  const h = juego.horas_historia;
  if (duracion === 'corto') return h != null && h < 10;
  if (duracion === 'medio') return h != null && h >= 10 && h <= 40;
  if (duracion === 'largo') return h != null && h > 40;
  return true;
}

// "Próximos" usa dos cosas que solo pide ese filtro (el estado "Early Access" y el orden por hypes):
// si IGDB las rechaza, se pide otra vez solo con la fecha de salida, para que el filtro nunca rompa la página.
async function explorar(filtros) {
  if (filtros.tipo !== 'Proximos') return explorarCon(filtros, false);
  try {
    return await explorarCon(filtros, true);
  } catch (e) {
    console.error('Próximos sin extras:', e.message);
    return explorarCon(filtros, false);
  }
}

async function explorarCon(filtros, extras) {
  const pagina = Math.min(Math.max(parseInt(filtros.pagina, 10) || 1, 1), 50);
  const conDuracion = ['corto', 'medio', 'largo'].indexOf(filtros.duracion) !== -1;
  // Con duración se piden más, porque una parte se descarta después.
  const pedir = conDuracion ? POR_PAGINA * 3 : POR_PAGINA;
  const where = await condiciones(filtros, extras);
  // Los próximos no tienen calificaciones: se ordenan por cuánta gente los espera (hypes)
  // o, sin extras, por la fecha de salida (los más cercanos primero)
  const orden = filtros.tipo !== 'Proximos' ? 'total_rating_count desc' : extras ? 'hypes desc' : 'first_release_date asc';
  if (filtraEnCodigo(filtros)) return explorarRevisando(filtros, where, orden, pagina, conDuracion);
  // A la vez: la página de juegos y cuántos hay en total (para "N juegos" en Buscar)
  const [juegos, cuenta] = await Promise.all([
    consultar('games', CAMPOS + ' where ' + where + '; sort ' + orden + '; limit ' + pedir + '; offset ' + (pagina - 1) * pedir + ';'),
    conDuracion ? null : consultar('games/count', 'where ' + where + ';')
  ]);
  let traducidos = await conHoras(juegos);
  if (conDuracion) traducidos = traducidos.filter(function (j) { return cumpleDuracion(j, filtros.duracion); }).slice(0, POR_PAGINA);
  // Con duración no se sabe el total (se filtra después): total = null
  return { juegos: traducidos, pagina: pagina, hay_mas: juegos.length === pedir, total: cuenta ? cuenta.count : null };
}

// AAA y Exclusivos: IGDB trae candidatos (los más conocidos primero, de a 500, hasta 2.000) y aquí se dejan
// los que cumplen. No se sabe el total exacto (total = null: Buscar muestra "24+ juegos").
const CANDIDATOS_POR_PEDIDO = 500;
const MAXIMO_DE_PEDIDOS = 4;
async function explorarRevisando(filtros, where, orden, pagina, conDuracion) {
  const hasta = pagina * POR_PAGINA;
  let cumplen = [];
  let quedan = true;
  for (let i = 0; i < MAXIMO_DE_PEDIDOS && quedan && cumplen.length <= hasta; i++) {
    const lote = await consultar('games', CAMPOS + ' where ' + where + '; sort ' + orden + '; limit ' + CANDIDATOS_POR_PEDIDO + '; offset ' + i * CANDIDATOS_POR_PEDIDO + ';');
    cumplen = cumplen.concat(lote.filter(function (j) { return cumpleTipoPropio(j, filtros); }));
    quedan = lote.length === CANDIDATOS_POR_PEDIDO;
  }
  let traducidos = await conHoras(cumplen.slice(hasta - POR_PAGINA, hasta));
  if (conDuracion) traducidos = traducidos.filter(function (j) { return cumpleDuracion(j, filtros.duracion); });
  return { juegos: traducidos, pagina: pagina, hay_mas: cumplen.length > hasta, total: null };
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
  return elegido ? descripcionEnEspanol((await conHoras([elegido]))[0]) : null;
}

// id puede ser el slug ("hades--1", el que va en las direcciones) o el número de IGDB (113112, el de las tablas).
async function ficha(id) {
  let condicion;
  if (/^\d{1,10}$/.test(id)) condicion = 'id = ' + id;
  else if (/^[a-z0-9-]{1,100}$/.test(id)) condicion = 'slug = "' + id + '"';
  else throw falla('juego', 404);
  const juegos = await consultar('games', CAMPOS.replace(';', ', similar_games;') + ' where ' + condicion + '; limit 1;');
  if (!juegos.length) throw falla('juego', 404);
  const juego = await descripcionEnEspanol((await conHoras(juegos))[0]);
  juego.similares = await similares(juegos[0].similar_games);
  return juego;
}

// La ficha de un juego de Steam por su número (appid), para que la Biblioteca y el Perfil abran
// la ficha de SaveSlot: IGDB guarda el número de Steam en external_games (fuente 1 = Steam).
async function fichaDeSteam(appid) {
  if (!/^\d{1,10}$/.test(appid)) throw falla('juego', 404);
  const enlaces = await consultar('external_games', 'fields game; where uid = "' + appid + '" & (external_game_source = 1 | category = 1); limit 5;');
  const ids = enlaces.map(function (e) { return e.game; }).filter(Number.isInteger);
  if (!ids.length) throw falla('juego', 404);
  // Si hay varios (un juego y su edición), el principal: el que pasa el filtro de SOLO_JUEGOS
  const principales = await consultar('games', 'fields id; where id = (' + ids.join(',') + ') & ' + SOLO_JUEGOS + '; sort total_rating_count desc; limit 1;');
  return ficha(String((principales[0] || { id: ids[0] }).id));
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
// Con plataforma ("Xbox" o "PlayStation"): los más jugados que salen en esa consola y no en la otra
// (los que están en las dos, como Fortnite o GTA V, hacían que las dos pestañas se vieran iguales).
// IGDB no separa la popularidad por plataforma: se toman los 500 más jugados y se dejan los de esa.
async function populares(plataforma) {
  if (!numeroJugando) {
    const tipos = await consultar('popularity_types', 'fields id, name; where name = "Playing"; limit 1;');
    numeroJugando = tipos.length ? tipos[0].id : 1; // si no lo encuentra, usa las visitas (1)
  }
  const deEsa = ['Xbox', 'PlayStation'].indexOf(plataforma) !== -1 ? PLATAFORMAS[plataforma] : null;
  const cuantos = deEsa ? 500 : 20;
  const lista = await consultar('popularity_primitives', 'fields game_id, value; where popularity_type = ' + numeroJugando + '; sort value desc; limit ' + cuantos + ';');
  if (!lista.length) return [];
  const ids = lista.map(function (p) { return p.game_id; });
  const juegos = await consultar('games', CAMPOS + ' where id = (' + ids.join(',') + ') & ' + SOLO_JUEGOS +
    (deEsa ? ' & platforms = (' + deEsa.join(',') + ')' : '') + '; limit ' + cuantos + ';');
  juegos.sort(function (a, b) { return ids.indexOf(a.id) - ids.indexOf(b.id); });
  // Sin los que también están en la otra consola (se revisa aquí: ver cumpleTipoPropio)
  const otra = plataforma === 'Xbox' ? 'PlayStation' : 'Xbox';
  const elegidos = deEsa ? juegos.filter(function (j) { return familiasDe(j).indexOf(otra) === -1; }) : juegos;
  return conHoras(elegidos.slice(0, 10));
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
  // Se piden 40 porque algunos (programas, herramientas) no son juegos para IGDB.
  // Steam los ordena por jugadores de este momento, pero lo que mostramos es el pico de ayer:
  // se reordenan por ese pico, así el número que se ve siempre baja de #1 a #6.
  const primeros = ranking.slice(0, 40).filter(function (x) { return Number.isInteger(x.appid); })
    .sort(function (a, b) { return (b.peak_in_game || 0) - (a.peak_in_game || 0); });
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
    const puesto = primeros.find(function (x) { return x.appid === j.appid_steam; });
    j.jugadores_steam = puesto ? puesto.peak_in_game : null; // pico de jugadores a la vez (ayer)
    return j;
  });
}

module.exports = async function (req, res) {
  const q = req.query || {};
  try {
    let respuesta;
    if (q.buscar !== undefined) respuesta = { juegos: await buscar(q.buscar) };
    else if (q.id !== undefined) respuesta = { juego: await ficha(String(q.id)) };
    else if (q.steam_app !== undefined) respuesta = { juego: await fichaDeSteam(String(q.steam_app)) };
    else if (q.populares !== undefined) respuesta = { juegos: await populares(String(q.plataforma || '')) };
    else if (q.explorar !== undefined) respuesta = await explorar(q);
    else if (q.random !== undefined) respuesta = { juego: await random(q) };
    else if (q.steam !== undefined) respuesta = { juegos: await masJugadosSteam() };
    else { res.status(400).json({ error: 'pedido', detalle: 'Usa ?buscar=, ?id=, ?steam_app=, ?populares=1, ?explorar=1, ?random=1 o ?steam=1' }); return; }
    // Vercel guarda la respuesta una hora: menos consultas a IGDB y más rápido para todos.
    // El juego al azar no se guarda: cada pedido debe dar uno distinto.
    res.setHeader('Cache-Control', q.random !== undefined ? 'no-store' : 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json(respuesta);
  } catch (e) {
    if (!e.tipo) console.error(e);
    res.status(e.estado || 500).json({ error: e.tipo || 'api' });
  }
};

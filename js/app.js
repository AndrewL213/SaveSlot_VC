/* ==========================================================================
   SaveSlot · app.js
   El comportamiento de las pantallas construidas con el design kit.
   - Los datos se leen SOLO con obtenerDatos("…"). Hoy salen de js/data.js;
     cuando se conecten Supabase e IGDB, solo cambia esa función.
   - Hay una función por pantalla. <body data-pantalla="…"> dice cuál se ejecuta.
   - Mientras no haya backend, lo que la spec marca como Real se guarda en la
     memoria del navegador con claves ss.… (session, profile, myReviews, diary…),
     heredadas del prototipo. Al conectar Supabase, esas lecturas y escrituras se
     reemplazan por consultas a la base de datos.
   ========================================================================== */

/* ---------- Supabase ---------- */

// Cliente de Supabase: la librería supabase-js (cargada en cada página) con la
// dirección y la clave pública de js/config.js. Si la librería no cargó (por
// ejemplo, sin internet), queda en null y la app sigue con los datos de data.js.
var clienteSupabase = (window.supabase && typeof SUPABASE_URL !== 'undefined')
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_CLAVE_PUBLICA)
  : null;

/* ---------- Steam (funciones de Vercel en api/steam) ----------
   Entrar con Steam y leer sus datos pasa por /api/steam/auth y /api/steam/data,
   que tienen la clave de Steam en Vercel (nunca en este código). Al volver de
   Steam, la página trae ?steam=1&token_hash=…: aquí se convierte en una sesión
   de Supabase y la cuenta queda vinculada en el perfil. */

// Manda a la persona a Steam; al terminar vuelve a "destino" (una página de la app)
function irASteam(destino) {
  var vuelta = new URL(destino || location.href, location.href);
  vuelta.searchParams.set('steam', '1');
  location.href = '/api/steam/auth?action=login&redirect_to=' + encodeURIComponent(vuelta.href);
}

// Pide datos de Steam de la persona: 'profile', 'library', 'achievements' o 'stats' (+ appid)
function pedirSteam(accion, appid) {
  if (!clienteSupabase) return Promise.reject(new Error('Sin conexión con Supabase'));
  return clienteSupabase.auth.getSession().then(function (r) {
    var sesion = r.data && r.data.session;
    if (!sesion) throw new Error('Sin sesión de Steam');
    return fetch('/api/steam/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sesion.access_token },
      body: JSON.stringify({ action: accion, appid: appid })
    });
  }).then(function (respuesta) {
    return respuesta.json().then(function (datos) {
      if (!respuesta.ok) {
        var error = new Error(datos.error || 'Steam no respondió');
        error.privado = !!datos.private;
        throw error;
      }
      return datos;
    });
  });
}

// Al volver de Steam: abre la sesión y vincula la cuenta. Devuelve el aviso a mostrar (o null).
function terminarVueltaDeSteam() {
  var params = new URLSearchParams(location.search);
  if (!params.get('steam')) return Promise.resolve(null);
  var token = params.get('token_hash');
  var fallo = params.get('error');
  ['steam', 'token_hash', 'type', 'error'].forEach(function (p) { params.delete(p); });
  history.replaceState(null, '', location.pathname + (params.toString() ? '?' + params : '') + location.hash);
  if (fallo || !token || !clienteSupabase) return Promise.resolve('No pudimos conectar con Steam. Inténtalo de nuevo.');

  return clienteSupabase.auth.verifyOtp({ token_hash: token, type: 'magiclink' }).then(function (r) {
    if (r.error) throw r.error;
    return pedirSteam('profile');
  }).then(function (steam) {
    var nombre = steam.personaname || 'Steam';
    if (!obtenerSesion()) {
      // Entró con Steam: su cuenta de SaveSlot nace con Steam vinculada
      var usuario = 'steam_' + steam.steamid;
      iniciarSesion({ name: nombre, user: usuario, initials: inicialesDe(nombre), email: '', steam: true }, {
        profile: { user: usuario, xp: XP_POR_CUENTA, level: 1, bio: '', since: hoy(), favorites: [], wishlist: [], genres: [], playing: null,
          accounts: { Steam: nombre, PlayStation: null, Xbox: null, Nintendo: null }, missionsDone: [] },
        myReviews: [], diary: [], joined: [], inscripciones: [], friends: {}, chatsMatchplay: []
      });
      var propio = leerPerfil();
      propio.accounts = propio.accounts || {};
      propio.accounts.Steam = nombre;
      guardarMemoria('profile', propio);
      return 'Entraste con Steam · ' + nombre;
    }
    // Ya tenía sesión: se vincula Steam a su perfil
    var yaEstaba = !!(leerPerfil().accounts || {}).Steam;
    var perfil = yaEstaba ? leerPerfil() : sumarXp(XP_POR_CUENTA);
    perfil.accounts = perfil.accounts || {};
    perfil.accounts.Steam = nombre;
    guardarMemoria('profile', perfil);
    return 'Steam vinculada · ' + nombre + (yaEstaba ? '' : ' · +' + XP_POR_CUENTA + ' XP');
  }).catch(function () {
    return 'No pudimos conectar con Steam. Inténtalo de nuevo.';
  });
}

// Un juego de la biblioteca de Steam en el mismo formato que los de data.js.
// Portadas: las oficiales de Steam (con crédito a Steam); si no hay vertical, la horizontal.
function juegoDeSteam(g) {
  var cdn = 'https://cdn.cloudflare.steamstatic.com/steam/apps/' + g.appid + '/';
  return {
    id: 'steam-' + g.appid, appid: g.appid, nombre: g.name, nombreCorto: g.name,
    portada: cdn + 'library_600x900.jpg', portadaRespaldo: cdn + 'header.jpg', color: null,
    generos: [], plataformas: ['PC (Steam)'], horas: g.hours || 0, ultimaVez: g.last_played || 0, steam: true
  };
}

// Biblioteca de Steam guardada en el navegador (se actualiza al abrir Biblioteca o Editar perfil)
function leerBibliotecaSteam() {
  return (leerMemoria('steamBiblioteca', null) || { games: [] }).games.map(juegoDeSteam);
}

function actualizarBibliotecaSteam() {
  return pedirSteam('library').then(function (datos) {
    guardarMemoria('steamBiblioteca', { fecha: Date.now(), games: datos.games });
    return datos.games.map(juegoDeSteam);
  });
}

function tieneSteam() {
  return !!(leerPerfil().accounts || {}).Steam;
}

// A dónde lleva un juego: su ficha en SaveSlot o, si viene de Steam, su página en la tienda de Steam
function enlaceJuego(juego) {
  return juego.steam
    ? 'https://store.steampowered.com/app/' + juego.appid + '/'
    : 'detalle-juego.html?id=' + encodeURIComponent(juego.id);
}

// Botón "Steam" de Iniciar sesión y Crear cuenta
function activarBotonSteam() {
  var boton = document.querySelector('a[href*="servicio=Steam"]');
  if (!boton || !clienteSupabase) return;
  boton.addEventListener('click', function (e) {
    e.preventDefault();
    irASteam(destinoVolver());
  });
}

/* ---------- Datos ---------- */

// Devuelve una copia de la lista pedida ("juegos", "resenas", "eventos"…).
function obtenerDatos(tipo) {
  return (DATOS[tipo] || []).slice();
}

function buscarPorId(tipo, id) {
  if (tipo === 'juegos' && /^steam-/.test(id)) {
    return leerBibliotecaSteam().find(function (j) { return j.id === id; }) || null;
  }
  return obtenerDatos(tipo).find(function (x) { return x.id === id; }) || null;
}

// Busca juegos con filtros: { texto, generos, plataformas, tipo, duracion, desde, hasta }.
// Hoy filtra los juegos de data.js; con IGDB, esta función hará la consulta a api/.
function buscarJuegos(filtros) {
  var texto = (filtros.texto || '').toLowerCase();
  return obtenerDatos('juegos').filter(function (j) {
    var horas = j.horasHistoria;
    if (texto && (j.nombre + ' ' + j.nombreCorto + ' ' + j.generos.join(' ')).toLowerCase().indexOf(texto) === -1) return false;
    if (filtros.generos.length && !filtros.generos.some(function (g) { return j.generos.indexOf(g) !== -1; })) return false;
    if (filtros.plataformas.length && !filtros.plataformas.some(function (p) { return j.plataformas.indexOf(p) !== -1; })) return false;
    if (filtros.tipo && j.tipo !== filtros.tipo) return false;
    if (filtros.duracion === 'corto' && !(horas && horas < 10)) return false;
    if (filtros.duracion === 'medio' && !(horas && horas >= 10 && horas <= 40)) return false;
    if (filtros.duracion === 'largo' && !(horas && horas > 40)) return false;
    if (filtros.desde && j.anio && j.anio < filtros.desde) return false;
    if (filtros.hasta && j.anio && j.anio > filtros.hasta) return false;
    return true;
  });
}

/* ---------- Rutas ---------- */

// Las páginas de pages/ suben un nivel para llegar a la raíz.
var RAIZ = /\/pages\//.test(location.pathname) ? '../' : '';

// Ruta a una página de la app desde la carpeta actual.
function rutaPagina(archivo) {
  return RAIZ + (/^(index|404)\.html/.test(archivo) ? '' : 'pages/') + archivo;
}

// Ruta a un archivo de assets/ desde la carpeta actual.
function rutaRecurso(ruta) {
  return ruta ? RAIZ + ruta : '';
}

/* ---------- Memoria del navegador ---------- */

function leerMemoria(clave, porDefecto) {
  try {
    var v = localStorage.getItem('ss.' + clave);
    return v == null ? porDefecto : JSON.parse(v);
  } catch (e) {
    return porDefecto;
  }
}

function guardarMemoria(clave, valor) {
  try { localStorage.setItem('ss.' + clave, JSON.stringify(valor)); } catch (e) { /* modo privado */ }
}

function leerVisita(clave) {
  try { return sessionStorage.getItem('ss.' + clave); } catch (e) { return null; }
}

function guardarVisita(clave, valor) {
  try { sessionStorage.setItem('ss.' + clave, valor); } catch (e) { /* modo privado */ }
}

// Los juegos de ejemplo ahora usan su id de IGDB (el "slug"). Cuatro cambiaron de id:
// esta traducción corre una sola vez y pasa al id nuevo lo que ya estaba guardado
// en el navegador (reseñas, diario, vistos, favoritos, borradores…).
var IDS_VIEJOS_DE_JUEGOS = {
  'zelda-totk': 'the-legend-of-zelda-tears-of-the-kingdom',
  'pokemon-legends-za': 'pokemon-legends-z-a',
  'fnaf-into-the-pit': 'five-nights-at-freddys-into-the-pit',
  'hades': 'hades--1'
};

function traducirIdsViejos() {
  try {
    if (localStorage.getItem('ss.idsIgdb')) return;
    Object.keys(localStorage).forEach(function (clave) {
      if (clave.indexOf('ss.') !== 0) return;
      var valor = localStorage.getItem(clave);
      var nuevo = valor.replace(/"([a-z0-9-]+)"/g, function (todo, id) {
        return IDS_VIEJOS_DE_JUEGOS[id] ? '"' + IDS_VIEJOS_DE_JUEGOS[id] + '"' : todo;
      });
      var claveNueva = clave.replace(/^ss.draft.(.+)$/, function (todo, id) {
        return IDS_VIEJOS_DE_JUEGOS[id] ? 'ss.draft.' + IDS_VIEJOS_DE_JUEGOS[id] : todo;
      });
      if (claveNueva !== clave) localStorage.removeItem(clave);
      if (nuevo !== valor || claveNueva !== clave) localStorage.setItem(claveNueva, nuevo);
    });
    localStorage.setItem('ss.idsIgdb', '1');
  } catch (e) { /* modo privado */ }
}
traducirIdsViejos();

// Id del juego que llega en la dirección (?id=…). Los enlaces viejos siguen funcionando.
function idDeJuego(id) {
  if (!id) return 'the-legend-of-zelda-tears-of-the-kingdom';
  return IDS_VIEJOS_DE_JUEGOS[id] || id;
}

/* ---------- Sesión (hasta conectar Supabase) ---------- */

function obtenerSesion() {
  return leerMemoria('session', null);
}

// Relación con otra persona: 'amigos', 'solicitud recibida', 'solicitud enviada' o 'ninguna'.
// Los cambios (aceptar, enviar, eliminar) se guardan en el navegador con los códigos
// del prototipo (friend, in, out, none) hasta conectar Supabase.
var RELACIONES = { friend: 'amigos', 'in': 'solicitud recibida', out: 'solicitud enviada', none: 'ninguna' };

function relacionCon(usuario) {
  var sesion = obtenerSesion();
  if (!sesion || usuario === sesion.user) return 'ninguna';
  var cambios = leerMemoria('friends', {});
  if (cambios[usuario]) return RELACIONES[cambios[usuario]] || 'ninguna';
  var dato = obtenerDatos('amigos').find(function (a) { return a.usuario === sesion.user && a.amigo === usuario; });
  return dato ? dato.estado : 'ninguna';
}

function cambiarRelacion(usuario, codigo) {
  var cambios = leerMemoria('friends', {});
  cambios[usuario] = codigo;
  guardarMemoria('friends', cambios);
}

function sonAmigos(usuario) {
  return relacionCon(usuario) === 'amigos';
}

/* ---------- Reseñas propias y comentarios (hasta conectar Supabase) ----------
   Lo que la persona publica se guarda en el navegador (myReviews, diary,
   comments.…) y lo leen el Diario, el Historial, el Perfil y el Detalle de juego. */

function usuarioActual() {
  return (obtenerSesion() || { user: 'samluq' }).user;
}

// Reseña guardada (formato del prototipo) → formato de data.js
function resenaDesdeMemoria(r) {
  return {
    id: r.id, juego: r.game, autor: usuarioActual(), tipo: r.kind === 'guia' ? 'guia' : 'resena', estado: 'publicada',
    titulo: r.title || null, texto: r.text, calificacion: r.score, dificultad: r.diff || null, horas: r.hours || 0,
    minutosLectura: r.kind === 'guia' ? Math.max(1, Math.round(String(r.text).split(/\s+/).length / 200)) : null,
    spoiler: !!r.spoiler, votosUtil: r.useful || 0, porcentajeUtil: null, meGusta: r.likes || 0, fecha: r.date || null,
    estadoPartida: r.state || null, editada: !!r.edited
  };
}

function resenaParaMemoria(r) {
  return {
    id: r.id, game: r.juego, kind: r.tipo, title: r.titulo, text: r.texto, score: r.calificacion, diff: r.dificultad,
    hours: r.horas, spoiler: r.spoiler, useful: r.votosUtil, likes: r.meGusta, date: r.fecha, state: r.estadoPartida, edited: r.editada
  };
}

// Las reseñas propias: las guardadas o, si no hay, las de samluq en data.js
function leerResenasPropias() {
  var guardadas = leerMemoria('myReviews', null);
  if (guardadas) return guardadas.map(resenaDesdeMemoria);
  return obtenerDatos('resenas').filter(function (r) { return r.autor === 'samluq'; }).map(function (r) {
    var partida = obtenerDatos('diario').find(function (d) { return d.juego === r.juego; });
    return Object.assign({}, r, { autor: usuarioActual(), estadoPartida: partida ? partida.estado : null, editada: false });
  });
}

function guardarResenasPropias(lista) {
  guardarMemoria('myReviews', lista.map(resenaParaMemoria));
}

// Todas las reseñas y guías: las de los demás (data.js) y las propias
function obtenerResenas() {
  return obtenerDatos('resenas').filter(function (r) { return r.autor !== 'samluq'; }).concat(leerResenasPropias());
}

function esPropia(resena) {
  return leerResenasPropias().some(function (r) { return r.id === resena.id; });
}

function leerComentarios(idResena) {
  var guardados = leerMemoria('comments.' + idResena, null);
  if (!guardados) return obtenerDatos('comentarios').filter(function (c) { return c.resena === idResena; });
  return guardados.map(function (c, i) {
    return { id: c.id || idResena + '-' + i, resena: idResena, autor: c.user, texto: c.text, fecha: c.fecha || null, cuando: c.when || null };
  });
}

function guardarComentarios(idResena, lista) {
  guardarMemoria('comments.' + idResena, lista.map(function (c) {
    var autor = buscarPorId('usuarios', c.autor);
    return { id: c.id, review: idResena, user: c.autor, initials: autor ? autor.iniciales : (obtenerSesion() || {}).initials, text: c.texto, fecha: c.fecha, when: c.cuando || null };
  }));
}

// Suma una entrada al diario (formato del prototipo), la más reciente primero
function agregarAlDiario(entrada) {
  var diario = leerMemoria('diary', null) || obtenerDatos('diario').map(function (d) {
    return { game: d.juego, date: d.fecha, state: d.estado, hours: d.horas, score: d.calificacion, like: d.meGusta, review: d.tieneResena };
  });
  diario.unshift({ game: entrada.juego, date: entrada.fecha, state: entrada.estado, hours: entrada.horas, score: entrada.calificacion, like: entrada.meGusta, review: entrada.tieneResena });
  diario.sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
  guardarMemoria('diary', diario);
}

// Suma XP al perfil; cada 1.500 XP se sube de nivel
var XP_POR_NIVEL = 1500;
function sumarXp(cantidad) {
  var perfil = leerPerfil();
  perfil.xp += cantidad;
  while (perfil.xp >= XP_POR_NIVEL) { perfil.xp -= XP_POR_NIVEL; perfil.level += 1; }
  guardarMemoria('profile', perfil);
  return perfil;
}

/* ---------- Ayudas para armar HTML ---------- */

// Escapa texto antes de ponerlo en el HTML.
function escapar(texto) {
  return String(texto == null ? '' : texto).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

var MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// '2026-10-07' → '7 oct 2026'
function formatearFecha(fecha) {
  if (!fecha) return '';
  var partes = String(fecha).split('-');
  return Number(partes[2]) + ' ' + MESES[Number(partes[1]) - 1] + ' ' + partes[0];
}

function hoy() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function formatearNumero(n) {
  return Number(n || 0).toLocaleString('es-CO');
}

// 2100 → "2,1k" (números grandes en poco espacio)
function formatearCorto(n) {
  return n >= 1000 ? String(Math.round(n / 100) / 10).replace('.', ',') + 'k' : String(n);
}

// Promedios con un decimal: 8 → '8,0'
function formatearPromedio(n) {
  return n.toFixed(1).replace('.', ',');
}

function formatearNota(n) {
  return n == null ? '' : String(Math.round(n * 10) / 10).replace('.', ',');
}

// Color del juego o del evento (contenido, no diseño): se marca con data-color
// y aplicarColores() lo pasa a la variable --c que usan los componentes.
function atributoColor(color) {
  return color ? ' data-color="' + escapar(color) + '"' : '';
}

function aplicarColores(contenedor) {
  (contenedor || document).querySelectorAll('[data-color]').forEach(function (el) {
    if (/^#[0-9a-fA-F]{6}$/.test(el.dataset.color)) el.style.setProperty('--c', el.dataset.color);
  });
  // También las medidas: data-h (altura de una barra, 0 a 100) y data-ancho (ancho de un medidor, 0 a 100)
  (contenedor || document).querySelectorAll('[data-h], [data-ancho]').forEach(function (el) {
    if (el.dataset.h) el.style.setProperty('--h', Math.max(0, Math.min(100, Number(el.dataset.h) || 0)));
    if (el.dataset.ancho) el.style.width = Math.max(0, Math.min(100, Number(el.dataset.ancho) || 0)) + '%';
  });
}

// Imagen de la portada, desde assets/.
function imagenPortada(juego) {
  if (!juego.portada) return '';
  var src = /^https?:/.test(juego.portada) ? juego.portada : rutaRecurso(juego.portada);
  return '<img class="portada__imagen" src="' + escapar(src) + '"' +
    (juego.portadaRespaldo ? ' data-respaldo="' + escapar(juego.portadaRespaldo) + '" loading="lazy"' : '') +
    ' alt="Portada de ' + escapar(juego.nombre) + '">';
}

// Si una portada no carga, usa la de respaldo; si tampoco, se queda el recuadro neutro
document.addEventListener('error', function (e) {
  var img = e.target;
  if (!img.classList || !img.classList.contains('portada__imagen')) return;
  if (img.dataset.respaldo) {
    img.src = img.dataset.respaldo;
    delete img.dataset.respaldo;
  } else if (/steamstatic/.test(img.src)) {
    img.remove();
  }
}, true);

function crearElemento(html) {
  var plantilla = document.createElement('template');
  plantilla.innerHTML = html.trim();
  return plantilla.content.firstElementChild;
}

/* ---------- Ventanas (modal) ---------- */

var ICONO_CERRAR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

// Abre una ventana. opciones: { titulo, texto, html, acciones: [{ texto, href, principal, peligro, alTocar }] }
// Una acción con alTocar ejecuta esa función y cierra la ventana.
function abrirModal(opciones) {
  var anterior = document.activeElement;
  var acciones = (opciones.acciones || []).map(function (a, i) {
    var clase = 'boton' + (a.peligro ? ' boton--peligro' : (a.principal ? '' : ' boton--secundario'));
    return a.href
      ? '<a class="' + clase + '" href="' + escapar(a.href) + '">' + escapar(a.texto) + '</a>'
      : '<button class="' + clase + '" type="button" data-cerrar data-accion="' + i + '">' + escapar(a.texto) + '</button>';
  }).join('');
  var fondo = crearElemento(
    '<div class="modal-fondo">' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">' +
        '<button class="boton boton--fantasma boton--icono modal__cerrar" type="button" aria-label="Cerrar" data-cerrar>' + ICONO_CERRAR + '</button>' +
        '<h2 class="modal__titulo" id="modal-titulo">' + escapar(opciones.titulo) + '</h2>' +
        (opciones.texto ? '<p class="modal__texto">' + escapar(opciones.texto) + '</p>' : '') +
        (opciones.html || '') +
        (acciones ? '<div class="modal__acciones">' + acciones + '</div>' : '') +
      '</div>' +
    '</div>');

  function cerrar() {
    fondo.remove();
    document.removeEventListener('keydown', alTeclear);
    if (anterior && anterior.focus) anterior.focus();
  }
  function alTeclear(e) {
    if (e.key === 'Escape') cerrar();
  }
  fondo.addEventListener('click', function (e) {
    var accion = e.target.closest('[data-accion]');
    if (accion && opciones.acciones[accion.dataset.accion].alTocar) {
      cerrar();
      opciones.acciones[accion.dataset.accion].alTocar();
      return;
    }
    if (e.target === fondo || e.target.closest('[data-cerrar]')) cerrar();
  });
  document.addEventListener('keydown', alTeclear);
  document.body.appendChild(fondo);
  var primero = fondo.querySelector('.modal__acciones .boton, .modal__cerrar');
  if (primero) primero.focus();
  return cerrar;
}

// Ventana "Necesitas una cuenta": vuelve a esta página al terminar.
function pedirCuenta(motivo) {
  var volver = encodeURIComponent(location.pathname.split('/').pop() + location.search);
  abrirModal({
    titulo: 'Necesitas una cuenta',
    texto: 'Crea tu cuenta gratis para ' + motivo + '. Solo toma un minuto.',
    acciones: [
      { texto: 'Ya tengo cuenta', href: rutaPagina('iniciar-sesion.html') + '?volver=' + volver },
      { texto: 'Crear cuenta gratis', href: rutaPagina('crear-cuenta.html') + '?volver=' + volver, principal: true }
    ]
  });
}

// Mensaje corto abajo de la pantalla. accion (opcional): { texto: 'Deshacer', alTocar: function }
function mostrarAviso(texto, accion) {
  document.querySelectorAll('.aviso-flotante').forEach(function (a) { a.remove(); });
  var aviso = crearElemento('<div class="aviso-flotante" role="status"></div>');
  aviso.textContent = texto;
  if (accion) {
    var boton = crearElemento('<button class="aviso-flotante__accion" type="button"></button>');
    boton.textContent = accion.texto;
    boton.addEventListener('click', function () {
      aviso.remove();
      accion.alTocar();
    });
    aviso.appendChild(boton);
  }
  document.body.appendChild(aviso);
  setTimeout(function () { aviso.remove(); }, accion ? 5000 : 2600);
}

/* ---------- Partes comunes a todas las pantallas ---------- */

var ICONO_AMIGOS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.9.8 3.1 2.6 3.5 5.2"/></svg>';
var ICONO_CAMPANA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>';

// Encabezado: con sesión muestra Amigos, campana y la pastilla del usuario.
function prepararEncabezado() {
  var sesion = obtenerSesion();
  var acciones = document.querySelector('[data-acciones-sesion]');
  var enlaceCuenta = document.querySelector('[data-enlace-cuenta]');
  if (!sesion || !acciones) return;

  var usuario = buscarPorId('usuarios', sesion.user);
  var nivel = leerMemoria('profile', {}).level || (usuario && usuario.nivel) || 1;
  var avisos = obtenerDatos('notificaciones').filter(function (n) { return n.usuario === sesion.user; });
  var solicitudes = obtenerDatos('usuarios').filter(function (u) { return relacionCon(u.usuario) === 'solicitud recibida'; });
  var cantidad = avisos.length + (solicitudes.length ? 1 : 0);

  acciones.innerHTML =
    '<a class="boton boton--secundario boton--icono navegacion__ocultar-movil" href="' + rutaPagina('amigos.html') + '" aria-label="Amigos">' + ICONO_AMIGOS + '</a>' +
    '<button class="boton boton--secundario boton--icono" type="button" data-notificaciones aria-label="Notificaciones, ' + cantidad + ' nuevas">' + ICONO_CAMPANA +
      (cantidad ? '<span class="contador contador--destacado navegacion__contador" aria-hidden="true">' + cantidad + '</span>' : '') + '</button>' +
    '<a class="navegacion__usuario" href="' + rutaPagina('perfil.html') + '">' +
      '<span class="avatar avatar--sm">' + escapar(sesion.initials) + '</span>' +
      '<span><span class="navegacion__nombre">' + escapar(String(sesion.name || '').split(' ')[0]) + '</span>' +
      '<span class="navegacion__nivel">Nivel ' + escapar(nivel) + '</span></span>' +
    '</a>';

  acciones.querySelector('[data-notificaciones]').addEventListener('click', function () {
    // 26. Ventana: Notificaciones (solicitudes de amistad y avisos, cada uno con su enlace)
    var html = (solicitudes.length
      ? '<a class="tarjeta tarjeta--enlace" href="' + rutaPagina('amigos.html') + '#solicitudes"><b>' + solicitudes.length + (solicitudes.length === 1 ? ' solicitud' : ' solicitudes') + ' de amistad</b>' +
        '<span class="tarjeta__texto">' + solicitudes.map(function (u) { return escapar(u.nombre); }).join(', ') + '</span></a>'
      : '') +
      avisos.map(function (n) {
        return '<a class="tarjeta tarjeta--enlace" href="' + rutaPagina(n.enlace) + '"><span>' + escapar(n.texto) + '</span>' +
          (n.fecha ? '<span class="tarjeta__texto">' + formatearFecha(n.fecha) + '</span>' : '') + '</a>';
      }).join('');
    abrirModal({
      titulo: 'Notificaciones',
      html: '<div class="pila pila--junta">' + (html || '<div class="vacio">No tienes avisos nuevos.</div>') + '</div>',
      acciones: [{ texto: 'Cerrar' }]
    });
  });

  if (enlaceCuenta) {
    enlaceCuenta.href = rutaPagina('perfil.html');
    enlaceCuenta.querySelector('[data-texto]').textContent = 'Perfil';
  }
}

// Franja "Prototipo académico": se puede cerrar y se recuerda.
function prepararFranja() {
  var franja = document.querySelector('[data-franja]');
  if (!franja) return;
  if (leerMemoria('hideDemo', false)) { franja.hidden = true; return; }
  franja.querySelector('[data-cerrar-franja]').addEventListener('click', function () {
    franja.hidden = true;
    guardarMemoria('hideDemo', true);
  });
}

// Pie: con sesión, "Iniciar sesión" pasa a "Cerrar sesión".
function prepararPie() {
  var enlace = document.querySelector('[data-pie-sesion]');
  if (!enlace || !obtenerSesion()) return;
  enlace.textContent = 'Cerrar sesión';
  enlace.href = rutaPagina('index.html');
  enlace.addEventListener('click', function (e) {
    e.preventDefault();
    guardarMemoria('session', null);
    var salir = function () { location.href = rutaPagina('index.html'); };
    if (clienteSupabase) clienteSupabase.auth.signOut().then(salir, salir);
    else salir();
  });
}

/* ---------- Piezas que se repiten entre pantallas ---------- */

// Portada de un juego con su nota, para rejillas.
function htmlJuegoMini(juego, ranking) {
  return '<li>' +
    '<a class="portada portada--enlace" href="' + rutaPagina('detalle-juego.html') + '?id=' + encodeURIComponent(juego.id) + '"' + atributoColor(juego.color) + '>' + imagenPortada(juego) +
      (ranking ? '<span class="portada__ranking">#' + ranking + '</span>' : '') +
      '<b class="portada__titulo">' + escapar(juego.nombreCorto) + '</b>' +
      '<span class="solo-lectores">, abrir la ficha del juego</span>' +
    '</a>' +
    '<div class="juego__meta">' +
      '<span class="tarjeta__texto">' + escapar(juego.generos[0] || '') + '</span>' +
      (juego.calificacion != null ? '<span class="nota nota--texto" aria-label="Nota de la comunidad ' + formatearNota(juego.calificacion) + ' de 10">' + formatearNota(juego.calificacion) + '</span>' : '') +
    '</div>' +
  '</li>';
}

// Tarjeta de reseña con autor, nota, texto y acciones.
function htmlResena(resena, opciones) {
  var juego = buscarPorId('juegos', resena.juego);
  var autor = buscarPorId('usuarios', resena.autor) || { usuario: resena.autor, iniciales: '?' };
  var comentarios = leerComentarios(resena.id).length;
  var votado = leerMemoria('votosUtil', []).indexOf(resena.id) !== -1;
  var votos = resena.votosUtil + (votado ? 1 : 0);
  return '<article class="tarjeta tarjeta--resena"' + atributoColor(juego && juego.color) + '>' +
    '<div class="en-fila">' +
      '<span class="avatar' + (autor.estado ? ' avatar--' + autor.estado : '') + '" aria-hidden="true">' + escapar(autor.iniciales) + (autor.estado ? '<span class="avatar__punto"></span>' : '') + '</span>' +
      '<div>' +
        '<a href="' + rutaPagina('perfil-usuario.html') + '?u=' + encodeURIComponent(autor.usuario) + '"><b>' + escapar(autor.usuario) + '</b></a> ' +
        (sonAmigos(autor.usuario) ? '<span class="etiqueta etiqueta--amigo">Amigo</span>' : '') +
        '<p class="tarjeta__texto">' + (opciones && opciones.conJuego && juego ? 'sobre ' + escapar(juego.nombreCorto) + ' · ' : '') + escapar(resena.horas) + ' h jugadas</p>' +
      '</div>' +
      '<span class="nota al-final" aria-label="Nota ' + resena.calificacion + ' de 10">' + escapar(resena.calificacion) + '<small>/10</small></span>' +
    '</div>' +
    (resena.spoiler
      ? '<div class="spoiler"><span>Esta reseña tiene spoilers.</span><button class="boton boton--secundario boton--sm" type="button" data-mostrar-spoiler>Mostrar de todas formas</button></div><p hidden>' + escapar(resena.texto) + '</p>'
      : '<p>' + escapar(resena.texto) + '</p>') +
    '<div class="en-fila tarjeta__texto">' +
      '<button class="boton boton--secundario boton--sm" type="button" data-util="' + escapar(resena.id) + '"' + (esPropia(resena) ? ' data-propia' : '') + ' aria-pressed="' + votado + '">Útil · <span>' + formatearNumero(votos) + '</span></button>' +
      '<span>♥ ' + formatearNumero(resena.meGusta) + '</span>' +
      '<span>' + comentarios + (comentarios === 1 ? ' comentario' : ' comentarios') + '</span>' +
      '<a class="al-final" href="' + rutaPagina('detalle-resena.html') + '?id=' + encodeURIComponent(resena.id) + '">Leer y comentar →</a>' +
    '</div>' +
  '</article>';
}

// Acciones de las tarjetas de reseña:
// - "Mostrar de todas formas" destapa una reseña con spoilers.
// - Votar "Útil": pide cuenta si no hay sesión; un voto por reseña.
function activarResenas(contenedor) {
  contenedor.addEventListener('click', function (e) {
    var spoiler = e.target.closest('[data-mostrar-spoiler]');
    if (spoiler) {
      var caja = spoiler.closest('.spoiler');
      caja.nextElementSibling.hidden = false;
      caja.remove();
      return;
    }
    var boton = e.target.closest('[data-util]');
    if (!boton) return;
    if (!obtenerSesion()) { pedirCuenta('votar reseñas'); return; }
    if (boton.hasAttribute('data-propia')) { mostrarAviso('No puedes votar tu propia reseña'); return; }
    if (boton.getAttribute('aria-pressed') === 'true') return;
    var votos = leerMemoria('votosUtil', []);
    votos.push(boton.dataset.util);
    guardarMemoria('votosUtil', votos);
    var numero = boton.querySelector('span');
    numero.textContent = formatearNumero(Number(numero.textContent.replace(/\D/g, '')) + 1);
    boton.setAttribute('aria-pressed', 'true');
    mostrarAviso('Gracias por tu voto');
  });
}

function enlaceEvento(evento) {
  return rutaPagina('detalle-evento.html') + '?id=' + encodeURIComponent(evento.id);
}

// "41 / 64", "1.284 participantes" o "Sin límite"
function textoCupos(evento) {
  if (evento.cuposMaximos) return evento.cuposOcupados + ' / ' + evento.cuposMaximos;
  return evento.cuposOcupados ? formatearNumero(evento.cuposOcupados) + ' participantes' : 'Sin límite';
}

// Tarjeta grande del evento del mes
function htmlEventoDestacado(evento) {
  return '<a class="tarjeta tarjeta--enlace tarjeta--destacada" href="' + enlaceEvento(evento) + '"' + atributoColor(evento.color) + '>' +
    '<span class="en-fila">' + etiquetaTipoEvento(evento) + '<span class="etiqueta etiqueta--contorno">EVENTO DEL MES</span></span>' +
    '<h3 class="titulo-pagina">' + escapar(evento.titulo) + '</h3>' +
    '<p class="tarjeta__texto">' + escapar(evento.fechaHora) + ' · Organiza: ' + escapar(evento.organizador) + '</p>' +
    '<span class="en-fila"><span class="boton">Ver evento</span><span class="tarjeta__texto">' + escapar(evento.cuposOcupados) + ' de ' + escapar(evento.cuposMaximos) + ' cupos ocupados</span></span>' +
  '</a>';
}

// Tarjeta de evento con banda de color
function htmlEvento(evento) {
  var juego = evento.juego ? buscarPorId('juegos', evento.juego) : null;
  return '<a class="tarjeta tarjeta--enlace" href="' + enlaceEvento(evento) + '">' +
    '<div class="tarjeta__banda"' + atributoColor(evento.color) + '>' + etiquetaTipoEvento(evento) + '</div>' +
    '<div class="tarjeta__cuerpo">' +
      '<span class="tarjeta__texto">' + escapar(juego ? juego.nombreCorto : 'Cualquier tienda') + '</span>' +
      '<h3 class="tarjeta__titulo">' + escapar(evento.titulo) + '</h3>' +
      '<p class="tarjeta__texto">' + escapar(evento.fechaHora) + '<br>' + escapar(evento.organizador) + '</p>' +
      '<p class="tarjeta__pie"><span>' + escapar(textoCupos(evento)) + '</span><b>' + escapar(evento.costo) + '</b></p>' +
    '</div>' +
  '</a>';
}

function etiquetaTipoEvento(evento) {
  return evento.tipo === 'torneo'
    ? '<span class="etiqueta etiqueta--primario">TORNEO</span>'
    : '<span class="etiqueta etiqueta--exito">SORTEO</span>';
}

/* ==========================================================================
   Pantallas
   ========================================================================== */

// 1. Inicio (y 2. Ventana: Evento del mes)
function pantallaIndex() {
  var juegos = obtenerDatos('juegos');

  // Portadas de la bienvenida (decorativas: el texto ya dice de qué trata la página)
  document.getElementById('portadas-heroe').innerHTML = obtenerDatos('destacadosInicio').map(function (d) {
    var juego = buscarPorId('juegos', d.juego);
    if (!juego) return '';
    return '<div class="portada heroe__portada"' + atributoColor(juego.color) + '>' + imagenPortada(juego) +
      '<b class="portada__titulo">' + escapar(juego.nombreCorto) + '</b></div>';
  }).join('');

  // Mejores juegos de la semana: los 6 de mejor calificación
  var mejores = juegos.slice().sort(function (a, b) { return (b.calificacion || 0) - (a.calificacion || 0); }).slice(0, 6);
  document.getElementById('mejores-juegos').innerHTML = mejores.map(function (j, i) { return htmlJuegoMini(j, i + 1); }).join('');

  // Vistos recientemente: solo si ya se abrió algún juego
  var vistos = leerMemoria('recentGames', []).map(function (id) { return buscarPorId('juegos', id); }).filter(Boolean);
  if (vistos.length) {
    document.getElementById('vistos').innerHTML = vistos.map(function (j) { return htmlJuegoMini(j); }).join('');
    document.getElementById('seccion-vistos').hidden = false;
  }

  // Reseñas destacadas: las 3 primeras publicadas sin spoiler (como en el diseño)
  var destacadas = obtenerResenas()
    .filter(function (r) { return r.tipo === 'resena' && !r.spoiler && r.estado === 'publicada'; })
    .slice(0, 3);
  var contenedorResenas = document.getElementById('resenas-destacadas');
  contenedorResenas.innerHTML = destacadas.map(function (r) { return htmlResena(r, { conJuego: true }); }).join('');
  activarResenas(contenedorResenas);

  // Eventos: el evento del mes y un sorteo
  var eventos = obtenerDatos('eventos');
  var delMes = eventos.find(function (e) { return e.destacado; });
  var sorteo = eventos.find(function (e) { return e.tipo === 'sorteo'; });
  var htmlEventos = (delMes ? htmlEventoDestacado(delMes) : '') + (sorteo ? htmlEvento(sorteo) : '');
  document.getElementById('eventos-inicio').innerHTML = htmlEventos;
  aplicarColores(document);

  // Ventana "Evento del mes": una sola vez por visita
  if (delMes && !leerVisita('eventoDelMesVisto')) {
    guardarVisita('eventoDelMesVisto', '1');
    setTimeout(function () {
      abrirModal({
        titulo: delMes.titulo,
        texto: 'Evento del mes. Arma tu equipo y compite. ' + delMes.fechaHora + ' · ' + delMes.cuposOcupados + ' de ' + delMes.cuposMaximos + ' cupos ocupados.',
        acciones: [{ texto: 'Ver evento', href: rutaPagina('detalle-evento.html') + '?id=' + encodeURIComponent(delMes.id), principal: true }]
      });
    }, 900);
  }
}

// 3. Buscar juegos
function pantallaBuscar() {
  var parametros = new URLSearchParams(location.search);
  var formularioBusqueda = document.getElementById('formulario-busqueda');
  var campoBusqueda = document.getElementById('busqueda');
  var filtros = document.getElementById('filtros');
  var botonFiltros = document.getElementById('boton-filtros');
  var titulo = document.getElementById('cantidad-resultados');
  var resultados = document.getElementById('resultados');
  var tipo = '';
  var duracion = '';

  // Lo que llega en la dirección: ?q=hollow o ?genero=Terror
  campoBusqueda.value = parametros.get('q') || '';
  var generoInicial = parametros.get('genero');
  filtros.querySelectorAll('input[name="genero"]').forEach(function (casilla) {
    if (casilla.value === generoInicial) casilla.checked = true;
  });

  function marcados(nombre) {
    return Array.prototype.map.call(filtros.querySelectorAll('input[name="' + nombre + '"]:checked'), function (c) { return c.value; });
  }

  function marcarChips(atributo, valor) {
    filtros.querySelectorAll('[data-' + atributo + ']').forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.dataset[atributo] === valor));
    });
  }

  function htmlResultado(juego) {
    var horas = juego.horasHistoria ? juego.horasHistoria + ' h' : 'Online';
    return '<a class="tarjeta tarjeta--enlace resultado" href="detalle-juego.html?id=' + encodeURIComponent(juego.id) + '">' +
      '<span class="portada portada--sm"' + atributoColor(juego.color) + '>' + imagenPortada(juego) + '</span>' +
      '<span class="resultado__nombre">' +
        '<b class="tarjeta__titulo">' + escapar(juego.nombre) + '</b>' +
        '<span class="tarjeta__texto">' + escapar(juego.generos.join(', ')) + ' · ' + escapar(juego.anio || '') + ' · ' + escapar(juego.plataformas.join(', ')) + '</span>' +
        (juego.tipo ? '<span class="etiqueta etiqueta--contorno">' + escapar(juego.tipo) + '</span>' : '') +
      '</span>' +
      '<span class="resultado__datos">' +
        '<span class="tarjeta__texto">Nota</span><span class="tarjeta__texto">Historia</span><span class="tarjeta__texto">Dificultad</span>' +
        '<b class="nota nota--texto">' + (juego.calificacion != null ? formatearNota(juego.calificacion) : '—') + '</b>' +
        '<b>' + escapar(horas) + '</b>' +
        '<b>' + (juego.dificultad ? juego.dificultad + '/10' : '—') + '</b>' +
      '</span>' +
    '</a>';
  }

  function mostrar() {
    var texto = campoBusqueda.value.trim();
    var lista = buscarJuegos({
      texto: texto,
      generos: marcados('genero'),
      plataformas: marcados('plataforma'),
      tipo: tipo,
      duracion: duracion,
      desde: Number(document.getElementById('anio-desde').value) || null,
      hasta: Number(document.getElementById('anio-hasta').value) || null
    });
    titulo.textContent = lista.length + (lista.length === 1 ? ' juego' : ' juegos') + (texto ? ' para “' + texto + '”' : '');
    resultados.innerHTML = lista.length
      ? lista.map(htmlResultado).join('')
      : '<div class="vacio"><b>No encontramos juegos con esos filtros.</b>' +
        '<span>Revisa la ortografía o quita algún filtro. También puedes preguntarle a MatchPlay.</span>' +
        '<a class="boton boton--secundario boton--sm" href="matchplay.html?q=' + encodeURIComponent(texto || 'Recomiéndame un juego') + '">Preguntar a MatchPlay</a></div>';
    aplicarColores(resultados);
  }

  formularioBusqueda.addEventListener('submit', function (e) {
    e.preventDefault();
    var texto = campoBusqueda.value.trim();
    history.replaceState(null, '', texto ? '?q=' + encodeURIComponent(texto) : location.pathname);
    mostrar();
  });

  filtros.addEventListener('change', mostrar);
  filtros.addEventListener('submit', function (e) { e.preventDefault(); });
  filtros.addEventListener('click', function (e) {
    var chipTipo = e.target.closest('[data-tipo]');
    var chipDuracion = e.target.closest('[data-duracion]');
    if (chipTipo) {
      tipo = chipTipo.dataset.tipo;
      marcarChips('tipo', tipo);
      mostrar();
    }
    if (chipDuracion) {
      // Tocar la duración elegida otra vez la quita
      duracion = duracion === chipDuracion.dataset.duracion ? '' : chipDuracion.dataset.duracion;
      marcarChips('duracion', duracion);
      mostrar();
    }
  });

  document.getElementById('limpiar-filtros').addEventListener('click', function () {
    filtros.reset();
    campoBusqueda.value = '';
    tipo = '';
    duracion = '';
    marcarChips('tipo', '');
    marcarChips('duracion', '');
    history.replaceState(null, '', location.pathname);
    mostrar();
  });

  // Celular: los filtros se abren con el botón "Filtros"
  botonFiltros.addEventListener('click', function () {
    var abiertos = filtros.classList.toggle('filtros--abiertos');
    botonFiltros.setAttribute('aria-expanded', String(abiertos));
    botonFiltros.textContent = abiertos ? 'Ocultar filtros' : 'Filtros';
  });

  mostrar();
}

// 4. Juego random
function pantallaRandom() {
  var juegos = obtenerDatos('juegos');
  var generos = [];
  juegos.forEach(function (j) {
    j.generos.forEach(function (g) { if (generos.indexOf(g) === -1) generos.push(g); });
  });
  generos.sort();

  var parametro = new URLSearchParams(location.search).get('genero');
  var genero = generos.indexOf(parametro) !== -1 ? parametro : 'Aventura';
  var actual = null;
  var cajaGeneros = document.getElementById('generos');
  var cajaSugerencia = document.getElementById('sugerencia');

  cajaGeneros.innerHTML = generos.map(function (g) {
    return '<button class="chip" type="button" data-genero="' + escapar(g) + '" aria-pressed="false">' + escapar(g) + '</button>';
  }).join('');

  // Elige un juego del género al azar, distinto al que se ve ahora
  function sortear() {
    var opciones = juegos.filter(function (j) { return j.generos.indexOf(genero) !== -1; });
    var otros = opciones.filter(function (j) { return !actual || j.id !== actual.id; });
    var lista = otros.length ? otros : opciones;
    return lista[Math.floor(Math.random() * lista.length)];
  }

  function mostrar() {
    cajaGeneros.querySelectorAll('[data-genero]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.genero === genero));
    });
    var cantidad = juegos.filter(function (j) { return j.generos.indexOf(genero) !== -1; }).length;
    var j = actual = sortear();
    cajaSugerencia.innerHTML =
      '<div class="portada sugerencia__portada"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</div>' +
      '<div class="sugerencia__texto">' +
        '<span class="antetitulo">Tu juego random de ' + escapar(genero.toLowerCase()) + '</span>' +
        '<h2 class="titulo-pagina">' + escapar(j.nombre) + '</h2>' +
        '<p>' + escapar(j.descripcion) + '</p>' +
        '<div class="en-fila">' +
          '<span class="etiqueta etiqueta--contorno">Historia: ' + (j.horasHistoria ? j.horasHistoria + ' h' : 'Online') + '</span>' +
          '<span class="etiqueta etiqueta--contorno">Dificultad: ' + escapar(j.dificultad) + '/10</span>' +
          '<span class="etiqueta etiqueta--contorno">Nota: ' + formatearNota(j.calificacion) + '/10</span>' +
        '</div>' +
        '<div class="en-fila">' +
          '<a class="boton" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '">Ver juego</a>' +
          '<button class="boton boton--secundario" type="button" id="otro-juego"' + (cantidad < 2 ? ' disabled title="Solo hay un juego de este género por ahora"' : '') + '>Dame otro</button>' +
        '</div>' +
      '</div>';
    aplicarColores(cajaSugerencia);
  }

  cajaGeneros.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-genero]');
    if (!chip) return;
    genero = chip.dataset.genero;
    actual = null;
    mostrar();
  });
  cajaSugerencia.addEventListener('click', function (e) {
    if (!e.target.closest('#otro-juego')) return;
    mostrar();
    document.getElementById('otro-juego').focus(); // el botón se vuelve a dibujar: no perder el foco
  });

  mostrar();
}

// Respuesta simulada de la IA: la primera cuyas palabras aparezcan en la pregunta.
// Cuando se conecte una IA de verdad, solo cambia esta función.
function responderMatchplay(pregunta) {
  var texto = pregunta.toLowerCase();
  var respuestas = obtenerDatos('respuestasMatchplay');
  var elegida = respuestas.find(function (r) {
    return r.palabras.some(function (p) { return texto.indexOf(p) !== -1; });
  }) || respuestas[respuestas.length - 1];
  return new Promise(function (listo) {
    setTimeout(function () { listo(elegida.texto); }, 700);
  });
}

// 5. MatchPlay
function pantallaMatchplay() {
  var HORA = 3600000;
  var ahora = Date.now();
  // Chats guardados en el navegador (hasta conectar Supabase); la primera vez, los de ejemplo
  var chats = leerMemoria('chatsMatchplay', null) || obtenerDatos('chatsMatchplay').map(function (c) {
    return { id: c.id, titulo: c.titulo, fecha: ahora - c.horasAtras * HORA, mensajes: c.mensajes };
  });
  var activo = null;
  var esperando = false;

  var biblioteca = document.getElementById('biblioteca');
  var lista = document.getElementById('lista-chats');
  var buscarChats = document.getElementById('buscar-chats');
  var inicio = document.getElementById('inicio-chat');
  var hilo = document.getElementById('hilo');
  var campo = document.getElementById('mensaje');
  var botonChats = document.getElementById('boton-chats');
  var tendencias = obtenerDatos('tendenciasMatchplay');

  function guardar() { guardarMemoria('chatsMatchplay', chats); }
  function chatActivo() { return chats.find(function (c) { return c.id === activo; }) || null; }

  var sesion = obtenerSesion();
  if (sesion) document.getElementById('saludo').textContent = 'Hola, ' + String(sesion.name || '').split(' ')[0] + '. ¿En qué te ayudo hoy?';

  function grupo(fecha) {
    var dias = (Date.now() - fecha) / (24 * HORA);
    return dias < 1 ? 'Hoy' : (dias < 7 ? 'Últimos 7 días' : 'Últimos 30 días');
  }

  function mostrarLista() {
    var filtro = buscarChats.value.trim().toLowerCase();
    var grupos = {};
    chats.filter(function (c) { return !filtro || c.titulo.toLowerCase().indexOf(filtro) !== -1; })
      .sort(function (a, b) { return b.fecha - a.fecha; })
      .forEach(function (c) { (grupos[grupo(c.fecha)] = grupos[grupo(c.fecha)] || []).push(c); });
    var html = ['Hoy', 'Últimos 7 días', 'Últimos 30 días'].filter(function (g) { return grupos[g]; }).map(function (g) {
      return '<h2 class="panel__titulo">' + g + '</h2>' + grupos[g].map(function (c) {
        return '<div class="item-chat" aria-current="' + (c.id === activo) + '">' +
          '<button class="item-chat__abrir" type="button" data-abrir="' + escapar(c.id) + '">' + escapar(c.titulo) + '</button>' +
          '<button class="item-chat__borrar" type="button" data-borrar="' + escapar(c.id) + '" aria-label="Borrar chat ' + escapar(c.titulo) + '">' + ICONO_CERRAR + '</button>' +
        '</div>';
      }).join('');
    }).join('');
    lista.innerHTML = html || '<p class="tarjeta__texto">Sin chats.</p>';
  }

  function mostrarChat() {
    var chat = chatActivo();
    inicio.hidden = !!chat;
    hilo.hidden = !chat;
    if (!chat) return;
    hilo.innerHTML = chat.mensajes.map(function (m) {
      if (m.quien === 'usuario') {
        return '<div class="mensaje mensaje--usuario"><div class="burbuja burbuja--usuario">' + escapar(m.texto) + '</div></div>';
      }
      var indice = chat.mensajes.indexOf(m);
      return '<div class="mensaje"><span class="avatar avatar--sm avatar--ia" aria-hidden="true">IA</span>' +
        '<div class="burbuja burbuja--ia">' + escapar(m.texto) +
          '<span class="burbuja__fuente">Fuente: reseñas y guías de la comunidad de SaveSlot. Verifica los datos importantes.</span>' +
          '<span class="burbuja__votos">' +
            '<button type="button" data-voto="util" data-indice="' + indice + '" aria-pressed="' + (m.voto === 'util') + '">Útil</button>' +
            '<button type="button" data-voto="no-sirve" data-indice="' + indice + '" aria-pressed="' + (m.voto === 'no-sirve') + '">No me sirve</button>' +
          '</span>' +
        '</div></div>';
    }).join('') +
    (esperando ? '<div class="mensaje"><span class="avatar avatar--sm avatar--ia" aria-hidden="true">IA</span><div class="burbuja burbuja--ia tarjeta__texto">Buscando en reseñas y guías…</div></div>' : '');
    hilo.lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }

  function preguntar(texto) {
    texto = texto.trim();
    if (!texto || esperando) return;
    var chat = chatActivo();
    if (!chat) {
      chat = { id: 'n' + Date.now(), titulo: texto.length > 34 ? texto.slice(0, 34) + '…' : texto, fecha: Date.now(), mensajes: [] };
      chats.unshift(chat);
      activo = chat.id;
    }
    chat.mensajes.push({ quien: 'usuario', texto: texto });
    chat.fecha = Date.now();
    esperando = true;
    campo.value = '';
    guardar();
    mostrarLista();
    mostrarChat();
    responderMatchplay(texto).then(function (respuesta) {
      chat.mensajes.push({ quien: 'ia', texto: respuesta });
      esperando = false;
      guardar();
      if (activo === chat.id) mostrarChat();
    });
  }

  // Tendencias: tocar una empieza un chat con esa pregunta
  document.getElementById('tendencias').innerHTML = tendencias.map(function (t) {
    return '<button class="tarjeta tarjeta--enlace tendencia" type="button" data-tendencia="' + escapar(t.id) + '">' +
      '<span class="antetitulo">' + escapar(t.etiqueta) + '</span>' +
      '<b class="tarjeta__titulo">' + escapar(t.pregunta) + '</b>' +
      '<span class="tarjeta__texto">' + formatearCorto(t.preguntasHoy) + ' preguntas hoy</span>' +
    '</button>';
  }).join('');
  document.getElementById('tendencias').addEventListener('click', function (e) {
    var tarjeta = e.target.closest('[data-tendencia]');
    if (tarjeta) preguntar(tendencias.find(function (t) { return t.id === tarjeta.dataset.tendencia; }).pregunta);
  });

  // Biblioteca: abrir y borrar (con deshacer)
  lista.addEventListener('click', function (e) {
    var abrir = e.target.closest('[data-abrir]');
    var borrar = e.target.closest('[data-borrar]');
    if (abrir) {
      activo = abrir.dataset.abrir;
      mostrarLista();
      mostrarChat();
      abrirBiblioteca(false);
    }
    if (borrar) {
      var posicion = chats.findIndex(function (c) { return c.id === borrar.dataset.borrar; });
      var borrado = chats[posicion];
      var eraActivo = activo === borrado.id;
      chats.splice(posicion, 1);
      if (eraActivo) activo = null;
      guardar();
      mostrarLista();
      mostrarChat();
      mostrarAviso('Chat borrado', {
        texto: 'Deshacer',
        alTocar: function () {
          chats.splice(posicion, 0, borrado);
          if (eraActivo) activo = borrado.id;
          guardar();
          mostrarLista();
          mostrarChat();
        }
      });
    }
  });

  // Votar una respuesta: "Útil" o "No me sirve"
  hilo.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-voto]');
    if (!boton) return;
    var mensaje = chatActivo().mensajes[Number(boton.dataset.indice)];
    mensaje.voto = boton.dataset.voto;
    guardar();
    mostrarChat();
    mostrarAviso(mensaje.voto === 'util' ? 'Gracias, nos ayuda a mejorar' : 'Gracias. Prueba a darme más detalles');
  });

  // Ideas para preguntar: escriben el comienzo de la pregunta
  document.querySelectorAll('[data-idea]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      campo.value = chip.dataset.idea;
      campo.focus();
      campo.setSelectionRange(campo.value.length, campo.value.length);
    });
  });

  document.getElementById('nuevo-chat').addEventListener('click', function () {
    activo = null;
    mostrarLista();
    mostrarChat();
    abrirBiblioteca(false);
    campo.focus();
  });
  buscarChats.addEventListener('input', mostrarLista);
  document.getElementById('compositor').addEventListener('submit', function (e) {
    e.preventDefault();
    preguntar(campo.value);
  });

  // Celular: la biblioteca se abre con "Mis chats" y se cierra tocando afuera o con Escape
  function abrirBiblioteca(abrir) {
    var velo = document.querySelector('.chat__velo');
    biblioteca.classList.toggle('chat__biblioteca--abierta', abrir);
    botonChats.setAttribute('aria-expanded', String(abrir));
    if (abrir && !velo) {
      velo = crearElemento('<div class="chat__velo"></div>');
      velo.addEventListener('click', function () { abrirBiblioteca(false); });
      document.body.appendChild(velo);
      document.getElementById('nuevo-chat').focus();
    }
    if (!abrir && velo) velo.remove();
  }
  botonChats.addEventListener('click', function () {
    abrirBiblioteca(!biblioteca.classList.contains('chat__biblioteca--abierta'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && biblioteca.classList.contains('chat__biblioteca--abierta')) {
      abrirBiblioteca(false);
      botonChats.focus();
    }
  });

  mostrarLista();
  mostrarChat();
  var pregunta = new URLSearchParams(location.search).get('q');
  if (pregunta) {
    history.replaceState(null, '', location.pathname); // al recargar no se vuelve a preguntar
    preguntar(pregunta);
  }
}

// Perfil propio guardado en el navegador (hasta conectar Supabase).
// La primera vez se arma con los datos de samluq en data.js.
function leerPerfil() {
  var guardado = leerMemoria('profile', null);
  if (guardado) return guardado;
  var yo = buscarPorId('usuarios', 'samluq');
  return {
    user: 'samluq', xp: yo.xp, level: yo.nivel, bio: yo.sobreMi, since: yo.miembroDesde, favorites: yo.favoritos.slice(),
    wishlist: yo.listaDeseos.slice(), genres: yo.generosFavoritos.slice(), playing: yo.jugandoAhora,
    accounts: { Steam: 'samluq_steam', PlayStation: null, Xbox: null, Nintendo: null }, missionsDone: ['calificar', 'guia']
  };
}

// Diario propio: el guardado en el navegador o, si no hay, el de data.js
function leerDiario() {
  var guardado = leerMemoria('diary', null);
  if (!guardado) return obtenerDatos('diario');
  return guardado.map(function (d) {
    return { juego: d.game, fecha: d.date, estado: d.state, horas: d.hours, calificacion: d.score, meGusta: !!d.like, tieneResena: !!d.review };
  });
}

// Guarda el juego al principio de "Vistos recientemente" (máximo 6)
function marcarVisto(idJuego) {
  var vistos = leerMemoria('recentGames', []).filter(function (id) { return id !== idJuego; });
  vistos.unshift(idJuego);
  guardarMemoria('recentGames', vistos.slice(0, 6));
}

function htmlCalaveras(dificultad) {
  var marcas = '';
  for (var i = 1; i <= 10; i++) marcas += '<i class="calaveras__marca' + (i <= dificultad ? ' calaveras__marca--encendida' : '') + '"></i>';
  return '<div class="calaveras" role="img" aria-label="Dificultad ' + dificultad + ' de 10">' + marcas + '</div>';
}

// 6. Detalle de juego (y 7. Ventana: Dificultad de 1 a 10)
function pantallaJuego() {
  var id = idDeJuego(new URLSearchParams(location.search).get('id'));
  var juego = buscarPorId('juegos', id);
  if (!juego) { location.replace(rutaPagina('404.html') + '?tipo=juego'); return; }
  var sesion = obtenerSesion();
  var genero = juego.generos[0] || '';

  document.title = juego.nombreCorto + ' · SaveSlot';
  marcarVisto(juego.id);

  // Cabecera
  var cabecera = document.getElementById('cabecera');
  cabecera.dataset.color = juego.color;
  var miga = document.getElementById('miga-genero');
  miga.textContent = genero || 'Juegos';
  miga.href = 'buscar-juegos.html?genero=' + encodeURIComponent(genero);
  document.getElementById('miga-juego').textContent = juego.nombreCorto;
  var portada = document.getElementById('portada-juego');
  portada.dataset.color = juego.color;
  portada.innerHTML = imagenPortada(juego);
  document.getElementById('antetitulo-juego').textContent = juego.generos.join(' · ') + (juego.anio ? ' · ' + juego.anio : '');
  document.getElementById('nombre-juego').textContent = juego.nombre;
  document.getElementById('plataformas-juego').innerHTML = juego.plataformas.map(function (p) {
    return '<span class="etiqueta etiqueta--contorno">' + escapar(p.toUpperCase()) + '</span>';
  }).join('') + (juego.calificacion != null
    ? '<span><b class="nota nota--texto">' + formatearNota(juego.calificacion) + '/10</b> <span class="tarjeta__texto">· nota de la comunidad · ' + formatearNumero(juego.votos) + ' calificaciones</span></span>'
    : '');
  document.getElementById('escribir-resena').href = 'escribir-resena.html?id=' + encodeURIComponent(juego.id);
  document.getElementById('preguntar-matchplay').href = 'matchplay.html?q=' + encodeURIComponent('Dame consejos para ' + juego.nombreCorto);

  // Lista de deseos: pide cuenta sin sesión; se guarda en el perfil y se puede deshacer
  var botonDeseos = document.getElementById('lista-deseos');
  function enDeseos() { return leerPerfil().wishlist.indexOf(juego.id) !== -1; }
  function marcarDeseos() {
    var esta = enDeseos();
    botonDeseos.textContent = esta ? '✓ En tu lista de deseos' : '+ Lista de deseos';
    botonDeseos.setAttribute('aria-pressed', String(esta));
  }
  function cambiarDeseos() {
    var perfil = leerPerfil();
    perfil.wishlist = enDeseos()
      ? perfil.wishlist.filter(function (x) { return x !== juego.id; })
      : perfil.wishlist.concat(juego.id);
    guardarMemoria('profile', perfil);
    marcarDeseos();
  }
  marcarDeseos();
  botonDeseos.addEventListener('click', function () {
    if (!obtenerSesion()) { pedirCuenta('guardar juegos en tu lista de deseos'); return; }
    cambiarDeseos();
    mostrarAviso(enDeseos() ? 'Añadido a tu lista de deseos' : 'Quitado de tu lista de deseos', { texto: 'Deshacer', alTocar: cambiarDeseos });
  });

  // Datos clave
  var progreso = sesion ? leerDiario().filter(function (d) { return d.juego === juego.id; })[0] : null;
  document.getElementById('datos-clave').innerHTML =
    '<div class="dato"><span class="dato__etiqueta">Dificultad</span>' +
      '<span class="dato__valor">' + (juego.dificultad ? juego.dificultad + '<small>/10</small>' : '—') + '</span>' +
      (juego.dificultad ? htmlCalaveras(juego.dificultad) : '') +
      '<span class="tarjeta__texto">Votada por la comunidad</span>' +
      '<button class="dato__ayuda" type="button" id="ayuda-dificultad">¿Cómo se calcula?</button>' +
    '</div>' +
    '<div class="dato"><span class="dato__etiqueta">Historia principal</span><span class="dato__valor">' + (juego.horasHistoria ? juego.horasHistoria + ' h' : 'Online') + '</span><span class="tarjeta__texto">Promedio de jugadores</span>' +
      // Enlace a HowLongToBeat (solo enlazamos: su web no permite leer sus datos con programas)
      '<a class="dato__ayuda" href="https://howlongtobeat.com/?q=' + encodeURIComponent(juego.nombre) + '" target="_blank" rel="noopener">Ver en HowLongToBeat</a></div>' +
    '<div class="dato"><span class="dato__etiqueta">Completar 100%</span><span class="dato__valor">' + (juego.horas100 ? juego.horas100 + ' h' : '—') + '</span><span class="tarjeta__texto">Promedio de jugadores</span></div>' +
    '<div class="dato dato--destacado"><span class="dato__etiqueta">Tu progreso</span>' +
      (progreso
        ? '<span class="dato__valor">' + escapar(progreso.horas) + ' h</span><span class="tarjeta__texto">' + escapar(progreso.estado) + ' · ' + escapar(progreso.calificacion) + '/10</span>'
        : '<span class="tarjeta__texto">Vincula tu cuenta o regístralo en tu diario.</span><a href="escribir-resena.html?id=' + encodeURIComponent(juego.id) + '"><b>Registrar juego</b></a>') +
    '</div>';

  // 7. Ventana: Dificultad de 1 a 10 (se cierra con la X, "Entendido" o Escape)
  document.getElementById('ayuda-dificultad').addEventListener('click', function () {
    abrirModal({
      titulo: 'Dificultad de 1 a 10',
      texto: 'Es el promedio de lo que votan los jugadores al reseñar: 1 es relajado y 10 es brutal. Las horas son el promedio de quienes registraron el juego en su diario.',
      acciones: [{ texto: 'Entendido', principal: true }]
    });
  });

  // Pestañas: Reseñas, Guías, Clips y Logros
  var publicadas = obtenerResenas().filter(function (r) { return r.juego === juego.id && r.estado === 'publicada'; });
  var resenas = publicadas.filter(function (r) { return r.tipo === 'resena'; });
  var guias = publicadas.filter(function (r) { return r.tipo === 'guia'; });
  var logros = obtenerDatos('logros').filter(function (l) { return l.juego === juego.id; });
  var escribir = 'escribir-resena.html?id=' + encodeURIComponent(juego.id);
  var pestanas = [
    { id: 'resenas', nombre: 'Reseñas', numero: resenas.length, html: function () {
      return resenas.length ? resenas.map(function (r) { return htmlResena(r); }).join('')
        : '<div class="vacio"><b>Todavía no hay reseñas.</b><span>Sé la primera persona en reseñar este juego.</span><a class="boton boton--sm" href="' + escribir + '">Escribir reseña</a></div>';
    } },
    { id: 'guias', nombre: 'Guías', numero: guias.length, html: function () {
      return guias.length ? guias.map(function (g) {
        return '<article class="tarjeta">' +
          '<div class="en-fila en-fila--entre"><h3 class="tarjeta__titulo">' + escapar(g.titulo) + '</h3><span class="tarjeta__texto">' + escapar(g.minutosLectura) + ' min</span></div>' +
          (g.porcentajeUtil != null ? '<span class="nota nota--texto">' + escapar(g.porcentajeUtil) + '% la marcó como útil</span>' : '<span class="tarjeta__texto">Guía nueva: todavía sin votos</span>') +
        '</article>';
      }).join('')
        : '<div class="vacio"><b>Aún no hay guías.</b><a href="' + escribir + '&amp;tipo=guia">Escribir la primera</a></div>';
    } },
    { id: 'clips', nombre: 'Clips', numero: 0, html: function () {
      return '<div class="vacio"><b>Los clips llegarán con la API de Twitch.</b><span>Mientras tanto puedes subir el tuyo desde “Escribir reseña › Clip”.</span></div>';
    } },
    { id: 'logros', nombre: 'Logros', numero: juego.logrosTotales, html: function () {
      return logros.length ? logros.map(function (l) {
        return '<article class="tarjeta"><div class="en-fila">' +
          '<span class="etiqueta ' + (l.obtenido ? 'etiqueta--exito">Obtenido' : 'etiqueta--contorno">Pendiente') + '</span>' +
          '<div><h3 class="tarjeta__titulo">' + escapar(l.nombre) + '</h3><p class="tarjeta__texto">' + escapar(l.descripcion) + '</p></div>' +
          '<span class="tarjeta__texto al-final">' + String(l.porcentaje).replace('.', ',') + '% lo tiene</span>' +
        '</div></article>';
      }).join('')
        : '<div class="vacio">No hay logros registrados para este juego.</div>';
    } }
  ];
  var cajaPestanas = document.getElementById('pestanas');
  var panel = document.getElementById('panel-pestana');
  cajaPestanas.innerHTML = pestanas.map(function (p, i) {
    return '<button class="pestanas__boton" type="button" role="tab" id="pestana-' + p.id + '" aria-controls="panel-pestana" aria-selected="' + (i === 0) + '" data-pestana="' + p.id + '">' +
      p.nombre + ' <span class="contador">' + formatearNumero(p.numero) + '</span></button>';
  }).join('');
  function mostrarPestana(idPestana) {
    var elegida = pestanas.find(function (p) { return p.id === idPestana; });
    cajaPestanas.querySelectorAll('[data-pestana]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.pestana === idPestana));
    });
    panel.setAttribute('aria-labelledby', 'pestana-' + idPestana);
    panel.innerHTML = elegida.html();
    aplicarColores(panel);
  }
  cajaPestanas.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-pestana]');
    if (boton) mostrarPestana(boton.dataset.pestana);
  });
  activarResenas(panel);
  mostrarPestana('resenas');

  // Ficha y "Si te gusta, prueba" (otros juegos del mismo género)
  document.getElementById('ficha').innerHTML = [
    ['Desarrolla', juego.desarrolladora || '—'], ['Lanzamiento', juego.anio || '—'], ['Género', juego.generos.join(', ')],
    ['Tipo', juego.tipo || '—'], ['Plataformas', juego.plataformas.join(', ')]
  ].map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + escapar(f[1]) + '</dd>'; }).join('');
  var similares = obtenerDatos('juegos').filter(function (j) {
    return j.id !== juego.id && j.generos.some(function (g) { return juego.generos.indexOf(g) !== -1; });
  }).slice(0, 3);
  document.getElementById('similares').innerHTML = similares.length ? similares.map(function (j) {
    return '<a class="similar" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '">' +
      '<span class="portada portada--sm"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span>' +
      '<span><b>' + escapar(j.nombreCorto) + '</b><br><span class="tarjeta__texto">' + escapar(j.generos.join(', ')) + '</span></span>' +
    '</a>';
  }).join('') : '<p class="tarjeta__texto">Sin sugerencias por ahora.</p>';

  aplicarColores(document);
}

// 8. Escribir reseña (y 9. Ventana: Publicación confirmada)
function pantallaEscribir() {
  var parametros = new URLSearchParams(location.search);
  var juego = buscarPorId('juegos', idDeJuego(parametros.get('id')));
  if (!juego) { location.replace(rutaPagina('404.html') + '?tipo=juego'); return; }
  var MINIMO = 50;
  var tipo = ['guia', 'clip'].indexOf(parametros.get('tipo')) !== -1 ? parametros.get('tipo') : 'resena';
  var calificacion = 8;
  var dificultad = juego.dificultad || 5;
  var meGusta = false;
  var claveBorrador = 'draft.' + juego.id;
  var editando = leerResenasPropias().find(function (r) { return r.id === parametros.get('editar') && r.juego === juego.id; }) || null;

  var formulario = document.getElementById('formulario-resena');
  var campoTexto = document.getElementById('texto');
  var campoTitulo = document.getElementById('titulo');
  var campoFecha = document.getElementById('fecha');
  var botonMeGusta = document.getElementById('me-gusta');
  var botonPublicar = document.getElementById('publicar');
  var avisoBorrador = document.getElementById('borrador-guardado');

  // Encabezado: el juego con su portada
  var portada = document.getElementById('portada-resena');
  portada.dataset.color = juego.color;
  portada.innerHTML = imagenPortada(juego);
  document.getElementById('juego-resena').textContent = juego.nombre;
  document.getElementById('cancelar').href = 'detalle-juego.html?id=' + encodeURIComponent(juego.id);
  document.title = 'Escribir reseña de ' + juego.nombreCorto + ' · SaveSlot';
  campoFecha.value = hoy();
  campoFecha.max = hoy();

  // Editar una reseña propia: llega con sus datos
  if (editando) {
    tipo = editando.tipo;
    calificacion = editando.calificacion || calificacion;
    dificultad = editando.dificultad || dificultad;
    campoTexto.value = editando.texto;
    campoTitulo.value = editando.titulo || '';
    document.getElementById('horas').value = editando.horas || '';
    document.getElementById('spoiler').checked = editando.spoiler;
    if (editando.estadoPartida) document.getElementById('estado').value = editando.estadoPartida;
    document.getElementById('tipo').hidden = true;
    document.getElementById('guardar-borrador').hidden = true;
    document.getElementById('cancelar').href = 'detalle-resena.html?id=' + encodeURIComponent(editando.id);
    botonPublicar.textContent = 'Guardar cambios';
  } else {
    var borrador = leerMemoria(claveBorrador, null);
    if (borrador) {
      campoTexto.value = borrador.text || '';
      campoTitulo.value = borrador.title || '';
      calificacion = borrador.score || calificacion;
      dificultad = borrador.diff || dificultad;
      meGusta = !!borrador.like;
      botonMeGusta.setAttribute('aria-pressed', String(meGusta));
      document.getElementById('horas').value = borrador.hours || '';
      avisoBorrador.hidden = false;
    }
  }

  // Escalas del 1 al 10
  function dibujarEscalas() {
    var htmlCalificacion = '';
    var htmlDificultad = '';
    for (var n = 1; n <= 10; n++) {
      htmlCalificacion += '<button class="escala__opcion" type="button" data-calificacion="' + n + '" aria-pressed="' + (n === calificacion) + '" aria-label="Calificación ' + n + ' de 10">' + n + '</button>';
      htmlDificultad += '<button class="escala__opcion' + (n < dificultad ? ' escala__opcion--llena' : '') + '" type="button" data-dificultad="' + n + '" aria-pressed="' + (n === dificultad) + '" aria-label="Dificultad ' + n + ' de 10"></button>';
    }
    document.getElementById('escala-calificacion').innerHTML = htmlCalificacion;
    document.getElementById('escala-dificultad').innerHTML = htmlDificultad;
    document.getElementById('texto-calificacion').textContent = calificacion + '/10';
    document.getElementById('texto-dificultad').textContent = dificultad + '/10';
  }
  formulario.addEventListener('click', function (e) {
    var opcion = e.target.closest('[data-calificacion], [data-dificultad]');
    if (!opcion) return;
    if (opcion.dataset.calificacion) calificacion = Number(opcion.dataset.calificacion);
    else dificultad = Number(opcion.dataset.dificultad);
    var atributo = opcion.dataset.calificacion ? 'calificacion' : 'dificultad';
    dibujarEscalas();
    if (campoTexto.value.trim()) guardarBorrador();
    formulario.querySelector('[data-' + atributo + '="' + (atributo === 'calificacion' ? calificacion : dificultad) + '"]').focus();
  });
  dibujarEscalas();

  botonMeGusta.addEventListener('click', function () {
    meGusta = !meGusta;
    botonMeGusta.setAttribute('aria-pressed', String(meGusta));
    if (campoTexto.value.trim()) guardarBorrador();
  });

  // Tipo: Reseña, Guía o Clip
  function elegirTipo(nuevo) {
    tipo = nuevo;
    document.querySelectorAll('[data-tipo]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tipo === tipo)); });
    document.getElementById('bloque-texto').hidden = tipo === 'clip';
    document.getElementById('bloque-clip').hidden = tipo !== 'clip';
    document.getElementById('etiqueta-texto').textContent = tipo === 'guia' ? 'Tu guía' : 'Tu reseña';
    document.getElementById('antetitulo-resena').textContent = editando ? 'Editar reseña' : ({ resena: 'Nueva reseña', guia: 'Nueva guía', clip: 'Nuevo clip' })[tipo];
  }
  document.getElementById('tipo').addEventListener('click', function (e) {
    var boton = e.target.closest('[data-tipo]');
    if (boton) elegirTipo(boton.dataset.tipo);
  });
  elegirTipo(tipo);

  // Contador de caracteres y borrador automático
  function contar() {
    var largo = campoTexto.value.trim().length;
    var contador = document.getElementById('caracteres');
    contador.textContent = (largo >= MINIMO ? '✓ Listo para publicar · ' : 'Faltan ' + (MINIMO - largo) + ' caracteres · ') + formatearNumero(campoTexto.value.length) + ' / 2.000';
    contador.classList.toggle('grupo-campo__ayuda--listo', largo >= MINIMO);
    if (largo >= MINIMO) mostrarError(false);
  }
  function mostrarError(hayError) {
    campoTexto.classList.toggle('campo--error', hayError);
    campoTexto.setAttribute('aria-invalid', String(hayError));
    document.getElementById('error-texto').hidden = !hayError;
  }
  function guardarBorrador() {
    if (editando) return;
    guardarMemoria(claveBorrador, {
      text: campoTexto.value, title: campoTitulo.value, score: calificacion, diff: dificultad, like: meGusta,
      hours: document.getElementById('horas').value
    });
    avisoBorrador.hidden = false;
  }
  campoTexto.addEventListener('input', function () { contar(); guardarBorrador(); });
  campoTitulo.addEventListener('input', guardarBorrador);
  document.getElementById('horas').addEventListener('input', function () { if (campoTexto.value.trim()) guardarBorrador(); });
  document.getElementById('guardar-borrador').addEventListener('click', function () {
    guardarBorrador();
    mostrarAviso('Borrador guardado');
  });
  contar();

  // Publicar
  formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    if (tipo === 'clip') {
      abrirModal({ titulo: 'Los clips llegan pronto', texto: 'Subir clips todavía no está disponible. Mientras tanto puedes publicar una reseña o una guía.', acciones: [{ texto: 'Entendido', principal: true }] });
      return;
    }
    if (campoTexto.value.trim().length < MINIMO) {
      mostrarError(true);
      campoTexto.focus();
      return;
    }
    if (!obtenerSesion()) { pedirCuenta('publicar tu ' + (tipo === 'guia' ? 'guía' : 'reseña')); return; }

    var datos = {
      tipo: tipo, titulo: campoTitulo.value.trim() || null, texto: campoTexto.value.trim(), calificacion: calificacion,
      dificultad: dificultad, horas: Number(document.getElementById('horas').value) || 0,
      spoiler: document.getElementById('spoiler').checked, estadoPartida: document.getElementById('estado').value
    };
    var propias = leerResenasPropias();
    botonPublicar.disabled = true;
    botonPublicar.textContent = editando ? 'Guardando…' : 'Publicando…';

    setTimeout(function () {
      botonPublicar.disabled = false;
      if (editando) {
        var guardada = propias.find(function (r) { return r.id === editando.id; });
        Object.assign(guardada, datos, { editada: true });
        guardarResenasPropias(propias);
        botonPublicar.textContent = 'Guardar cambios';
        abrirModal({
          titulo: 'Reseña actualizada',
          texto: 'Los cambios ya se ven en tu historial y en la página del juego.',
          acciones: [{ texto: 'Ver reseña', href: 'detalle-resena.html?id=' + encodeURIComponent(editando.id), principal: true }, { texto: 'Ir al historial', href: 'historial-resenas.html' }]
        });
        return;
      }

      var nueva = Object.assign({
        id: 'u' + Date.now(), juego: juego.id, autor: usuarioActual(), estado: 'publicada', minutosLectura: null,
        votosUtil: 0, porcentajeUtil: null, meGusta: 0, fecha: hoy(), editada: false
      }, datos);
      propias.unshift(nueva);
      guardarResenasPropias(propias);
      agregarAlDiario({ juego: juego.id, fecha: campoFecha.value || hoy(), estado: datos.estadoPartida, horas: datos.horas, calificacion: calificacion, meGusta: meGusta, tieneResena: tipo === 'resena' });
      guardarMemoria(claveBorrador, null);
      avisoBorrador.hidden = true;
      var perfil = sumarXp(50);
      botonPublicar.textContent = 'Publicar';

      // 9. Ventana: Publicación confirmada
      abrirModal({
        titulo: (tipo === 'guia' ? 'Guía' : 'Reseña') + ' publicada',
        texto: 'Ganaste 50 XP. Vas en ' + formatearNumero(perfil.xp) + ' / ' + formatearNumero(XP_POR_NIVEL) + ' XP del nivel ' + perfil.level + '.',
        acciones: tipo === 'guia'
          ? [{ texto: 'Ver en el juego', href: 'detalle-juego.html?id=' + encodeURIComponent(juego.id), principal: true }, { texto: 'Ver mi diario', href: 'diario.html' }]
          : [{ texto: 'Ver mi reseña', href: 'detalle-resena.html?id=' + encodeURIComponent(nueva.id), principal: true }, { texto: 'Ir al historial', href: 'historial-resenas.html' }]
      });
    }, 500);
  });

  aplicarColores(document);
}

// 11. Comunidad
function pantallaComunidad() {
  var pestana = 'resenas';
  var orden = 'utiles';
  var lista = document.getElementById('lista-comunidad');
  var pestanas = document.getElementById('pestanas-comunidad');

  function ordenar(resenas) {
    return resenas.sort(orden === 'utiles'
      ? function (a, b) { return (b.votosUtil || 0) - (a.votosUtil || 0); }
      : function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); });
  }

  function mostrar() {
    pestanas.querySelectorAll('[data-pestana]').forEach(function (b) {
      b.setAttribute('aria-selected', String(b.dataset.pestana === pestana));
    });
    lista.setAttribute('aria-labelledby', 'pestana-' + pestana);
    document.getElementById('caja-orden').hidden = pestana === 'guias';
    var publicadas = obtenerResenas().filter(function (r) { return r.estado === 'publicada'; });

    if (pestana === 'guias') {
      lista.innerHTML = publicadas.filter(function (r) { return r.tipo === 'guia'; }).map(function (g) {
        var juego = buscarPorId('juegos', g.juego);
        return '<a class="tarjeta tarjeta--enlace tarjeta--resena" href="detalle-juego.html?id=' + encodeURIComponent(g.juego) + '"' + atributoColor(juego.color) + '>' +
          '<span class="tarjeta__texto">' + escapar(juego.nombreCorto.toUpperCase()) + ' · ' + escapar(g.minutosLectura) + ' MIN</span>' +
          '<b class="tarjeta__titulo">' + escapar(g.titulo || 'Guía de ' + juego.nombreCorto) + '</b>' +
          (g.porcentajeUtil != null ? '<span class="nota nota--texto">' + escapar(g.porcentajeUtil) + '% la marcó como útil</span>' : '<span class="tarjeta__texto">Guía nueva: todavía sin votos</span>') +
        '</a>';
      }).join('');
    } else {
      var resenas = publicadas.filter(function (r) { return r.tipo === 'resena'; });
      if (pestana === 'amigos') resenas = resenas.filter(function (r) { return sonAmigos(r.autor); });
      resenas = ordenar(resenas);
      lista.innerHTML = resenas.length
        ? resenas.map(function (r) { return htmlResena(r, { conJuego: true }); }).join('')
        : (obtenerSesion()
          ? '<div class="vacio"><b>Tus amigos todavía no publican reseñas.</b><a href="amigos.html">Busca amigos</a></div>'
          : '<div class="vacio"><b>Inicia sesión para ver las reseñas de tus amigos.</b><a class="boton boton--sm" href="iniciar-sesion.html?volver=comunidad.html">Iniciar sesión</a></div>');
    }
    aplicarColores(lista);
  }

  pestanas.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-pestana]');
    if (!boton) return;
    pestana = boton.dataset.pestana;
    mostrar();
  });
  document.getElementById('orden').addEventListener('change', function (e) {
    orden = e.target.value;
    mostrar();
  });
  activarResenas(lista);
  mostrar();
}

var ICONO_CORAZON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.4 1 4.2 2.3h2C13.8 6 15.2 5 17.2 5c3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z"/></svg>';

// Avatar de una persona con el anillo de su estado (si se conoce)
function htmlAvatar(persona, tamano) {
  var estado = persona.estado ? ' avatar--' + persona.estado : '';
  return '<span class="avatar' + (tamano ? ' avatar--' + tamano : '') + estado + '" aria-hidden="true">' + escapar(persona.iniciales || '?') +
    (persona.estado ? '<span class="avatar__punto"></span>' : '') + '</span>';
}

// Datos de una persona: los de data.js o, si es la cuenta actual, los de la sesión
function datosPersona(usuario) {
  var sesion = obtenerSesion();
  var persona = buscarPorId('usuarios', usuario);
  if (sesion && sesion.user === usuario) {
    return Object.assign({ usuario: usuario, estado: 'en-linea' }, persona || {}, { nombre: sesion.name, iniciales: sesion.initials, nivel: leerPerfil().level });
  }
  return persona || { usuario: usuario, nombre: usuario, iniciales: usuario.slice(0, 2).toUpperCase(), nivel: null, estado: null };
}

function enlacePerfil(usuario) {
  return obtenerSesion() && usuario === usuarioActual() ? 'perfil.html' : 'perfil-usuario.html?u=' + encodeURIComponent(usuario);
}

// 12. Detalle de reseña
function pantallaResena() {
  var id = new URLSearchParams(location.search).get('id');
  var resena = obtenerResenas().find(function (r) { return r.id === id; });
  if (!resena) { location.replace(rutaPagina('404.html') + '?tipo=resena'); return; }
  var juego = buscarPorId('juegos', resena.juego);
  var propia = esPropia(resena);
  var autor = datosPersona(resena.autor);
  var sesion = obtenerSesion();
  var esGuia = resena.tipo === 'guia';

  document.title = (esGuia ? 'Guía' : 'Reseña') + ' de ' + juego.nombreCorto + ' · SaveSlot';

  // Cabecera: juego, autor y nota
  document.getElementById('cabecera').dataset.color = juego.color;
  var miga = document.getElementById('miga-juego');
  miga.textContent = juego.nombreCorto;
  miga.href = 'detalle-juego.html?id=' + encodeURIComponent(juego.id);
  var portada = document.getElementById('portada-resena');
  portada.href = miga.href;
  portada.dataset.color = juego.color;
  portada.innerHTML = imagenPortada(juego) + '<span class="solo-lectores">Abrir la ficha de ' + escapar(juego.nombre) + '</span>';
  document.getElementById('antetitulo-resena').textContent = (esGuia ? 'Guía' : 'Reseña') + ' · ' + juego.generos.join(' · ');
  document.getElementById('titulo-resena').textContent = juego.nombre;
  document.getElementById('autor-resena').innerHTML = htmlAvatar(autor) +
    '<span><a href="' + enlacePerfil(autor.usuario) + '"><b>' + escapar(autor.nombre) + '</b></a> <span class="tarjeta__texto">@' + escapar(autor.usuario) + '</span><br>' +
    '<span class="tarjeta__texto">' + formatearFecha(resena.fecha) + (resena.editada ? ' · editada' : '') + '</span></span>';
  var nota = document.getElementById('nota-resena');
  if (resena.calificacion) {
    nota.innerHTML = '<b>' + escapar(resena.calificacion) + '</b><span>de 10</span>';
    nota.setAttribute('aria-label', 'Calificación ' + resena.calificacion + ' de 10');
    nota.style.setProperty('--p', resena.calificacion * 10);
  } else {
    nota.hidden = true;
  }

  // Texto completo (con el spoiler tapado)
  var cuerpo = document.getElementById('cuerpo-resena');
  var texto = resena.texto
    ? '<p>' + escapar(resena.texto) + '</p>'
    : '<p class="tarjeta__texto">Esta guía todavía no tiene su texto completo en SaveSlot.</p>';
  cuerpo.innerHTML = (resena.titulo ? '<h2 class="tarjeta__titulo">' + escapar(resena.titulo) + '</h2>' : '') +
    (resena.spoiler
      ? '<div class="spoiler"><span>Esta reseña tiene spoilers.</span><button class="boton boton--secundario boton--sm" type="button" data-mostrar-spoiler>Mostrar de todas formas</button></div>' + texto.replace('<p', '<p hidden')
      : texto);
  activarResenas(cuerpo);

  // Acciones: me gusta, útil y compartir; editar y eliminar si es propia
  var acciones = document.getElementById('acciones-resena');
  function dibujarAcciones() {
    var meGusta = leerMemoria('meGustaResenas', []).indexOf(resena.id) !== -1;
    var votado = leerMemoria('votosUtil', []).indexOf(resena.id) !== -1;
    acciones.innerHTML =
      '<button class="boton boton--secundario boton--me-gusta" type="button" id="accion-me-gusta" aria-pressed="' + meGusta + '">' + ICONO_CORAZON + 'Me gusta · ' + formatearNumero(resena.meGusta + (meGusta ? 1 : 0)) + '</button>' +
      '<button class="boton boton--secundario" type="button" data-util="' + escapar(resena.id) + '"' + (propia ? ' data-propia' : '') + ' aria-pressed="' + votado + '">Útil · <span>' + formatearNumero((resena.votosUtil || 0) + (votado ? 1 : 0)) + '</span></button>' +
      '<button class="boton boton--secundario" type="button" id="accion-compartir">Compartir</button>' +
      (propia
        ? '<a class="boton boton--secundario al-final" href="escribir-resena.html?id=' + encodeURIComponent(juego.id) + '&amp;editar=' + encodeURIComponent(resena.id) + '">Editar</a>' +
          '<button class="boton boton--peligro" type="button" id="accion-eliminar">Eliminar</button>'
        : '');
  }
  dibujarAcciones();
  activarResenas(acciones);
  acciones.addEventListener('click', function (e) {
    if (e.target.closest('#accion-compartir')) {
      // Simulado: copia el enlace de esta página
      var enlace = location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(enlace).then(function () { mostrarAviso('Enlace copiado'); }, function () { mostrarAviso('Enlace: ' + enlace); });
      else mostrarAviso('Enlace: ' + enlace);
    }
    if (e.target.closest('#accion-me-gusta')) {
      if (!obtenerSesion()) { pedirCuenta('dar me gusta'); return; }
      if (propia) { mostrarAviso('No puedes dar me gusta a tu propia reseña'); return; }
      var meGustan = leerMemoria('meGustaResenas', []);
      meGustan = meGustan.indexOf(resena.id) !== -1 ? meGustan.filter(function (x) { return x !== resena.id; }) : meGustan.concat(resena.id);
      guardarMemoria('meGustaResenas', meGustan);
      dibujarAcciones();
      document.getElementById('accion-me-gusta').focus();
    }
    if (e.target.closest('#accion-eliminar')) {
      abrirModal({
        titulo: '¿Eliminar esta ' + (esGuia ? 'guía' : 'reseña') + '?',
        texto: 'Se quitará del juego, de la comunidad y de tu historial. No se puede deshacer.',
        acciones: [
          { texto: 'Cancelar' },
          { texto: 'Eliminar', peligro: true, alTocar: function () {
            guardarResenasPropias(leerResenasPropias().filter(function (r) { return r.id !== resena.id; }));
            location.href = 'historial-resenas.html';
          } }
        ]
      });
    }
  });

  // Comentarios
  var lista = document.getElementById('lista-comentarios');
  var campo = document.getElementById('texto-comentario');
  var error = document.getElementById('error-comentario');
  document.getElementById('avatar-comentario').textContent = sesion ? sesion.initials : '?';

  function dibujarComentarios() {
    var comentarios = leerComentarios(resena.id);
    document.getElementById('cantidad-comentarios').textContent = '· ' + comentarios.length;
    lista.innerHTML = comentarios.length ? comentarios.map(function (c) {
      var persona = datosPersona(c.autor);
      var mio = sesion && c.autor === sesion.user;
      return '<div class="fila">' + htmlAvatar(persona, 'sm') +
        '<div class="comentario">' +
          '<div class="en-fila"><a href="' + enlacePerfil(c.autor) + '"><b>@' + escapar(c.autor) + '</b></a>' +
          '<span class="tarjeta__texto">' + escapar(c.fecha ? formatearFecha(c.fecha) : (c.cuando || '')) + '</span>' +
          (mio ? '<button class="dato__ayuda al-final" type="button" data-borrar-comentario="' + escapar(c.id) + '">Eliminar</button>' : '') + '</div>' +
          '<p class="comentario__texto">' + escapar(c.texto) + '</p>' +
        '</div></div>';
    }).join('') : '<div class="vacio">Sé la primera persona en comentar.</div>';
  }
  dibujarComentarios();

  document.getElementById('formulario-comentario').addEventListener('submit', function (e) {
    e.preventDefault();
    var texto = campo.value.trim();
    if (!texto) {
      error.hidden = false;
      campo.classList.add('campo--error');
      campo.setAttribute('aria-invalid', 'true');
      campo.focus();
      return;
    }
    if (!obtenerSesion()) { pedirCuenta('comentar'); return; }
    var comentarios = leerComentarios(resena.id);
    comentarios.push({ id: 'k' + Date.now(), resena: resena.id, autor: usuarioActual(), texto: texto, fecha: hoy() });
    guardarComentarios(resena.id, comentarios);
    campo.value = '';
    dibujarComentarios();
    mostrarAviso('Comentario publicado');
  });
  campo.addEventListener('input', function () {
    if (!campo.value.trim()) return;
    error.hidden = true;
    campo.classList.remove('campo--error');
    campo.setAttribute('aria-invalid', 'false');
  });
  lista.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-borrar-comentario]');
    if (!boton) return;
    var comentarios = leerComentarios(resena.id);
    var posicion = comentarios.findIndex(function (c) { return c.id === boton.dataset.borrarComentario; });
    var borrado = comentarios.splice(posicion, 1)[0];
    guardarComentarios(resena.id, comentarios);
    dibujarComentarios();
    mostrarAviso('Comentario eliminado', { texto: 'Deshacer', alTocar: function () {
      var actuales = leerComentarios(resena.id);
      actuales.splice(posicion, 0, borrado);
      guardarComentarios(resena.id, actuales);
      dibujarComentarios();
    } });
  });

  // Sobre quien escribe (con "+ Agregar amigo" si no lo es)
  var relacion = propia ? 'yo' : ({ amigos: 'amigos', 'solicitud enviada': 'enviada' })[relacionCon(autor.usuario)] || 'ninguna';
  document.getElementById('sobre-autor').innerHTML = '<h2 class="panel__titulo" id="titulo-autor">Sobre quien escribe</h2>' +
    '<a class="fila fila--actividad" href="' + enlacePerfil(autor.usuario) + '">' + htmlAvatar(autor, 'md') +
      '<span><b>' + escapar(autor.nombre) + '</b><br><span class="tarjeta__texto">' + (autor.nivel ? 'Nivel ' + escapar(autor.nivel) : '@' + escapar(autor.usuario)) + '</span></span></a>' +
    (autor.sobreMi && !propia ? '<p class="tarjeta__texto">' + escapar(autor.sobreMi) + '</p>' : '') +
    (relacion === 'amigos' ? '<span><span class="etiqueta etiqueta--amigo">✓ Amigos</span></span>' : '') +
    (relacion === 'enviada' ? '<span><span class="etiqueta etiqueta--contorno">Solicitud enviada</span></span>' : '') +
    (relacion === 'ninguna' && autor.nivel ? '<span><button class="boton boton--secundario boton--sm" type="button" id="agregar-amigo">+ Agregar amigo</button></span>' : '');
  var botonAmigo = document.getElementById('agregar-amigo');
  if (botonAmigo) botonAmigo.addEventListener('click', function () {
    if (!obtenerSesion()) { pedirCuenta('agregar amigos'); return; }
    cambiarRelacion(autor.usuario, 'out');
    botonAmigo.outerHTML = '<span class="etiqueta etiqueta--contorno">Solicitud enviada</span>';
    mostrarAviso('Solicitud enviada a ' + autor.nombre);
  });

  // Datos de la partida
  var partida = resena.estadoPartida;
  if (!partida && resena.autor === 'samluq') {
    var enDiario = obtenerDatos('diario').find(function (d) { return d.juego === resena.juego; });
    partida = enDiario && enDiario.estado;
  }
  document.getElementById('datos-partida').innerHTML = [
    ['Estado', partida || 'Terminado'], ['Horas jugadas', (resena.horas || 0) + ' h'],
    ['Dificultad votada', (resena.dificultad || '—') + '/10'], ['Nota de la comunidad', formatearNota(juego.calificacion) + '/10']
  ].map(function (f) { return '<dt>' + f[0] + '</dt><dd>' + escapar(f[1]) + '</dd>'; }).join('');

  // Más reseñas de este juego
  var mas = obtenerResenas().filter(function (r) { return r.juego === juego.id && r.id !== resena.id && r.tipo === 'resena'; }).slice(0, 3);
  document.getElementById('mas-resenas').innerHTML = mas.length ? mas.map(function (r) {
    return '<a class="fila fila--actividad" href="detalle-resena.html?id=' + encodeURIComponent(r.id) + '">' + htmlAvatar(datosPersona(r.autor), 'sm') +
      '<span><b>@' + escapar(r.autor) + '</b> <span class="nota nota--texto">' + escapar(r.calificacion) + '/10</span><br>' +
      '<span class="tarjeta__texto">' + escapar(r.spoiler ? 'Contiene spoilers' : r.texto.slice(0, 90) + (r.texto.length > 90 ? '…' : '')) + '</span></span></a>';
  }).join('') : '<p class="tarjeta__texto">Es la única reseña de este juego.</p><a href="escribir-resena.html?id=' + encodeURIComponent(juego.id) + '"><b>Escribe la tuya</b></a>';

  aplicarColores(document);
}

// 13. Eventos
function pantallaEventos() {
  var eventos = obtenerDatos('eventos');
  var filtro = 'todos';
  var organiza = '';
  var lista = document.getElementById('lista-eventos');
  var cajaFiltros = document.getElementById('filtro-tipo');
  var selectorOrganiza = document.getElementById('organiza');

  var delMes = eventos.find(function (e) { return e.destacado; });
  document.getElementById('evento-destacado').innerHTML = delMes ? htmlEventoDestacado(delMes) : '';

  function mostrar() {
    cajaFiltros.querySelectorAll('[data-filtro]').forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.dataset.filtro === filtro));
    });
    var elegidos = eventos.filter(function (e) {
      var porTipo = filtro === 'todos' || e.tipo === filtro || (filtro === 'gratis' && e.gratis);
      return porTipo && (!organiza || e.tipoOrganizador === organiza);
    });
    lista.innerHTML = elegidos.length
      ? elegidos.map(htmlEvento).join('')
      : '<div class="vacio"><b>No hay eventos con estos filtros.</b><button class="boton boton--secundario boton--sm" type="button" id="ver-todos">Ver todos</button></div>';
    aplicarColores(document);
  }

  cajaFiltros.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-filtro]');
    if (!chip) return;
    filtro = chip.dataset.filtro;
    mostrar();
  });
  selectorOrganiza.addEventListener('change', function () {
    organiza = selectorOrganiza.value;
    mostrar();
  });
  lista.addEventListener('click', function (e) {
    if (!e.target.closest('#ver-todos')) return;
    filtro = 'todos';
    organiza = '';
    selectorOrganiza.value = '';
    mostrar();
  });

  mostrar();
}

// Inscripciones propias (hasta conectar Supabase). "joined" es la lista de ids
// que muestra el Perfil en "Mis eventos".
var XP_SORTEO = 300;
var XP_POR_TORNEO = 100;

function estaInscrito(idEvento) {
  return leerMemoria('joined', []).indexOf(idEvento) !== -1;
}

function guardarInscripcion(inscripcion) {
  var inscripciones = leerMemoria('inscripciones', []);
  inscripciones.push(inscripcion);
  guardarMemoria('inscripciones', inscripciones);
  var ids = leerMemoria('joined', []);
  if (ids.indexOf(inscripcion.evento) === -1) ids.push(inscripcion.evento);
  guardarMemoria('joined', ids);
}

// 14. Detalle de evento (y 15. Ventana: Inscripción confirmada)
function pantallaEvento() {
  var evento = buscarPorId('eventos', new URLSearchParams(location.search).get('id'));
  if (!evento) { location.replace(rutaPagina('404.html') + '?tipo=evento'); return; }
  var esTorneo = evento.tipo === 'torneo';
  var juego = evento.juego ? buscarPorId('juegos', evento.juego) : null;
  var xp = leerPerfil().xp;

  document.title = evento.titulo + ' · SaveSlot';

  // Cabecera: tipo, juego, organizador y datos
  document.getElementById('cabecera').dataset.color = evento.color;
  var miga = document.getElementById('miga-tipo');
  miga.textContent = esTorneo ? 'Torneos' : 'Sorteos';
  document.getElementById('miga-evento').textContent = evento.titulo;
  document.getElementById('etiquetas-evento').innerHTML = etiquetaTipoEvento(evento) +
    (juego ? '<span class="etiqueta etiqueta--contorno">' + escapar(juego.nombreCorto.toUpperCase()) + '</span>' : '') +
    '<span class="etiqueta etiqueta--contorno">ORGANIZA ' + escapar(evento.organizador.toUpperCase()) + '</span>';
  document.getElementById('titulo-evento').textContent = evento.titulo;
  document.getElementById('datos-evento').innerHTML = [
    ['Fecha', evento.fechaHora],
    [esTorneo ? 'Cupos' : 'Participantes', evento.cuposMaximos ? evento.cuposOcupados + ' / ' + evento.cuposMaximos : (evento.cuposOcupados ? formatearNumero(evento.cuposOcupados) : 'Sin límite')],
    ['Costo', evento.costo],
    ['Premio', evento.premio || '—']
  ].map(function (d) {
    return '<div class="dato"><span class="dato__etiqueta">' + d[0] + '</span><b>' + escapar(d[1]) + '</b></div>';
  }).join('');

  // Sobre el evento, cronograma y reglas
  document.getElementById('sobre-evento').innerHTML =
    '<h2 class="encabezado-seccion__titulo">' + (esTorneo ? 'Sobre el torneo' : 'Sobre el sorteo') + '</h2>' +
    '<p class="tarjeta__texto">' + escapar(evento.descripcion) + '</p>' +
    (evento.cronograma.length
      ? '<h2 class="encabezado-seccion__titulo">Cronograma</h2><ol class="cronograma">' + evento.cronograma.map(function (c) {
        return '<li><b>' + escapar(c.paso) + '</b> <span class="tarjeta__texto">' + escapar(c.cuando) + '</span></li>';
      }).join('') + '</ol>'
      : '');
  document.getElementById('reglas-evento').innerHTML = evento.reglas.map(function (r) { return '<li>' + escapar(r) + '</li>'; }).join('');

  // Formulario de inscripción
  var formulario = document.getElementById('formulario-inscripcion');
  var soloPago = !evento.gratis;
  var faltaXp = !esTorneo && xp < XP_SORTEO;
  var opcionGratis = evento.gratis
    ? '<label class="opcion' + (faltaXp ? ' opcion--desactivada' : '') + '"><input type="radio" name="forma" value="xp"' + (faltaXp ? ' disabled' : ' checked') + '>' +
        '<span class="opcion__texto"><b>Gratis' + (esTorneo ? '' : ' con ' + XP_SORTEO + ' XP') + '</b><br><span class="tarjeta__texto">' +
        (esTorneo ? 'Sin costo de inscripción.' : (faltaXp
          ? 'Tienes ' + formatearNumero(xp) + ' XP: te faltan ' + formatearNumero(XP_SORTEO - xp) + '. Gánalos reseñando juegos.'
          : 'Tienes ' + formatearNumero(xp) + ' XP. Te quedarán ' + formatearNumero(xp - XP_SORTEO) + '.')) +
        '</span></span></label>'
    : '';
  // Pagos: llegan después. Se muestran desactivados, como en el diseño.
  var opcionPago = esTorneo && evento.gratis ? '' :
    '<label class="opcion opcion--desactivada"><input type="radio" name="forma" value="pago" disabled>' +
      '<span class="opcion__texto"><b>' + (esTorneo ? 'Pagar inscripción' : 'Participación de pago') + '</b><br>' +
      '<span class="tarjeta__texto">No disponible todavía: los pagos aún no están conectados. No se te cobrará nada.</span></span><b>' + escapar(evento.costo) + '</b></label>';

  formulario.innerHTML =
    '<h2 class="encabezado-seccion__titulo" id="titulo-inscripcion">' + (esTorneo ? 'Inscribe a tu equipo' : 'Participa') + '</h2>' +
    (estaInscrito(evento.id) ? '<div class="tarjeta tarjeta--exito"><b>Ya estás inscrito en este evento.</b><a href="perfil.html#mis-eventos">Ver en mi perfil</a></div>' : '') +
    (esTorneo
      ? '<div class="grupo-campo"><label class="grupo-campo__etiqueta" for="equipo">Nombre del equipo</label>' +
          '<input class="campo" id="equipo" maxlength="40" placeholder="Ej. Los Salvados" aria-describedby="error-equipo">' +
          '<span class="grupo-campo__error" id="error-equipo" hidden>Escribe el nombre de tu equipo.</span></div>' +
        '<div class="grupo-campo"><label class="grupo-campo__etiqueta" for="companero">Compañero de equipo</label>' +
          '<input class="campo" id="companero" maxlength="40" placeholder="Usuario de SaveSlot">' +
          '<span class="grupo-campo__ayuda">Le enviaremos una invitación para confirmar.</span></div>'
      : '') +
    '<fieldset class="grupo-campo"><legend class="grupo-campo__etiqueta">Cómo participar</legend>' + opcionGratis + opcionPago +
      (soloPago ? '<div class="tarjeta tarjeta--aviso"><b>Este torneo solo admite inscripción de pago.</b><span class="tarjeta__texto">Mientras conectamos los pagos, mira los eventos gratuitos.</span><a href="eventos.html"><b>Ver eventos gratis</b></a></div>' : '') +
    '</fieldset>' +
    '<label class="casilla"><input type="checkbox" id="reglamento" aria-describedby="error-reglamento"><span>Acepto el reglamento y la política de reembolsos.</span></label>' +
    '<span class="grupo-campo__error" id="error-reglamento" hidden>Debes aceptar el reglamento para continuar.</span>' +
    '<button class="boton boton--bloque" type="submit" id="inscribirme"' + (soloPago ? ' disabled' : '') + '>' + (esTorneo ? 'Inscribirme' : 'Participar') + '</button>';

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!obtenerSesion()) { pedirCuenta('inscribirte en eventos'); return; }
    var valido = true;
    var equipo = document.getElementById('equipo');
    if (equipo) {
      var sinEquipo = !equipo.value.trim();
      equipo.classList.toggle('campo--error', sinEquipo);
      equipo.setAttribute('aria-invalid', String(sinEquipo));
      document.getElementById('error-equipo').hidden = !sinEquipo;
      if (sinEquipo) { valido = false; equipo.focus(); }
    }
    var reglamento = document.getElementById('reglamento');
    document.getElementById('error-reglamento').hidden = reglamento.checked;
    if (!reglamento.checked) valido = false;
    if (!valido) return;
    var forma = formulario.querySelector('input[name="forma"]:checked');
    if (!forma) { mostrarAviso('Elige cómo participar'); return; }

    var boton = document.getElementById('inscribirme');
    boton.disabled = true;
    boton.textContent = 'Inscribiendo…';
    setTimeout(function () {
      if (esTorneo) {
        sumarXp(XP_POR_TORNEO);
      } else {
        var perfil = leerPerfil();
        perfil.xp -= XP_SORTEO;
        guardarMemoria('profile', perfil);
      }
      guardarInscripcion({
        usuario: usuarioActual(), evento: evento.id, equipo: equipo ? equipo.value.trim() : null,
        companero: esTorneo ? document.getElementById('companero').value.trim() || null : null, forma: 'xp', fecha: hoy()
      });

      // 15. Ventana: Inscripción confirmada
      abrirModal({
        titulo: esTorneo ? '¡Estás inscrito!' : '¡Ya participas!',
        texto: esTorneo
          ? 'Tu equipo tiene cupo y ganaste ' + XP_POR_TORNEO + ' XP. Recibirás el recordatorio del check-in y lo verás en Mis eventos de tu perfil.'
          : 'Usaste ' + XP_SORTEO + ' XP. Te avisaremos por correo si ganas. Lo verás en Mis eventos de tu perfil.',
        acciones: [
          { texto: 'Ver mis eventos', href: 'perfil.html#mis-eventos', principal: true },
          { texto: 'Listo', alTocar: function () { location.reload(); } }
        ]
      });
    }, 600);
  });

  aplicarColores(document);
}

/* ---------- Cuentas (hasta conectar Supabase) ----------
   El navegador guarda los datos de una sola persona a la vez (perfil, reseñas,
   diario…). Al entrar con otra cuenta, se guardan los de la anterior aparte y se
   cargan los de la nueva. Si "duenoDatos" no existe, los datos son de samluq. */
var CLAVES_DE_CUENTA = ['profile', 'myReviews', 'diary', 'joined', 'inscripciones', 'friends', 'meGustaResenas', 'votosUtil', 'chatsMatchplay', 'steamBiblioteca', 'steamLogros'];

function cambiarDeCuenta(usuario, datosNuevos) {
  var dueno = leerMemoria('duenoDatos', 'samluq');
  if (dueno !== usuario) {
    var copia = {};
    CLAVES_DE_CUENTA.forEach(function (clave) { copia[clave] = leerMemoria(clave, null); });
    guardarMemoria('datosDe.' + dueno, copia);
    var guardados = leerMemoria('datosDe.' + usuario, null) || datosNuevos || {};
    CLAVES_DE_CUENTA.forEach(function (clave) {
      try { localStorage.removeItem('ss.' + clave); } catch (e) { /* modo privado */ }
      if (guardados[clave] != null) guardarMemoria(clave, guardados[clave]);
    });
    guardarMemoria('duenoDatos', usuario);
  }
}

function iniciarSesion(sesion, datosNuevos) {
  cambiarDeCuenta(sesion.user, datosNuevos);
  guardarMemoria('session', sesion);
}

function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo);
}

function inicialesDe(nombre) {
  return nombre.trim().split(/\s+/).slice(0, 2).map(function (p) { return p[0]; }).join('').toUpperCase() || 'S';
}

// A dónde volver después de entrar (?volver=…): solo páginas de la app
function destinoVolver() {
  var volver = new URLSearchParams(location.search).get('volver');
  if (!volver || !/^[a-z0-9\-]+\.html(\?[^<>"'\s]*)?$/i.test(volver)) return 'perfil.html';
  return /^(index|404)\.html/.test(volver) ? '../' + volver : volver;
}

// Muestra u oculta el error de un campo; devuelve true si no hay error
function marcarError(campo, error, mensaje) {
  var marco = campo.closest('.campo-clave');
  if (marco) marco.classList.toggle('campo-clave--error', !!mensaje);
  else if (campo.classList.contains('campo')) campo.classList.toggle('campo--error', !!mensaje);
  campo.setAttribute('aria-invalid', String(!!mensaje));
  error.textContent = mensaje || '';
  error.hidden = !mensaje;
  return !mensaje;
}

var ICONO_OJO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

// Botón del ojo: muestra u oculta la contraseña
function activarOjo(boton, campo) {
  boton.addEventListener('click', function () {
    var oculta = campo.type === 'password';
    campo.type = oculta ? 'text' : 'password';
    boton.setAttribute('aria-label', oculta ? 'Ocultar contraseña' : 'Mostrar contraseña');
    boton.setAttribute('aria-pressed', String(oculta));
  });
}

// 16. Iniciar sesión
function pantallaEntrar() {
  if (obtenerSesion()) { location.replace(destinoVolver()); return; }
  document.getElementById('ir-a-crear').href = 'crear-cuenta.html' + location.search;
  activarBotonSteam();
  var correo = document.getElementById('correo');
  var clave = document.getElementById('clave');
  activarOjo(document.getElementById('ver-clave'), clave);

  document.getElementById('formulario-entrar').addEventListener('submit', function (e) {
    e.preventDefault();
    var errorCorreo = document.getElementById('error-correo');
    var correoOk = marcarError(correo, errorCorreo, correoValido(correo.value.trim()) ? '' :
      (correo.value.trim() ? 'Al correo le falta algo. Ejemplo: samuel@correo.com' : 'Escribe tu correo.'));
    var claveOk = marcarError(clave, document.getElementById('error-clave'), clave.value.length >= 8 ? '' : 'La contraseña tiene al menos 8 caracteres.');
    if (!correoOk) { correo.focus(); return; }
    if (!claveOk) { clave.focus(); return; }
    var cuenta = leerMemoria('accounts', {})[correo.value.trim().toLowerCase()];
    if (!cuenta) {
      marcarError(correo, errorCorreo, 'x');
      errorCorreo.innerHTML = 'No hay una cuenta con ' + escapar(correo.value.trim()) + '. Revisa si está bien escrito o <a href="crear-cuenta.html' + escapar(location.search) + '">crea una cuenta</a>.';
      correo.focus();
      return;
    }
    iniciarSesion({ name: cuenta.name, user: cuenta.user, initials: inicialesDe(cuenta.name), email: correo.value.trim().toLowerCase() });
    location.href = destinoVolver();
  });

  // Cuenta de demostración: entra sin pedir datos, con el perfil de ejemplo
  document.getElementById('entrar-demo').addEventListener('click', function () {
    iniciarSesion({ name: 'Samuel D Luq', user: 'samluq', initials: 'SL', email: 'demo@saveslot' });
    location.href = destinoVolver();
  });
}

// 17. Crear cuenta (paso 1 de 3)
function pantallaRegistro() {
  if (obtenerSesion()) { location.replace('perfil.html'); return; }
  document.getElementById('ir-a-entrar').href = 'iniciar-sesion.html' + location.search;
  activarBotonSteam();
  var nombre = document.getElementById('nombre');
  var correo = document.getElementById('correo');
  var usuario = document.getElementById('usuario');
  var clave = document.getElementById('clave');
  var terminos = document.getElementById('terminos');
  var mensajeUsuario = document.getElementById('mensaje-usuario');
  activarOjo(document.getElementById('ver-clave'), clave);
  var USUARIO_VALIDO = /^[a-z0-9_.]{3,20}$/i;

  // Medidor de fuerza: largo, mayúsculas y minúsculas, números y símbolos
  var textosFuerza = ['Escribe al menos 8 caracteres.', 'Débil. Agrega mayúsculas y números.', 'Regular. Agrega un número o símbolo.', 'Buena. Agrega un símbolo para hacerla fuerte.', 'Fuerte.'];
  clave.addEventListener('input', function () {
    var v = clave.value;
    var nivel = (v.length >= 8 ? 1 : 0) + (/[A-Z]/.test(v) && /[a-z]/.test(v) ? 1 : 0) + (/\d/.test(v) ? 1 : 0) + (/[^A-Za-z0-9]/.test(v) ? 1 : 0);
    document.getElementById('fuerza').dataset.nivel = nivel;
    document.getElementById('texto-fuerza').textContent = textosFuerza[nivel];
  });

  usuario.addEventListener('input', function () {
    var valor = usuario.value.trim();
    var libre = USUARIO_VALIDO.test(valor) && !buscarPorId('usuarios', valor.toLowerCase());
    mensajeUsuario.className = valor ? (libre ? 'grupo-campo__ayuda grupo-campo__ayuda--listo' : 'grupo-campo__error') : 'grupo-campo__ayuda';
    mensajeUsuario.textContent = !valor ? '' : (libre ? '✓ Disponible' : (USUARIO_VALIDO.test(valor) ? 'Ese usuario ya existe. Prueba otro.' : 'Usa de 3 a 20 letras, números, punto o guion bajo.'));
    usuario.classList.toggle('campo--error', !!valor && !libre);
  });

  document.getElementById('formulario-registro').addEventListener('submit', function (e) {
    e.preventDefault();
    var valorUsuario = usuario.value.trim();
    var usuarioOk = USUARIO_VALIDO.test(valorUsuario) && !buscarPorId('usuarios', valorUsuario.toLowerCase());
    var resultados = [
      [nombre, marcarError(nombre, document.getElementById('error-nombre'), nombre.value.trim().length >= 2 ? '' : 'Escribe tu nombre.')],
      [correo, marcarError(correo, document.getElementById('error-correo'), correoValido(correo.value.trim()) ? '' : 'Revisa el correo. Ejemplo: tu@correo.com')],
      [usuario, marcarError(usuario, mensajeUsuario, usuarioOk ? '' : (USUARIO_VALIDO.test(valorUsuario) ? 'Ese usuario ya existe. Prueba otro.' : 'Usa de 3 a 20 letras, números, punto o guion bajo.'))],
      [clave, marcarError(clave, document.getElementById('error-clave'), clave.value.length >= 8 ? '' : 'La contraseña necesita al menos 8 caracteres.')],
      [terminos, marcarError(terminos, document.getElementById('error-terminos'), terminos.checked ? '' : 'Debes aceptar los términos para crear la cuenta.')]
    ];
    if (!usuarioOk) mensajeUsuario.className = 'grupo-campo__error';
    var primero = resultados.find(function (r) { return !r[1]; });
    if (primero) { primero[0].focus(); return; }

    var cuentas = leerMemoria('accounts', {});
    var llave = correo.value.trim().toLowerCase();
    if (cuentas[llave]) {
      marcarError(correo, document.getElementById('error-correo'), 'Ya existe una cuenta con ese correo. Inicia sesión.');
      correo.focus();
      return;
    }
    // La contraseña NO se guarda: la cuenta real la manejará Supabase.
    cuentas[llave] = { name: nombre.value.trim(), user: valorUsuario };
    guardarMemoria('accounts', cuentas);
    iniciarSesion({ name: nombre.value.trim(), user: valorUsuario, initials: inicialesDe(nombre.value), email: llave }, {
      profile: { user: valorUsuario, xp: 0, level: 1, bio: '', since: hoy(), favorites: [], wishlist: [], genres: [], playing: null,
        accounts: { Steam: null, PlayStation: null, Xbox: null, Nintendo: null }, missionsDone: [] },
      myReviews: [], diary: [], joined: [], inscripciones: [], friends: {}, chatsMatchplay: []
    });
    location.href = 'editar-perfil.html?nuevo=1';
  });
}

// Lleva a Iniciar sesión si no hay sesión (y vuelve a esta página al entrar)
function exigirSesion() {
  if (obtenerSesion()) return true;
  location.replace('iniciar-sesion.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search));
  return false;
}

// Los colores de hasta 3 juegos, para la banda de un perfil
function colorearBanda(banda, idsJuegos) {
  var colores = idsJuegos.map(function (id) { return buscarPorId('juegos', id); }).filter(Boolean).map(function (j) { return j.color; });
  ['--c1', '--c2', '--c3'].forEach(function (variable, i) { if (colores[i]) banda.style.setProperty(variable, colores[i]); });
}

// '2024-03-14' → '14 de marzo de 2024'
function formatearFechaLarga(fecha) {
  return fecha ? new Date(fecha + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
}

// Ordena personas: jugando, en línea y desconectadas
function ordenarPorEstado(personas) {
  var orden = ['jugando', 'en-linea', 'desconectado'];
  return personas.sort(function (a, b) { return orden.indexOf(a.estado) - orden.indexOf(b.estado); });
}

function copiarEnlace(enlace, mensaje) {
  if (navigator.clipboard) navigator.clipboard.writeText(enlace).then(function () { mostrarAviso(mensaje); }, function () { mostrarAviso(enlace); });
  else mostrarAviso(enlace);
}

// 18. Perfil (y 19. Ventana: Cómo ganar XP)
function pantallaPerfil() {
  if (!exigirSesion()) return;
  var sesion = obtenerSesion();
  var perfil = leerPerfil();
  var diario = leerDiario();
  var datosUsuario = buscarPorId('usuarios', sesion.user) || {};
  var jugando = perfil.playing ? buscarPorId('juegos', perfil.playing) : null;

  // Cabecera
  colorearBanda(document.getElementById('banda-perfil'), perfil.favorites);
  var avatar = document.getElementById('avatar-perfil');
  avatar.textContent = sesion.initials;
  if (jugando) {
    avatar.classList.add('avatar--jugando');
    avatar.insertAdjacentHTML('beforeend', '<span class="avatar__punto"></span>');
  }
  document.getElementById('nombre-perfil').textContent = sesion.name;
  document.getElementById('usuario-perfil').textContent = '@' + sesion.user;
  document.getElementById('insignias-perfil').innerHTML = '<span class="etiqueta etiqueta--primario">NIVEL ' + escapar(perfil.level) + '</span>' +
    (datosUsuario.insignias || []).map(function (i) { return '<span class="etiqueta etiqueta--contorno">' + escapar(i.toUpperCase()) + '</span>'; }).join('');
  document.getElementById('compartir-perfil').addEventListener('click', function () {
    copiarEnlace(location.href.split('?')[0].replace('perfil.html', 'perfil-usuario.html?u=' + encodeURIComponent(sesion.user)), 'Enlace del perfil copiado');
  });

  // Actividad: qué está jugando
  document.getElementById('jugando-perfil').innerHTML = jugando
    ? '<a class="fila fila--jugando" href="detalle-juego.html?id=' + encodeURIComponent(jugando.id) + '"><span class="portada portada--sm"' + atributoColor(jugando.color) + '>' + imagenPortada(jugando) + '</span>' +
      '<span><span class="estado estado--jugando">Jugando ahora</span><br><b>' + escapar(jugando.nombreCorto) + '</b><br><span class="tarjeta__texto">Dato de Steam (demo)</span></span></a>'
    : '<p class="tarjeta__texto">No está jugando nada en este momento.</p>';

  // Si Steam está vinculada de verdad, se muestra lo que juega ahora en Steam
  if ((perfil.accounts || {}).Steam) {
    pedirSteam('profile').then(function (steam) {
      var caja = document.getElementById('jugando-perfil');
      if (steam.playing_now) {
        caja.innerHTML = '<div class="fila fila--jugando"><span><span class="estado estado--jugando">Jugando ahora</span><br><b>' + escapar(steam.playing_now.name) + '</b><br><span class="tarjeta__texto">Dato de Steam</span></span></div>';
      } else if (!jugando && steam.recent_games && steam.recent_games.length) {
        var ultimo = steam.recent_games[0];
        caja.innerHTML = '<p class="tarjeta__texto">No está jugando ahora. Último en Steam: <b>' + escapar(ultimo.name) + '</b> · ' +
          formatearNumero(Math.round((ultimo.playtime_2weeks || 0) / 60)) + ' h en las últimas 2 semanas.</p>';
      }
    }).catch(function () { /* sin sesión de Steam (cuenta demo): se queda el dato de ejemplo */ });
  }

  // Sobre mí, miembro desde y XP
  document.getElementById('sobre-perfil').textContent = perfil.bio || 'Todavía no escribiste nada sobre ti.';
  document.getElementById('desde-perfil').textContent = formatearFechaLarga(perfil.since);
  document.getElementById('barra-xp').dataset.ancho = Math.round(perfil.xp / XP_POR_NIVEL * 100);
  document.getElementById('texto-xp').textContent = formatearNumero(perfil.xp) + ' / ' + formatearNumero(XP_POR_NIVEL) + ' XP · nivel ' + (perfil.level + 1) + ' a ' + formatearNumero(XP_POR_NIVEL - perfil.xp) + ' XP';
  // 19. Ventana: Cómo ganar XP (se cierra con la X, "Entendido" o Escape)
  document.getElementById('ayuda-xp').addEventListener('click', function () {
    abrirModal({
      titulo: 'Cómo ganar XP',
      html: '<ul class="lista-puntos">' +
        '<li>Publicar una reseña o guía: +50 XP</li>' +
        '<li>Vincular una cuenta de juego: +100 XP</li>' +
        '<li>Inscribirte en un torneo: +' + XP_POR_TORNEO + ' XP</li>' +
        '<li>Cada ' + formatearNumero(XP_POR_NIVEL) + ' XP subes de nivel. Puedes usar ' + XP_SORTEO + ' XP para entrar gratis a un sorteo.</li></ul>',
      acciones: [{ texto: 'Entendido', principal: true }]
    });
  });

  // Amigos (primero los que juegan) y solicitudes pendientes
  var personas = obtenerDatos('usuarios');
  var amigos = ordenarPorEstado(personas.filter(function (u) { return relacionCon(u.usuario) === 'amigos'; }));
  var solicitudes = personas.filter(function (u) { return relacionCon(u.usuario) === 'solicitud recibida'; });
  document.getElementById('cantidad-amigos').textContent = '· ' + amigos.length;
  document.getElementById('amigos-perfil').innerHTML = amigos.slice(0, 8).map(function (a) {
    return '<a href="perfil-usuario.html?u=' + encodeURIComponent(a.usuario) + '" title="' + escapar(a.nombre) + '"><span class="solo-lectores">' + escapar(a.nombre) + '</span>' + htmlAvatar(a) + '</a>';
  }).join('') || '<p class="tarjeta__texto">Aún no tienes amigos. <a href="amigos.html#sugerencias">Ver sugerencias</a></p>';
  document.getElementById('solicitudes-perfil').innerHTML = solicitudes.length
    ? '<a class="fila fila--actividad" href="amigos.html#solicitudes">' + htmlAvatar(solicitudes[0], 'sm') + '<span><b>' + solicitudes.length + (solicitudes.length === 1 ? ' solicitud' : ' solicitudes') + '</b> de amistad pendientes</span><span class="al-final" aria-hidden="true">→</span></a>'
    : '';

  // Conexiones (simulado)
  var cuentas = perfil.accounts || {};
  document.getElementById('conexiones-perfil').innerHTML = ['Steam', 'PlayStation', 'Xbox', 'Nintendo'].map(function (plataforma) {
    var nombre = cuentas[plataforma];
    return '<div class="fila"><span><b>' + plataforma + '</b> <span class="tarjeta__texto">' + escapar(nombre || '') + '</span></span>' +
      (nombre ? '<span class="etiqueta etiqueta--exito al-final">Verificada</span>' : '<a class="al-final" href="editar-perfil.html#cuentas"><b>Vincular</b></a>') + '</div>';
  }).join('');

  // Mis eventos: cancelar inscripción con deshacer
  var cajaEventos = document.getElementById('eventos-perfil');
  function dibujarEventos() {
    var ids = leerMemoria('joined', []);
    cajaEventos.innerHTML = ids.map(function (id) {
      var evento = buscarPorId('eventos', id);
      if (!evento) return '';
      return '<div class="tarjeta"><a href="detalle-evento.html?id=' + encodeURIComponent(id) + '"><b>' + escapar(evento.titulo) + '</b></a>' +
        '<span class="tarjeta__texto">' + escapar(evento.fechaHora) + '</span>' +
        '<button class="dato__ayuda" type="button" data-cancelar="' + escapar(id) + '">Cancelar inscripción</button></div>';
    }).join('') || '<p class="tarjeta__texto">No estás inscrito en eventos. <a href="eventos.html"><b>Ver eventos</b></a></p>';
  }
  dibujarEventos();
  cajaEventos.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-cancelar]');
    if (!boton) return;
    var id = boton.dataset.cancelar;
    guardarMemoria('joined', leerMemoria('joined', []).filter(function (x) { return x !== id; }));
    dibujarEventos();
    mostrarAviso('Inscripción cancelada', { texto: 'Deshacer', alTocar: function () {
      var ids = leerMemoria('joined', []);
      if (ids.indexOf(id) === -1) ids.push(id);
      guardarMemoria('joined', ids);
      dibujarEventos();
    } });
  });

  // Estadísticas
  var resenas = leerResenasPropias().filter(function (r) { return r.tipo === 'resena'; });
  var resumenLogros = obtenerDatos('resumenLogros').find(function (r) { return r.usuario === sesion.user; });
  var anio = String(new Date().getFullYear());
  var logrosSteam = (perfil.accounts || {}).Steam ? leerMemoria('steamLogros', null) : null;
  var bibliotecaSteam = (perfil.accounts || {}).Steam ? leerBibliotecaSteam() : [];
  document.getElementById('estadisticas-perfil').innerHTML = [
    ['Biblioteca', bibliotecaSteam.length, 'biblioteca.html'],
    ['Juegos', diario.length, 'diario.html'],
    ['Este año', diario.filter(function (d) { return String(d.fecha).slice(0, 4) === anio; }).length, 'diario.html'],
    ['Reseñas', resenas.length, 'historial-resenas.html'],
    ['Logros', formatearNumero(logrosSteam ? logrosSteam.summary.unlocked : (resumenLogros ? resumenLogros.desbloqueados : 0)), 'logros.html'],
    ['Lista de deseos', perfil.wishlist.length, '#deseos']
  ].map(function (d) {
    return '<a class="dato" href="' + d[2] + '"><span class="dato__valor">' + d[1] + '</span><span class="dato__etiqueta">' + d[0] + '</span></a>';
  }).join('');

  // Juegos favoritos (4 lugares)
  var favoritos = perfil.favorites.slice(0, 4).map(function (id) { return buscarPorId('juegos', id); }).filter(Boolean);
  document.getElementById('cantidad-favoritos').textContent = favoritos.length + ' de 4';
  document.getElementById('favoritos-perfil').innerHTML = favoritos.map(function (j) {
    return '<a class="portada portada--enlace" href="' + escapar(enlaceJuego(j)) + '"' + atributoColor(j.color) + '>' + imagenPortada(j) + '<b class="portada__titulo">' + escapar(j.nombreCorto) + '</b></a>';
  }).join('') + new Array(4 - favoritos.length + 1).join('<a class="vacio" href="editar-perfil.html#favoritos">+ Elegir favorito</a>');

  // Actividad reciente: los últimos 6 del diario
  document.getElementById('recientes-perfil').innerHTML = diario.slice(0, 6).map(function (d) {
    var j = buscarPorId('juegos', d.juego);
    if (!j) return '';
    var abandonado = d.estado === 'Abandonado';
    return '<a href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '"><span class="portada portada--enlace"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span>' +
      '<span class="' + (abandonado ? 'etiqueta etiqueta--error' : 'nota nota--texto') + '">' + (abandonado ? 'Abandonado' : d.calificacion + '/10') + (d.meGusta ? ' ♥' : '') + '</span></a>';
  }).join('') || '<div class="vacio">Aún no registras juegos. <a href="buscar-juegos.html">Busca uno</a></div>';

  // Géneros más jugados (horas del diario por género)
  var horas = {};
  diario.forEach(function (d) {
    var j = buscarPorId('juegos', d.juego);
    if (j) j.generos.forEach(function (g) { horas[g] = (horas[g] || 0) + (d.horas || 0) / j.generos.length; });
  });
  var total = Object.keys(horas).reduce(function (s, g) { return s + horas[g]; }, 0) || 1;
  var top = Object.keys(horas).map(function (g) { return [g, horas[g]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 5);
  var mayor = top.length ? top[0][1] : 1;
  document.getElementById('generos-perfil').innerHTML = top.map(function (g) {
    return '<span>' + escapar(g[0]) + '</span><span class="medidor"><span class="medidor__barra" data-ancho="' + Math.round(g[1] / mayor * 100) + '"></span></span><b>' + Math.round(g[1] / total * 100) + '%</b>';
  }).join('') || '<span class="tarjeta__texto">Registra juegos para ver tus géneros.</span>';
  document.getElementById('generos-favoritos').textContent = perfil.genres.length ? 'Favoritos: ' + perfil.genres.join(', ') : '';

  // Calificaciones del 1 al 10
  var cuentas10 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  var calificados = diario.filter(function (d) { return d.calificacion; });
  calificados.forEach(function (d) { cuentas10[d.calificacion - 1]++; });
  var maximo = Math.max.apply(null, cuentas10.concat(1));
  var promedio = calificados.length ? calificados.reduce(function (s, d) { return s + d.calificacion; }, 0) / calificados.length : 0;
  var histograma = document.getElementById('histograma-perfil');
  histograma.innerHTML = cuentas10.map(function (c, i) {
    return '<span class="histograma__barra" data-h="' + Math.round(c / maximo * 100) + '" title="' + (i + 1) + '/10: ' + c + ' juegos"></span>';
  }).join('');
  histograma.setAttribute('aria-label', 'Distribución de tus calificaciones. Promedio ' + formatearNota(promedio));
  document.getElementById('promedio-perfil').textContent = formatearPromedio(promedio) + ' · ' + calificados.length + ' juegos';

  // Biblioteca de Steam: los 6 más jugados (antes de la lista de deseos)
  function dibujarBiblioteca(lista) {
    var seccion = document.getElementById('biblioteca');
    if (!seccion) return;
    seccion.hidden = false;
    var top = lista.slice().sort(function (a, b) { return b.horas - a.horas; }).slice(0, 6);
    document.getElementById('biblioteca-perfil').innerHTML = top.map(function (j) {
      return '<a href="' + escapar(enlaceJuego(j)) + '" target="_blank" rel="noopener" title="Ver ' + escapar(j.nombre) + ' en Steam">' +
        '<span class="portada portada--enlace">' + imagenPortada(j) + '</span>' +
        '<span class="tarjeta__texto">' + (j.horas ? formatearNumero(j.horas) + ' h' : 'Sin estrenar') + '</span></a>';
    }).join('') || '<div class="vacio">Trayendo tu biblioteca de Steam…</div>';
    var dato = document.querySelector('#estadisticas-perfil a[href="biblioteca.html"] .dato__valor');
    if (dato) dato.textContent = lista.length;
  }
  if ((perfil.accounts || {}).Steam) {
    dibujarBiblioteca(bibliotecaSteam);
    actualizarBibliotecaSteam().then(dibujarBiblioteca).catch(function () {
      if (!bibliotecaSteam.length) document.getElementById('biblioteca').hidden = true;
    });
  }

  // Lista de deseos: quitar con deshacer
  var cajaDeseos = document.getElementById('deseos-perfil');
  function dibujarDeseos() {
    cajaDeseos.innerHTML = leerPerfil().wishlist.map(function (id) {
      var j = buscarPorId('juegos', id);
      if (!j) return '';
      return '<div class="tarjeta deseo"><span class="portada portada--sm"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span>' +
        '<a href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '"><b>' + escapar(j.nombreCorto) + '</b><br><span class="tarjeta__texto">' + escapar(j.plataformas.join(', ')) + '</span></a>' +
        '<button class="boton boton--fantasma boton--sm al-final" type="button" data-quitar="' + escapar(j.id) + '" aria-label="Quitar ' + escapar(j.nombreCorto) + ' de la lista">Quitar</button></div>';
    }).join('') || '<div class="vacio">Tu lista de deseos está vacía. Agrega juegos desde su página.</div>';
    aplicarColores(cajaDeseos);
  }
  dibujarDeseos();
  cajaDeseos.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-quitar]');
    if (!boton) return;
    var id = boton.dataset.quitar;
    var datos = leerPerfil();
    var posicion = datos.wishlist.indexOf(id);
    datos.wishlist.splice(posicion, 1);
    guardarMemoria('profile', datos);
    dibujarDeseos();
    mostrarAviso('Quitado de tu lista de deseos', { texto: 'Deshacer', alTocar: function () {
      var otra = leerPerfil();
      otra.wishlist.splice(posicion, 0, id);
      guardarMemoria('profile', otra);
      dibujarDeseos();
    } });
  });

  aplicarColores(document);
}

// 20. Editar perfil (pasos 2 y 3 al crear la cuenta)
var MAXIMO_FAVORITOS = 4;
var XP_POR_CUENTA = 100;
// Steam se vincula de verdad (api/steam); Xbox, simulado; PlayStation y Nintendo no tienen conexión pública (Después)
var PLATAFORMAS = [
  { nombre: 'Steam', nota: 'Se conecta con tu cuenta de Steam', vincula: true },
  { nombre: 'PlayStation', nota: 'No tiene conexión pública: registra tus juegos a mano', vincula: false },
  { nombre: 'Xbox', nota: 'Se conecta mediante OpenXBL (servicio de terceros)', vincula: true },
  { nombre: 'Nintendo', nota: 'No tiene conexión pública: registra tus juegos a mano', vincula: false }
];

function pantallaEditar() {
  if (!exigirSesion()) return;
  var sesion = obtenerSesion();
  var perfil = leerPerfil();
  perfil.accounts = perfil.accounts || {};
  var juegos = obtenerDatos('juegos');
  var bibliotecaSteam = perfil.accounts.Steam ? leerBibliotecaSteam() : [];
  var campoNombre = document.getElementById('nombre-visible');

  if (new URLSearchParams(location.search).get('nuevo')) document.getElementById('bienvenida').hidden = false;
  document.getElementById('avatar-editar').textContent = sesion.initials;
  campoNombre.value = sesion.name;
  document.getElementById('usuario-fijo').value = sesion.user;
  document.getElementById('sobre-mi').value = perfil.bio || '';
  document.getElementById('jugando-ahora').innerHTML = '<option value="">Nada por ahora</option>' + juegos.map(function (j) {
    return '<option value="' + escapar(j.id) + '"' + (perfil.playing === j.id ? ' selected' : '') + '>' + escapar(j.nombreCorto) + '</option>';
  }).join('');

  // Favoritos: máximo 4
  var cajaFavoritos = document.getElementById('favoritos-editar');
  var selector = document.getElementById('elegir-favorito');
  var botonAgregar = document.getElementById('agregar-favorito');
  function dibujarFavoritos() {
    var lleno = perfil.favorites.length >= MAXIMO_FAVORITOS;
    perfil.favorites = perfil.favorites.filter(function (id) { return buscarPorId('juegos', id); });
    lleno = perfil.favorites.length >= MAXIMO_FAVORITOS;
    cajaFavoritos.innerHTML = perfil.favorites.map(function (id) {
      var j = buscarPorId('juegos', id);
      return '<div class="portada"' + atributoColor(j.color) + '>' + imagenPortada(j) + '<b class="portada__titulo">' + escapar(j.nombreCorto) + '</b>' +
        '<button class="portada__accion" type="button" data-quitar-favorito="' + escapar(id) + '" aria-label="Quitar ' + escapar(j.nombreCorto) + ' de favoritos">' + ICONO_CERRAR + '</button></div>';
    }).join('') + new Array(MAXIMO_FAVORITOS - perfil.favorites.length + 1).join('<div class="vacio">Espacio libre</div>');
    document.getElementById('pista-favoritos').textContent = lleno
      ? 'Ya tienes 4 favoritos. Quita uno para elegir otro.'
      : 'Puedes elegir ' + (MAXIMO_FAVORITOS - perfil.favorites.length) + ' más (máximo 4).';
    botonAgregar.disabled = lleno;
    selector.disabled = lleno;
    function opciones(lista) {
      return lista.filter(function (j) { return perfil.favorites.indexOf(j.id) === -1; }).map(function (j) {
        return '<option value="' + escapar(j.id) + '">' + escapar(j.nombreCorto) + (j.steam && j.horas ? ' · ' + formatearNumero(j.horas) + ' h' : '') + '</option>';
      }).join('');
    }
    var porHoras = bibliotecaSteam.slice().sort(function (a, b) { return b.horas - a.horas; });
    selector.innerHTML = '<option value="">Elige un juego</option>' + (porHoras.length
      ? '<optgroup label="Tu biblioteca de Steam">' + opciones(porHoras) + '</optgroup><optgroup label="Catálogo de SaveSlot">' + opciones(juegos) + '</optgroup>'
      : opciones(juegos));
    aplicarColores(cajaFavoritos);
  }
  cajaFavoritos.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-quitar-favorito]');
    if (!boton) return;
    perfil.favorites = perfil.favorites.filter(function (x) { return x !== boton.dataset.quitarFavorito; });
    dibujarFavoritos();
    selector.focus();
  });
  botonAgregar.addEventListener('click', function () {
    if (!selector.value) { mostrarAviso('Elige un juego de la lista'); return; }
    if (perfil.favorites.length >= MAXIMO_FAVORITOS) return;
    perfil.favorites.push(selector.value);
    dibujarFavoritos();
  });
  dibujarFavoritos();
  // Trae la biblioteca de Steam al día para elegir favoritos de ahí
  if (perfil.accounts.Steam) {
    actualizarBibliotecaSteam().then(function (lista) {
      bibliotecaSteam = lista;
      dibujarFavoritos();
    }).catch(function () { /* sin sesión de Steam: solo el catálogo */ });
  }

  // Géneros favoritos
  var generos = [];
  juegos.forEach(function (j) { j.generos.forEach(function (g) { if (generos.indexOf(g) === -1) generos.push(g); }); });
  var cajaGeneros = document.getElementById('generos-editar');
  cajaGeneros.innerHTML = generos.sort().map(function (g) {
    return '<button class="chip" type="button" data-genero="' + escapar(g) + '" aria-pressed="' + (perfil.genres.indexOf(g) !== -1) + '">' + escapar(g) + '</button>';
  }).join('');
  cajaGeneros.addEventListener('click', function (e) {
    var chip = e.target.closest('[data-genero]');
    if (!chip) return;
    var g = chip.dataset.genero;
    perfil.genres = perfil.genres.indexOf(g) !== -1 ? perfil.genres.filter(function (x) { return x !== g; }) : perfil.genres.concat(g);
    chip.setAttribute('aria-pressed', String(perfil.genres.indexOf(g) !== -1));
  });

  // Cuentas vinculadas (simulado)
  var cajaCuentas = document.getElementById('cuentas-editar');
  function dibujarCuentas() {
    cajaCuentas.innerHTML = PLATAFORMAS.map(function (p) {
      var nombre = perfil.accounts[p.nombre];
      return '<div class="fila fila--comparacion"><span><b>' + p.nombre + '</b><br><span class="tarjeta__texto">' + p.nota + '</span></span>' +
        (nombre
          ? '<span class="estado estado--jugando al-final">Vinculada · ' + escapar(nombre) + '</span><button class="boton boton--secundario boton--sm" type="button" data-desvincular="' + p.nombre + '">Desvincular</button>'
          : (p.vincula
            ? '<button class="boton boton--sm al-final" type="button" data-vincular="' + p.nombre + '">Vincular</button>'
            : '<a class="boton boton--secundario boton--sm al-final" href="buscar-juegos.html" title="' + p.nombre + ' no ofrece conexión pública: registra tus juegos en el diario">Registrar a mano</a>')) +
      '</div>';
    }).join('');
  }
  cajaCuentas.addEventListener('click', function (e) {
    var vincular = e.target.closest('[data-vincular]');
    var desvincular = e.target.closest('[data-desvincular]');
    if (desvincular) {
      var plataforma = desvincular.dataset.desvincular;
      var anterior = perfil.accounts[plataforma];
      perfil.accounts[plataforma] = null;
      dibujarCuentas();
      mostrarAviso(plataforma + ' desvinculada. Guarda los cambios para confirmar.', { texto: 'Deshacer', alTocar: function () {
        perfil.accounts[plataforma] = anterior;
        dibujarCuentas();
      } });
    }
    if (vincular && vincular.dataset.vincular === 'Steam' && clienteSupabase) {
      // Steam es real: se va a Steam y vuelve aquí ya vinculada
      vincular.disabled = true;
      vincular.textContent = 'Conectando…';
      irASteam(location.href);
      return;
    }
    if (vincular) {
      vincular.disabled = true;
      vincular.textContent = 'Conectando…';
      setTimeout(function () {
        perfil.accounts[vincular.dataset.vincular] = sesion.user + '_' + vincular.dataset.vincular.toLowerCase();
        var conXp = sumarXp(XP_POR_CUENTA);
        perfil.xp = conXp.xp;
        perfil.level = conXp.level;
        dibujarCuentas();
        mostrarAviso(vincular.dataset.vincular + ' vinculada (demo) · +' + XP_POR_CUENTA + ' XP');
      }, 600);
    }
  });
  dibujarCuentas();

  // Guardar: se ve en el Perfil
  document.getElementById('formulario-perfil').addEventListener('submit', function (e) {
    e.preventDefault();
    if (!marcarError(campoNombre, document.getElementById('error-nombre'), campoNombre.value.trim().length >= 2 ? '' : 'Escribe tu nombre visible.')) {
      campoNombre.focus();
      return;
    }
    perfil.bio = document.getElementById('sobre-mi').value.trim().slice(0, 190);
    perfil.playing = document.getElementById('jugando-ahora').value || null;
    guardarMemoria('profile', perfil);
    if (!perfil.accounts.Steam && clienteSupabase) clienteSupabase.auth.signOut();
    guardarMemoria('session', Object.assign({}, sesion, { name: campoNombre.value.trim(), initials: inicialesDe(campoNombre.value) }));
    mostrarAviso('Cambios guardados');
    setTimeout(function () { location.href = 'perfil.html'; }, 600);
  });
}

// Etiqueta de color para el estado de un juego en el diario
var ETIQUETA_ESTADO = { Terminado: 'etiqueta--exito', Rejugado: 'etiqueta--primario', Abandonado: 'etiqueta--error', 'En progreso': 'etiqueta--contorno' };

// 21. Diario
function pantallaDiario() {
  if (!exigirSesion()) return;
  var diario = leerDiario();
  var estado = 'Todos';
  var selectorAnio = document.getElementById('anio-diario');
  var filas = document.getElementById('filas-diario');
  var anios = [];
  diario.forEach(function (d) { var a = String(d.fecha).slice(0, 4); if (anios.indexOf(a) === -1) anios.push(a); });
  anios.sort().reverse();
  if (!anios.length) anios.push(String(new Date().getFullYear()));
  selectorAnio.innerHTML = anios.map(function (a) { return '<option>' + a + '</option>'; }).join('');

  function mostrar() {
    var anio = selectorAnio.value;
    var delAnio = diario.filter(function (d) { return String(d.fecha).slice(0, 4) === anio; });
    var lista = delAnio.filter(function (d) { return estado === 'Todos' || (estado === 'Con reseña' ? d.tieneResena : d.estado === estado); });
    var calificados = delAnio.filter(function (d) { return d.calificacion; });

    document.getElementById('resumen-diario').innerHTML = [
      [delAnio.length, 'Juegos registrados en ' + anio],
      [formatearNumero(delAnio.reduce(function (s, d) { return s + (d.horas || 0); }, 0)) + ' h', 'Horas jugadas'],
      [delAnio.filter(function (d) { return d.estado === 'Terminado'; }).length, 'Terminados'],
      [calificados.length ? formatearPromedio(calificados.reduce(function (s, d) { return s + d.calificacion; }, 0) / calificados.length) : '—', 'Calificación promedio']
    ].map(function (d) { return '<div class="dato"><span class="dato__valor">' + d[0] + '</span><span class="dato__etiqueta">' + d[1] + '</span></div>'; }).join('');

    var mesAnterior = '';
    filas.innerHTML = lista.map(function (d) {
      var j = buscarPorId('juegos', d.juego);
      if (!j) return '';
      var mes = MESES[Number(String(d.fecha).slice(5, 7)) - 1];
      var mostrarMes = mes !== mesAnterior;
      mesAnterior = mes;
      return '<tr>' +
        '<td class="tabla__solo-escritorio">' + (mostrarMes ? '<span class="tabla__mes"><b>' + mes + '</b><span>' + anio + '</span></span>' : '') + '</td>' +
        '<td class="tabla__dia">' + String(d.fecha).slice(8, 10) + '</td>' +
        '<td class="tabla__ancha"><a class="juego-en-fila" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '"><span class="portada portada--sm"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span>' +
          '<span><b>' + escapar(j.nombreCorto) + '</b><br><span class="tarjeta__texto">' + escapar(j.plataformas[0]) + '</span></span></a></td>' +
        '<td><span class="etiqueta ' + (ETIQUETA_ESTADO[d.estado] || 'etiqueta--contorno') + '">' + escapar(d.estado) + '</span></td>' +
        '<td class="tabla__solo-escritorio tarjeta__texto">' + (d.horas || 0) + ' h</td>' +
        '<td><span class="nota nota--texto">' + (d.calificacion ? d.calificacion + '/10' : '—') + '</span></td>' +
        '<td class="tabla__centro tabla__solo-escritorio"><span class="tabla__me-gusta' + (d.meGusta ? ' tabla__me-gusta--activo' : '') + '" role="img" aria-label="' + (d.meGusta ? 'Te gustó' : 'Sin me gusta') + '">♥</span></td>' +
        '<td class="tabla__centro tabla__solo-escritorio">' + (d.tieneResena ? '<a class="boton boton--secundario boton--sm" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '" aria-label="Leer tu reseña de ' + escapar(j.nombreCorto) + '">Leer</a>' : '') + '</td>' +
      '</tr>';
    }).join('') || '<tr><td colspan="8"><div class="vacio">No hay registros con este filtro.</div></td></tr>';
    aplicarColores(filas);
  }

  document.getElementById('filtro-diario').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-estado]');
    if (!chip) return;
    estado = chip.dataset.estado;
    document.querySelectorAll('[data-estado]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
    mostrar();
  });
  selectorAnio.addEventListener('change', mostrar);
  mostrar();
}

// 22. Historial de reseñas
function pantallaHistorial() {
  if (!exigirSesion()) return;
  var texto = '';
  var banda = 'todas';
  var orden = 'recientes';
  var campo = document.getElementById('buscar-historial');
  var lista = document.getElementById('lista-historial');

  function mias() {
    return leerResenasPropias().filter(function (r) { return r.tipo === 'resena'; });
  }

  function htmlFila(r) {
    var j = buscarPorId('juegos', r.juego);
    if (!j) return '';
    var comentarios = leerComentarios(r.id).length;
    return '<article class="tarjeta tarjeta--resena fila-historial"' + atributoColor(j.color) + '>' +
      '<a class="portada portada--enlace" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '" tabindex="-1" aria-hidden="true"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</a>' +
      '<div class="fila-historial__cuerpo">' +
        '<div class="en-fila en-fila--entre"><div><a href="detalle-resena.html?id=' + encodeURIComponent(r.id) + '"><b class="tarjeta__titulo">' + escapar(j.nombreCorto) + '</b></a><br>' +
          '<span class="tarjeta__texto">' + formatearFecha(r.fecha) + ' · ' + escapar(r.estadoPartida || 'Terminado') + ' · ' + (r.horas || 0) + ' h' + (r.editada ? ' · Editada' : '') + '</span></div>' +
          '<span class="nota">' + escapar(r.calificacion) + '<small>/10</small></span></div>' +
        '<p class="tarjeta__texto texto-corto">' + (r.spoiler ? '<span class="etiqueta etiqueta--contorno">SPOILER</span> ' : '') + escapar(r.texto) + '</p>' +
        '<div class="en-fila en-fila--entre"><span class="tarjeta__texto">♥ ' + formatearNumero(r.meGusta) + ' · Útil ' + formatearNumero(r.votosUtil) + ' · ' + comentarios + (comentarios === 1 ? ' comentario' : ' comentarios') + '</span>' +
          '<span class="en-fila"><a class="boton boton--secundario boton--sm" href="detalle-resena.html?id=' + encodeURIComponent(r.id) + '">Ver</a>' +
          '<a class="boton boton--secundario boton--sm" href="escribir-resena.html?id=' + encodeURIComponent(j.id) + '&amp;editar=' + encodeURIComponent(r.id) + '">Editar</a>' +
          '<button class="boton boton--fantasma boton--sm" type="button" data-eliminar="' + escapar(r.id) + '" aria-label="Eliminar reseña de ' + escapar(j.nombreCorto) + '">Eliminar</button></span></div>' +
      '</div></article>';
  }

  function mostrar() {
    var todas = mias();
    var promedio = todas.length ? todas.reduce(function (s, r) { return s + r.calificacion; }, 0) / todas.length : 0;
    document.getElementById('resumen-historial').innerHTML = [
      [todas.length, 'Reseñas'],
      [formatearNumero(todas.reduce(function (s, r) { return s + (r.meGusta || 0); }, 0)), 'Me gusta recibidos'],
      [formatearNumero(todas.reduce(function (s, r) { return s + (r.votosUtil || 0); }, 0)), 'Votos de “útil”'],
      [formatearPromedio(promedio), 'Nota promedio']
    ].map(function (d) { return '<div class="dato"><span class="dato__valor">' + d[0] + '</span><span class="dato__etiqueta">' + d[1] + '</span></div>'; }).join('');

    var elegidas = todas.filter(function (r) {
      var j = buscarPorId('juegos', r.juego) || { nombre: '' };
      var porTexto = !texto || (j.nombre + ' ' + j.nombreCorto + ' ' + r.texto).toLowerCase().indexOf(texto) !== -1;
      var porNota = banda === 'todas' || (banda === '9' ? r.calificacion >= 9 : banda === '7' ? r.calificacion >= 7 && r.calificacion <= 8 : r.calificacion <= 6);
      return porTexto && porNota;
    });
    var comparar = {
      recientes: function (a, b) { return String(b.fecha).localeCompare(String(a.fecha)); },
      antiguas: function (a, b) { return String(a.fecha).localeCompare(String(b.fecha)); },
      nota: function (a, b) { return b.calificacion - a.calificacion; },
      utiles: function (a, b) { return (b.votosUtil || 0) - (a.votosUtil || 0); }
    }[orden];
    elegidas.sort(comparar);
    document.getElementById('cantidad-historial').textContent = 'Mostrando ' + elegidas.length + ' de ' + todas.length + ' reseñas';
    lista.innerHTML = elegidas.map(htmlFila).join('') || (todas.length
      ? '<div class="vacio"><b>Ninguna reseña coincide con los filtros.</b><button class="boton boton--secundario boton--sm" type="button" id="limpiar-historial">Limpiar filtros</button></div>'
      : '<div class="vacio"><b>Aún no escribes reseñas.</b><span>Cuenta qué te pareció el último juego que terminaste.</span><a class="boton boton--sm" href="buscar-juegos.html">Escribir mi primera reseña</a></div>');
    aplicarColores(lista);
  }

  campo.addEventListener('input', function () { texto = campo.value.trim().toLowerCase(); mostrar(); });
  document.getElementById('filtro-nota').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-nota]');
    if (!chip) return;
    banda = chip.dataset.nota;
    document.querySelectorAll('[data-nota]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
    mostrar();
  });
  document.getElementById('orden-historial').addEventListener('change', function (e) { orden = e.target.value; mostrar(); });
  lista.addEventListener('click', function (e) {
    if (e.target.closest('#limpiar-historial')) {
      texto = '';
      banda = 'todas';
      campo.value = '';
      document.querySelectorAll('[data-nota]').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.nota === 'todas')); });
      mostrar();
      return;
    }
    var boton = e.target.closest('[data-eliminar]');
    if (!boton) return;
    var propias = leerResenasPropias();
    var posicion = propias.findIndex(function (r) { return r.id === boton.dataset.eliminar; });
    var borrada = propias.splice(posicion, 1)[0];
    guardarResenasPropias(propias);
    mostrar();
    mostrarAviso('Reseña eliminada', { texto: 'Deshacer', alTocar: function () {
      var otra = leerResenasPropias();
      otra.splice(posicion, 0, borrada);
      guardarResenasPropias(otra);
      mostrar();
    } });
  });
  mostrar();
  aplicarColores(document);
}

// 23. Logros (Steam real; las demás plataformas, datos de ejemplo)
function pantallaLogros() {
  if (!exigirSesion()) return;
  var usuario = obtenerSesion().user;
  var plataforma = 'Todas';
  var progreso = obtenerDatos('progresoLogros').filter(function (p) { return p.usuario === usuario; });
  var resumen = obtenerDatos('resumenLogros').find(function (r) { return r.usuario === usuario; }) || { desbloqueados: 0, promedio: 0, juegosCompletos: 0, raros: 0 };
  var raros = obtenerDatos('logros').map(function (l) {
    var j = buscarPorId('juegos', l.juego);
    return { nombre: l.nombre, juego: j ? j.nombreCorto : '', porcentaje: l.porcentaje, obtenido: l.obtenido };
  });
  var caja = document.getElementById('logros-por-juego');

  function mostrarResumen() {
    document.getElementById('resumen-logros').innerHTML = [
      [formatearNumero(resumen.desbloqueados), 'Logros desbloqueados'], [resumen.promedio + '%', 'Completado en promedio'],
      [resumen.juegosCompletos, 'Juegos al 100%'], [resumen.raros, 'Logros raros (menos del 10%)']
    ].map(function (d) { return '<div class="dato"><span class="dato__valor">' + d[0] + '</span><span class="dato__etiqueta">' + d[1] + '</span></div>'; }).join('');
  }

  function mostrar() {
    var lista = progreso.filter(function (p) { return plataforma === 'Todas' || p.plataforma === plataforma; });
    caja.innerHTML = lista.map(function (p) {
      var j = p.juegoSteam || buscarPorId('juegos', p.juego);
      if (!j) return '';
      var porcentaje = Math.round(p.obtenidos / p.totales * 100);
      return '<a class="tarjeta tarjeta--enlace progreso-juego" href="' + escapar(enlaceJuego(j)) + '">' +
        '<span class="portada portada--sm"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span>' +
        '<span class="progreso-juego__nombre"><b class="tarjeta__titulo">' + escapar(j.nombreCorto) + '</b>' +
          '<span class="medidor' + (porcentaje === 100 ? ' medidor--exito' : '') + '" role="img" aria-label="' + porcentaje + '% de los logros"><span class="medidor__barra" data-ancho="' + porcentaje + '"></span></span></span>' +
        '<span>' + (porcentaje === 100 ? '<b class="nota nota--texto">100%</b> · ' : '') + '<b>' + p.obtenidos + '</b> <span class="tarjeta__texto">/ ' + p.totales + '</span></span>' +
        '<span class="etiqueta etiqueta--contorno">' + escapar(p.plataforma.toUpperCase()) + '</span></a>';
    }).join('') || '<div class="vacio"><b>No tienes logros sincronizados de ' + escapar(plataforma) + '.</b><a href="editar-perfil.html#cuentas">Vincular cuenta</a></div>';
    aplicarColores(caja);
  }

  // Logros más raros: de menos a más común
  function mostrarRaros() {
    document.getElementById('logros-raros').innerHTML = raros.slice().sort(function (a, b) { return a.porcentaje - b.porcentaje; }).map(function (l) {
      return '<div class="tarjeta logro-raro">' +
        (l.obtenido ? '<span class="nota" aria-label="Obtenido">★</span>' : '<span class="etiqueta etiqueta--contorno" aria-label="Te falta">?</span>') +
        '<span><b>' + escapar(l.nombre) + '</b><br><span class="tarjeta__texto">' + escapar(l.juego) + ' · ' + String(l.porcentaje).replace('.', ',') + '% lo tiene' + (l.obtenido ? '' : ' · te falta') + '</span></span></div>';
    }).join('') || '<p class="tarjeta__texto">Aún no hay logros raros para mostrar.</p>';
  }

  // Logros reales de Steam: reemplazan los de ejemplo de Steam
  function usarSteam(datos) {
    progreso = progreso.filter(function (p) { return p.plataforma !== 'Steam'; }).concat(datos.games.map(function (g) {
      return { juego: 'steam-' + g.appid, juegoSteam: juegoDeSteam(g), obtenidos: g.unlocked, totales: g.total, plataforma: 'Steam' };
    }));
    progreso.sort(function (a, b) { return b.obtenidos / b.totales - a.obtenidos / a.totales; });
    resumen = { desbloqueados: datos.summary.unlocked, promedio: datos.summary.average, juegosCompletos: datos.summary.complete, raros: datos.summary.rare };
    raros = datos.rarest.map(function (l) { return { nombre: l.name, juego: l.game, porcentaje: l.percent, obtenido: l.achieved }; });
    var nota = document.getElementById('nota-logros');
    if (nota) nota.textContent = 'Logros de Steam de tus 30 juegos más jugados (Steam Web API). Xbox llegará con OpenXBL.';
    mostrarResumen();
    mostrar();
    mostrarRaros();
  }

  document.getElementById('filtro-plataforma').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-plataforma]');
    if (!chip) return;
    plataforma = chip.dataset.plataforma;
    document.querySelectorAll('[data-plataforma]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
    mostrar();
  });

  var guardados = tieneSteam() ? leerMemoria('steamLogros', null) : null;
  if (guardados) usarSteam(guardados);
  else { mostrarResumen(); mostrar(); mostrarRaros(); }

  if (tieneSteam()) {
    if (!guardados) caja.insertAdjacentHTML('afterbegin', '<p class="tarjeta__texto" id="cargando-steam">Trayendo tus logros de Steam…</p>');
    pedirSteam('achievements_summary').then(function (datos) {
      guardarMemoria('steamLogros', datos);
      usarSteam(datos);
    }).catch(function (error) {
      if (error.privado) guardarMemoria('steamLogros', null);
      if (!document.getElementById('cargando-steam')) caja.insertAdjacentHTML('afterbegin', '<p class="tarjeta__texto" id="cargando-steam"></p>');
      document.getElementById('cargando-steam').innerHTML = error.privado
        ? '<b>Tus logros de Steam están ocultos.</b> En Steam ve a tu perfil → Editar perfil → Configuración de privacidad y pon «Detalles de juego» en <b>Público</b>. Luego vuelve a abrir esta página.'
        : 'No pudimos traer tus logros de Steam. Inténtalo de nuevo en un momento.';
    });
  }
}

// Biblioteca de Steam (pantalla nueva: pages/biblioteca.html)
function pantallaBiblioteca() {
  if (!exigirSesion()) return;
  var caja = document.getElementById('biblioteca-juegos');
  var buscador = document.getElementById('buscar-biblioteca');
  var orden = 'horas';
  var juegos = leerBibliotecaSteam();
  var ORDENES = {
    horas: function (a, b) { return b.horas - a.horas; },
    recientes: function (a, b) { return b.ultimaVez - a.ultimaVez; },
    nombre: function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); }
  };

  function dibujar() {
    var total = juegos.reduce(function (s, j) { return s + j.horas; }, 0);
    var jugados = juegos.filter(function (j) { return j.horas > 0; }).length;
    document.getElementById('resumen-biblioteca').innerHTML = [
      [formatearNumero(juegos.length), 'Juegos'], [formatearNumero(Math.round(total)), 'Horas jugadas'],
      [formatearNumero(jugados), 'Jugados'], [formatearNumero(juegos.length - jugados), 'Sin estrenar']
    ].map(function (d) { return '<div class="dato"><span class="dato__valor">' + d[0] + '</span><span class="dato__etiqueta">' + d[1] + '</span></div>'; }).join('');

    var texto = buscador.value.trim().toLowerCase();
    var lista = juegos.filter(function (j) { return !texto || j.nombre.toLowerCase().indexOf(texto) !== -1; }).sort(ORDENES[orden]);
    caja.innerHTML = lista.map(function (j) {
      return '<a href="' + escapar(enlaceJuego(j)) + '" target="_blank" rel="noopener" title="Ver ' + escapar(j.nombre) + ' en Steam">' +
        '<span class="portada portada--enlace">' + imagenPortada(j) + '</span>' +
        '<b>' + escapar(j.nombreCorto) + '</b>' +
        '<span class="tarjeta__texto">' + (j.horas ? formatearNumero(j.horas) + ' h' : 'Sin estrenar') + '</span></a>';
    }).join('') || (juegos.length
      ? '<div class="vacio">Ningún juego de tu biblioteca coincide con «' + escapar(buscador.value.trim()) + '».</div>'
      : '');
  }

  if (!tieneSteam()) {
    document.getElementById('resumen-biblioteca').hidden = true;
    caja.outerHTML = '<div class="vacio"><b>Vincula tu cuenta de Steam para ver tu biblioteca.</b><a href="editar-perfil.html#cuentas">Vincular Steam</a></div>';
    return;
  }

  document.getElementById('orden-biblioteca').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-orden]');
    if (!chip) return;
    orden = chip.dataset.orden;
    document.querySelectorAll('[data-orden]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
    dibujar();
  });
  buscador.addEventListener('input', dibujar);

  dibujar();
  var estado = document.getElementById('estado-biblioteca');
  estado.textContent = juegos.length ? 'Actualizando con Steam…' : 'Trayendo tu biblioteca de Steam…';
  actualizarBibliotecaSteam().then(function (lista) {
    juegos = lista;
    estado.textContent = '';
    dibujar();
  }).catch(function () {
    estado.textContent = 'No pudimos traer tu biblioteca. Revisa que tu perfil y tus detalles de juego sean públicos en Steam.';
  });
}

// Texto del estado de una persona: "Jugando Hades", "En línea" o "Desconectado · hace 5 h"
function htmlEstado(persona) {
  if (persona.estado === 'jugando') {
    var juego = buscarPorId('juegos', persona.jugandoAhora);
    return '<span class="estado estado--jugando">Jugando' + (juego ? ' ' + escapar(juego.nombreCorto) : '') + '</span>';
  }
  if (persona.estado === 'en-linea') return '<span class="estado estado--en-linea">En línea</span>';
  return '<span class="estado estado--desconectado">Desconectado' + (persona.ultimaConexion ? ' · ' + escapar(persona.ultimaConexion) : '') + '</span>';
}

// Juegos que la otra persona calificó y que también están en mi diario
function juegosEnComun(persona) {
  var mios = leerDiario().map(function (d) { return d.juego; });
  return Object.keys(persona.notas || {}).filter(function (id) { return mios.indexOf(id) !== -1; });
}

// 24. Amigos
function pantallaAmigos() {
  if (!exigirSesion()) return;
  var sesion = obtenerSesion();
  var pestana = ({ '#solicitudes': 'recibidas', '#sugerencias': 'sugerencias', '#en-linea': 'en-linea' })[location.hash] || 'todos';
  var texto = '';
  var personas = obtenerDatos('usuarios').filter(function (u) { return u.usuario !== sesion.user && u.nivel; });
  var lista = document.getElementById('lista-amigos');
  var campoBuscar = document.getElementById('buscar-amigos');

  function grupo(relacion) { return personas.filter(function (p) { return relacionCon(p.usuario) === relacion; }); }

  function htmlTarjeta(p) {
    var relacion = relacionCon(p.usuario);
    var juego = p.estado === 'jugando' ? buscarPorId('juegos', p.jugandoAhora) : null;
    var comunes = juegosEnComun(p);
    var perfil = 'perfil-usuario.html?u=' + encodeURIComponent(p.usuario);
    var acciones = {
      amigos: '<a class="boton boton--secundario boton--sm" href="' + perfil + '">Ver perfil</a>' +
        '<button class="boton boton--secundario boton--sm" type="button" data-mensaje="' + escapar(p.usuario) + '" aria-disabled="true">Mensaje <span class="etiqueta etiqueta--contorno">Pronto</span></button>' +
        '<button class="boton boton--fantasma boton--sm" type="button" data-eliminar-amigo="' + escapar(p.usuario) + '" aria-label="Eliminar a ' + escapar(p.nombre) + ' de tus amigos">Eliminar</button>',
      'solicitud recibida': '<button class="boton boton--sm" type="button" data-aceptar="' + escapar(p.usuario) + '">Aceptar</button>' +
        '<button class="boton boton--secundario boton--sm" type="button" data-rechazar="' + escapar(p.usuario) + '">Rechazar</button>' +
        '<a class="boton boton--fantasma boton--sm" href="' + perfil + '">Ver perfil</a>',
      'solicitud enviada': '<span class="etiqueta etiqueta--contorno">SOLICITUD ENVIADA</span>' +
        '<button class="boton boton--fantasma boton--sm" type="button" data-cancelar-solicitud="' + escapar(p.usuario) + '">Cancelar</button>',
      ninguna: '<button class="boton boton--sm" type="button" data-agregar="' + escapar(p.usuario) + '">+ Agregar</button>' +
        '<a class="boton boton--fantasma boton--sm" href="' + perfil + '">Ver perfil</a>'
    }[relacion];
    var lineaComun = relacion === 'ninguna' || relacion === 'solicitud recibida'
      ? '<span class="tarjeta__texto">' + (p.amigosEnComun || 0) + ' amigos en común · ' + comunes.length + ' juegos en común</span>'
      : (comunes.length
        ? '<div class="en-fila"><span class="juegos-en-comun">' + comunes.slice(0, 4).map(function (id) {
            var j = buscarPorId('juegos', id);
            return '<span class="portada portada--sm"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span>';
          }).join('') + '</span><span class="tarjeta__texto">' + comunes.length + ' juegos en común</span></div>'
        : '<span class="tarjeta__texto">Sin juegos en común todavía</span>');
    return '<article class="tarjeta-amigo' + (juego ? ' tarjeta-amigo--jugando' : '') + '"' + (juego ? atributoColor(juego.color) : '') + '>' +
      '<div class="tarjeta-amigo__cabeza">' + htmlAvatar(p, 'md') +
        '<div><a href="' + perfil + '"><h3 class="tarjeta-amigo__nombre">' + escapar(p.nombre) + '</h3></a>' +
        '<span class="tarjeta__texto">@' + escapar(p.usuario) + ' · Nivel ' + escapar(p.nivel) + '</span><br>' + htmlEstado(p) + '</div></div>' +
      (juego ? '<a class="fila fila--jugando" href="detalle-juego.html?id=' + encodeURIComponent(juego.id) + '"><span class="portada portada--sm"' + atributoColor(juego.color) + '>' + imagenPortada(juego) + '</span>' +
        '<span><span class="estado estado--jugando">EN JUEGO</span><br><b>' + escapar(juego.nombreCorto) + '</b></span></a>' : '') +
      lineaComun +
      '<div class="tarjeta-amigo__acciones">' + acciones + '</div></article>';
  }

  function mostrar() {
    var amigos = grupo('amigos');
    var enLinea = amigos.filter(function (p) { return p.estado !== 'desconectado'; });
    var recibidas = grupo('solicitud recibida');
    var sugerencias = grupo('ninguna').concat(grupo('solicitud enviada'));
    document.getElementById('resumen-amigos').innerHTML = [[amigos.length, 'Amigos'], [enLinea.length, 'En línea'], [amigos.filter(function (p) { return p.estado === 'jugando'; }).length, 'Jugando ahora']]
      .map(function (d) { return '<div class="dato"><span class="dato__valor">' + d[0] + '</span><span class="dato__etiqueta">' + d[1] + '</span></div>'; }).join('');

    var pestanas = [['todos', 'Todos', amigos], ['en-linea', 'En línea', enLinea], ['recibidas', 'Solicitudes', recibidas], ['sugerencias', 'Sugerencias', sugerencias]];
    document.getElementById('pestanas-amigos').innerHTML = pestanas.map(function (p) {
      return '<button class="pestanas__boton" type="button" role="tab" id="pestana-' + p[0] + '" aria-controls="lista-amigos" aria-selected="' + (p[0] === pestana) + '" data-pestana="' + p[0] + '">' + p[1] +
        ' <span class="contador' + (p[0] === 'recibidas' && p[2].length ? ' contador--destacado' : '') + '">' + p[2].length + '</span></button>';
    }).join('');
    lista.setAttribute('aria-labelledby', 'pestana-' + pestana);

    var elegidos = ordenarPorEstado(pestanas.find(function (p) { return p[0] === pestana; })[2].slice());
    if (texto) elegidos = elegidos.filter(function (p) { return (p.nombre + ' ' + p.usuario).toLowerCase().indexOf(texto) !== -1; });
    var vacio = { todos: 'Aún no tienes amigos. Revisa las sugerencias.', 'en-linea': 'Ninguno de tus amigos está en línea ahora.', recibidas: 'No tienes solicitudes pendientes.', sugerencias: 'No hay más sugerencias por ahora.' }[pestana];
    lista.innerHTML = elegidos.map(htmlTarjeta).join('') || (texto
      ? '<div class="vacio"><b>Nadie coincide con “' + escapar(texto) + '”.</b><button class="boton boton--secundario boton--sm" type="button" id="limpiar-amigos">Limpiar búsqueda</button></div>'
      : '<div class="vacio">' + vacio + '</div>');
    aplicarColores(lista);
  }

  document.getElementById('pestanas-amigos').addEventListener('click', function (e) {
    var boton = e.target.closest('[data-pestana]');
    if (!boton) return;
    pestana = boton.dataset.pestana;
    mostrar();
  });
  campoBuscar.addEventListener('input', function () { texto = campoBuscar.value.trim().toLowerCase().replace(/^@/, ''); mostrar(); });

  // Acciones de las tarjetas (con deshacer cuando se pierde algo)
  lista.addEventListener('click', function (e) {
    if (e.target.closest('#limpiar-amigos')) { texto = ''; campoBuscar.value = ''; mostrar(); return; }
    var boton = e.target.closest('button');
    if (!boton) return;
    var usuario = boton.dataset.eliminarAmigo || boton.dataset.aceptar || boton.dataset.rechazar || boton.dataset.agregar || boton.dataset.cancelarSolicitud || boton.dataset.mensaje;
    if (!usuario) return;
    var persona = buscarPorId('usuarios', usuario);
    var antes = ({ amigos: 'friend', 'solicitud recibida': 'in', 'solicitud enviada': 'out', ninguna: 'none' })[relacionCon(usuario)];
    var deshacer = { texto: 'Deshacer', alTocar: function () { cambiarRelacion(usuario, antes); mostrar(); } };
    if (boton.dataset.mensaje) { mostrarAviso('Los mensajes directos llegarán en una próxima versión'); return; }
    if (boton.dataset.eliminarAmigo) { cambiarRelacion(usuario, 'none'); mostrarAviso(persona.nombre + ' ya no está en tus amigos', deshacer); }
    if (boton.dataset.aceptar) { cambiarRelacion(usuario, 'friend'); sumarXp(10); mostrarAviso('Ahora eres amigo de ' + persona.nombre + ' · +10 XP'); }
    if (boton.dataset.rechazar) { cambiarRelacion(usuario, 'none'); mostrarAviso('Solicitud rechazada', deshacer); }
    if (boton.dataset.agregar) { cambiarRelacion(usuario, 'out'); mostrarAviso('Solicitud enviada a ' + persona.nombre, deshacer); }
    if (boton.dataset.cancelarSolicitud) { cambiarRelacion(usuario, 'none'); mostrarAviso('Solicitud cancelada'); }
    mostrar();
  });

  // Agregar amigo por @usuario
  var campoUsuario = document.getElementById('usuario-amigo');
  var error = document.getElementById('error-agregar');
  document.getElementById('formulario-agregar').addEventListener('submit', function (e) {
    e.preventDefault();
    var valor = campoUsuario.value.trim().replace(/^@/, '').toLowerCase();
    var persona = personas.find(function (p) { return p.usuario.toLowerCase() === valor; });
    var mensaje = !valor ? 'Escribe el usuario de tu amigo, por ejemplo @feli_fps.'
      : (valor === sesion.user.toLowerCase() ? 'Ese es tu propio usuario.'
        : (!persona ? 'No encontramos a @' + valor + '. Revisa que esté bien escrito; también puedes ver la pestaña Sugerencias.'
          : (relacionCon(persona.usuario) === 'amigos' ? '@' + persona.usuario + ' ya está en tus amigos.' : '')));
    if (!marcarError(campoUsuario, error, mensaje)) { campoUsuario.focus(); return; }
    if (relacionCon(persona.usuario) === 'solicitud recibida') {
      cambiarRelacion(persona.usuario, 'friend');
      mostrarAviso('Tenía una solicitud tuya pendiente: ahora son amigos');
      pestana = 'todos';
    } else {
      cambiarRelacion(persona.usuario, 'out');
      mostrarAviso('Solicitud enviada a ' + persona.nombre);
      pestana = 'sugerencias';
    }
    campoUsuario.value = '';
    mostrar();
  });
  document.getElementById('mi-usuario').textContent = '@' + sesion.user;
  document.getElementById('copiar-usuario').addEventListener('click', function () { copiarEnlace('@' + sesion.user, 'Usuario copiado'); });

  // Actividad de amigos: quién juega ahora y sus últimas reseñas
  var amigosAhora = grupo('amigos');
  var jugandoAhora = amigosAhora.filter(function (p) { return p.estado === 'jugando'; }).map(function (p) {
    var j = buscarPorId('juegos', p.jugandoAhora);
    return '<a class="fila fila--actividad" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '">' + htmlAvatar(p, 'sm') +
      '<span><b>' + escapar(p.nombre.split(' ')[0]) + '</b> está jugando <b>' + escapar(j.nombreCorto) + '</b><br><span class="estado estado--jugando">Ahora</span></span></a>';
  });
  var resenasAmigos = obtenerResenas().filter(function (r) { return r.tipo === 'resena' && sonAmigos(r.autor); }).slice(0, 5).map(function (r) {
    var p = buscarPorId('usuarios', r.autor);
    var j = buscarPorId('juegos', r.juego);
    return '<a class="fila fila--actividad" href="detalle-resena.html?id=' + encodeURIComponent(r.id) + '">' + htmlAvatar(p, 'sm') +
      '<span><b>' + escapar(p.nombre.split(' ')[0]) + '</b> reseñó <b>' + escapar(j.nombreCorto) + '</b> <span class="nota nota--texto">' + r.calificacion + '/10</span><br><span class="tarjeta__texto">' + formatearFecha(r.fecha) + '</span></span></a>';
  });
  document.getElementById('actividad-amigos').innerHTML = jugandoAhora.concat(resenasAmigos).join('') || '<p class="tarjeta__texto">Sin actividad reciente.</p>';

  mostrar();
  aplicarColores(document);
}

// 25. Perfil de otro usuario (?u=usuario)
function pantallaUsuario() {
  var usuario = new URLSearchParams(location.search).get('u');
  var persona = buscarPorId('usuarios', usuario);
  if (!persona || !persona.nivel) { location.replace(rutaPagina('404.html') + '?tipo=usuario'); return; }
  var sesion = obtenerSesion();
  if (sesion && sesion.user === persona.usuario) { location.replace('perfil.html'); return; }
  document.title = persona.nombre + ' · SaveSlot';

  // Cabecera
  colorearBanda(document.getElementById('banda-usuario'), persona.favoritos);
  var avatar = document.getElementById('avatar-usuario');
  avatar.textContent = persona.iniciales;
  if (persona.estado) {
    avatar.classList.add('avatar--' + persona.estado);
    avatar.insertAdjacentHTML('beforeend', '<span class="avatar__punto"></span>');
  }
  document.getElementById('nombre-usuario').textContent = persona.nombre;
  document.getElementById('arroba-usuario').textContent = '@' + persona.usuario;
  document.getElementById('insignias-usuario').innerHTML = '<span class="etiqueta etiqueta--primario">NIVEL ' + escapar(persona.nivel) + '</span>' + htmlEstado(persona);

  // Botón de amistad: cambia de estado al tocarlo
  var acciones = document.getElementById('acciones-usuario');
  function dibujarAcciones() {
    var compartir = '<button class="boton boton--secundario" type="button" data-accion="compartir">Compartir</button>';
    acciones.innerHTML = ({
      amigos: '<span class="etiqueta etiqueta--amigo">✓ AMIGOS</span><button class="boton boton--secundario" type="button" data-accion="mensaje" aria-disabled="true">Mensaje <span class="etiqueta etiqueta--contorno">Pronto</span></button><button class="boton boton--fantasma" type="button" data-accion="eliminar">Eliminar amigo</button>',
      'solicitud recibida': '<button class="boton" type="button" data-accion="aceptar">Aceptar solicitud</button><button class="boton boton--secundario" type="button" data-accion="rechazar">Rechazar</button>',
      'solicitud enviada': '<span class="etiqueta etiqueta--contorno">SOLICITUD ENVIADA</span><button class="boton boton--fantasma" type="button" data-accion="cancelar">Cancelar</button>',
      ninguna: '<button class="boton" type="button" data-accion="agregar">+ Agregar amigo</button>'
    })[relacionCon(persona.usuario)] + compartir;
  }
  dibujarAcciones();
  acciones.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-accion]');
    if (!boton) return;
    var accion = boton.dataset.accion;
    if (accion === 'compartir') { copiarEnlace(location.href, 'Enlace del perfil copiado'); return; }
    if (!obtenerSesion()) { pedirCuenta('agregar amigos'); return; }
    if (accion === 'mensaje') { mostrarAviso('Los mensajes directos llegarán en una próxima versión'); return; }
    var antes = ({ amigos: 'friend', 'solicitud recibida': 'in', 'solicitud enviada': 'out', ninguna: 'none' })[relacionCon(persona.usuario)];
    cambiarRelacion(persona.usuario, { eliminar: 'none', aceptar: 'friend', rechazar: 'none', cancelar: 'none', agregar: 'out' }[accion]);
    dibujarAcciones();
    var mensajes = { eliminar: 'Eliminado de tus amigos', aceptar: 'Ahora son amigos', rechazar: 'Solicitud rechazada', cancelar: 'Solicitud cancelada', agregar: 'Solicitud enviada' };
    mostrarAviso(mensajes[accion], accion === 'eliminar' || accion === 'agregar'
      ? { texto: 'Deshacer', alTocar: function () { cambiarRelacion(persona.usuario, antes); dibujarAcciones(); } }
      : null);
  });

  // Actividad, sobre y amigos en común
  var jugando = persona.estado === 'jugando' ? buscarPorId('juegos', persona.jugandoAhora) : null;
  document.getElementById('actividad-usuario').innerHTML = jugando
    ? '<a class="fila fila--jugando" href="detalle-juego.html?id=' + encodeURIComponent(jugando.id) + '"><span class="portada portada--sm"' + atributoColor(jugando.color) + '>' + imagenPortada(jugando) + '</span>' +
      '<span><span class="estado estado--jugando">Jugando ahora</span><br><b>' + escapar(jugando.nombreCorto) + '</b></span></a>'
    : '<p class="tarjeta__texto">' + htmlEstado(persona) + '</p>';
  document.getElementById('sobre-usuario').textContent = persona.sobreMi || '';
  document.getElementById('desde-usuario').textContent = 'Miembro desde ' + formatearFechaLarga(persona.miembroDesde);
  var comunes = obtenerDatos('usuarios').filter(function (u) { return u.usuario !== persona.usuario && sonAmigos(u.usuario); }).slice(0, persona.amigosEnComun || 3);
  document.getElementById('cantidad-comunes').textContent = comunes.length;
  document.getElementById('amigos-comunes').innerHTML = comunes.map(function (u) {
    return '<a href="perfil-usuario.html?u=' + encodeURIComponent(u.usuario) + '" title="' + escapar(u.nombre) + '"><span class="solo-lectores">' + escapar(u.nombre) + '</span>' + htmlAvatar(u) + '</a>';
  }).join('') || '<p class="tarjeta__texto">Ninguno</p>';

  // Estadísticas
  var resenas = obtenerResenas().filter(function (r) { return r.autor === persona.usuario && r.tipo === 'resena'; });
  var enComun = juegosEnComun(persona);
  document.getElementById('estadisticas-usuario').innerHTML = [
    [Object.keys(persona.notas || {}).length, 'Juegos'], [resenas.length, 'Reseñas'], [enComun.length, 'En común'], [comunes.length, 'Amigos en común']
  ].map(function (d) { return '<div class="dato"><span class="dato__valor">' + d[0] + '</span><span class="dato__etiqueta">' + d[1] + '</span></div>'; }).join('');

  // Favoritos
  document.getElementById('favoritos-usuario').innerHTML = persona.favoritos.map(function (id) {
    var j = buscarPorId('juegos', id);
    return j ? '<a class="portada portada--enlace" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '"' + atributoColor(j.color) + '>' + imagenPortada(j) + '<b class="portada__titulo">' + escapar(j.nombreCorto) + '</b></a>' : '';
  }).join('');

  // Juegos en común: su nota frente a la tuya
  var misNotas = {};
  leerDiario().forEach(function (d) { if (d.calificacion && !(d.juego in misNotas)) misNotas[d.juego] = d.calificacion; });
  document.getElementById('en-comun-usuario').innerHTML = enComun.length ? enComun.map(function (id) {
    var j = buscarPorId('juegos', id);
    var suya = persona.notas[id];
    var tuya = misNotas[id];
    return '<a class="fila fila--comparacion" href="detalle-juego.html?id=' + encodeURIComponent(j.id) + '"><span class="portada portada--sm"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span>' +
      '<b class="comparar__nombre">' + escapar(j.nombreCorto) + '</b>' +
      '<span class="comparar"><span class="tarjeta__texto">' + escapar(persona.nombre.split(' ')[0]) + '</span><span class="medidor"><span class="medidor__barra" data-ancho="' + suya * 10 + '"></span></span><b>' + suya + '</b></span>' +
      '<span class="comparar"><span class="tarjeta__texto">Tú</span><span class="medidor medidor--exito"><span class="medidor__barra" data-ancho="' + tuya * 10 + '"></span></span><b>' + tuya + '</b></span></a>';
  }).join('') : '<div class="vacio">Todavía no tienen juegos en común en el diario.</div>';

  // Reseñas recientes
  document.getElementById('resenas-usuario').innerHTML = resenas.map(function (r) {
    var j = buscarPorId('juegos', r.juego);
    return '<a class="tarjeta tarjeta--enlace tarjeta--resena" href="detalle-resena.html?id=' + encodeURIComponent(r.id) + '"' + atributoColor(j.color) + '>' +
      '<span class="en-fila"><span class="portada portada--sm"' + atributoColor(j.color) + '>' + imagenPortada(j) + '</span><span><b>' + escapar(j.nombreCorto) + '</b><br><span class="tarjeta__texto">' + formatearFecha(r.fecha) + '</span></span>' +
        '<span class="nota al-final">' + r.calificacion + '<small>/10</small></span></span>' +
      '<p class="tarjeta__texto texto-corto">' + escapar(r.spoiler ? 'Contiene spoilers. Ábrela para leerla.' : r.texto) + '</p>' +
      '<span class="tarjeta__texto">♥ ' + formatearNumero(r.meGusta) + ' · Útil ' + formatearNumero(r.votosUtil) + '</span></a>';
  }).join('') || '<div class="vacio">Aún no publica reseñas.</div>';

  aplicarColores(document);
}

// 27. Contáctanos (y 28. Ventana: Mensaje guardado)
var TEMAS_CONTACTO = { cuenta: 'Problema con mi cuenta', eventos: 'Eventos y pagos', torneo: 'Quiero organizar un torneo', reporte: 'Otro' };

function pantallaContacto() {
  var formulario = document.getElementById('formulario-contacto');
  var nombre = document.getElementById('nombre-contacto');
  var correo = document.getElementById('correo-contacto');
  var tema = document.getElementById('tema-contacto');
  var mensaje = document.getElementById('mensaje-contacto');
  var sesion = obtenerSesion();

  // Lo que ya sabemos: el tema desde el enlace (?tema=torneo) y el nombre si hay sesión
  var temaInicial = TEMAS_CONTACTO[new URLSearchParams(location.search).get('tema')];
  if (temaInicial) tema.value = temaInicial;
  if (sesion) {
    nombre.value = sesion.name || '';
    if (sesion.email && sesion.email.indexOf('@saveslot') === -1) correo.value = sesion.email;
  }

  formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    var resultados = [
      [nombre, marcarError(nombre, document.getElementById('error-nombre-contacto'), nombre.value.trim() ? '' : 'Escribe tu nombre.')],
      [correo, marcarError(correo, document.getElementById('error-correo-contacto'), correoValido(correo.value.trim()) ? '' : 'Revisa el correo. Ejemplo: tu@correo.com')],
      [mensaje, marcarError(mensaje, document.getElementById('error-mensaje-contacto'), mensaje.value.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).')]
    ];
    var primero = resultados.find(function (r) { return !r[1]; });
    if (primero) { primero[0].focus(); return; }

    // Hasta conectar Supabase, el mensaje se guarda en el navegador
    var guardados = leerMemoria('outbox', []);
    guardados.push({ name: nombre.value.trim(), email: correo.value.trim(), topic: tema.value, msg: mensaje.value.trim(), at: new Date().toISOString() });
    guardarMemoria('outbox', guardados);
    formulario.reset();

    // 28. Ventana: Mensaje guardado (el formulario queda vacío)
    abrirModal({
      titulo: 'Mensaje guardado',
      texto: 'El prototipo todavía no tiene servidor de correo, así que tu mensaje quedó guardado en este navegador. Te responderemos cuando conectemos el servicio.',
      acciones: [{ texto: 'Volver al inicio', href: rutaPagina('index.html'), principal: true }, { texto: 'Cerrar' }]
    });
  });
}

// 29. Error y estado de servicios (404.html)
// ?tipo=… elige la variante; ?servicio=… dice qué falló; ?volver=… activa "Reintentar"; ?detalle=… da el detalle técnico.
var ETIQUETA_SERVICIO = { conectado: 'etiqueta--exito', demo: 'etiqueta--ia', pendiente: 'etiqueta--aviso', 'no-disponible': 'etiqueta--error' };

function pantallaError() {
  var parametros = new URLSearchParams(location.search);
  var variantes = obtenerDatos('variantesError');
  var tipo = parametros.get('tipo') || (navigator.onLine === false ? 'sin-conexion' : 'no-encontrado');
  var variante = variantes.find(function (v) { return v.id === tipo; }) || variantes.find(function (v) { return v.id === 'no-encontrado'; });
  var servicio = (parametros.get('servicio') || '').slice(0, 60);
  function conServicio(texto) {
    return texto.replace(/\{servicio\}/g, servicio || variante.servicioPorDefecto || (texto.indexOf('{servicio}') === 0 ? 'Un servicio externo' : 'el servicio'));
  }

  var titulo = conServicio(variante.titulo);
  document.title = titulo + ' · SaveSlot';
  document.getElementById('titulo-error').textContent = titulo;
  document.getElementById('texto-error').textContent = conServicio(variante.texto);
  document.getElementById('codigo-error').textContent = 'Código ' + variante.codigo;
  var detalle = parametros.get('detalle');
  if (detalle) {
    var cajaDetalle = document.getElementById('detalle-error');
    cajaDetalle.hidden = false;
    cajaDetalle.textContent = ' · Detalle técnico: ' + detalle.slice(0, 120);
  }

  // Qué puedes hacer
  document.getElementById('lista-consejos').innerHTML = variante.consejos.map(function (c) { return '<li>' + escapar(conServicio(c)) + '</li>'; }).join('');
  document.getElementById('consejos-error').hidden = !variante.consejos.length;

  // Botón de la variante (por ejemplo "Ver eventos gratis")
  if (variante.accion) {
    var accion = document.getElementById('accion-error');
    accion.hidden = false;
    accion.textContent = variante.accion.texto;
    accion.href = rutaPagina(variante.accion.pagina);
  }

  // Reintentar: vuelve a la página que falló; en "límite de consultas" espera antes
  var volver = parametros.get('volver');
  if (variante.reintentar && volver && /^[a-z0-9\-]+\.html(\?[^<>"'\s]*)?$/i.test(volver)) {
    var reintentar = document.getElementById('reintentar');
    reintentar.hidden = false;
    reintentar.addEventListener('click', function () { location.href = rutaPagina(volver); });
    if (variante.espera) {
      var segundos = variante.espera;
      reintentar.disabled = true;
      reintentar.textContent = 'Reintentar en ' + segundos + ' s';
      var reloj = setInterval(function () {
        segundos--;
        if (segundos > 0) { reintentar.textContent = 'Reintentar en ' + segundos + ' s'; return; }
        clearInterval(reloj);
        reintentar.disabled = false;
        reintentar.textContent = 'Reintentar';
      }, 1000);
    }
  }

  // Estado de los servicios (simulado)
  document.getElementById('estado-servicios').innerHTML = obtenerDatos('estadoServicios').map(function (s) {
    // "Con fallas" solo cuando un servicio falló (no cuando una función no existe todavía)
    var falla = /^API-/.test(variante.codigo);
    var afectado = falla && servicio && (s.servicio.indexOf(servicio) !== -1 || s.proveedor.indexOf(servicio) !== -1);
    return '<tr><td>' + (afectado ? '<b>' + escapar(s.servicio) + '</b> <span class="etiqueta etiqueta--error">Con fallas</span>' : '<b>' + escapar(s.servicio) + '</b>') + '</td>' +
      '<td class="tarjeta__texto">' + escapar(s.proveedor) + '</td>' +
      '<td><span class="etiqueta ' + (ETIQUETA_SERVICIO[s.estado] || 'etiqueta--contorno') + '">' + escapar(s.texto) + '</span></td></tr>';
  }).join('');
}

/* ---------- Arranque ---------- */

var PANTALLAS = {
  index: pantallaIndex,
  buscar: pantallaBuscar,
  random: pantallaRandom,
  matchplay: pantallaMatchplay,
  juego: pantallaJuego,
  escribir: pantallaEscribir,
  comunidad: pantallaComunidad,
  resena: pantallaResena,
  eventos: pantallaEventos,
  evento: pantallaEvento,
  entrar: pantallaEntrar,
  registro: pantallaRegistro,
  perfil: pantallaPerfil,
  editar: pantallaEditar,
  diario: pantallaDiario,
  historial: pantallaHistorial,
  logros: pantallaLogros,
  biblioteca: pantallaBiblioteca,
  amigos: pantallaAmigos,
  usuario: pantallaUsuario,
  contacto: pantallaContacto,
  error: pantallaError
};

document.addEventListener('DOMContentLoaded', function () {
  // Primero se termina la vuelta de Steam (si la hay), para que la pantalla ya vea la sesión
  terminarVueltaDeSteam().then(function (aviso) {
    prepararEncabezado();
    prepararFranja();
    prepararPie();
    var pantalla = PANTALLAS[document.body.dataset.pantalla];
    if (pantalla) pantalla();
    if (aviso) mostrarAviso(aviso);
  });
});

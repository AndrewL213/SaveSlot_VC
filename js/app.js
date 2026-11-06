/* ==========================================================================
   SaveSlot · app.js
   El comportamiento de las pantallas construidas con el design kit.
   - Los datos se leen SOLO con obtenerDatos("…"). Hoy salen de js/data.js;
     cuando se conecten Supabase e IGDB, solo cambia esa función.
   - Hay una función por pantalla. <body data-pantalla="…"> dice cuál se ejecuta.
   - Mientras no haya backend, lo que la spec marca como Real se guarda en la
     memoria del navegador (las mismas claves que usan las páginas del prototipo,
     para que la sesión y los "vistos recientemente" sigan al ir de una a otra).
   ========================================================================== */

/* ---------- Datos ---------- */

// Devuelve una copia de la lista pedida ("juegos", "resenas", "eventos"…).
function obtenerDatos(tipo) {
  return (DATOS[tipo] || []).slice();
}

function buscarPorId(tipo, id) {
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

/* ---------- Sesión (hasta conectar Supabase) ---------- */

function obtenerSesion() {
  return leerMemoria('session', null);
}

function sonAmigos(usuario) {
  var sesion = obtenerSesion();
  if (!sesion) return false;
  return obtenerDatos('amigos').some(function (a) {
    return a.usuario === sesion.user && a.amigo === usuario && a.estado === 'amigos';
  });
}

/* ---------- Reseñas propias y comentarios (hasta conectar Supabase) ----------
   Lo que la persona publica se guarda en el navegador con las mismas claves y
   nombres que usan las páginas del prototipo (myReviews, diary, comments.…),
   para que el Diario y el Historial, aún sin construir, también lo vean. */

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
}

// Imagen de la portada, desde assets/.
function imagenPortada(juego) {
  return juego.portada
    ? '<img class="portada__imagen" src="' + escapar(rutaRecurso(juego.portada)) + '" alt="Portada de ' + escapar(juego.nombre) + '">'
    : '';
}

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

  acciones.innerHTML =
    '<a class="boton boton--secundario boton--icono navegacion__ocultar-movil" href="' + rutaPagina('amigos.html') + '" aria-label="Amigos">' + ICONO_AMIGOS + '</a>' +
    '<button class="boton boton--secundario boton--icono" type="button" data-notificaciones aria-label="Notificaciones, ' + avisos.length + ' nuevas">' + ICONO_CAMPANA + '</button>' +
    '<a class="navegacion__usuario" href="' + rutaPagina('perfil.html') + '">' +
      '<span class="avatar avatar--sm">' + escapar(sesion.initials) + '</span>' +
      '<span><span class="navegacion__nombre">' + escapar(String(sesion.name || '').split(' ')[0]) + '</span>' +
      '<span class="navegacion__nivel">Nivel ' + escapar(nivel) + '</span></span>' +
    '</a>';

  acciones.querySelector('[data-notificaciones]').addEventListener('click', function () {
    abrirModal({
      titulo: 'Notificaciones',
      html: '<div class="rejilla-tarjetas">' + avisos.map(function (n) {
        return '<p class="tarjeta tarjeta__texto">' + escapar(n.texto) + '</p>';
      }).join('') + '</div>',
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
    location.href = rutaPagina('index.html');
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
  var htmlEventos = '';
  if (delMes) {
    htmlEventos +=
      '<a class="tarjeta tarjeta--enlace tarjeta--destacada" href="' + rutaPagina('detalle-evento.html') + '?id=' + encodeURIComponent(delMes.id) + '"' + atributoColor(delMes.color) + '>' +
        '<span class="en-fila">' + etiquetaTipoEvento(delMes) + '<span class="etiqueta etiqueta--contorno">EVENTO DEL MES</span></span>' +
        '<h3 class="titulo-pagina">' + escapar(delMes.titulo) + '</h3>' +
        '<p class="tarjeta__texto">' + escapar(delMes.fechaHora) + ' · Organiza: ' + escapar(delMes.organizador) + '</p>' +
        '<span class="en-fila"><span class="boton">Ver evento</span><span class="tarjeta__texto">' + escapar(delMes.cuposOcupados) + ' de ' + escapar(delMes.cuposMaximos) + ' cupos ocupados</span></span>' +
      '</a>';
  }
  if (sorteo) {
    var juegoSorteo = sorteo.juego ? buscarPorId('juegos', sorteo.juego) : null;
    var cupos = sorteo.cuposMaximos ? sorteo.cuposOcupados + ' / ' + sorteo.cuposMaximos : formatearNumero(sorteo.cuposOcupados) + ' participantes';
    htmlEventos +=
      '<a class="tarjeta tarjeta--enlace" href="' + rutaPagina('detalle-evento.html') + '?id=' + encodeURIComponent(sorteo.id) + '">' +
        '<div class="tarjeta__banda"' + atributoColor(sorteo.color) + '>' + etiquetaTipoEvento(sorteo) + '</div>' +
        '<div class="tarjeta__cuerpo">' +
          '<span class="tarjeta__texto">' + escapar(juegoSorteo ? juegoSorteo.nombreCorto : 'Cualquier tienda') + '</span>' +
          '<h3 class="tarjeta__titulo">' + escapar(sorteo.titulo) + '</h3>' +
          '<p class="tarjeta__texto">' + escapar(sorteo.fechaHora) + ' · ' + escapar(sorteo.organizador) + '</p>' +
          '<p class="en-fila en-fila--entre tarjeta__texto"><span>' + escapar(cupos) + '</span><b>' + escapar(sorteo.costo) + '</b></p>' +
        '</div>' +
      '</a>';
  }
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
// La primera vez se arma con los datos de samluq en data.js; usa los mismos nombres
// que las páginas del prototipo para que el Perfil (aún sin construir) lo siga leyendo.
function leerPerfil() {
  var guardado = leerMemoria('profile', null);
  if (guardado) return guardado;
  var yo = buscarPorId('usuarios', 'samluq');
  return {
    xp: yo.xp, level: yo.nivel, bio: yo.sobreMi, since: yo.miembroDesde, favorites: yo.favoritos.slice(),
    wishlist: yo.listaDeseos.slice(), genres: yo.generosFavoritos.slice(), playing: yo.jugandoAhora,
    accounts: { Steam: 'samluq_steam', PlayStation: null, Xbox: null, Nintendo: null }, missionsDone: ['calificar', 'guia']
  };
}

// Diario propio: el guardado en el navegador o, si no hay, el de data.js
function leerDiario() {
  var guardado = leerMemoria('diary', null);
  if (!guardado) return obtenerDatos('diario');
  return guardado.map(function (d) {
    return { juego: d.game, fecha: d.date, estado: d.state, horas: d.hours, calificacion: d.score };
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
  var id = new URLSearchParams(location.search).get('id') || 'zelda-totk';
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
    '<div class="dato"><span class="dato__etiqueta">Historia principal</span><span class="dato__valor">' + (juego.horasHistoria ? juego.horasHistoria + ' h' : 'Online') + '</span><span class="tarjeta__texto">Promedio de jugadores</span></div>' +
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
  var juego = buscarPorId('juegos', parametros.get('id') || 'zelda-totk');
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
  var solicitudes = leerMemoria('friends', {});
  var relacion = propia ? 'yo' : (sonAmigos(autor.usuario) ? 'amigos' : (solicitudes[autor.usuario] === 'out' ? 'enviada' : 'ninguna'));
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
    var pendientes = leerMemoria('friends', {});
    pendientes[autor.usuario] = 'out';
    guardarMemoria('friends', pendientes);
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

/* ---------- Arranque ---------- */

var PANTALLAS = {
  index: pantallaIndex,
  buscar: pantallaBuscar,
  random: pantallaRandom,
  matchplay: pantallaMatchplay,
  juego: pantallaJuego,
  escribir: pantallaEscribir,
  comunidad: pantallaComunidad,
  resena: pantallaResena
};

document.addEventListener('DOMContentLoaded', function () {
  prepararEncabezado();
  prepararFranja();
  prepararPie();
  var pantalla = PANTALLAS[document.body.dataset.pantalla];
  if (pantalla) pantalla();
});

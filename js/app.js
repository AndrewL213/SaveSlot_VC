/* ==========================================================================
   SaveSlot · app.js
   El comportamiento de las pantallas construidas con el design kit.
   - Los datos se leen SOLO con obtenerDatos("…"). Hoy salen de js/data.js;
     cuando se conecten Supabase y RAWG, solo cambia esa función.
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

/* ---------- Ayudas para armar HTML ---------- */

// Escapa texto antes de ponerlo en el HTML.
function escapar(texto) {
  return String(texto == null ? '' : texto).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function formatearNumero(n) {
  return Number(n || 0).toLocaleString('es-CO');
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

// Abre una ventana. opciones: { titulo, texto, html, acciones: [{ texto, href, principal }] }
function abrirModal(opciones) {
  var anterior = document.activeElement;
  var acciones = (opciones.acciones || []).map(function (a) {
    var clase = 'boton' + (a.principal ? '' : ' boton--secundario');
    return a.href
      ? '<a class="' + clase + '" href="' + escapar(a.href) + '">' + escapar(a.texto) + '</a>'
      : '<button class="' + clase + '" type="button" data-cerrar>' + escapar(a.texto) + '</button>';
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

// Mensaje corto abajo de la pantalla.
function mostrarAviso(texto) {
  var aviso = crearElemento('<div class="aviso-flotante" role="status"></div>');
  aviso.textContent = texto;
  document.body.appendChild(aviso);
  setTimeout(function () { aviso.remove(); }, 2600);
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
  var comentarios = obtenerDatos('comentarios').filter(function (c) { return c.resena === resena.id; }).length;
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
    '<p>' + escapar(resena.texto) + '</p>' +
    '<div class="en-fila tarjeta__texto">' +
      '<button class="boton boton--secundario boton--sm" type="button" data-util="' + escapar(resena.id) + '" aria-pressed="' + votado + '">Útil · <span>' + formatearNumero(votos) + '</span></button>' +
      '<span>♥ ' + formatearNumero(resena.meGusta) + '</span>' +
      '<span>' + comentarios + (comentarios === 1 ? ' comentario' : ' comentarios') + '</span>' +
      '<a class="al-final" href="' + rutaPagina('detalle-resena.html') + '?id=' + encodeURIComponent(resena.id) + '">Leer y comentar →</a>' +
    '</div>' +
  '</article>';
}

// Votar "Útil": pide cuenta si no hay sesión; un voto por reseña.
function activarVotos(contenedor) {
  contenedor.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-util]');
    if (!boton) return;
    if (!obtenerSesion()) { pedirCuenta('votar reseñas'); return; }
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
  var destacadas = obtenerDatos('resenas')
    .filter(function (r) { return !r.spoiler && r.estado === 'publicada'; })
    .slice(0, 3);
  var contenedorResenas = document.getElementById('resenas-destacadas');
  contenedorResenas.innerHTML = destacadas.map(function (r) { return htmlResena(r, { conJuego: true }); }).join('');
  activarVotos(contenedorResenas);

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

/* ---------- Arranque ---------- */

var PANTALLAS = {
  index: pantallaIndex
};

document.addEventListener('DOMContentLoaded', function () {
  prepararEncabezado();
  prepararFranja();
  prepararPie();
  var pantalla = PANTALLAS[document.body.dataset.pantalla];
  if (pantalla) pantalla();
});

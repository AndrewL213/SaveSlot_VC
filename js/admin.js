/* js/admin.js · Pantalla Administración (pages/admin.html).
   Solo la carga esa página, después de app.js (usa sus ayudas: escapar, abrirModal, mostrarAviso, MI_FILA, ES_ADMIN…).
   Todo lo que lee o cambia pasa por las funciones admin_… de la base (supabase/administracion.sql), que primero
   comprueban que la cuenta esté en la tabla administradores. Esconder esta página no es la seguridad: lo es la base. */

var POR_PAGINA_ADMIN = 20;

// Qué ofrece "Mostrar" en cada pestaña (el primero es el que sale al entrar)
var FILTROS_ADMIN = {
  revisar: [['revisar', 'Ocultas o reportadas'], ['reportadas', 'Solo reportadas'], ['ocultas', 'Solo ocultas']],
  publicaciones: [['todas', 'Todas'], ['visibles', 'Visibles'], ['reportadas', 'Reportadas'], ['ocultas', 'Ocultas'], ['borradores', 'Borradores']],
  perfiles: [['todos', 'Todas las cuentas'], ['bloqueados', 'Suspendidas'], ['reportados', 'Con publicaciones reportadas']],
  registro: []
};
var NOMBRE_TIPO_ADMIN = { resena: 'Reseña', guia: 'Guía', clip: 'Clip' };
var NOMBRE_ACCION_ADMIN = {
  ocultar: 'Ocultó una publicación', aprobar: 'Aprobó una publicación', borrar_publicacion: 'Borró una publicación',
  borrar_comentario: 'Borró un comentario', bloquear: 'Suspendió la cuenta', desbloquear: 'Quitó la suspensión'
};

// Llama a una función admin_… de la base. Si falla, el error lleva un mensaje en palabras simples.
async function pedirAdmin(funcion, argumentos) {
  var respuesta = await clienteSupabase.rpc(funcion, argumentos || {});
  if (respuesta.error) {
    var e = respuesta.error;
    var error = new Error(
      e.code === '42501' ? 'Tu cuenta no tiene permiso de moderación.'
      : e.code === 'PGRST202' || e.code === '42883' ? 'Falta ejecutar supabase/administracion.sql en Supabase.'
      : e.code === 'P0002' ? e.message
      : 'La base no respondió. Intenta de nuevo.');
    console.error('Supabase no hizo ' + funcion + ':', e);
    throw error;
  }
  return respuesta.data;
}

function etiquetaAdmin(texto, tipo) {
  return '<span class="etiqueta etiqueta--' + tipo + '">' + escapar(texto) + '</span>';
}

// 1 → "1 comentario", 3 → "3 comentarios"
function cuantos(n, uno, varios) {
  return formatearNumero(n) + ' ' + (Number(n) === 1 ? uno : varios);
}

function fechaAdmin(valor) {
  return valor ? formatearFecha(fechaLocal(valor)) : '';
}

async function pantallaAdmin() {
  // Sin cuenta real: primero entrar (y volver aquí)
  if (!obtenerSesion() || !MI_FILA) {
    location.replace('iniciar-sesion.html?volver=admin.html');
    return;
  }
  aplicarColores();
  if (!ES_ADMIN) {
    document.getElementById('sin-permiso-admin').hidden = false;
    return;
  }
  document.getElementById('contenido-admin').hidden = false;

  var estado = { pestana: 'revisar', filtro: 'revisar', buscar: '', autor: null, desde: 0 };
  var lista = document.getElementById('lista-admin');
  var cantidad = document.getElementById('cantidad-admin');
  var botonMas = document.getElementById('mas-admin');
  var selectFiltro = document.getElementById('filtro-admin');
  var campoBuscar = document.getElementById('buscar-admin');
  var publicaciones = {}; // las publicaciones dibujadas, por id (para las acciones)
  var dibujadas = [];     // las mismas, en el orden en que se ven
  var mostrados = 0;      // cuántas filas hay en la lista

  function grupoDeFiltros(pestana) {
    return pestana === 'revisar' || pestana === 'perfiles' || pestana === 'registro' ? pestana : 'publicaciones';
  }

  function dibujarFiltros() {
    var opciones = FILTROS_ADMIN[grupoDeFiltros(estado.pestana)];
    selectFiltro.innerHTML = opciones.map(function (o) {
      return '<option value="' + o[0] + '"' + (o[0] === estado.filtro ? ' selected' : '') + '>' + escapar(o[1]) + '</option>';
    }).join('');
    selectFiltro.closest('.orden').hidden = !opciones.length;
    campoBuscar.closest('form').hidden = estado.pestana === 'registro';
    campoBuscar.placeholder = estado.pestana === 'perfiles' ? 'Buscar por @usuario, nombre o correo' : 'Buscar por texto, @usuario o nombre';
    document.querySelectorAll('#pestanas-admin [data-pestana]').forEach(function (chip) {
      var activa = !estado.autor && chip.dataset.pestana === estado.pestana;
      chip.setAttribute('aria-pressed', String(activa));
      chip.setAttribute('aria-selected', String(activa));
    });
  }

  async function cargarResumen() {
    try {
      var r = await pedirAdmin('admin_resumen');
      document.getElementById('resumen-admin').innerHTML = [
        [r.por_revisar, 'Por revisar', true], [r.reportadas, 'Reportadas visibles'], [r.ocultas, 'Ocultas'],
        [r.bloqueados, 'Cuentas suspendidas'], [r.usuarios, 'Cuentas'], [r.resenas, 'Reseñas'], [r.guias, 'Guías'], [r.clips, 'Clips']
      ].map(function (d) {
        return '<div class="dato' + (d[2] && d[0] ? ' dato--destacado' : '') + '"><span class="dato__valor">' + formatearNumero(d[0]) + '</span><span class="dato__etiqueta">' + d[1] + '</span></div>';
      }).join('');
    } catch (error) {
      document.getElementById('resumen-admin').innerHTML = '';
      mostrarAviso(error.message);
    }
  }

  /* ---------- Publicaciones (reseñas, guías y clips) ---------- */
  function htmlPublicacion(p) {
    var juego = juegoOMarcador(p.juego_igdb);
    var visible = p.estado === 'publicada' && !p.oculta && !p.autor_bloqueado;
    var etiquetas = etiquetaAdmin(NOMBRE_TIPO_ADMIN[p.tipo] || p.tipo, 'primario') +
      (p.estado === 'borrador' ? ' ' + etiquetaAdmin('Borrador', 'contorno') : '') +
      (p.oculta ? ' ' + etiquetaAdmin('Oculta', 'error') : '') +
      (p.reportes ? ' ' + etiquetaAdmin(cuantos(p.reportes, 'reporte', 'reportes'), 'aviso') : '') +
      (p.autor_bloqueado ? ' ' + etiquetaAdmin('Autor suspendido', 'error') : '') +
      (p.spoiler ? ' ' + etiquetaAdmin('Spoiler', 'contorno') : '');
    var datos = [
      'De <a href="#" data-accion="publicaciones-de" data-id="' + escapar(p.autor_id) + '" data-usuario="' + escapar(p.autor) + '">@' + escapar(p.autor) + '</a>',
      'sobre <a href="detalle-juego.html?id=' + encodeURIComponent(slugDeJuego(p.juego_igdb)) + '">' + escapar(juego.nombre) + '</a>',
      fechaAdmin(p.fecha) + (p.editada ? ' (editada)' : '')
    ];
    if (p.calificacion != null) datos.push('Nota ' + escapar(p.calificacion) + '/10');
    if (p.horas != null) datos.push(formatearNumero(p.horas) + ' h');
    var motivo = p.oculta ? '<p class="tarjeta__texto"><b>Por qué está oculta:</b> ' +
      (p.motivo_oculta ? escapar(p.motivo_oculta) : 'la ocultaron 3 reportes de la comunidad.') + '</p>' : '';
    var acciones = [];
    if (visible && p.tipo !== 'clip') acciones.push('<a class="boton boton--secundario boton--sm" href="detalle-resena.html?id=' + encodeURIComponent(p.id) + '" target="_blank" rel="noopener">Ver en la app</a>');
    if (p.tipo === 'clip') acciones.push('<button class="boton boton--secundario boton--sm" type="button" data-accion="ver-clip" data-id="' + escapar(p.id) + '">Ver clip</button>');
    if (p.reportes) acciones.push('<button class="boton boton--secundario boton--sm" type="button" data-accion="reportes" data-id="' + escapar(p.id) + '">Reportes (' + escapar(p.reportes) + ')</button>');
    if (p.comentarios) acciones.push('<button class="boton boton--secundario boton--sm" type="button" data-accion="comentarios" data-id="' + escapar(p.id) + '">Comentarios (' + escapar(p.comentarios) + ')</button>');
    if (p.oculta || p.reportes) acciones.push('<button class="boton boton--sm" type="button" data-accion="aprobar" data-id="' + escapar(p.id) + '">' + (p.oculta ? 'Aprobar y mostrar' : 'Descartar reportes') + '</button>');
    if (!p.oculta) acciones.push('<button class="boton boton--secundario boton--sm" type="button" data-accion="ocultar" data-id="' + escapar(p.id) + '">Ocultar</button>');
    acciones.push('<button class="boton boton--peligro boton--sm" type="button" data-accion="borrar" data-id="' + escapar(p.id) + '">Borrar</button>');
    acciones.push(p.autor_bloqueado
      ? '<button class="boton boton--fantasma boton--sm" type="button" data-accion="desbloquear" data-id="' + escapar(p.autor_id) + '" data-usuario="' + escapar(p.autor) + '">Quitar suspensión a @' + escapar(p.autor) + '</button>'
      : '<button class="boton boton--fantasma boton--sm" type="button" data-accion="bloquear" data-id="' + escapar(p.autor_id) + '" data-usuario="' + escapar(p.autor) + '">Suspender a @' + escapar(p.autor) + '</button>');
    return '<article class="tarjeta">' +
      '<div class="en-fila en-fila--entre"><span class="en-fila">' + etiquetas + '</span><span class="tarjeta__texto">#' + escapar(p.id) + '</span></div>' +
      (p.titulo ? '<h2 class="tarjeta__titulo">' + escapar(p.titulo) + '</h2>' : '') +
      '<p class="tarjeta__texto">' + datos.join(' · ') + '</p>' +
      motivo +
      (p.texto ? '<p class="tarjeta__texto">' + escapar(p.texto) + '</p>' : '') +
      (p.tipo === 'clip' ? '<p class="tarjeta__texto">' + (p.clip_twitch ? 'Clip de Twitch' : 'Video subido a SaveSlot') + '</p>' : '') +
      '<div class="en-fila">' + acciones.join('') + '</div>' +
    '</article>';
  }

  /* ---------- Perfiles ---------- */
  function htmlPerfiles(filas) {
    return '<div class="tabla"><table>' +
      '<thead><tr><th>Cuenta</th><th class="tabla__solo-escritorio">Correo</th><th>Actividad</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>' +
      filas.map(function (u) {
        var estadoCuenta = u.es_admin ? etiquetaAdmin('Administrador', 'primario')
          : u.bloqueado ? etiquetaAdmin('Suspendida', 'error') : etiquetaAdmin('Activa', 'exito');
        var acciones = '<button class="boton boton--secundario boton--sm" type="button" data-accion="publicaciones-de" data-id="' + escapar(u.id) + '" data-usuario="' + escapar(u.usuario) + '">Publicaciones</button>' +
          (u.bloqueado ? '' : '<a class="boton boton--secundario boton--sm" href="perfil-usuario.html?id=' + encodeURIComponent(u.usuario) + '" target="_blank" rel="noopener">Perfil</a>') +
          (u.es_admin ? '' : u.bloqueado
            ? '<button class="boton boton--sm" type="button" data-accion="desbloquear" data-id="' + escapar(u.id) + '" data-usuario="' + escapar(u.usuario) + '">Quitar suspensión</button>'
            : '<button class="boton boton--peligro boton--sm" type="button" data-accion="bloquear" data-id="' + escapar(u.id) + '" data-usuario="' + escapar(u.usuario) + '">Suspender</button>');
        return '<tr>' +
          '<td class="tabla__ancha"><span class="en-fila"><span class="avatar avatar--sm">' + contenidoAvatar({ usuario: u.usuario, foto: u.foto, iniciales: u.iniciales }) + '</span>' +
            '<span><b>@' + escapar(u.usuario) + '</b><br><span class="tarjeta__texto">' + escapar(u.nombre) + ' · nivel ' + escapar(u.nivel) + ' · desde ' + fechaAdmin(u.miembro_desde) + '</span>' +
            (u.sobre_mi ? '<br><span class="tarjeta__texto">«' + escapar(u.sobre_mi) + '»</span>' : '') + '</span></span></td>' +
          '<td class="tabla__solo-escritorio"><span class="tarjeta__texto">' + escapar(u.correo || '—') + '<br>Entra con ' + escapar(u.forma_de_entrar) + '</span></td>' +
          '<td><span class="tarjeta__texto">' + cuantos(u.publicaciones, 'publicación', 'publicaciones') + ' · ' + cuantos(u.comentarios, 'comentario', 'comentarios') +
            (u.reportes ? ' · <b>' + cuantos(u.reportes, 'reporte recibido', 'reportes recibidos') + '</b>' : '') +
            (u.ultima_conexion ? '<br>Última conexión ' + escapar(textoHace(u.ultima_conexion)) : '') + '</span></td>' +
          '<td>' + estadoCuenta + (u.bloqueado && u.bloqueado_motivo ? '<br><span class="tarjeta__texto">' + escapar(u.bloqueado_motivo) + '</span>' : '') + '</td>' +
          '<td><span class="en-fila">' + acciones + '</span></td>' +
        '</tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- Registro ---------- */
  function htmlRegistro(filas) {
    return '<div class="tabla"><table>' +
      '<thead><tr><th>Fecha</th><th>Quién</th><th>Qué hizo</th><th>A quién</th><th class="tabla__solo-escritorio">Motivo y detalle</th></tr></thead><tbody>' +
      filas.map(function (m) {
        return '<tr><td><span class="tarjeta__texto">' + fechaAdmin(m.fecha) + '</span></td>' +
          '<td><span class="tarjeta__texto">' + escapar(m.admin || '—') + '</span></td>' +
          '<td class="tabla__ancha"><b>' + escapar(NOMBRE_ACCION_ADMIN[m.accion] || m.accion) + '</b>' + (m.resena_id ? ' <span class="tarjeta__texto">#' + escapar(m.resena_id) + '</span>' : '') + '</td>' +
          '<td>' + (m.usuario ? '@' + escapar(m.usuario) : '<span class="tarjeta__texto">Cuenta borrada</span>') + '</td>' +
          '<td class="tabla__solo-escritorio"><span class="tarjeta__texto">' + escapar(m.motivo || '—') + (m.detalle ? '<br>«' + escapar(m.detalle) + '»' : '') + '</span></td></tr>';
      }).join('') + '</tbody></table></div>';
  }

  /* ---------- Cargar y dibujar la pestaña ---------- */
  var pedidoActual = 0;
  async function cargar(agregar) {
    var numero = ++pedidoActual;
    if (!agregar) {
      estado.desde = 0;
      publicaciones = {};
      dibujadas = [];
      mostrados = 0;
      lista.innerHTML = '<div class="vacio" role="status"><b>Cargando…</b></div>';
      cantidad.textContent = '';
    }
    botonMas.hidden = true;
    var filas;
    try {
      if (estado.pestana === 'perfiles' && !estado.autor) {
        filas = await pedirAdmin('admin_usuarios', { p_buscar: estado.buscar || null, p_filtro: estado.filtro, p_limite: POR_PAGINA_ADMIN, p_desde: estado.desde });
      } else if (estado.pestana === 'registro' && !estado.autor) {
        filas = await pedirAdmin('admin_registro', { p_limite: POR_PAGINA_ADMIN, p_desde: estado.desde });
      } else {
        filas = await pedirAdmin('admin_publicaciones', {
          p_tipo: estado.autor || estado.pestana === 'revisar' ? null : estado.pestana,
          p_filtro: estado.autor ? 'todas' : estado.filtro,
          p_buscar: estado.buscar || null,
          p_autor: estado.autor ? estado.autor.id : null,
          p_limite: POR_PAGINA_ADMIN, p_desde: estado.desde
        });
      }
    } catch (error) {
      if (numero !== pedidoActual) return;
      lista.innerHTML = '<div class="vacio" role="alert"><b>' + escapar(error.message) + '</b><button class="boton boton--secundario boton--sm" type="button" data-accion="reintentar">Intentar de nuevo</button></div>';
      return;
    }
    if (numero !== pedidoActual) return; // llegó tarde: ya se pidió otra pestaña
    var esPerfiles = estado.pestana === 'perfiles' && !estado.autor;
    var esRegistro = estado.pestana === 'registro' && !estado.autor;
    if (!esPerfiles && !esRegistro) filas.forEach(function (f) { publicaciones[f.id] = f; dibujadas.push(f); });
    mostrados += filas.length;
    var encabezado = estado.autor
      ? '<div class="en-fila en-fila--entre"><span class="tarjeta__texto">Publicaciones de <b>@' + escapar(estado.autor.usuario) + '</b></span>' +
        '<button class="boton boton--fantasma boton--sm" type="button" data-accion="quitar-autor">Ver todas</button></div>'
      : '';

    if (!filas.length && !agregar) {
      lista.innerHTML = encabezado + '<div class="vacio"><b>' + (estado.pestana === 'revisar' && !estado.autor && !estado.buscar
        ? 'No hay nada por revisar. ¡Todo en orden!' : 'No hay resultados con estos filtros.') + '</b></div>';
      cantidad.textContent = '';
      return;
    }
    var html = esPerfiles ? htmlPerfiles(filas) : esRegistro ? htmlRegistro(filas) : filas.map(htmlPublicacion).join('');
    if (agregar) lista.insertAdjacentHTML('beforeend', html);
    else lista.innerHTML = encabezado + html;
    aplicarColores(lista);
    cantidad.textContent = 'Mostrando ' + (esPerfiles ? cuantos(mostrados, 'cuenta', 'cuentas')
      : esRegistro ? cuantos(mostrados, 'acción', 'acciones') : cuantos(mostrados, 'publicación', 'publicaciones'));
    estado.desde += filas.length;
    botonMas.hidden = filas.length < POR_PAGINA_ADMIN;

    // Los nombres de los juegos que no están en el navegador se piden a IGDB y se vuelve a dibujar
    if (!esPerfiles && !esRegistro) {
      traerJuegosQueFaltan(filas.map(function (f) { return f.juego_igdb; })).then(function (cambio) {
        if (cambio && numero === pedidoActual) lista.innerHTML = encabezado + dibujadas.map(htmlPublicacion).join('');
      });
    }
  }

  async function recargarTodo() {
    await Promise.all([cargarResumen(), cargar(false)]);
  }

  /* ---------- Acciones ---------- */
  // Ventana con un campo "Motivo" (opcional) y un botón de confirmar
  function pedirMotivo(opciones) {
    abrirModal({
      titulo: opciones.titulo,
      texto: opciones.texto,
      html: '<div class="grupo-campo"><label class="grupo-campo__etiqueta" for="motivo-admin">Motivo (lo verá la persona)</label>' +
        '<textarea class="campo" id="motivo-admin" rows="3" maxlength="300" placeholder="Por ejemplo: lenguaje ofensivo, spam, spoiler sin avisar…"></textarea></div>',
      acciones: [{ texto: 'Cancelar' }, { texto: opciones.boton, peligro: !!opciones.peligro, principal: !opciones.peligro, alTocar: function () {
        opciones.alConfirmar(campo.value.trim());
      } }]
    });
    var campo = document.getElementById('motivo-admin');
    campo.focus();
  }

  async function hacer(funcion, argumentos, textoListo) {
    try {
      await pedirAdmin(funcion, argumentos);
      mostrarAviso(textoListo);
      await recargarTodo();
    } catch (error) {
      mostrarAviso(error.message);
    }
  }

  function verClip(p) {
    var titulo = p.titulo || 'Clip de @' + p.autor;
    var reproductor = p.clip_twitch
      ? '<iframe class="clip-reproductor" src="' + escapar('https://clips.twitch.tv/embed?clip=' + encodeURIComponent(p.clip_twitch) + '&parent=' + encodeURIComponent(location.hostname)) + '" title="Clip de Twitch: ' + escapar(titulo) + '" allowfullscreen></iframe>'
      : '<video class="clip-reproductor" src="' + escapar(direccionClip(p.clip_archivo)) + '" controls playsinline></video>';
    abrirModal({ titulo: titulo, html: reproductor + '<p class="tarjeta__texto">De @' + escapar(p.autor) + '</p>', acciones: [{ texto: 'Cerrar' }] });
  }

  async function verReportes(p) {
    try {
      var reportes = await pedirAdmin('admin_reportes', { p_resena: p.id });
      abrirModal({
        titulo: 'Reportes de la publicación #' + p.id,
        html: reportes.length ? '<div class="pila pila--junta">' + reportes.map(function (r) {
          return '<div class="fila"><span><b>@' + escapar(r.usuario) + '</b> <span class="tarjeta__texto">' + fechaAdmin(r.fecha) + '</span><br>' +
            '<span class="tarjeta__texto">' + escapar(r.motivo || 'Sin motivo') + '</span></span></div>';
        }).join('') + '</div>' : '<div class="vacio"><b>Ya no tiene reportes.</b></div>',
        acciones: [{ texto: 'Cerrar' }]
      });
    } catch (error) { mostrarAviso(error.message); }
  }

  async function verComentarios(p) {
    try {
      var comentarios = await pedirAdmin('admin_comentarios', { p_resena: p.id });
      var cerrarVentana = abrirModal({
        titulo: 'Comentarios de la publicación #' + p.id,
        html: comentarios.length ? '<div class="pila pila--junta" id="comentarios-admin">' + comentarios.map(function (c) {
          return '<div class="fila en-fila en-fila--entre"><span><b>@' + escapar(c.autor) + '</b>' + (c.autor_bloqueado ? ' ' + etiquetaAdmin('Suspendido', 'error') : '') +
            ' <span class="tarjeta__texto">' + fechaAdmin(c.fecha) + '</span><br><span class="tarjeta__texto">' + escapar(c.texto) + '</span></span>' +
            '<button class="boton boton--peligro boton--sm" type="button" data-borrar-comentario="' + escapar(c.id) + '">Borrar</button></div>';
        }).join('') + '</div>' : '<div class="vacio"><b>No tiene comentarios.</b></div>',
        acciones: [{ texto: 'Cerrar' }]
      });
      var caja = document.getElementById('comentarios-admin');
      if (caja) caja.addEventListener('click', function (e) {
        var boton = e.target.closest('[data-borrar-comentario]');
        if (!boton) return;
        var id = Number(boton.dataset.borrarComentario);
        cerrarVentana();
        pedirMotivo({
          titulo: '¿Borrar este comentario?', texto: 'Se borra para siempre. Su autor recibe un aviso.',
          boton: 'Borrar comentario', peligro: true,
          alConfirmar: function (motivo) { hacer('admin_borrar_comentario', { p_id: id, p_motivo: motivo || null }, 'Comentario borrado'); }
        });
      });
    } catch (error) { mostrarAviso(error.message); }
  }

  lista.addEventListener('click', function (e) {
    var boton = e.target.closest('[data-accion]');
    if (!boton) return;
    var accion = boton.dataset.accion;
    var id = Number(boton.dataset.id);
    var p = publicaciones[id];
    // "esta reseña", "esta guía", "este clip"
    var nombreTipo = p ? (p.tipo === 'clip' ? 'este clip' : 'esta ' + (NOMBRE_TIPO_ADMIN[p.tipo] || 'publicación').toLowerCase()) : '';
    e.preventDefault();

    if (accion === 'reintentar') cargar(false);
    else if (accion === 'quitar-autor') { estado.autor = null; dibujarFiltros(); cargar(false); }
    else if (accion === 'publicaciones-de') {
      estado.autor = { id: id, usuario: boton.dataset.usuario };
      estado.buscar = '';
      campoBuscar.value = '';
      dibujarFiltros();
      cargar(false);
    }
    else if (accion === 'ver-clip' && p) verClip(p);
    else if (accion === 'reportes' && p) verReportes(p);
    else if (accion === 'comentarios' && p) verComentarios(p);
    else if (accion === 'aprobar' && p) {
      hacer('admin_aprobar_publicacion', { p_id: id }, p.oculta ? 'Publicación aprobada: ya se ve en la app' : 'Reportes descartados');
    }
    else if (accion === 'ocultar' && p) {
      pedirMotivo({
        titulo: '¿Ocultar ' + nombreTipo + '?',
        texto: 'Deja de verse en toda la app. Su autor la sigue viendo en su historial, con el motivo, y recibe un aviso. Puedes volver a mostrarla.',
        boton: 'Ocultar', peligro: true,
        alConfirmar: function (motivo) { hacer('admin_ocultar_publicacion', { p_id: id, p_motivo: motivo || null }, 'Publicación oculta'); }
      });
    }
    else if (accion === 'borrar' && p) {
      pedirMotivo({
        titulo: '¿Borrar ' + nombreTipo + ' para siempre?',
        texto: 'Se borran también sus comentarios, votos y reportes. No se puede deshacer. Su autor recibe un aviso.',
        boton: 'Borrar', peligro: true,
        alConfirmar: async function (motivo) {
          await hacer('admin_borrar_publicacion', { p_id: id, p_motivo: motivo || null }, 'Publicación borrada');
          // El video de un clip subido también se borra de Storage (si falla, solo queda el archivo sin usar)
          if (p.clip_archivo) {
            clienteSupabase.storage.from('clips').remove([p.clip_archivo, p.clip_archivo.replace(/\.[a-z0-9]+$/i, '.jpg')]).catch(function () {});
          }
        }
      });
    }
    else if (accion === 'bloquear') {
      pedirMotivo({
        titulo: '¿Suspender a @' + boton.dataset.usuario + '?',
        texto: 'Su perfil, sus publicaciones y sus comentarios dejan de verse, y ya no podrá publicar, comentar, enviar mensajes ni cambiar su perfil. Puede seguir entrando y ve el motivo. Puedes quitar la suspensión cuando quieras.',
        boton: 'Suspender cuenta', peligro: true,
        alConfirmar: function (motivo) { hacer('admin_bloquear_usuario', { p_id: id, p_bloquear: true, p_motivo: motivo || null }, '@' + boton.dataset.usuario + ' suspendida'); }
      });
    }
    else if (accion === 'desbloquear') {
      abrirModal({
        titulo: '¿Quitar la suspensión a @' + boton.dataset.usuario + '?',
        texto: 'Su perfil y sus publicaciones vuelven a verse y puede volver a publicar. Recibe un aviso.',
        acciones: [{ texto: 'Cancelar' }, { texto: 'Quitar suspensión', principal: true, alTocar: function () {
          hacer('admin_bloquear_usuario', { p_id: id, p_bloquear: false, p_motivo: null }, '@' + boton.dataset.usuario + ' ya no está suspendida');
        } }]
      });
    }
  });

  /* ---------- Pestañas, filtros y búsqueda ---------- */
  document.getElementById('pestanas-admin').addEventListener('click', function (e) {
    var chip = e.target.closest('[data-pestana]');
    if (!chip) return;
    estado.pestana = chip.dataset.pestana;
    estado.autor = null;
    var opciones = FILTROS_ADMIN[grupoDeFiltros(estado.pestana)];
    estado.filtro = opciones.length ? opciones[0][0] : null;
    dibujarFiltros();
    cargar(false);
  });
  selectFiltro.addEventListener('change', function () {
    estado.filtro = selectFiltro.value;
    estado.autor = null;
    dibujarFiltros();
    cargar(false);
  });
  document.getElementById('filtros-admin').addEventListener('submit', function (e) {
    e.preventDefault();
    estado.buscar = campoBuscar.value.trim().slice(0, 80);
    cargar(false);
  });
  botonMas.addEventListener('click', function () { cargar(true); });

  dibujarFiltros();
  await recargarTodo();
}

PANTALLAS.admin = pantallaAdmin;

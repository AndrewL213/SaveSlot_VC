## Qué es este proyecto
SaveSlot: reúne videojuegos, sus comunidades y funciones con inteligencia
artificial en una sola página web para gamers casuales de 15 a 24 años en
España y Latinoamérica. Es el MVP de un equipo del curso Lenguajes
Digitales 3. Más contexto en README.md.

## Documentos que debes leer antes de construir
- spec.md: qué se construye (flujo, datos y pantallas). Si no existe o
  algo no está ahí, pregunta antes de inventar.
- css/tokens.css y css/components.css: el design kit.
  componentes.html muestra todos los componentes.

## Tecnología (no cambiar sin preguntar)
- HTML, CSS y JavaScript sin paso de compilación: todo debe funcionar
  abriendo los archivos en el navegador. Las librerías (por ejemplo,
  supabase-js) se cargan como scripts normales, sin type="module".
- La app se publicará en Vercel, conectada a este repositorio.
- Cuentas y base de datos: Supabase. Catálogo de juegos: IGDB (de Twitch), con las
  descripciones traducidas al español (por ahora con el enlace gratis de
  Google Translate, temporal; DeepL si se pone su clave). Steam (Steam Web
  API, desde api/steam/): inicio de sesión, perfil, biblioteca, logros, lista
  de deseos, reseñas y precio, nota y jugadores de cada juego. Todo lo
  demás usa datos simulados (ver spec.md).

## Estructura del proyecto
- disenos/: diseños originales. Solo de referencia: nunca los modifiques.
- assets/: todas las imágenes, logos e íconos de la app. Usa siempre
  las de aquí, nunca links de imágenes de internet. Únicas excepciones: las
  portadas de juegos que trae IGDB (images.igdb.com), siempre con crédito a IGDB,
  y las de la biblioteca de Steam del usuario (shared.fastly.steamstatic.com,
  con la dirección que da la tienda de Steam; cdn.cloudflare.steamstatic.com como respaldo),
  siempre con crédito a Steam.
- css/: estilos. tokens.css (decisiones base), components.css
  (componentes) y styles.css (estilos generales de las pantallas).
- js/: código. app.js (comportamiento), data.js (datos simulados,
  separados del diseño) y config.js (dirección y clave pública de Supabase).
  Cada página carga, en este orden: supabase-js (versión fija, con integrity),
  js/config.js, js/data.js y js/app.js.
- api/: funciones de Vercel que usan claves secretas (por ejemplo,
  api/igdb.js, la consulta a IGDB, y api/steam/, el inicio de sesión y los
  datos de Steam: perfil, biblioteca y logros). JavaScript sin paso de compilación.
- supabase/: el código SQL de las tablas de Supabase (por ejemplo, juegos.sql).
  Si creas o cambias una tabla, guarda aquí su SQL.
- vercel.json: las tareas automáticas de Vercel (crons), como la
  actualización diaria de los datos de Steam.
- index.html: la pantalla de inicio, la puerta de entrada de la app.
  Las demás pantallas van en la carpeta pages/.
- 404.html: la página de error, también en la raíz (Vercel la usa para
  las direcciones que no existen). Todos los errores llevan ahí.
- Nombres de archivos y carpetas: minúsculas, sin tildes, ñ ni
  espacios, con guiones.

## Reglas de trabajo
1. Antes de crear o modificar archivos, explica tu plan en pocas líneas
   y espera aprobación.
2. Trabaja una pantalla o una función a la vez.
3. Usa solo los tokens y componentes del design kit. Si necesitas un
   estilo o componente que no existe, pregunta: primero se agrega al kit
   y a componentes.html, y después se usa.
4. Nunca escribas claves, contraseñas ni tokens de acceso en el código:
   este repositorio es público. Única excepción: la clave pública (anon
   key) de Supabase, hecha para ir en el navegador; los datos se protegen
   con reglas de acceso en la base. Las demás claves (como las de Twitch para IGDB, la de Steam,
   la secreta de Supabase y la de DeepL, si se usa) van
   en las variables de entorno de Vercel y solo se usan desde api/.
5. Si algo que te pedimos contradice spec.md, avísanos antes de hacerlo.
6. Al terminar cada tarea, explica en lenguaje simple qué cambiaste y
   por qué. Somos un equipo aprendiendo.
7. Antes de cada comando de git, explica en una frase qué hace.
8. Al terminar cada pantalla, actualiza su fila en pantallas.md.

## Componentes disponibles
Definidos en css/components.css (estilo v3); se ven todos en componentes.html.
Cada pantalla enlaza primero css/tokens.css y después css/components.css.
Las portadas de juegos usan su imagen de assets/ si existe; si no, la portada que trae IGDB (con crédito a IGDB). El color del juego (--c) es solo respaldo: los juegos que vienen de IGDB no tienen color y usan el neutro del kit.
En las pantallas no se escribe `style`: el color de un juego o evento va en `data-color="#…"` y app.js lo pasa a `--c` con aplicarColores().

- `.antetitulo` y `.titulo-pagina` (+ `--grande`):
  `<span class="antetitulo">Tu gente</span><h1 class="titulo-pagina">Amigos</h1>`
- `.bajada` (párrafo bajo el título que explica la pantalla):
  `<h1 class="titulo-pagina">Juego random</h1><p class="bajada">Elige un género…</p>`
- `.encabezado-seccion` con `__titulo` y `__enlace`:
  `<div class="encabezado-seccion"><h2 class="encabezado-seccion__titulo">Mejores juegos</h2><a class="encabezado-seccion__enlace" href="…">Ver todo</a></div>`
- `.boton` (+ `--secundario`, `--fantasma`, `--peligro`, `--me-gusta`, `--sm`, `--bloque`, `--icono`; presionado con `aria-pressed="true"`):
  `<button class="boton boton--secundario" type="button">Cancelar</button>`
- `.boton__logo` (logo de un servicio dentro de un botón; imágenes `assets/logo-google.svg`, `logo-discord.svg`, `logo-twitch.svg` y `logo-steam.svg`, con `alt=""` porque el botón ya dice el nombre):
  `<a class="boton boton--secundario" href="…"><img class="boton__logo" src="assets/logo-steam.svg" alt="">Steam</a>`
- `.grupo-campo` con `.grupo-campo__etiqueta`, `__ayuda` (+ `--listo`, en verde), `__error`, y `.campo` (+ `--error`, `--sm`) para input, select y textarea:
  `<div class="grupo-campo"><label class="grupo-campo__etiqueta" for="c">Correo</label><input class="campo" id="c" type="email"></div>`
- `.campo-clave` (+ `--error`) con `__campo` y un `.boton--icono` para mostrar u ocultar; `.fuerza-clave` con 4 `<i>` y `data-nivel` de 0 a 4:
  `<div class="campo-clave"><input class="campo-clave__campo" type="password"><button class="boton boton--fantasma boton--icono boton--sm" aria-label="Mostrar contraseña">…</button></div>`
- `.separador` (línea con texto en medio): `<p class="separador">o con tu correo</p>`
- `.pasos` con `__paso` (actual con `aria-current="step"`) y `__numero`:
  `<ol class="pasos"><li class="pasos__paso" aria-current="step"><span class="pasos__numero">1</span><span><b>Tus datos</b></span></li></ol>`
- `.escala` (+ `--dificultad`) con `.escala__opcion` (elegida con `aria-pressed="true"`; en dificultad, las anteriores con `--llena`):
  `<div class="escala" role="group" aria-label="Tu calificación"><button class="escala__opcion" type="button" aria-pressed="false">1</button>…</div>`
- `.opcion` (+ `--desactivada`) con `.opcion__texto` (radio dentro de una tarjeta):
  `<label class="opcion"><input type="radio" name="modo" value="xp"><span class="opcion__texto"><b>Gratis</b></span></label>`
- `.casilla` (checkbox con su texto; se agrupan en `fieldset.grupo-campo` con `legend.grupo-campo__etiqueta`):
  `<label class="casilla"><input type="checkbox" name="genero" value="RPG">RPG</label>`
- `.buscador` (+ `--ia`, borde morado para escribirle a MatchPlay) con `.buscador__campo`:
  `<form class="buscador" role="search"><input class="buscador__campo" type="search" aria-label="Buscar juegos"><button class="boton">Buscar</button></form>`
- `.etiqueta` (+ `--primario`, `--exito`, `--error`, `--aviso`, `--ia`, `--amigo`, `--contorno`; `.etiqueta__logo` para el logo de una cuenta, con `alt=""`):
  `<span class="etiqueta etiqueta--amigo">Amigo</span>`
- `.contador` (+ `--destacado`):
  `<span class="contador contador--destacado">3</span>`
- `.menu-lateral` con `.menu-lateral__enlace` (secciones de una página; cuadradas, del color del fondo, solo cambian con el hover):
  `<nav class="menu-lateral" aria-label="Ajustes"><a class="menu-lateral__enlace" href="#datos">Perfil público</a></nav>`
- `.chip` (activo con `aria-pressed="true"` o `.chip--activo`):
  `<button class="chip" type="button" aria-pressed="false">Torneos</button>`
- `.nota` (+ `--texto`) y `.nota-anillo` (se llena con `--p`, de 0 a 100):
  `<span class="nota">9<small>/10</small></span>` · `<div class="nota-anillo" style="--p:90"><b>9</b><span>de 10</span></div>`
- `.estado` (+ `--jugando`, `--en-linea`, `--desconectado`):
  `<span class="estado estado--jugando">Jugando Hades</span>`
- `.tarjeta` (+ `--enlace`, `--destacada` con `--c`, `--resena` con `--c`, `--exito` y `--aviso` con borde de color) con `.tarjeta__titulo`, `.tarjeta__texto`, `.tarjeta__pie` (línea arriba y valor en azul) y `.tarjeta__banda` (banda de color arriba, con `--c`):
  `<article class="tarjeta tarjeta--resena" style="--c:#8A2B2B"><h3 class="tarjeta__titulo">Hades</h3><p class="tarjeta__texto">…</p></article>`
- `.tarjeta-amigo` (+ `--jugando` con `--c`) con `__cabeza` y `__nombre`:
  `<article class="tarjeta-amigo"><div class="tarjeta-amigo__cabeza"><span class="avatar avatar--md avatar--en-linea">JV</span><h3 class="tarjeta-amigo__nombre">juanvi</h3></div></article>`
- `.fila` (comentario; + `--comparacion`, `--actividad`, `--jugando`):
  `<a class="fila fila--actividad" href="…"><span class="avatar avatar--sm">JV</span><span>juanvi reseñó Hades</span></a>`
- `.panel` con `.panel__titulo`:
  `<section class="panel"><h2 class="panel__titulo">Actividad</h2>…</section>`
- `.dato` (+ `--destacado`) con `.dato__etiqueta`, `.dato__valor` y `.dato__ayuda` (botón que parece enlace):
  `<div class="dato"><span class="dato__etiqueta">Logros</span><span class="dato__valor">1.912</span></div>`
- `.calaveras` con `.calaveras__marca` (+ `--encendida`), la dificultad en 10 marcas:
  `<div class="calaveras" role="img" aria-label="Dificultad 6 de 10"><i class="calaveras__marca calaveras__marca--encendida"></i>…</div>`
- `.migas` (ruta; la página actual con `aria-current="page"`):
  `<nav class="migas" aria-label="Ruta"><a href="…">Inicio</a><span aria-hidden="true">/</span><span aria-current="page">Zelda</span></nav>`
- `.cabecera-juego` con `__contenido` (banda con el color del juego en `data-color`):
  `<section class="cabecera-juego" data-color="#2F6B4F"><div class="cabecera-juego__contenido">…</div></section>`
- `.cabecera-perfil` con `__banda` (colores en `--c1`, `--c2`, `--c3`), `__contenido`, `__avatar` (en un `.avatar--lg`), `__texto` y `__acciones`:
  `<section class="cabecera-perfil"><div class="cabecera-perfil__banda"></div><div class="cabecera-perfil__contenido"><span class="avatar avatar--lg cabecera-perfil__avatar">SL</span>…</div></section>`
- `.histograma` con `__barra` (altura en `--h`, de 0 a 100; en pantallas va en `data-h`) y `.histograma__numeros`.
- `.tabla` (envuelve un <table>; en celular las filas se vuelven tarjetas) con `__solo-escritorio`, `__ancha`, `__centro`, `__mes`, `__dia` y `__me-gusta` (+ `--activo`):
  `<div class="tabla"><table><thead>…</thead><tbody><tr><td class="tabla__dia">07</td><td class="tabla__ancha">…</td></tr></tbody></table></div>`
- `.preguntas` con `.preguntas__item` (un <details> con <summary> y <p>; se abre y se cierra solo):
  `<div class="preguntas"><details class="preguntas__item"><summary>¿Qué es el XP?</summary><p>…</p></details></div>`
- `.icono-alerta` (triángulo rojo de error): `<span class="icono-alerta" aria-hidden="true"><svg>…</svg></span>`
- `.ficha` (lista de datos con dt y dd):
  `<dl class="ficha"><dt>Desarrolla</dt><dd>Nintendo EPD</dd></dl>`
- `.spoiler` (tapa una reseña con spoilers):
  `<div class="spoiler"><span>Esta reseña tiene spoilers.</span><button class="boton boton--secundario boton--sm">Mostrar de todas formas</button></div>`
- `.mensaje` (+ `--usuario`) con `.burbuja` (+ `--usuario`, `--ia`, `--error`; `__fuente` y `__votos`), para el chat de MatchPlay:
  `<div class="mensaje"><span class="avatar avatar--sm avatar--ia">IA</span><div class="burbuja burbuja--ia">…</div></div>`
- `.item-chat` (actual con `aria-current="true"`) con `__abrir` y `__borrar`:
  `<div class="item-chat"><button class="item-chat__abrir">Terror corto</button><button class="item-chat__borrar" aria-label="Borrar chat">…</button></div>`
- `.pestanas` con `.pestanas__boton` (activa con `aria-selected="true"`; número con `.contador`):
  `<div class="pestanas" role="tablist"><button class="pestanas__boton" role="tab" aria-selected="true">Reseñas <span class="contador">12</span></button></div>`
- `.segmentado` con `.segmentado__opcion` (activa con `aria-selected="true"`):
  `<div class="segmentado" role="tablist"><button class="segmentado__opcion" role="tab" aria-selected="true">Iniciar sesión</button></div>`
- `.navegacion` con `__contenido`, `__logo`, `__enlaces`, `__enlace` (actual con `aria-current="page"`; `--escritorio` solo en computador, `--movil` solo en celular), `__buscar` con `__buscar-campo`, `__acciones` (`navegacion__ocultar-movil` para ocultar un botón en celular) `__usuario` con `__nombre` y `__nivel`, y `__contador` (un `.contador contador--destacado` sobre la campana). En celular los enlaces bajan a una barra fija (con íconos): la pantalla debe dejar espacio abajo.
  `<header class="navegacion"><div class="navegacion__contenido"><a class="navegacion__logo" href="index.html">SaveSlot</a>…</div></header>`
- `.portada` (+ `--enlace`, `--sm`) con `.portada__imagen` (img con alt, de assets/ o de IGDB), `.portada__titulo`, `.portada__ranking` y `.portada__accion` (botón arriba a la derecha); `--c` de respaldo:
  `<a class="portada portada--enlace" href="…" data-color="#8A2B2B"><img class="portada__imagen" src="assets/portada-hades.jpg" alt="Portada de Hades"><b class="portada__titulo">Hades</b></a>`
- `.avatar` (+ `--sm` 32, normal 40, `--md` 56, `--lg` 128, `--ia`; anillo `--jugando`, `--en-linea`, `--desconectado` con `.avatar__punto` opcional):
  `<span class="avatar avatar--md avatar--jugando">SL<span class="avatar__punto"></span></span>`
- `.medidor` (+ `--exito`, `--aviso`) con `.medidor__barra`:
  `<div class="medidor"><span class="medidor__barra" style="width:62%"></span></div>`
- `.modal-fondo` > `.modal` con `__titulo`, `__texto`, `__cerrar` y `__acciones`:
  `<div class="modal-fondo"><div class="modal" role="dialog" aria-modal="true"><h2 class="modal__titulo">…</h2></div></div>`
- `.aviso-flotante` con `.aviso-flotante__accion`:
  `<div class="aviso-flotante" role="status">Guardado <button class="aviso-flotante__accion">Deshacer</button></div>`
- `.vacio`:
  `<div class="vacio"><b>Todavía no tienes reseñas</b><span>Cuando escribas una, aparecerá aquí.</span></div>`
- `.franja` con `.franja__enlace` (aviso arriba de la página):
  `<div class="franja" role="region" aria-label="Aviso"><span>Prototipo académico… <a class="franja__enlace" href="…">Más información</a></span><button class="boton boton--fantasma boton--icono boton--sm" aria-label="Ocultar aviso">…</button></div>`
- `.heroe` con `__texto`, `__arte` y `__portada` (en una `.portada`; las 3 portadas solo en pantallas anchas):
  `<section class="heroe"><div class="heroe__texto">…</div><div class="heroe__arte" aria-hidden="true"><div class="portada heroe__portada">…</div></div></section>`
- `.pie` con `__contenido`, `__marca`, `__logo`, `__frase`, `__columnas`, `__columna`, `__titulo`, `__enlace` y `__creditos`:
  `<footer class="pie"><div class="pie__contenido">…<p class="pie__creditos">…</p></div></footer>`

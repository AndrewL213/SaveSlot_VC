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
- HTML, CSS y JavaScript puro. Sin frameworks ni librerías (nada de
  React, Vue, Tailwind ni TypeScript) y sin paso de compilación: todo
  debe funcionar abriendo los archivos en el navegador.
- La app se publicará en Vercel, conectada a este repositorio.
- Más adelante, la base de datos será Supabase. Por ahora, los datos
  son simulados.

## Estructura del proyecto
- disenos/: diseños originales. Solo de referencia: nunca los modifiques.
- assets/: todas las imágenes, logos e íconos de la app. Usa siempre
  las de aquí, nunca links de imágenes de internet.
- css/: estilos. tokens.css (decisiones base), components.css
  (componentes) y styles.css (estilos generales de las pantallas).
- js/: código. app.js (comportamiento) y data.js (datos simulados,
  separados del diseño).
- index.html: la pantalla de inicio, la puerta de entrada de la app.
  Las demás pantallas van en la carpeta pages/.
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
   este repositorio es público.
5. Si algo que te pedimos contradice spec.md, avísanos antes de hacerlo.
6. Al terminar cada tarea, explica en lenguaje simple qué cambiaste y
   por qué. Somos un equipo aprendiendo.
7. Antes de cada comando de git, explica en una frase qué hace.

## Componentes disponibles
Definidos en css/components.css; se ven todos en componentes.html.
Cada pantalla enlaza primero css/tokens.css y después css/components.css.

- `.boton` (+ `--secundario`, `--fantasma`, `--peligro`, `--sm`, `--bloque`, `--icono`):
  `<button class="boton boton--secundario" type="button">Cancelar</button>`
- `.grupo-campo` con `.grupo-campo__etiqueta`, `__ayuda`, `__error`, y `.campo` (+ `--error`, `--sm`) para input, select y textarea:
  `<div class="grupo-campo"><label class="grupo-campo__etiqueta" for="c">Correo</label><input class="campo" id="c" type="email"></div>`
- `.buscador` con `.buscador__campo`:
  `<form class="buscador" role="search"><input class="buscador__campo" type="search" aria-label="Buscar juegos"><button class="boton">Buscar</button></form>`
- `.etiqueta` (+ `--primario`, `--exito`, `--error`, `--aviso`, `--ia`, `--contorno`):
  `<span class="etiqueta etiqueta--exito">Logro</span>`
- `.chip` (activo con `aria-pressed="true"` o `.chip--activo`):
  `<button class="chip" type="button" aria-pressed="false">Torneos</button>`
- `.tarjeta` (+ `--enlace`, `--destacada`) con `.tarjeta__titulo` y `.tarjeta__texto`:
  `<article class="tarjeta"><h3 class="tarjeta__titulo">Hades</h3><p class="tarjeta__texto">…</p></article>`
- `.panel` con `.panel__titulo`:
  `<section class="panel"><h2 class="panel__titulo">Actividad</h2>…</section>`
- `.dato` con `.dato__etiqueta` y `.dato__valor`:
  `<div class="dato"><span class="dato__etiqueta">Logros</span><span class="dato__valor">1.912</span></div>`
- `.pestanas` con `.pestanas__boton` (activa con `aria-selected="true"`):
  `<div class="pestanas" role="tablist"><button class="pestanas__boton" role="tab" aria-selected="true">Reseñas</button></div>`
- `.segmentado` con `.segmentado__opcion` (activa con `aria-selected="true"`):
  `<div class="segmentado" role="tablist"><button class="segmentado__opcion" role="tab" aria-selected="true">Iniciar sesión</button></div>`
- `.navegacion` con `__contenido`, `__logo`, `__enlaces`, `__enlace` (actual con `aria-current="page"`) y `__acciones`. En celular los enlaces bajan a una barra fija: la pantalla debe dejar espacio abajo.
  `<header class="navegacion"><div class="navegacion__contenido"><a class="navegacion__logo" href="index.html">SaveSlot</a>…</div></header>`
- `.portada` (+ `--enlace`, `--sm`) con `.portada__titulo` y `.portada__ranking`; la imagen siempre desde assets/:
  `<a class="portada portada--enlace" href="…" style="background-image:url(assets/portada-hades.jpg)"><b class="portada__titulo">Hades</b></a>`
- `.avatar` (+ `--lg`):
  `<span class="avatar">SL</span>`
- `.medidor` (+ `--exito`, `--aviso`) con `.medidor__barra`:
  `<div class="medidor"><span class="medidor__barra" style="width:62%"></span></div>`
- `.modal-fondo` > `.modal` con `__titulo`, `__texto`, `__cerrar` y `__acciones`:
  `<div class="modal-fondo"><div class="modal" role="dialog" aria-modal="true"><h2 class="modal__titulo">…</h2></div></div>`
- `.aviso-flotante` con `.aviso-flotante__accion`:
  `<div class="aviso-flotante" role="status">Guardado <button class="aviso-flotante__accion">Deshacer</button></div>`
- `.vacio`:
  `<div class="vacio"><b>Todavía no tienes reseñas</b><span>Cuando escribas una, aparecerá aquí.</span></div>`

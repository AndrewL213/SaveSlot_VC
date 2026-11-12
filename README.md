# SaveSlot

SaveSlot reúne tus videojuegos, sus comunidades y funciones con inteligencia artificial en una sola página web.

## El problema

Los gamers usan en promedio 4 o 5 canales distintos para informarse sobre sus juegos. Esa dispersión les causa frustración (33 %) y hasta los lleva a abandonar el juego (24 %). Además, el 72 % juega en dos o más plataformas, lo que agrava el problema. *(Fuente: Statista, 2024)*

## Para quién

Gamers casuales de 15 a 24 años en España y Latinoamérica que hoy tienen que buscar en varias páginas para encontrar lo que necesitan de sus juegos.

## Equipo

- **Andrés Hernández** · Líder de producto · Diseñador UX/UI · Desarrollador frontend
- **Juan Vigoya** · Investigador UX · Responsable de validación con usuarios · QA y gestión de APIs
- **Kenneth Velásquez** · Director de marca · Productor audiovisual · Responsable de promoción y comunidad

## Links

- App publicada: https://saveslot-pi.vercel.app/
- Brief del proyecto: [Brief-SaveSlot.md](Brief-SaveSlot.md)
- Repositorio del proceso: [SaveSlot-Info](https://github.com/AndrewL213/SaveSlot-Info)

## Con qué funciona

- **Páginas**: HTML, CSS y JavaScript, sin paso de compilación, publicadas en Vercel.
- **Cuentas y base de datos**: Supabase. Se entra con correo, Google, Discord, Twitch o Steam (o como invitado, sin cuenta). En la base se guardan los perfiles, reseñas, votos «útil», me gusta, comentarios, diario, lista de deseos, Steam vinculada, amigos, eventos e inscripciones, misiones y los mensajes de Contáctanos; «en línea» se ve en vivo.
- **Catálogo de juegos**: IGDB (de Twitch), con las descripciones traducidas al español.
- **Steam**: entrar con Steam, y ver perfil, biblioteca, logros, lista de deseos, reseñas y el precio, la nota y los jugadores de cada juego.
- **Todavía en el navegador** (falta pasarlos a Supabase): chats de MatchPlay, notificaciones y vistos recientemente.
- **Simulado**: las respuestas de la IA de MatchPlay, los logros de otras plataformas (los de Steam son reales) y Xbox (demo).

## Cómo está organizado este repo

- `index.html` · La pantalla de inicio. Las demás pantallas están en `pages/`, y la página de error es `404.html`.
- `disenos/` · Los diseños originales de las pantallas (inicio, buscador, ficha de juego, perfil, eventos, chat con IA y más). Son solo de referencia.
- `js/` · El código de la app: `app.js` (cómo se comporta), `data.js` (listas fijas y datos simulados) y `supabase.js` (conexión con Supabase).
- `api/` · Funciones de Vercel que usan claves secretas: `igdb.js` (catálogo de juegos) y `steam/` (inicio de sesión y datos de Steam).
- `supabase/` · El código SQL de Supabase, para ejecutar en su SQL Editor: `esquema.sql` (todas las tablas, reglas de acceso y funciones de la app; se puede ejecutar varias veces), `juegos.sql` y `usuarios_steam.sql` (datos de Steam), `avatares.sql` (fotos de perfil), `borrar-cuenta.sql` (borrar la cuenta propia) y `limpiar-ejemplos.sql` (borra los datos de prueba).
- `vercel.json` · Tareas automáticas de Vercel, como actualizar cada día los datos de Steam.
- `pantallas.md` · El avance de cada pantalla.
- `assets/` · Las imágenes de la app: iconos, portadas de juegos y una foto de prueba, con sus créditos en `CREDITOS.md`.
- `css/` · El design kit: `tokens.css` (colores, letras, espacios) y `components.css` (botones, tarjetas, campos y demás piezas).
- `componentes.html` · Catálogo para ver en el navegador todas las piezas del design kit.
- `decisiones-design-kit.md` · La revisión del diseño y las decisiones que tomamos para armar el kit.
- `spec.md` · El plano de la app: qué pantallas tiene, qué datos usa y cuándo está lista cada una.
- `CLAUDE.md` · Las instrucciones para Claude, el asistente de IA con el que construimos la app.
- `Brief-SaveSlot.md` · El brief del proyecto: problema, usuario, objetivos, mercado y competencia.
- `README.md` · Esta página.
- `.gitignore` · Lista de archivos del sistema que no se suben al repositorio.

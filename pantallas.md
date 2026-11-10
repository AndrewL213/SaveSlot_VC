# Pantallas de SaveSlot

Avance de cada pantalla de spec.md, por tramo del flujo. Las páginas salen de los diseños v3 (disenos/).

- **Separada**: tiene su propia página (o vive dentro de la página indicada, si es una ventana).
- **Con kit**: usa solo css/tokens.css y css/components.css, sin el andamio del prototipo (css/prototipo.css y js/prototipo.js, ya borrados).
- **Datos en data.js**: sus datos simulados salen de js/data.js, separados del diseño (o de Supabase/IGDB, si son Real). También las listas fijas que antes estaban escritas en el HTML (géneros, plataformas, estados de partida, temas y preguntas de Contáctanos, atajos de Inicio, ideas de MatchPlay, reglas y organizadores de Eventos); en el HTML solo quedan las opciones de orden y filtros de la interfaz.
- **Revisada vs spec**: cumple todos sus criterios de «Está lista cuando» en spec.md.

## Descubrir

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 1. Inicio | `index.html` | ✅ | ✅ | ✅ (catálogo real de IGDB) | ⬜ |
| 3. Buscar juegos | `pages/buscar-juegos.html` | ✅ | ✅ | ✅ (catálogo real de IGDB) | ⬜ |
| 4. Juego random | `pages/juego-random.html` | ✅ | ✅ | ✅ (catálogo real de IGDB) | ⬜ |
| 5. MatchPlay | `pages/matchplay.html` | ✅ | ✅ | ✅ | ⬜ |
| 6. Detalle de juego | `pages/detalle-juego.html` | ✅ | ✅ | ✅ (catálogo real de IGDB) | ⬜ |
| 7. Ventana: Dificultad de 1 a 10 | dentro de `pages/detalle-juego.html` | ✅ | ✅ | ✅ | ⬜ |

## Opinar

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 8. Escribir reseña | `pages/escribir-resena.html` | ✅ | ✅ | ✅ (catálogo real de IGDB) | ⬜ |
| 9. Ventana: Publicación confirmada | dentro de `pages/escribir-resena.html` | ✅ | ✅ | ✅ | ⬜ |
| 10. Ventana: Necesitas una cuenta | se abre en varias páginas | ✅ | ✅ | ✅ | ⬜ |
| 11. Comunidad | `pages/comunidad.html` | ✅ | ✅ | ✅ | ⬜ |
| 12. Detalle de reseña | `pages/detalle-resena.html` | ✅ | ✅ | ✅ | ⬜ |

## Eventos

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 2. Ventana: Evento del mes | dentro de `index.html` | ✅ | ✅ | ✅ | ⬜ |
| 13. Eventos | `pages/eventos.html` | ✅ | ✅ | ✅ | ⬜ |
| 14. Detalle de evento | `pages/detalle-evento.html` | ✅ | ✅ | ✅ | ⬜ |
| 15. Ventana: Inscripción confirmada | dentro de `pages/detalle-evento.html` | ✅ | ✅ | ✅ | ⬜ |

## Cuenta, perfil y amigos

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 16. Iniciar sesión | `pages/iniciar-sesion.html` | ✅ | ✅ | ✅ | ⬜ |
| 17. Crear cuenta | `pages/crear-cuenta.html` | ✅ | ✅ | ✅ | ⬜ |
| 18. Perfil | `pages/perfil.html` | ✅ | ✅ | ✅ | ⬜ |
| 19. Ventana: Cómo ganar XP | dentro de `pages/perfil.html` | ✅ | ✅ | ✅ | ⬜ |
| 20. Editar perfil | `pages/editar-perfil.html` | ✅ | ✅ | ✅ | ⬜ |
| 21. Diario | `pages/diario.html` | ✅ | ✅ | ✅ | ⬜ |
| 22. Historial de reseñas | `pages/historial-resenas.html` | ✅ | ✅ | ✅ | ⬜ |
| 23. Logros | `pages/logros.html` | ✅ | ✅ | ✅ | ⬜ |
| 24. Amigos | `pages/amigos.html` | ✅ | ✅ | ✅ | ⬜ |
| 25. Perfil de otro usuario | `pages/perfil-usuario.html` | ✅ | ✅ | ✅ | ⬜ |
| 26. Ventana: Notificaciones | se abre en todas las páginas (campana) | ✅ | ✅ | ✅ | ⬜ |
| 30. Biblioteca | `pages/biblioteca.html` | ✅ | ✅ | ✅ (datos reales de Steam) | ⬜ |
| 31. Menú de la cuenta | se abre en todas las páginas (nombre o avatar de la barra) | ✅ | ✅ | ✅ | ⬜ |

## Ayuda

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 27. Contáctanos | `pages/contacto.html` | ✅ | ✅ | ✅ | ⬜ |
| 28. Ventana: Mensaje guardado | dentro de `pages/contacto.html` | ✅ | ✅ | ✅ | ⬜ |
| 29. Error y estado de servicios | `404.html` (en la raíz) | ✅ | ✅ | ✅ | ⬜ |

## Pendientes para la revisión vs spec
- **Iniciar sesión y Crear cuenta**: los botones «Pronto» de Google y Discord del diseño ahora son cuatro (Google, Discord, Twitch y Steam) con su logo (`.boton__logo`), debajo del formulario de la cuenta de SaveSlot. Steam ya funciona (`api/steam/auth.js`); Google, Discord y Twitch llevan a la página de error hasta conectarlos en Supabase.
- **404.html**: tiene 5 variantes nuevas de «no encontrado» (página, juego, evento, reseña y usuario) y una de «acceso» (entrar con Google, Discord o Twitch mientras no están conectados) que el diseño no traía; la de página es la que sale por defecto. En Vercel, una línea en el <head> hace que los archivos se busquen desde la raíz del sitio.
- **Mensaje (Amigos y Perfil de otro usuario)**, clips, pagos y foto de perfil: siguen visibles como en el diseño, aunque la spec los marca como **Después**.
- **Index.html**: la cabecera de la v3 viene con los estilos de una vista previa; en la app ya está arreglada (igual que en noviembre).
- **Comunidad, pestaña Guías**: cada guía abre su juego (como en el diseño), no un Detalle de reseña; las guías de ejemplo no tienen texto completo.
- **Detalle de evento**: la banda usa el color de cada evento (el diseño usa azul fijo para torneos y verde para sorteos). Premio, costo y organizadores siguen con los textos entre corchetes del diseño hasta tener los datos reales en Supabase.
- **Notificaciones**: no muestra el aviso de comentarios del diseño («Kenneth y Daniela comentaron…»), porque la spec solo define avisos de votos «útil» y de cierre de inscripciones; las ventanas del kit no llevan el ícono de arriba del diseño.
- **Avatares**: los de amigos no llevan el color de fondo de cada persona como en el diseño (el avatar del kit no tiene esa opción).
- **Perfil de otro usuario**: «Juegos» cuenta los juegos que la persona calificó (el diseño suma un número fijo); el avatar grande es azul y no del color de la persona.
- **Inicio**: «Mejores juegos de la semana» sale de IGDB («jugando ahora»). Tiene una sección «Lo más jugado en Steam» que el diseño no traía. El aviso de arriba y el pie ya dicen que el catálogo es real (IGDB).
- **Juego random**: los géneros ya no salen de los juegos de ejemplo, sino de los 15 que entiende IGDB. Nota y dificultad solo se ven si el juego ya tiene reseñas en SaveSlot.
- **Buscar juegos**: busca en todo IGDB (de 24 en 24, con «Ver más juegos»). Tiene una sección «Lo más jugado en Steam» que el diseño no traía (solo se ve sin búsqueda ni filtros). Algunas búsquedas traen al final juegos poco conocidos o repetidos de IGDB.
- **Perfil de otro usuario**: la dirección ahora es `perfil-usuario.html?id=usuario`, como las demás pantallas de detalle (`?u=` sigue funcionando).
- **Detalle de juego**: abre cualquier juego de IGDB (no solo los 12 de ejemplo); «Si te gusta, prueba» usa los parecidos de IGDB. Tiene un apartado «Sobre el juego» (la descripción, con «Leer más») que el diseño no traía. Las horas de la historia salen de IGDB solo si las reportaron 10 jugadores o más; si no, dice «Sin datos» (u «Online» en juegos solo online) y queda el enlace «Ver en HowLongToBeat».
- **Traducción de descripciones (api/igdb.js)**: usa por ahora el enlace gratis de Google Translate, que no es oficial. Al conectar Supabase hay que guardar cada traducción una sola vez y pasar a DeepL (poner `DEEPL_API_KEY` en Vercel).
- **Steam (noviembre)**: perfil, biblioteca, logros, lista de deseos, juegos recientes y reseñas de Steam ya son reales (`api/steam/`), y cada ficha de juego muestra precio, nota y jugadores de Steam (tabla **juegos** de Supabase, actualizada cada día). Las portadas de Steam están permitidas en `CLAUDE.md`. Las reseñas de Steam se leen de las páginas públicas de la comunidad: si Steam las cambia, hay que ajustar el código.
- **Perfil y Editar perfil**: el @ ya se puede cambiar (el diseño decía que no); las cuentas vinculadas van debajo del nombre. Falta revisar que el @ sea único contra todos los usuarios cuando exista la tabla **usuarios**.
- **Biblioteca y Menú de la cuenta**: no tienen diseño en disenos/; se hicieron con el kit (`.menu-usuario` es un componente nuevo, en componentes.html). Cada juego de la Biblioteca lleva bajo la portada la etiqueta de su cuenta con el logo (`.etiqueta__logo`, nueva en el kit).

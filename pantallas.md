# Pantallas de SaveSlot

Datos: conectados a Supabase (js/supabase.js y supabase/esquema.sql)

Avance de cada pantalla de spec.md, por tramo del flujo. Las páginas salen de los diseños v3 (disenos/).

- **Separada**: tiene su propia página (o vive dentro de la página indicada, si es una ventana).
- **Con kit**: usa solo css/tokens.css y css/components.css, sin el andamio del prototipo (css/prototipo.css y js/prototipo.js, ya borrados).
- **Datos**: de dónde salen los datos de la pantalla: Supabase (usuarios, reseñas, votos, me gusta, comentarios, diario, amistades, eventos, tendencias, destacados, misiones y mensajes de contacto; «en línea» con Supabase Realtime), IGDB (catálogo de juegos), Steam (la cuenta de Steam de la persona) o js/data.js (listas fijas, como géneros o preguntas frecuentes, y lo simulado, como logros de otras plataformas o respuestas de MatchPlay). Chats, notificaciones, inscripciones, lista de deseos de SaveSlot, cuentas vinculadas y vistos recientemente siguen en el navegador: falta pasarlos a Supabase (ver «Lo que falta»). En el HTML solo quedan las opciones de orden y filtros de la interfaz.
- **Revisada vs spec**: cumple todos sus criterios de «Está lista cuando» en spec.md.

## Descubrir

| Pantalla | Archivo | Separada | Con kit | Datos | Revisada vs spec |
|---|---|---|---|---|---|
| 1. Inicio | `index.html` | ✅ | ✅ | ✅ (IGDB y Supabase) | ⬜ |
| 3. Buscar juegos | `pages/buscar-juegos.html` | ✅ | ✅ | ✅ (catálogo real de IGDB) | ⬜ |
| 4. Juego random | `pages/juego-random.html` | ✅ | ✅ | ✅ (catálogo real de IGDB) | ⬜ |
| 5. MatchPlay | `pages/matchplay.html` | ✅ | ✅ | ✅ (tendencias de Supabase; chats en el navegador) | ⬜ |
| 6. Detalle de juego | `pages/detalle-juego.html` | ✅ | ✅ | ✅ (IGDB y Supabase) | ⬜ |
| 7. Ventana: Dificultad de 1 a 10 | dentro de `pages/detalle-juego.html` | ✅ | ✅ | ✅ (texto fijo) | ⬜ |

## Opinar

| Pantalla | Archivo | Separada | Con kit | Datos | Revisada vs spec |
|---|---|---|---|---|---|
| 8. Escribir reseña | `pages/escribir-resena.html` | ✅ | ✅ | ✅ (IGDB y Supabase: guarda reseñas, borradores y diario) | ⬜ |
| 9. Ventana: Publicación confirmada | dentro de `pages/escribir-resena.html` | ✅ | ✅ | ✅ (Supabase; XP de la base) | ⬜ |
| 10. Ventana: Necesitas una cuenta | se abre en varias páginas | ✅ | ✅ | ✅ (texto fijo) | ⬜ |
| 11. Comunidad | `pages/comunidad.html` | ✅ | ✅ | ✅ (Supabase) | ⬜ |
| 12. Detalle de reseña | `pages/detalle-resena.html` | ✅ | ✅ | ✅ (Supabase: lee y guarda útil, me gusta, comentarios y eliminar) | ⬜ |

## Eventos

| Pantalla | Archivo | Separada | Con kit | Datos | Revisada vs spec |
|---|---|---|---|---|---|
| 2. Ventana: Evento del mes | dentro de `index.html` | ✅ | ✅ | ✅ (Supabase) | ⬜ |
| 13. Eventos | `pages/eventos.html` | ✅ | ✅ | ✅ (Supabase) | ⬜ |
| 14. Detalle de evento | `pages/detalle-evento.html` | ✅ | ✅ | ✅ (Supabase) | ⬜ |
| 15. Ventana: Inscripción confirmada | dentro de `pages/detalle-evento.html` | ✅ | ✅ | ✅ (navegador; falta pasar a la tabla **inscripciones**) | ⬜ |

## Cuenta, perfil y amigos

| Pantalla | Archivo | Separada | Con kit | Datos | Revisada vs spec |
|---|---|---|---|---|---|
| 16. Iniciar sesión | `pages/iniciar-sesion.html` | ✅ | ✅ | ✅ (Supabase: usuarios) | ⬜ |
| 17. Crear cuenta | `pages/crear-cuenta.html` | ✅ | ✅ | ✅ (Supabase: usuarios) | ⬜ |
| 18. Perfil | `pages/perfil.html` | ✅ | ✅ | ✅ (Supabase y Steam; misiones con api/steam/misiones.js) | ⬜ |
| 19. Ventana: Cómo ganar XP | dentro de `pages/perfil.html` | ✅ | ✅ | ✅ (misiones de Supabase) | ⬜ |
| 20. Editar perfil | `pages/editar-perfil.html` | ✅ | ✅ | ✅ (Supabase: guarda perfil público, favoritos y géneros) | ⬜ |
| 21. Diario | `pages/diario.html` | ✅ | ✅ | ✅ (Supabase) | ⬜ |
| 22. Historial de reseñas | `pages/historial-resenas.html` | ✅ | ✅ | ✅ (Supabase: eliminar en la base) | ⬜ |
| 23. Logros | `pages/logros.html` | ✅ | ✅ | ✅ (Steam; otras plataformas simuladas en data.js) | ⬜ |
| 24. Amigos | `pages/amigos.html` | ✅ | ✅ | ✅ (Supabase: lee y guarda amistades y solicitudes; en línea en vivo) | ⬜ |
| 25. Perfil de otro usuario | `pages/perfil-usuario.html` | ✅ | ✅ | ✅ (Supabase: agregar y eliminar amigo en la base; en línea en vivo) | ⬜ |
| 26. Ventana: Notificaciones | se abre en todas las páginas (campana) | ✅ | ✅ | ✅ (avisos de ejemplo de data.js y de precios de Steam; falta leer la tabla **notificaciones**) | ⬜ |
| 30. Biblioteca | `pages/biblioteca.html` | ✅ | ✅ | ✅ (datos reales de Steam) | ⬜ |
| 31. Menú de la cuenta | se abre en todas las páginas (nombre o avatar de la barra) | ✅ | ✅ | ✅ (sesión) | ⬜ |

## Ayuda

| Pantalla | Archivo | Separada | Con kit | Datos | Revisada vs spec |
|---|---|---|---|---|---|
| 27. Contáctanos | `pages/contacto.html` | ✅ | ✅ | ✅ (listas fijas de data.js; el mensaje se guarda en Supabase) | ⬜ |
| 28. Ventana: Mensaje guardado | dentro de `pages/contacto.html` | ✅ | ✅ | ✅ (Supabase) | ⬜ |
| 29. Error y estado de servicios | `404.html` (en la raíz) | ✅ | ✅ | ✅ (data.js + revisión en vivo de IGDB, Steam y Supabase) | ⬜ |

## Lo que falta

Pasar a Supabase (las tablas ya existen en `esquema.sql`; hoy se guarda en el navegador):
- **Lista de deseos de SaveSlot** (Detalle de juego y Perfil): se lee de la base, pero agregar y quitar quedan en el navegador.
- **Cuentas vinculadas** (Editar perfil, tabla **cuentas_vinculadas**): al pasarla, la base dará los +100 XP de la misión «vincular».
- **Inscripciones a eventos y sorteos** (Detalle de evento y Perfil): la base ya cuenta los cupos, revisa el XP mínimo y suma el XP.
- **Chats de MatchPlay** (tablas **chats_matchplay** y **mensajes_matchplay**).
- **Notificaciones** (la campana): la base ya crea los avisos de «útil», pero la campana muestra los de ejemplo.
- **Vistos recientemente** (Inicio, tabla **vistos_recientes**).

Arreglos:
- Editar perfil deja elegir solo 9 géneros (los de los juegos de ejemplo); la base acepta los 15.
- Las descripciones de IGDB se traducen cada vez con el enlace gratis de Google; falta guardarlas en la tabla **traducciones** y pasar a DeepL.
- Opcional: desactivar los inicios de sesión anónimos en Supabase (el invitado ya no los usa).

Después (así lo marca spec.md): mensajes entre amigos, clips y pagos.

Revisión: la columna «Revisada vs spec» sigue en ⬜ en todas las pantallas.

## Pendientes para la revisión vs spec
- **Amigos (noviembre)**: con una cuenta real, enviar, aceptar, rechazar, cancelar y eliminar amistades se guardan en Supabase (en Amigos, Perfil de otro usuario y «+ Agregar amigo» de Detalle de reseña); la otra persona ve tu solicitud. Eliminar ahora pide confirmación en vez de «Deshacer».
- **En línea (noviembre)**: funciona con la presencia de Supabase Realtime (canal `en-linea`): al abrir cualquier página, una cuenta real avisa que está conectada y qué juega (lo de «¿Qué estás jugando?» o, en automático, su juego de Steam). Amigos (resumen, pestaña «En línea», orden y tarjetas) y Perfil de otro usuario (anillo del avatar y actividad) cambian en vivo, sin recargar. Desconectado muestra «hace X» con la columna nueva `usuarios.ultima_conexion` (sección 7 de esquema.sql). Las demás pantallas muestran el estado del momento en que se abrieron. Límite: el canal es público, así que alguien con conocimientos podría aparecer «en línea» con un @ que no es suyo (solo afecta ese punto verde, no los datos).
- **Editar perfil (noviembre)**: con una cuenta real, «Guardar» guarda en Supabase el nombre, el @, sobre mí, qué estás jugando, los favoritos y los géneros; al abrir cualquier página el perfil se trae de la base. Siguen en el navegador la lista de deseos y las cuentas vinculadas (tabla **cuentas_vinculadas**). Los géneros que se pueden elegir salen de los juegos de ejemplo (9), no de los 15 de la base.
- **Detalle de reseña e Historial (noviembre)**: con una cuenta real, el «útil» (en todas las pantallas), el me gusta, los comentarios y eliminar la reseña propia se guardan en Supabase. Borrar el comentario propio es nuevo (spec.md solo dejaba agregar). Eliminar, en el Historial y en los comentarios, pide confirmación en vez de «Deshacer», porque en la base no se puede deshacer.
- **Invitado (noviembre)**: «Entrar con la cuenta de demostración» ahora es «Entrar como invitado»: perfil vacío, solo en el navegador, sin cuenta en Supabase (ya no muestra el perfil de ejemplo de samluq).
- **Datos de ejemplo (noviembre)**: las personas de ejemplo (samluq, kenvel…) y lo suyo se borraron de Supabase (`supabase/limpiar-ejemplos.sql`) y `esquema.sql` ya no las carga: Inicio, Comunidad y los perfiles muestran solo cuentas reales (pueden verse casi vacíos al principio). El voto «útil» ahora se puede quitar tocándolo otra vez (spec.md lo prohibía; se cambió).
- **Escribir reseña (noviembre)**: con una cuenta real (correo, servicio o Steam) publica, edita y guarda borradores en Supabase, y registra el juego en el diario; lo propio (mis reseñas y mi diario) se lee de la base. El invitado guarda en el navegador. Las reseñas y el diario que las cuentas reales tenían solo en el navegador ya no se muestran. Borrar una reseña (Detalle de reseña e Historial) también es en la base.
- **Perfil, panel Misiones (noviembre)**: no está en el diseño. 3 diarias y 3 semanales de juegos (horas y logros de Steam) con su barra de avance (`.medidor`), XP y cuándo se reinician; cada grupo empieza con un `.separador` («Diarias · se reinician en 5 h»); se comprueban en `api/steam/misiones.js`. Las horas solo cuentan desde la primera vez que la persona abre SaveSlot ese día o esa semana.
- **Datos de Supabase (noviembre)**: las pantallas leen de Supabase usuarios, reseñas, comentarios, diario, amistades, eventos, tendencias, destacados y misiones (`obtenerDatos()` en app.js; `js/data.js` queda como registro). Mientras llegan se ve «Cargando…» y, si Supabase falla, «No pudimos cargar la información». Lo que todavía está en el navegador está en «Lo que falta». Diferencias con los datos de ejemplo: los votos «útil» y me gusta empiezan en 0, «en línea» y «jugando» salen de la presencia de Supabase, «juegos en común» solo cuenta el diario que hay en la base y las solicitudes de amistad pendientes solo las ven sus dos personas.
- **Iniciar sesión y Crear cuenta**: los botones «Pronto» de Google y Discord del diseño ahora son cuatro (Google, Discord, Twitch y Steam) con su logo (`.boton__logo`), debajo del formulario de la cuenta de SaveSlot. Todos funcionan: Steam con `api/steam/auth.js` y Google, Discord y Twitch con Supabase Auth (si fallan, llevan a la página de error). El correo usa Supabase Auth y pide confirmar la cuenta por correo (el diseño pasaba directo a Editar perfil). «Entrar como invitado» no crea cuenta: lo suyo queda en el navegador.
- **404.html**: tiene 5 variantes nuevas de «no encontrado» (página, juego, evento, reseña y usuario) y una de «acceso» (falló entrar con Google, Discord o Twitch) que el diseño no traía; la de página es la que sale por defecto. Se quitaron las variantes del diseño a las que no lleva ninguna pantalla (plataforma sin API, pagos y función no disponible). El estado de IGDB, Steam, la base y las cuentas se revisa de verdad al abrir la página; la tabla ya no se corta en computador. En Vercel, una línea en el <head> hace que los archivos se busquen desde la raíz del sitio.
- **Mensaje (Amigos y Perfil de otro usuario)**, clips y pagos: siguen visibles como en el diseño, aunque la spec los marca como **Después**.
- **Foto de perfil (Editar perfil)**: ya funciona con Supabase Storage (carpeta `avatares`), aunque el diseño decía que llegaba después. Los demás la ven en reseñas, amigos y perfiles (columna `foto` de **usuarios**).
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
- **Traducción de descripciones (api/igdb.js)**: usa por ahora el enlace gratis de Google Translate, que no es oficial. Falta guardar cada traducción una sola vez en la tabla **traducciones** y pasar a DeepL (poner `DEEPL_API_KEY` en Vercel).
- **Steam (noviembre)**: perfil, biblioteca, logros, lista de deseos, juegos recientes y reseñas de Steam ya son reales (`api/steam/`), y cada ficha de juego muestra precio, nota y jugadores de Steam (tabla **juegos** de Supabase, actualizada cada día). Las portadas de Steam están permitidas en `CLAUDE.md`. Las reseñas de Steam se leen de las páginas públicas de la comunidad: si Steam las cambia, hay que ajustar el código.
- **Perfil y Editar perfil**: el @ ya se puede cambiar (el diseño decía que no); las cuentas vinculadas van debajo del nombre. El @ se compara con todas las cuentas de la tabla **usuarios** (si alguien lo toma mientras editas, avisa «Ese usuario ya existe»).
- **Biblioteca y Menú de la cuenta**: no tienen diseño en disenos/; se hicieron con el kit (`.menu-usuario` es un componente nuevo, en componentes.html). Cada juego de la Biblioteca lleva bajo la portada la etiqueta de su cuenta con el logo (`.etiqueta__logo`, nueva en el kit).
- **Aviso de baja de precio (noviembre)**: con Steam vinculado, cada 6 horas se revisa la lista de deseos de Steam; si un juego entra en oferta o su descuento sube, sale un aviso flotante («Ver» lleva a Lista de deseos) y queda 7 días en Notificaciones. Lo ya avisado se guarda en el navegador (`ss.steamPreciosAvisados`, `ss.avisosPrecio`).
- **Google, Discord y Twitch (noviembre)**: entran con Supabase Auth. En las consolas de Google Cloud, Discord y Twitch la dirección de regreso debe ser `https://jzshrfiezzysbkzdsjzf.supabase.co/auth/v1/callback`. Google sigue en modo «Prueba»: solo entran los usuarios de prueba hasta publicar la app.
- **Unir cuentas y borrar cuenta (noviembre, Editar perfil)**: el diseño no traía «Formas de entrar» ni «Borrar cuenta». Google, Discord y Twitch se vinculan a la misma cuenta (Supabase Auth, vinculación manual activada) y Steam se guarda en la cuenta abierta en vez de crear otra (`api/steam/auth.js?action=preparar`). «Borrar cuenta» necesita haber corrido `supabase/borrar-cuenta.sql` en el SQL Editor.

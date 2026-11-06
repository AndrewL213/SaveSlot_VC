# Pantallas de SaveSlot

Avance de cada pantalla de spec.md, por tramo del flujo. Las páginas salen de los diseños v3 (disenos/).

- **Separada**: tiene su propia página (o vive dentro de la página indicada, si es una ventana).
- **Con kit**: usa solo css/tokens.css y css/components.css, sin el andamio del prototipo (css/prototipo.css y js/prototipo.js, ya borrados).
- **Datos en data.js**: sus datos simulados salen de js/data.js, separados del diseño (o de Supabase/IGDB, si son Real).
- **Revisada vs spec**: cumple todos sus criterios de «Está lista cuando» en spec.md.

## Descubrir

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 1. Inicio | `index.html` | ✅ | ✅ | ✅ | ⬜ |
| 3. Buscar juegos | `pages/buscar-juegos.html` | ✅ | ✅ | ✅ | ⬜ |
| 4. Juego random | `pages/juego-random.html` | ✅ | ✅ | ✅ | ⬜ |
| 5. MatchPlay | `pages/matchplay.html` | ✅ | ✅ | ✅ | ⬜ |
| 6. Detalle de juego | `pages/detalle-juego.html` | ✅ | ✅ | ✅ | ⬜ |
| 7. Ventana: Dificultad de 1 a 10 | dentro de `pages/detalle-juego.html` | ✅ | ✅ | ✅ | ⬜ |

## Opinar

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 8. Escribir reseña | `pages/escribir-resena.html` | ✅ | ✅ | ✅ | ⬜ |
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

## Ayuda

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 27. Contáctanos | `pages/contacto.html` | ✅ | ✅ | ✅ | ⬜ |
| 28. Ventana: Mensaje guardado | dentro de `pages/contacto.html` | ✅ | ✅ | ✅ | ⬜ |
| 29. Error y estado de servicios | `404.html` (en la raíz) | ✅ | ✅ | ✅ | ⬜ |

## Pendientes para la revisión vs spec
- **404.html**: tiene 5 variantes nuevas de «no encontrado» (página, juego, evento, reseña y usuario) que el diseño no traía; la de página es la que sale por defecto. En Vercel, una línea en el <head> hace que los archivos se busquen desde la raíz del sitio.
- **Mensaje (Amigos y Perfil de otro usuario)**, clips, pagos, Google y Discord y foto de perfil: siguen visibles como en el diseño, aunque la spec los marca como **Después**.
- **Index.html**: la cabecera de la v3 viene con los estilos de una vista previa; en la app ya está arreglada (igual que en noviembre).
- **Datos fuera de spec.md** (agregarlos a la sección Datos): variantesError, estadoServicios, meGusta, destacado, destacadosInicio, porcentajeUtil de las guías, horasAtras de los chats de ejemplo, respuestasMatchplay, en las reseñas propias estadoPartida (estado de la partida) y editada, y en los eventos descripcion y cronograma.
- **Comunidad, pestaña Guías**: cada guía abre su juego (como en el diseño), no un Detalle de reseña; las guías de ejemplo no tienen texto completo.
- **Detalle de evento**: la banda usa el color de cada evento (el diseño usa azul fijo para torneos y verde para sorteos). Premio, costo y organizadores siguen con los textos entre corchetes del diseño hasta tener los datos reales en Supabase.
- **Notificaciones**: no muestra el aviso de comentarios del diseño («Kenneth y Daniela comentaron…»), porque la spec solo define avisos de votos «útil» y de cierre de inscripciones; las ventanas del kit no llevan el ícono de arriba del diseño.
- **Avatares**: los de amigos no llevan el color de fondo de cada persona como en el diseño (el avatar del kit no tiene esa opción).
- **Perfil de otro usuario**: «Juegos» cuenta los juegos que la persona calificó (el diseño suma un número fijo); el avatar grande es azul y no del color de la persona.

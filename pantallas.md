# Pantallas de SaveSlot

Avance de cada pantalla de spec.md, por tramo del flujo.

- **Separada**: tiene su propia página (o vive dentro de la página indicada, si es una ventana).
- **Con kit**: usa solo css/tokens.css y css/components.css, ya no el andamio (css/prototipo.css y js/prototipo.js).
- **Datos en data.js**: sus datos simulados salen de js/data.js, separados del diseño.
- **Revisada vs spec**: cumple todos sus criterios de «Está lista cuando» en spec.md.

## Descubrir

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 1. Inicio | `index.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 3. Buscar juegos | `pages/buscar-juegos.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 4. Juego random | `pages/juego-random.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 5. MatchPlay | `pages/matchplay.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 6. Detalle de juego | `pages/detalle-juego.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 7. Ventana: Dificultad de 1 a 10 | dentro de `pages/detalle-juego.html` | ✅ | ⬜ | ⬜ | ⬜ |

## Opinar

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 8. Escribir reseña | `pages/escribir-resena.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 9. Ventana: Publicación confirmada | dentro de `pages/escribir-resena.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 10. Ventana: Necesitas una cuenta | se abre en varias páginas | ✅ | ⬜ | ⬜ | ⬜ |
| 11. Comunidad | `pages/comunidad.html` | ✅ | ⬜ | ⬜ | ⬜ |

## Eventos

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 2. Ventana: Evento del mes | dentro de `index.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 12. Eventos | `pages/eventos.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 13. Detalle de evento | `pages/detalle-evento.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 14. Ventana: Inscripción confirmada | dentro de `pages/detalle-evento.html` | ✅ | ⬜ | ⬜ | ⬜ |

## Cuenta y perfil

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 15. Iniciar sesión | `pages/iniciar-sesion.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 16. Crear cuenta | `pages/crear-cuenta.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 17. Perfil | `pages/perfil.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 18. Ventana: Cómo ganar XP | dentro de `pages/perfil.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 19. Editar perfil | `pages/editar-perfil.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 20. Diario | `pages/diario.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 21. Logros | `pages/logros.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 22. Ventana: Notificaciones | se abre en todas las páginas (campana) | ✅ | ⬜ | ⬜ | ⬜ |

## Ayuda

| Pantalla | Archivo | Separada | Con kit | Datos en data.js | Revisada vs spec |
|---|---|---|---|---|---|
| 23. Contáctanos | `pages/contacto.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 24. Ventana: Mensaje guardado | dentro de `pages/contacto.html` | ✅ | ⬜ | ⬜ | ⬜ |
| 25. Error y estado de servicios | `404.html` (en la raíz) | ✅ | ⬜ | ⬜ | ⬜ |

## Pendientes para la revisión vs spec
- **404.html**: cuando un juego o evento no existe, muestra el texto por defecto («Un servicio externo no está respondiendo»), porque el diseño no tiene un texto para "no encontrado".
- **Contáctanos**: todavía muestra la tarjeta de correo y redes, que la spec quita del MVP.
- Los elementos que la spec marca como **Después** (clips, pagos, Google y Discord, foto de perfil, etc.) siguen visibles como en el diseño.

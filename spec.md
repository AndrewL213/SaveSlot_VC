# Spec · SaveSlot

Plano de la app: qué se construye, en qué orden y cuándo está lista cada pantalla.
Fuentes: Brief-SaveSlot.md, Flujogramas.pdf (repo SaveSlot-Info) y los diseños de disenos/ (versión 3).

Leyenda de "Qué funciona de verdad":
- **Real**: funciona y se guarda (solo con nuestras integraciones de backend).
- **Simulado**: se ve y se puede tocar, pero con datos de mentira.
- **Después**: no entra en el MVP.
Los enlaces que solo llevan a otra pantalla siempre funcionan y no se clasifican.

**Portadas:** todas las portadas de juegos se ven con su imagen, en cualquier pantalla: listas, resultados, perfiles, diario, historial y amigos. Si el juego tiene imagen en `assets/`, se usa esa; si no, la portada que trae IGDB (desde images.igdb.com), con crédito a IGDB. Solo si IGDB no tiene portada se usa el rectángulo de color de respaldo.

## Integraciones de backend del MVP
- **Supabase**: todo lo que se guarda.
  - Cuentas: crear cuenta, iniciar sesión y sesión de invitado (la "cuenta de demostración").
  - Base de datos: reseñas y borradores, comentarios, diario, perfil, amigos, eventos, inscripciones, notificaciones, chats de MatchPlay, tendencias, vistos recientemente y mensajes de contacto.
  - Presencia: quién está en línea.
  - Su clave pública va en el código; los datos se protegen con reglas de acceso en la base.
- **IGDB** (de Twitch): catálogo de juegos (búsqueda, filtros, ficha y tiempos para terminar). Sus claves (Client ID y Client Secret de Twitch) se guardan en Vercel y se usan solo desde una función en `api/`, que también renueva el token de acceso; nunca van en el código del navegador (IGDB tampoco acepta pedidos directos desde el navegador). Uso no comercial: si SaveSlot se vuelve comercial, hay que pedir permiso a Twitch.
  - La función es `api/igdb.js`. Acepta solo tres pedidos: `?buscar=texto` (hasta 20 juegos), `?id=slug` (la ficha de un juego) y `?populares=1` (los 10 más visitados en IGDB, para "Mejores juegos de la semana"). Devuelve los juegos con el mismo formato de `js/data.js` y, si algo falla, el nombre de la variante de la página de error (`credenciales`, `limite`, `tiempo`, `api` o `juego`).
  - Vercel guarda cada respuesta una hora, para hacer menos consultas a IGDB.
  - IGDB tiene la descripción de los juegos solo en inglés. La ficha (`?id=`) la traduce al español con **DeepL** (plan gratis: 500.000 caracteres al mes; clave `DEEPL_API_KEY` en Vercel). En las listas (`?buscar=` y `?populares=1`) queda en inglés para no gastar el cupo; cada juego trae `idiomaDescripcion` (`es` o `en`). Si DeepL falla o se acaba el cupo, la ficha llega igual, en inglés.
  - Mientras no esté conectada (o abriendo los archivos directo en el navegador), la app usa los juegos de `js/data.js`.
- Siguen **Simulados** solo lo que depende de servicios externos que no están en el MVP: las respuestas de la IA de MatchPlay, los logros (también los logros totales de cada juego, que IGDB no da) y la vinculación con Steam y Xbox, y el estado de los servicios.

## Flujo

Se puede entrar y explorar sin cuenta. La cuenta se pide solo al escribir, comentar, inscribirse, agregar amigos o ver el perfil propio.

1. **Descubrir un juego** (flujograma "Buscador")
   Inicio → Buscar juegos (con filtros) → Detalle de juego → "Si te gusta, prueba" (otro Detalle de juego)
   Caminos alternos: Inicio → Juego random → Detalle de juego · Inicio → MatchPlay (IA) → Detalle de juego
2. **Opinar sobre un juego** (flujogramas "Página del juego" y "Reseñas")
   Detalle de juego → Escribir reseña → [sin cuenta: Necesitas una cuenta → Iniciar sesión o Crear cuenta] → Publicación confirmada → Detalle de juego
   Comunidad, Detalle de juego o Inicio → Detalle de reseña (leer, votar, comentar; editar o eliminar si es propia)
3. **Participar en un evento** (flujograma "Eventos")
   Inicio (ventana Evento del mes) → Eventos → Detalle de evento (torneo o sorteo) → [sin cuenta: Necesitas una cuenta] → Inscripción confirmada → Perfil (Mis eventos)
4. **Cuenta, perfil y amigos** (flujograma "Cuenta y perfil")
   Crear cuenta (paso 1) → Editar perfil (pasos 2 y 3: vincular plataformas y elegir favoritos) → Perfil → Diario · Historial de reseñas · Logros · Editar perfil
   Perfil o Comunidad → Amigos → Perfil de otro usuario
   Iniciar sesión (o entrar como invitado) → la pantalla donde estaba
5. **Ayuda**: desde cualquier pantalla → Contáctanos. Si algo falla → Error.

## Datos

Solo lo que se ve o se guarda en los diseños. Entre paréntesis, de dónde sale.

- **juegos** (IGDB): id, nombre, nombre corto, géneros, plataformas, año, desarrolladora, tipo (AAA o Indie: Indie si IGDB le pone ese género), horas de la historia ("Time to beat" de IGDB), descripción, portada (de `assets/` o de IGDB), color de respaldo (solo los juegos con imagen en `assets/`; los demás usan el neutro del kit)
  - Datos de ejemplo: logros totales (IGDB no los da)
  - Calculados con nuestras reseñas (Supabase): dificultad promedio (1–10), calificación, número de votos, horas al 100 %
- **reseñas** (Supabase): id, juego, autor, tipo (reseña o guía), estado (publicada o borrador), título (opcional), texto, calificación (1–10), dificultad (1–10), horas jugadas, minutos de lectura (guías), contiene spoilers, votos de "útil", fecha
- **comentarios** (Supabase): reseña, autor, texto, fecha
- **diario** (Supabase): usuario, juego, fecha, estado (Terminado, Rejugado, En progreso o Abandonado), horas, calificación, me gusta, tiene reseña
- **usuarios** (Supabase): nombre visible, usuario, correo, invitado (sí o no), sobre mí, jugando ahora, miembro desde, nivel, XP, 4 juegos favoritos, géneros favoritos, lista de deseos, insignias, iniciales
  - Estado: "en línea" sale de la presencia de Supabase; "jugando" sale de "jugando ahora"
- **amigos** (Supabase): usuario, amigo, estado (amigos, solicitud enviada o solicitud recibida), fecha
- **eventos** (Supabase): id, tipo (torneo o sorteo), juego, título, fecha y hora, organizador, tipo de organizador, cupos ocupados, cupos máximos, costo, gratis (sí o no), premio, reglas
- **inscripciones** (Supabase): usuario, evento, nombre del equipo, compañero, forma de participar (XP o pago)
- **notificaciones** (Supabase): usuario, tipo (voto "útil" a una reseña tuya o cierre de inscripciones de un evento tuyo), texto, fecha
- **chats de MatchPlay** (Supabase): usuario, título, fecha, mensajes (quién habla y texto), voto de "útil" por respuesta. Las respuestas de la IA son simuladas.
- **tendencias de MatchPlay** (Supabase): etiqueta, pregunta, cantidad de preguntas hoy
- **vistos recientemente** (Supabase; sin sesión, en el navegador): usuario, los últimos 6 juegos abiertos
- **mensajes de contacto** (Supabase): nombre, correo, tema, mensaje, fecha
- **logros** (datos de ejemplo): juego, nombre, descripción, % de jugadores que lo tienen, obtenido (sí o no), plataforma
- **cuentas vinculadas** (datos de ejemplo): usuario, plataforma (Steam, Xbox, PlayStation o Nintendo), nombre en la plataforma, estado

## Pantallas

### 1. Inicio
- **Archivo de diseño:** disenos/index.html (comparte archivo con la ventana "Evento del mes")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda empezar a buscar un juego o descubrir qué jugar y qué eventos hay. Sabemos que funciona si la persona usa el buscador o un atajo en su primera visita.
- **Contenido:**
  1. Título, buscador y 3 portadas destacadas
  2. Atajos: Juego random, Recomiéndame algo corto, Torneos de esta semana
  3. Vistos recientemente (solo si ya visitó juegos)
  4. Mejores juegos de la semana
  5. Reseñas destacadas
  6. Eventos: el evento del mes y un sorteo
- **Qué funciona de verdad:**
  - Buscador y Mejores juegos de la semana: Real (IGDB)
  - Reseñas destacadas y votar "útil": Real (Supabase)
  - Vistos recientemente: Real (Supabase; sin sesión, en el navegador)
  - Eventos: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Al buscar "Hades", lleva a Buscar juegos con ese texto ya escrito.
  - "Vistos recientemente" solo aparece después de abrir al menos un juego.
  - La ventana "Evento del mes" sale una sola vez por visita y se puede cerrar.

### 2. Ventana: Evento del mes
- **Archivo de diseño:** disenos/index.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda enterarse del evento destacado sin buscarlo. Sabemos que funciona si se toca "Ver evento" más veces de las que se cierra.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - "Ver evento" abre el Detalle de ese evento.
  - Se cierra con la X y con la tecla Escape.

### 3. Buscar juegos
- **Archivo de diseño:** disenos/buscar.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda encontrar un juego por nombre o con filtros. Sabemos que funciona si la persona abre un juego desde los resultados.
- **Contenido:**
  1. Buscador
  2. Cantidad de resultados
  3. Lista de resultados con portada
  4. Filtros: género, plataforma, tipo, duración de la historia, año
  5. Botones Juego random y Limpiar filtros
- **Qué funciona de verdad:**
  - Búsqueda y filtros: Real (IGDB)
  - Sugerencias automáticas al escribir (del flujograma): Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho): los filtros se abren con el botón "Filtros".
  - Cada filtro cambia la lista y el número de resultados.
  - "Limpiar filtros" muestra todos los juegos otra vez.
  - Si no hay resultados, se ve un mensaje y no una lista vacía.

### 4. Juego random
- **Archivo de diseño:** disenos/random.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda recibir una sugerencia al azar de un género. Sabemos que funciona si la persona abre el juego sugerido.
- **Contenido:**
  1. Selector de género
  2. Juego sugerido (portada, datos y enlace a su página)
  3. Botón para pedir otro
- **Qué funciona de verdad:** Sugerencia: Real (IGDB)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con su portada (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Al elegir un género, el juego sugerido es de ese género.
  - "Otro" muestra un juego distinto al anterior.

### 5. MatchPlay
- **Archivo de diseño:** disenos/matchplay.html (estado inicial con tendencias y estado de conversación)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda preguntarle a una IA por juegos, recomendaciones o logros. Sabemos que funciona si la persona hace al menos una segunda pregunta en el mismo chat.
- **Contenido:**
  1. Caja para escribir y enviar
  2. Saludo e ideas para preguntar
  3. Tendencias
  4. Conversación
  5. Biblioteca de chats (nuevo chat, buscar, borrar)
  6. Aviso "MatchPlay puede equivocarse"
- **Qué funciona de verdad:**
  - Respuestas de la IA: Simulado
  - Guardar chats, borrarlos y votar respuestas: Real (Supabase)
  - Tendencias: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho): la biblioteca se abre con "Mis chats".
  - Al enviar un mensaje aparece la respuesta y el chat se agrega a la biblioteca.
  - Tocar una tendencia empieza un chat con esa pregunta.
  - "Nuevo chat" vuelve al saludo.

### 6. Detalle de juego
- **Archivo de diseño:** disenos/juego.html (pestañas Reseñas, Guías, Clips y Logros, y la ventana "Dificultad de 1 a 10")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver todo sobre un juego en un solo lugar. Sabemos que funciona si la persona lee reseñas o guías, o agrega el juego a su lista de deseos.
- **Contenido:**
  1. Portada, nombre, plataformas
  2. Botones: Escribir reseña, Lista de deseos, Preguntar a MatchPlay
  3. Datos clave (tiempo, dificultad, calificación, logros)
  4. Pestañas: Reseñas, Guías, Clips, Logros
  5. Ficha del juego
  6. "Si te gusta, prueba"
- **Qué funciona de verdad:**
  - Ficha, datos y "Si te gusta, prueba": Real (IGDB)
  - Dificultad, calificación y horas al 100 %: Real (calculados con reseñas de Supabase)
  - Pestañas Reseñas y Guías, votar "útil": Real (Supabase)
  - Editar o eliminar mi reseña: Real (Supabase)
  - Lista de deseos: Real (Supabase)
  - Pestaña Logros: Simulado
  - Pestaña Clips: Después (el diseño dice que llega con la API de Twitch)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con su portada (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Cada pestaña muestra su contenido y su número.
  - "+ Lista de deseos" cambia de estado y el juego aparece en el Perfil.
  - Las reseñas con spoiler se ven ocultas hasta tocarlas.

### 7. Ventana: Dificultad de 1 a 10
- **Archivo de diseño:** disenos/juego.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda entender cómo se calcula la dificultad. Sabemos que funciona si la persona la cierra y sigue en el juego.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Se abre desde "¿Cómo se calcula?" y se cierra con la X o con Escape.

### 8. Escribir reseña
- **Archivo de diseño:** disenos/resena.html (tipos Reseña, Guía y Clip; también sirve para editar una reseña propia)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda registrar un juego en su diario y publicar su opinión. Sabemos que funciona si la persona publica sin abandonar a mitad del formulario.
- **Contenido:**
  1. Juego que se reseña, con su portada
  2. Tipo: Reseña, Guía o Clip
  3. Registro en el diario: fecha, estado, horas, me gusta
  4. Calificación de 1 a 10
  5. Dificultad de 1 a 10
  6. Título y texto (mínimo 50 caracteres), spoilers
  7. Guardar borrador y Publicar (+50 XP)
- **Qué funciona de verdad:**
  - Publicar o editar reseña o guía y registrar en el diario: Real (Supabase)
  - Guardar borrador: Real (Supabase)
  - Subir clip: Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con su portada (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - No deja publicar con menos de 50 caracteres y muestra el error.
  - Al publicar, la reseña aparece en el juego, en el Diario y en el Historial.
  - Sin sesión iniciada, sale la ventana "Necesitas una cuenta".

### 9. Ventana: Publicación confirmada
- **Archivo de diseño:** disenos/resena.html (ventana emergente "Reseña publicada" / "Guía publicada")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda confirmar que su reseña se publicó. Sabemos que funciona si la persona ve su reseña publicada en el juego.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Dice si se publicó una reseña o una guía, e indica los XP ganados.

### 10. Ventana: Necesitas una cuenta
- **Archivo de diseño:** sale desde disenos/js/app.js en varias pantallas
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda crear cuenta o entrar sin perder lo que estaba haciendo. Sabemos que funciona si la persona crea cuenta o entra en vez de cerrarla.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - "Crear cuenta gratis" y "Ya tengo cuenta" llevan a esas pantallas y, al terminar, vuelven a donde estaba.

### 11. Comunidad
- **Archivo de diseño:** disenos/comunidad.html (pestañas Reseñas, De tus amigos y Guías)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda leer y votar reseñas y guías de otros jugadores. Sabemos que funciona si la persona vota "útil" o abre un juego desde una reseña.
- **Contenido:**
  1. Pestañas Reseñas, De tus amigos y Guías
  2. Orden: Más útiles o Más recientes
  3. Lista de tarjetas
  4. Botones Escribir una reseña, Mi historial de reseñas y Mis amigos
- **Qué funciona de verdad:** Lista, reseñas de amigos y votos: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cambiar de pestaña cambia la lista; "De tus amigos" solo muestra reseñas de amigos.
  - Cambiar el orden reordena las tarjetas.
  - Cada tarjeta abre su Detalle de reseña.

### 12. Detalle de reseña
- **Archivo de diseño:** disenos/ver-resena.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda leer una reseña completa y conversar sobre ella. Sabemos que funciona si la persona vota "útil" o deja un comentario.
- **Contenido:**
  1. Juego, título, autor y nota
  2. Texto completo de la reseña
  3. Acciones: útil, compartir (y editar o eliminar si es propia)
  4. Comentarios: escribir uno y ver la lista
  5. Sobre el juego, datos de la partida y más reseñas del juego
- **Qué funciona de verdad:**
  - Reseña y votar "útil": Real (Supabase)
  - Comentarios: Real (Supabase)
  - Editar o eliminar la reseña propia: Real (Supabase)
  - Compartir (copiar enlace): Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con su portada (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Al abrir una reseña desde Comunidad, el juego o Inicio, se ve esa reseña.
  - No deja enviar un comentario vacío.
  - Un comentario nuevo aparece en la lista y suma al contador.

### 13. Eventos
- **Archivo de diseño:** disenos/eventos.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda encontrar torneos y sorteos de sus juegos. Sabemos que funciona si la persona abre el detalle de un evento.
- **Contenido:**
  1. Evento destacado
  2. Filtros: Todos, Torneos, Sorteos, Gratis y quién organiza
  3. Tarjetas de eventos
  4. Reglas generales y "Propón un evento"
- **Qué funciona de verdad:** Lista de eventos: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cada filtro muestra solo los eventos que corresponden.
  - Cada tarjeta abre su Detalle de evento.

### 14. Detalle de evento
- **Archivo de diseño:** disenos/evento.html (versión torneo y versión sorteo)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda conocer un evento e inscribirse. Sabemos que funciona si la persona completa la inscripción.
- **Contenido:**
  1. Título, tipo y datos (fecha, cupos, costo, premio)
  2. Formulario: equipo y compañero (torneo), forma de participar (XP o pago), aceptar reglamento
  3. Sobre el evento y cronograma
  4. Reglas
- **Qué funciona de verdad:**
  - Datos del evento: Real (Supabase)
  - Inscribirse gratis o con XP: Real (Supabase)
  - Pagar inscripción: Después (el diseño dice que los pagos aún no están disponibles)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, en versión torneo y en versión sorteo.
  - Funciona en celular (375 px de ancho).
  - No deja inscribirse sin aceptar el reglamento (y sin nombre de equipo en torneos).
  - Si no tiene 300 XP, la opción de XP del sorteo aparece desactivada.
  - Al inscribirse, el evento aparece en "Mis eventos" del Perfil.

### 15. Ventana: Inscripción confirmada
- **Archivo de diseño:** disenos/evento.html (ventana emergente "¡Estás inscrito!" / "¡Ya participas!")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda confirmar que quedó inscrito. Sabemos que funciona si la persona encuentra el evento en "Mis eventos".
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - El texto cambia según sea torneo o sorteo.

### 16. Iniciar sesión
- **Archivo de diseño:** disenos/login.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda entrar a su cuenta. Sabemos que funciona si la persona entra al primer intento.
- **Contenido:**
  1. Correo y contraseña (con mostrar u ocultar)
  2. Entrar
  3. Entrar con la cuenta de demostración
  4. Explorar sin cuenta
  5. Google y Discord
- **Qué funciona de verdad:**
  - Entrar con correo: Real (Supabase)
  - Cuenta de demostración: Real (sesión de invitado de Supabase, sin contraseña, con los datos de ejemplo cargados)
  - Google y Discord: Después (el diseño dice "Pronto")
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Con el correo mal escrito o sin contraseña, muestra el error junto al campo.
  - Al entrar, el encabezado muestra al usuario en vez de los botones de acceso.
  - La cuenta de demostración entra sin pedir datos y muestra el perfil de ejemplo.

### 17. Crear cuenta
- **Archivo de diseño:** disenos/registro.html (paso 1 de 3)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda crear su cuenta gratis. Sabemos que funciona si la persona termina el paso 1 y llega a Editar perfil.
- **Contenido:**
  1. Los 3 pasos
  2. Nombre, correo, usuario, contraseña con medidor de fuerza
  3. Aceptar términos
  4. Crear cuenta
  5. Google y Discord
- **Qué funciona de verdad:**
  - Crear cuenta: Real (Supabase)
  - Google y Discord: Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cada campo vacío o inválido muestra su error.
  - El medidor cambia según la contraseña.
  - Al crear la cuenta lleva a Editar perfil con el aviso "¡Cuenta creada!".

### 18. Perfil
- **Archivo de diseño:** disenos/perfil.html (y la ventana "Cómo ganar XP")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver su actividad y sus juegos en un solo lugar. Sabemos que funciona si la persona entra a Editar perfil, Diario o Logros desde aquí.
- **Contenido:**
  1. Portada, avatar, nombre, nivel y "jugando ahora"
  2. Estadísticas
  3. 4 juegos favoritos
  4. Actividad reciente, con enlaces a Historial de reseñas y Diario
  5. Géneros más jugados y calificaciones
  6. Lista de deseos
  7. Sobre mí, XP, Amigos, conexiones y Mis eventos
  8. Editar perfil y Compartir
- **Qué funciona de verdad:**
  - Datos del perfil, favoritos, actividad, lista de deseos, amigos y Mis eventos: Real (Supabase)
  - Quitar de lista de deseos y cancelar inscripción: Real (Supabase)
  - Conexiones (cuentas vinculadas): Simulado
  - Copiar enlace del perfil: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Muestra lo que el usuario hizo: reseñas, favoritos, deseos, amigos y eventos.
  - Sin sesión, pide iniciar sesión.

### 19. Ventana: Cómo ganar XP
- **Archivo de diseño:** disenos/perfil.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda saber cómo ganar XP. Sabemos que funciona si la persona realiza después alguna acción que da XP.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Se abre desde "¿Qué es el XP y cómo lo gano?" y se cierra con la X o con Escape.

### 20. Editar perfil
- **Archivo de diseño:** disenos/editar-perfil.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda personalizar su perfil y vincular sus plataformas. Sabemos que funciona si la persona guarda al menos un cambio.
- **Contenido:**
  1. Perfil público: nombre, sobre mí, qué estás jugando
  2. 4 juegos favoritos
  3. Géneros favoritos
  4. Cuentas vinculadas
  5. Guardar o Cancelar
- **Qué funciona de verdad:**
  - Guardar cambios (incluye "qué estás jugando", que define el estado "jugando"): Real (Supabase)
  - Vincular Steam o Xbox: Simulado
  - Vincular PlayStation o Nintendo: Después (no tienen conexión pública, según el diseño)
  - Foto de perfil: Después (el diseño dice que llega con el almacenamiento de archivos)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - No deja agregar un quinto favorito.
  - Los cambios guardados se ven en el Perfil.
  - El usuario no se puede editar.

### 21. Diario
- **Archivo de diseño:** disenos/diario.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver los juegos que jugó, por fecha. Sabemos que funciona si la persona registra un juego desde aquí.
- **Contenido:**
  1. Resumen del año
  2. Filtros por año y estado
  3. Tabla: mes, día, juego, estado, horas, calificación, me gusta, reseña
  4. Botón Registrar juego
- **Qué funciona de verdad:** Diario: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho): la tabla se vuelve tarjetas.
  - Los filtros cambian las filas.
  - Lo publicado en Escribir reseña aparece aquí.

### 22. Historial de reseñas
- **Archivo de diseño:** disenos/historial.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver y administrar todas sus reseñas. Sabemos que funciona si la persona encuentra una reseña suya con el buscador o los filtros y la abre.
- **Contenido:**
  1. Resumen de sus reseñas
  2. Buscador por juego o texto
  3. Filtro por nota y orden (recientes, mejor nota, más útiles)
  4. Lista de reseñas con portada, nota y votos
  5. Botón + Escribir reseña
- **Qué funciona de verdad:**
  - Lista, búsqueda y filtros: Real (Supabase)
  - Editar o eliminar una reseña: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Buscar, filtrar y ordenar cambian la lista y el contador.
  - Sin resultados, se ve un mensaje con "Limpiar filtros".
  - Sin reseñas, se ve "Escribir mi primera reseña".

### 23. Logros
- **Archivo de diseño:** disenos/logros.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver sus logros de todas sus plataformas juntos. Sabemos que funciona si la persona usa el filtro de plataforma.
- **Contenido:**
  1. Resumen (desbloqueados, promedio, juegos al 100 %, raros)
  2. Filtro por plataforma
  3. Progreso por juego
  4. Logros más raros
- **Qué funciona de verdad:** Logros: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - El filtro de plataforma cambia la lista y, si no hay datos, lo dice.
  - Indica que son datos de ejemplo.

### 24. Amigos
- **Archivo de diseño:** disenos/amigos.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver quién está en línea, a qué juegan sus amigos y agregar nuevos. Sabemos que funciona si la persona envía o acepta al menos una solicitud de amistad.
- **Contenido:**
  1. Resumen (amigos, en línea, jugando)
  2. Pestañas: Todos, En línea, Solicitudes, Sugerencias
  3. Buscar entre amigos por nombre o @usuario
  4. Tarjetas de amigos con su estado y juegos en común
  5. Agregar amigo por @usuario y copiar tu usuario
  6. Actividad de amigos
- **Qué funciona de verdad:**
  - Amigos, solicitudes (enviar, aceptar, rechazar, cancelar), eliminar y sugerencias: Real (Supabase)
  - Estado "en línea": Real (presencia de Supabase)
  - Estado "jugando": Real (sale de "jugando ahora" en Supabase)
  - Actividad de amigos: Real (Supabase)
  - Mensaje: Después (el diseño dice que llegará en una próxima versión)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Cada pestaña muestra solo los amigos que corresponden.
  - Enviar una solicitud sin usuario, o a uno que no existe, muestra el error.
  - Al aceptar una solicitud, la persona pasa a Todos.

### 25. Perfil de otro usuario
- **Archivo de diseño:** disenos/usuario.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda conocer a otro jugador y comparar sus gustos. Sabemos que funciona si la persona agrega al usuario como amigo o abre uno de sus juegos en común.
- **Contenido:**
  1. Portada, avatar, nombre, usuario e insignias
  2. Acciones: agregar o eliminar amigo, mensaje, compartir
  3. Estadísticas
  4. Juegos favoritos
  5. Juegos en común (su nota frente a la tuya)
  6. Reseñas recientes
  7. Actividad, sobre y amigos en común
- **Qué funciona de verdad:**
  - Perfil, favoritos, reseñas, juegos en común, actividad y amigos en común: Real (Supabase)
  - Agregar o eliminar amigo: Real (Supabase)
  - Compartir (copiar enlace): Simulado
  - Mensaje: Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Muestra el usuario que indica la dirección.
  - El botón de amistad cambia de estado al tocarlo.
  - Un usuario que no existe lleva al 404.

### 26. Ventana: Notificaciones
- **Archivo de diseño:** sale desde disenos/js/app.js (campana del encabezado, solo con sesión iniciada)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver sus avisos. Sabemos que funciona si la persona abre la ventana desde la campana.
- **Qué funciona de verdad:** Avisos: Real (Supabase): votos "útil" a tus reseñas y cierre de inscripciones de tus eventos
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - La campana solo aparece con sesión iniciada y muestra cuántos avisos hay.
  - La ventana se cierra con "Cerrar", la X o Escape.

### 27. Contáctanos
- **Archivo de diseño:** disenos/contacto.html (y la ventana "Mensaje guardado")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda pedir ayuda o proponer un torneo. Sabemos que funciona si la persona envía el mensaje sin errores.
- **Contenido:**
  1. Formulario: nombre, correo, tema, mensaje
  2. Acceso a MatchPlay
  3. Preguntas frecuentes
  (La tarjeta de correo y redes del diseño no va en el MVP.)
- **Qué funciona de verdad:** Enviar mensaje: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, sin la tarjeta de correo y redes.
  - Funciona en celular (375 px de ancho).
  - No deja enviar con campos vacíos o correo inválido.
  - Al enviar sale la ventana "Mensaje guardado".
  - Las preguntas frecuentes se abren y cierran.

### 28. Ventana: Mensaje guardado
- **Archivo de diseño:** disenos/contacto.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda confirmar que su mensaje quedó guardado. Sabemos que funciona si la persona no envía el mismo mensaje dos veces.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Se cierra y deja el formulario vacío.

### 29. Error y estado de servicios
- **Archivo de diseño:** disenos/error.html (variantes: servicio caído, límite de consultas, tiempo agotado, credenciales, mantenimiento, sin conexión, plataforma sin API, pagos, función no disponible, prototipo, estado de servicios)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda entender qué falló y qué hacer. Sabemos que funciona si la persona toca "Reintentar" o "Ir al inicio" en vez de cerrar la página.
- **Contenido:**
  1. Título y explicación del error
  2. Qué puedes hacer
  3. Botones: Reintentar, Ir al inicio, Reportar el problema
  4. Estado de los servicios
- **Qué funciona de verdad:** Estado de los servicios: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, en todas sus variantes.
  - Funciona en celular (375 px de ancho).
  - Cada variante muestra su código y sus consejos.
  - "Reportar el problema" lleva a Contáctanos.

# Spec · SaveSlot

Plano de la app: qué se construye, en qué orden y cuándo está lista cada pantalla.
Fuentes: Brief-SaveSlot.md, Flujogramas.pdf (repo SaveSlot-Info) y los diseños de disenos/.

Leyenda de "Qué funciona de verdad":
- **Real**: funciona y se guarda (solo con nuestras integraciones de backend).
- **Simulado**: se ve y se puede tocar, pero con datos de mentira.
- **Después**: no entra en el MVP.
Los enlaces que solo llevan a otra pantalla siempre funcionan y no se clasifican.

## Integraciones de backend del MVP
- **Supabase**: cuentas (crear cuenta, iniciar sesión) y base de datos (reseñas, diario, inscripciones, perfil, mensajes de contacto). Su clave pública va en el código; los datos se protegen con reglas de acceso en la base.
- **RAWG**: catálogo de juegos (búsqueda, filtros, ficha). Su clave se guarda en Vercel y se usa solo desde una función en `api/`, nunca en el código del navegador.
- Todo lo demás es Simulado o Después.

## Flujo

Se puede entrar y explorar sin cuenta. La cuenta se pide solo al escribir, inscribirse o ver el perfil.

1. **Descubrir un juego** (flujograma "Buscador")
   Inicio → Buscar juegos (con filtros) → Detalle de juego → "Si te gusta, prueba" (otro Detalle de juego)
   Caminos alternos: Inicio → Juego random → Detalle de juego · Inicio → MatchPlay (IA) → Detalle de juego
2. **Opinar sobre un juego** (flujogramas "Página del juego" y "Reseñas")
   Detalle de juego → Escribir reseña → [sin cuenta: Necesitas una cuenta → Iniciar sesión o Crear cuenta] → Publicación confirmada → Detalle de juego
   También: Comunidad → Detalle de juego o Escribir reseña
3. **Participar en un evento** (flujograma "Eventos")
   Inicio (ventana Evento del mes) → Eventos → Detalle de evento (torneo o sorteo) → [sin cuenta: Necesitas una cuenta] → Inscripción confirmada → Perfil (Mis eventos)
4. **Cuenta y perfil** (flujograma "Cuenta y perfil")
   Crear cuenta (paso 1) → Editar perfil (pasos 2 y 3: vincular plataformas y elegir favoritos) → Perfil → Diario · Logros · Editar perfil
   Iniciar sesión → la pantalla donde estaba
   Historial de reseñas y Biblioteca de juegos (del flujograma) están cubiertos por el Diario y el Perfil. Lista de amigos: Después.
5. **Ayuda**: desde cualquier pantalla → Contáctanos. Si algo falla → Error.

## Datos

Solo lo que se ve o se guarda en los diseños. Entre paréntesis, de dónde sale.

- **juegos** (RAWG): id, nombre, nombre corto, géneros, plataformas, año, desarrolladora, tipo (AAA o Indie), horas de la historia, logros totales, descripción, portada, color de respaldo
  - Calculados con nuestras reseñas (Supabase): dificultad promedio (1–10), calificación, número de votos, horas al 100 %
- **reseñas** (Supabase): juego, autor, tipo (reseña o guía), título (opcional), texto, calificación (1–10), dificultad (1–10), horas jugadas, minutos de lectura (guías), contiene spoilers, votos de "útil", fecha
- **diario** (Supabase): usuario, juego, fecha, estado (Terminado, Rejugado, En progreso o Abandonado), horas, calificación, me gusta, tiene reseña
- **usuarios** (Supabase): nombre visible, usuario, correo, sobre mí, jugando ahora, miembro desde, nivel, XP, 4 juegos favoritos, géneros favoritos, lista de deseos, iniciales
- **inscripciones** (Supabase): usuario, evento, nombre del equipo, compañero, forma de participar (XP o pago)
- **mensajes de contacto** (Supabase): nombre, correo, tema, mensaje, fecha
- **eventos** (datos de ejemplo): id, tipo (torneo o sorteo), juego, título, fecha y hora, organizador, tipo de organizador, cupos ocupados, cupos máximos, costo, gratis (sí o no), premio, reglas
- **logros** (datos de ejemplo): juego, nombre, descripción, % de jugadores que lo tienen, obtenido (sí o no), plataforma
- **cuentas vinculadas** (datos de ejemplo): usuario, plataforma (Steam, Xbox, PlayStation o Nintendo), nombre en la plataforma, estado
- **chats de MatchPlay** (datos de ejemplo, en el navegador): título, fecha, mensajes (quién habla y texto), voto de "útil" por respuesta
- **tendencias de MatchPlay** (datos de ejemplo): etiqueta, pregunta, cantidad de preguntas hoy
- **vistos recientemente** (en el navegador): los últimos 6 juegos abiertos

## Pantallas

### 1. Inicio
- **Archivo de diseño:** disenos/index.html (comparte archivo con la ventana "Evento del mes")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda empezar a buscar un juego o descubrir qué jugar y qué eventos hay. Sabemos que funciona si la persona usa el buscador o un atajo en su primera visita.
- **Contenido:**
  1. Título y buscador
  2. Atajos: Juego random, Recomiéndame algo corto, Torneos de esta semana
  3. Vistos recientemente (solo si ya visitó juegos)
  4. Mejores juegos de la semana
  5. Reseñas destacadas
  6. Eventos: el evento del mes y un sorteo
- **Qué funciona de verdad:**
  - Buscador y Mejores juegos de la semana: Real (RAWG)
  - Reseñas destacadas y votar "útil": Real (Supabase)
  - Vistos recientemente: Simulado
  - Eventos: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Al buscar "Hades", lleva a Buscar juegos con ese texto ya escrito.
  - "Vistos recientemente" solo aparece después de abrir al menos un juego.
  - La ventana "Evento del mes" sale una sola vez por visita y se cierra con "Ahora no".

### 2. Ventana: Evento del mes
- **Archivo de diseño:** disenos/index.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda enterarse del evento destacado sin buscarlo. Sabemos que funciona si se toca "Ver evento" más veces que "Ahora no".
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - "Ver evento" abre el Detalle de ese evento.
  - Se cierra con "Ahora no", con la X y con la tecla Escape.

### 3. Buscar juegos
- **Archivo de diseño:** disenos/buscar-juegos.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda encontrar un juego por nombre o con filtros. Sabemos que funciona si la persona abre un juego desde los resultados.
- **Contenido:**
  1. Buscador
  2. Cantidad de resultados
  3. Lista de resultados
  4. Filtros: género, plataforma, tipo, duración de la historia, año
  5. Botones Juego random y Limpiar filtros
- **Qué funciona de verdad:**
  - Búsqueda y filtros: Real (RAWG)
  - Sugerencias automáticas al escribir (del flujograma): Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho): los filtros se abren con el botón "Filtros".
  - Cada filtro cambia la lista y el número de resultados.
  - "Limpiar filtros" muestra todos los juegos otra vez.
  - Si no hay resultados, se ve un mensaje y no una lista vacía.

### 4. Juego random
- **Archivo de diseño:** disenos/juego-random.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda recibir una sugerencia al azar de un género. Sabemos que funciona si la persona abre el juego sugerido.
- **Contenido:**
  1. Selector de género
  2. Juego sugerido (portada, datos y enlace a su página)
  3. Botón para pedir otro
- **Qué funciona de verdad:** Sugerencia: Real (RAWG)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
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
  - Guardar chats y votar respuestas: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho): la biblioteca se abre con "Mis chats".
  - Al enviar un mensaje aparece la respuesta y el chat se agrega a la biblioteca.
  - Tocar una tendencia empieza un chat con esa pregunta.
  - "Nuevo chat" vuelve al saludo.

### 6. Detalle de juego
- **Archivo de diseño:** disenos/detalle-juego.html (pestañas Reseñas, Guías, Clips y Logros, y la ventana "Dificultad de 1 a 10")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver todo sobre un juego en un solo lugar. Sabemos que funciona si la persona lee reseñas o guías, o agrega el juego a su lista de deseos.
- **Contenido:**
  1. Portada, nombre, plataformas
  2. Botones: Escribir reseña, Lista de deseos, Preguntar a MatchPlay
  3. Datos clave (tiempo, dificultad, calificación, logros)
  4. Pestañas: Reseñas, Guías, Clips, Logros
  5. Ficha del juego
  6. "Si te gusta, prueba"
- **Qué funciona de verdad:**
  - Ficha, datos y "Si te gusta, prueba": Real (RAWG)
  - Dificultad, calificación y horas al 100 %: Real (calculados con reseñas de Supabase)
  - Pestañas Reseñas y Guías, votar "útil": Real (Supabase)
  - Lista de deseos: Real (Supabase)
  - Pestaña Logros: Simulado
  - Pestaña Clips: Después (el diseño dice que llega con la API de Twitch)
  - Editar o borrar mi reseña (del flujograma): Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cada pestaña muestra su contenido y su número.
  - "+ Lista de deseos" cambia de estado y el juego aparece en el Perfil.
  - Las reseñas con spoiler se ven ocultas hasta tocarlas.

### 7. Ventana: Dificultad de 1 a 10
- **Archivo de diseño:** disenos/detalle-juego.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda entender cómo se calcula la dificultad. Sabemos que funciona si la persona la cierra y sigue en el juego.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Se abre desde "¿Cómo se calcula?" y se cierra con la X o con Escape.

### 8. Escribir reseña
- **Archivo de diseño:** disenos/escribir-resena.html (tipos Reseña, Guía y Clip)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda registrar un juego en su diario y publicar su opinión. Sabemos que funciona si la persona publica sin abandonar a mitad del formulario.
- **Contenido:**
  1. Juego que se reseña
  2. Tipo: Reseña, Guía o Clip
  3. Registro en el diario: fecha, estado, horas, me gusta
  4. Calificación de 1 a 10
  5. Dificultad de 1 a 10
  6. Título y texto (mínimo 50 caracteres), spoilers
  7. Guardar borrador y Publicar (+50 XP)
- **Qué funciona de verdad:**
  - Publicar reseña o guía y registrar en el diario: Real (Supabase)
  - Guardar borrador: Simulado
  - Subir clip: Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - No deja publicar con menos de 50 caracteres y muestra el error.
  - Al publicar, la reseña aparece en el juego y en el Diario.
  - Sin sesión iniciada, sale la ventana "Necesitas una cuenta".

### 9. Ventana: Publicación confirmada
- **Archivo de diseño:** disenos/escribir-resena.html (ventana emergente "Reseña publicada" / "Guía publicada")
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
- **Archivo de diseño:** disenos/comunidad.html (pestañas Reseñas y Guías)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda leer y votar reseñas y guías de otros jugadores. Sabemos que funciona si la persona vota "útil" o abre un juego desde una reseña.
- **Contenido:**
  1. Pestañas Reseñas y Guías
  2. Orden: Más útiles o Más recientes
  3. Lista de tarjetas
  4. Botón Escribir una reseña
- **Qué funciona de verdad:** Lista y votos: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cambiar de pestaña cambia la lista.
  - Cambiar el orden reordena las tarjetas.

### 12. Eventos
- **Archivo de diseño:** disenos/eventos.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda encontrar torneos y sorteos de sus juegos. Sabemos que funciona si la persona abre el detalle de un evento.
- **Contenido:**
  1. Evento destacado
  2. Filtros: Todos, Torneos, Sorteos, Gratis y quién organiza
  3. Tarjetas de eventos
  4. Reglas generales y "Propón un evento"
- **Qué funciona de verdad:** Lista de eventos: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cada filtro muestra solo los eventos que corresponden.
  - Cada tarjeta abre su Detalle de evento.

### 13. Detalle de evento
- **Archivo de diseño:** disenos/detalle-evento.html (versión torneo y versión sorteo)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda conocer un evento e inscribirse. Sabemos que funciona si la persona completa la inscripción.
- **Contenido:**
  1. Título, tipo y datos (fecha, cupos, costo, premio)
  2. Formulario: equipo y compañero (torneo), forma de participar (XP o pago), aceptar reglamento
  3. Sobre el evento y cronograma
  4. Reglas
- **Qué funciona de verdad:**
  - Datos del evento: Simulado
  - Inscribirse gratis o con XP: Real (Supabase)
  - Pagar inscripción: Después (el diseño dice que los pagos aún no están disponibles)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, en versión torneo y en versión sorteo.
  - Funciona en celular (375 px de ancho).
  - No deja inscribirse sin aceptar el reglamento (y sin nombre de equipo en torneos).
  - Si no tiene 300 XP, la opción de XP del sorteo aparece desactivada.
  - Al inscribirse, el evento aparece en "Mis eventos" del Perfil.

### 14. Ventana: Inscripción confirmada
- **Archivo de diseño:** disenos/detalle-evento.html (ventana emergente "¡Estás inscrito!" / "¡Ya participas!")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda confirmar que quedó inscrito. Sabemos que funciona si la persona encuentra el evento en "Mis eventos".
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - El texto cambia según sea torneo o sorteo.

### 15. Iniciar sesión
- **Archivo de diseño:** disenos/iniciar-sesion.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda entrar a su cuenta. Sabemos que funciona si la persona entra al primer intento.
- **Contenido:**
  1. Correo y contraseña (con mostrar u ocultar)
  2. Entrar
  3. Entrar con la cuenta de demostración
  4. Explorar sin cuenta
  5. Google y Discord
- **Qué funciona de verdad:**
  - Entrar con correo: Real (Supabase)
  - Cuenta de demostración: Simulado
  - Google y Discord: Después (el diseño dice "Pronto")
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Con el correo mal escrito o sin contraseña, muestra el error junto al campo.
  - Al entrar, el encabezado muestra al usuario en vez de los botones de acceso.

### 16. Crear cuenta
- **Archivo de diseño:** disenos/crear-cuenta.html (paso 1 de 3)
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

### 17. Perfil
- **Archivo de diseño:** disenos/perfil.html (y la ventana "Cómo ganar XP")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver su actividad y sus juegos en un solo lugar. Sabemos que funciona si la persona entra a Editar perfil, Diario o Logros desde aquí.
- **Contenido:**
  1. Portada, avatar, nombre, nivel y "jugando ahora"
  2. Estadísticas
  3. 4 juegos favoritos
  4. Actividad reciente
  5. Géneros más jugados y calificaciones
  6. Lista de deseos
  7. Sobre mí, XP, conexiones y Mis eventos
  8. Editar perfil y Compartir
- **Qué funciona de verdad:**
  - Datos del perfil, favoritos, actividad, lista de deseos y Mis eventos: Real (Supabase)
  - Quitar de lista de deseos y cancelar inscripción: Real (Supabase)
  - Conexiones (cuentas vinculadas): Simulado
  - Copiar enlace del perfil: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Muestra lo que el usuario hizo: reseñas, favoritos, deseos y eventos.
  - Sin sesión, pide iniciar sesión.

### 18. Ventana: Cómo ganar XP
- **Archivo de diseño:** disenos/perfil.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda saber cómo ganar XP. Sabemos que funciona si la persona realiza después alguna acción que da XP.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Se abre desde "¿Qué es el XP y cómo lo gano?" y se cierra con la X o con Escape.

### 19. Editar perfil
- **Archivo de diseño:** disenos/editar-perfil.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda personalizar su perfil y vincular sus plataformas. Sabemos que funciona si la persona guarda al menos un cambio.
- **Contenido:**
  1. Perfil público: nombre, sobre mí, qué estás jugando
  2. 4 juegos favoritos
  3. Géneros favoritos
  4. Cuentas vinculadas
  5. Guardar o Cancelar
- **Qué funciona de verdad:**
  - Guardar cambios: Real (Supabase)
  - Vincular Steam o Xbox: Simulado
  - Vincular PlayStation o Nintendo: Después (no tienen conexión pública, según el diseño)
  - Foto de perfil: Después (el diseño dice que llega con el almacenamiento de archivos)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - No deja agregar un quinto favorito.
  - Los cambios guardados se ven en el Perfil.
  - El usuario no se puede editar.

### 20. Diario
- **Archivo de diseño:** disenos/diario.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver los juegos que jugó, por fecha. Sabemos que funciona si la persona registra un juego desde aquí.
- **Contenido:**
  1. Resumen del año
  2. Filtros por año y estado
  3. Tabla: mes, día, juego, estado, horas, calificación, me gusta, reseña
  4. Botón Registrar juego
- **Qué funciona de verdad:** Diario: Real (Supabase)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho): la tabla se vuelve tarjetas.
  - Los filtros cambian las filas.
  - Lo publicado en Escribir reseña aparece aquí.

### 21. Logros
- **Archivo de diseño:** disenos/logros.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver sus logros de todas sus plataformas juntos. Sabemos que funciona si la persona usa el filtro de plataforma.
- **Contenido:**
  1. Resumen (desbloqueados, promedio, juegos al 100 %, raros)
  2. Filtro por plataforma
  3. Progreso por juego
  4. Logros más raros
- **Qué funciona de verdad:** Logros: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - El filtro de plataforma cambia la lista y, si no hay datos, lo dice.
  - Indica que son datos de ejemplo.

### 22. Ventana: Notificaciones
- **Archivo de diseño:** sale desde disenos/js/app.js (campana del encabezado, solo con sesión iniciada)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver sus avisos. Sabemos que funciona si la persona abre la ventana desde la campana.
- **Qué funciona de verdad:** Avisos: Simulado (los dos avisos de ejemplo del diseño)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - La campana solo aparece con sesión iniciada.
  - La ventana se cierra con "Cerrar", la X o Escape.

### 23. Contáctanos
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

### 24. Ventana: Mensaje guardado
- **Archivo de diseño:** disenos/contacto.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda confirmar que su mensaje quedó guardado. Sabemos que funciona si la persona no envía el mismo mensaje dos veces.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Se cierra y deja el formulario vacío.

### 25. Error y estado de servicios
- **Archivo de diseño:** disenos/error.html (11 variantes: servicio caído, límite de consultas, tiempo agotado, credenciales, mantenimiento, sin conexión, plataforma sin API, pagos, función no disponible, prototipo, estado de servicios)
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

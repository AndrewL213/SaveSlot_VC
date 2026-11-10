# Spec · SaveSlot

Plano de la app: qué se construye, en qué orden y cuándo está lista cada pantalla.
Fuentes: Brief-SaveSlot.md, Flujogramas.pdf (repo SaveSlot-Info) y los diseños de disenos/ (versión 3).

Leyenda de "Qué funciona de verdad":
- **Real**: funciona y se guarda (solo con nuestras integraciones de backend).
- **Simulado**: se ve y se puede tocar, pero con datos de mentira.
- **Después**: no entra en el MVP.
Los enlaces que solo llevan a otra pantalla siempre funcionan y no se clasifican.

**Portadas:** todas las portadas de juegos se ven con su imagen, en cualquier pantalla: listas, resultados, perfiles, diario, historial y amigos. Si el juego tiene imagen en `assets/`, se usa esa; si no, la portada que trae IGDB (desde images.igdb.com), con crédito a IGDB. Solo si IGDB no tiene portada se usa el rectángulo de color de respaldo. Los juegos que vienen de la cuenta de Steam de la persona (biblioteca, favoritos, lista de deseos, logros, recientes) usan la portada oficial de Steam (cdn.cloudflare.steamstatic.com), con crédito a Steam.

## Integraciones de backend del MVP
- **Supabase**: todo lo que se guarda.
  - Cuentas: crear cuenta, iniciar sesión y sesión de invitado (la "cuenta de demostración"). Se entra con la cuenta de SaveSlot (correo y contraseña) o con Google, Discord, Twitch o Steam (proveedores de inicio de sesión de Supabase; sus claves se guardan en Supabase, nunca en el código).
  - Base de datos: reseñas y borradores, comentarios, diario, perfil, amigos, eventos, inscripciones, notificaciones, chats de MatchPlay, tendencias, vistos recientemente y mensajes de contacto.
  - Presencia: quién está en línea.
  - Su clave pública va en el código; los datos se protegen con reglas de acceso en la base.
- **IGDB** (de Twitch): catálogo de juegos (búsqueda, filtros, ficha y tiempos para terminar). Sus claves (Client ID y Client Secret de Twitch) se guardan en Vercel y se usan solo desde una función en `api/`, que también renueva el token de acceso; nunca van en el código del navegador (IGDB tampoco acepta pedidos directos desde el navegador). Uso no comercial: si SaveSlot se vuelve comercial, hay que pedir permiso a Twitch.
  - La función es `api/igdb.js`. Acepta solo seis pedidos: `?buscar=texto` (hasta 20 juegos, los más conocidos primero), `?id=` (la ficha de un juego por su slug o su número, con "Si te gusta, prueba"), `?populares=1` (los 10 que más gente marca como "jugando ahora" en IGDB, para "Mejores juegos de la semana"), `?explorar=1` (lista de Buscar juegos de 24 en 24, con los filtros de género, plataforma, tipo, duración y año), `?random=1` (un juego al azar entre los 300 más conocidos de un género) y `?steam=1` (los 10 juegos más jugados en Steam: la lista pública de Steam, sin clave, con el pico de jugadores de ayer; IGDB pone los datos de cada juego). `?explorar` también dice cuántos juegos hay en total. Solo muestra juegos principales, remakes, remasters y expansiones que se venden solas (nada de DLC, mods, packs ni ports no oficiales), y solo de **PC y consolas** (PlayStation, Xbox y Nintendo): los juegos que solo salen en celular o navegador no aparecen. Devuelve los juegos con el mismo formato de `js/data.js` y, si algo falla, el nombre de la variante de la página de error (`credenciales`, `limite`, `tiempo`, `api` o `juego`).
  - Vercel guarda cada respuesta una hora, para hacer menos consultas a IGDB.
  - IGDB tiene la descripción de los juegos solo en inglés. La ficha (`?id=`) la traduce al español:
    - **Por ahora (temporal):** con el enlace gratis de Google Translate, sin clave. No es oficial: va contra las condiciones de Google y puede dejar de funcionar en cualquier momento. Se reemplaza al conectar Supabase.
    - **Al conectar Supabase:** cada traducción se guarda una sola vez y se usa un traductor oficial: **DeepL** (plan gratis de 500.000 caracteres al mes; basta con poner la clave `DEEPL_API_KEY` en Vercel, y la función la usa en lugar de Google).
    - En las listas (`?buscar=` y `?populares=1`) la descripción queda en inglés, para no hacer 20 traducciones por búsqueda. Cada juego trae `idiomaDescripcion` (`es` o `en`).
    - Si la traducción falla, la ficha llega igual, en inglés.
  - Mientras no esté conectada (o abriendo los archivos directo en el navegador), la app usa los juegos de `js/data.js`.
  - Cada juego trae `appidSteam`, su número en Steam (IGDB lo guarda en `external_games`; Steam es la fuente 1), para pedirle a Steam precio, nota, logros y reseñas.
- **Steam** (Steam Web API + OpenID): funciones de Vercel en `api/steam/`. La clave `STEAM_API_KEY` y la llave secreta de Supabase (`SUPABASE_SERVICE_ROLE_KEY`) están solo en Vercel. Antes eran Edge Functions de Supabase (`steam-auth` y `steam-data`); ya no se usan.
  - `api/steam/auth.js`: entrar con Steam (OpenID 2.0). Steam devuelve a la persona a la app con un token de un solo uso y la app abre la sesión de Supabase (`verifyOtp`). La cuenta queda con `app_metadata.steam_id`, y su @ se guarda en `user_metadata.usuario`.
  - `api/steam/data.js` (con la sesión de Supabase): `profile` (perfil, jugando ahora, recientes de 2 semanas, nivel e insignias de Steam), `library` (biblioteca con horas), `wishlist` (lista de deseos con precio en COP y descuento), `achievements_summary` (logros de los 30 juegos más jugados y los más raros), `achievements`, `stats` y `my_reviews` (tus reseñas de Steam).
  - `api/steam/resenas.js` (sin sesión): las 10 reseñas en español más útiles de un juego y su nota global en Steam.
  - `api/steam/juego.js` (sin sesión): precio, descuento, nota, logros totales y jugadores conectados de un juego; los guarda en la tabla **juegos** de Supabase y no vuelve a preguntarle a Steam en 24 horas.
  - `api/steam/sincronizar.js`: Vercel la ejecuta cada día a las 9:00 UTC (4:00 a. m. en Colombia; `crons` en `vercel.json`) y actualiza hasta 200 juegos de la tabla **juegos**. Solo responde a Vercel (variable `CRON_SECRET`).
  - Steam ya no da un JSON público de reseñas: las reseñas de cada juego y las tuyas se leen de las páginas públicas de la comunidad de Steam. Funciona, pero si Steam cambia esas páginas hay que ajustar `resenas.js` y `my_reviews`.
  - Logros, lista de deseos y reseñas necesitan que en Steam «Detalles de juego» esté en **Público**. Si no, la app explica cómo cambiarlo.
- Siguen **Simulados** solo lo que depende de servicios externos que no están en el MVP: las respuestas de la IA de MatchPlay, los logros de otras plataformas (los de Steam son reales), la vinculación con Xbox y el estado de los servicios.

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
   Crear cuenta (paso 1) → Editar perfil (pasos 2 y 3: vincular plataformas y elegir favoritos) → Perfil → Diario · Historial de reseñas · Logros · Biblioteca · Editar perfil
   Entrar con Steam (Iniciar sesión o Crear cuenta) → Steam → Perfil, con Steam ya vinculada
   Menú de la cuenta (en la barra, en todas las páginas) → Mi perfil · Editar perfil · Cerrar sesión
   Perfil o Comunidad → Amigos → Perfil de otro usuario
   Iniciar sesión (o entrar como invitado) → la pantalla donde estaba
5. **Ayuda**: desde cualquier pantalla → Contáctanos. Si algo falla → Error.

## Datos

Solo lo que se ve o se guarda en las pantallas. Entre paréntesis, de dónde sale.

**Cómo se identifican:** cada elemento tiene un `id`. Las personas se enlazan por el id de su cuenta en Supabase Auth (el @usuario es el nombre visible, único, pero puede cambiar). Los juegos se enlazan por su id de IGDB: en las tablas de Supabase se guarda el **número** (`idIgdb`, por ejemplo 113112, que nunca cambia) y en las direcciones de la web va el **slug** (`id`, por ejemplo `detalle-juego.html?id=hades--1`, que se lee mejor). Los 12 juegos de ejemplo ya usan los dos. Los enlaces con los ids viejos (como `?id=hades`) siguen funcionando. "Calculado" quiere decir que no se guarda: la app lo saca de otros datos.

### Vienen de IGDB

- **juegos** (IGDB): id (slug de IGDB), idIgdb (número de IGDB), nombre, nombre corto, géneros, plataformas, año, desarrolladora, tipo (AAA o Indie: Indie si IGDB le pone ese género), horas de la historia ("Time to beat" de IGDB: el tiempo de solo la historia principal; se muestra solo si lo reportaron 10 jugadores o más y si no pasa de 300 h; si no, la pantalla dice "Sin datos"), solo online (sí o no: sin modo de un jugador; en vez de horas dice "Online"), descripción (en español, ver Integraciones), portada (de `assets/` o de IGDB), color de respaldo (solo los juegos con imagen en `assets/`; los demás usan el neutro del kit)
  - De Steam (si el juego está en Steam): número de Steam (`appidSteam`), logros totales, precio, nota y jugadores conectados (ver la tabla **juegos**)
  - Datos de ejemplo: logros totales de los juegos que no están en Steam (IGDB no los da)
  - Calculados con nuestras reseñas (Supabase): dificultad promedio (1–10), calificación, número de votos, horas al 100 %

### Vienen de Steam (de la cuenta de la persona, sin guardarse en tablas)

- **perfil de Steam**: nombre y enlace del perfil, jugando ahora, juegos recientes (horas de las últimas 2 semanas), nivel e insignias
- **biblioteca de Steam**: juegos con horas jugadas y última vez jugado
- **logros de Steam**: por juego (obtenidos y totales), resumen y logros más raros (% global de jugadores)
- **lista de deseos de Steam**: juegos con precio, precio anterior y descuento. Se ve en el Perfil; se cambia desde Steam.
- **reseñas de Steam**: las de cada juego (autor, recomienda o no, horas, fecha, votos de "útil") y las de la persona
- El navegador guarda una copia para mostrar algo mientras llegan los datos nuevos (claves `steamPerfil`, `steamBiblioteca`, `steamLogros`, `steamDeseos` y `steamResenas`).

### Se guardan en Supabase

- **usuarios_steam** (Supabase, ya creada; descrita en `supabase/usuarios_steam.sql`): id (cuenta de Supabase Auth), steam_id64 (único), steam_username, steam_avatar, sincronizado_el. Cualquiera la lee; cada persona solo escribe su fila. La llenan `api/steam/auth.js` al entrar con Steam y el Perfil (una vez por visita). Sirve para saber qué autores de reseñas de Steam tienen cuenta en SaveSlot; su @ se lee de `user_metadata.usuario`.
- **juegos** (Supabase, ya creada; código en `supabase/juegos.sql`): igdb_id (clave), slug, nombre, steam_appid, steam_precio, steam_precio_original, steam_descuento, steam_gratis, steam_nota, steam_nota_pct, steam_resenas, steam_logros, steam_jugando, actualizado. Cualquiera la lee; solo el servidor (Vercel) escribe. La llenan `api/steam/juego.js` al abrir una ficha y `api/steam/sincronizar.js` cada día.

- **usuarios** (Supabase): id, usuario (@, único), nombre visible, iniciales, correo, forma de entrar (correo, Google, Discord, Twitch o Steam), invitado (sí o no), sobre mí, jugando ahora (juego), miembro desde, nivel, XP, 4 juegos favoritos, géneros favoritos, lista de deseos, insignias, color del avatar
  - Estado: "en línea" y última conexión salen de la presencia de Supabase; "jugando" sale de "jugando ahora"
  - Calculado: amigos en común, notas de cada juego (del diario; en los datos de ejemplo están en `notas`)
- **cuentas vinculadas** (Supabase; hoy dentro del perfil en el navegador): usuario, plataforma (Steam, Xbox, PlayStation o Nintendo), nombre en la plataforma, estado (verificada o pendiente). Quien entra con Steam la tiene vinculada desde el inicio. Steam es real (su número queda en `app_metadata.steam_id` de Supabase Auth); Xbox es simulada.
- **reseñas** (Supabase): id, juego, autor, tipo (reseña o guía), estado (publicada o borrador), título (opcional), texto, calificación (1–10), dificultad (1–10), horas jugadas, estado de la partida (Terminado, Rejugado, En progreso o Abandonado), minutos de lectura (guías), contiene spoilers, editada (sí o no), fecha
  - Calculado: votos de "útil" y me gusta (se cuentan en sus tablas), porcentaje de "útil" de las guías
  - Borradores: un borrador por persona y juego, con los mismos campos (estado "borrador")
- **votos "útil"** (Supabase): usuario, reseña, fecha. Uno por persona y reseña; nadie vota su propia reseña.
- **me gusta de reseñas** (Supabase): usuario, reseña, fecha. Uno por persona y reseña; se puede quitar.
- **comentarios** (Supabase): id, reseña, autor, texto, fecha
- **diario** (Supabase): id, usuario, juego, fecha, estado (Terminado, Rejugado, En progreso o Abandonado), horas, calificación, me gusta, tiene reseña
- **amigos** (Supabase): id, usuario, amigo, estado (amigos, solicitud enviada o solicitud recibida), fecha
- **eventos** (Supabase): id, tipo (torneo o sorteo), juego, título, descripción, fecha y hora, organizador, tipo de organizador, cupos ocupados, cupos máximos, costo, gratis (sí o no), premio, cronograma (pasos con su fecha), reglas, color, destacado (el "evento del mes" de Inicio)
- **inscripciones** (Supabase): id, usuario, evento, nombre del equipo, compañero, forma de participar (XP o pago), fecha
- **notificaciones** (Supabase): id, usuario, tipo (voto "útil" a una reseña tuya o cierre de inscripciones de un evento tuyo), texto, enlace, fecha, leída (sí o no)
- **chats de MatchPlay** (Supabase): id, usuario, título, fecha, mensajes (quién habla, texto y voto de "útil" en cada respuesta). Las respuestas de la IA son simuladas.
- **tendencias de MatchPlay** (Supabase): id, etiqueta, pregunta, cantidad de preguntas hoy
- **destacados de Inicio** (Supabase): id, juego, orden (las 3 portadas del título de Inicio)
- **vistos recientemente** (Supabase; sin sesión, en el navegador): usuario, los últimos 6 juegos abiertos
- **mensajes de contacto** (Supabase): id, nombre, correo, tema, mensaje, fecha

### Siguen como datos de ejemplo (en `js/data.js`)

- **logros** (datos de ejemplo): id, juego, nombre, descripción, % de jugadores que lo tienen, obtenido (sí o no), plataforma
- **progreso de logros** (datos de ejemplo): id, usuario, juego, obtenidos, totales, plataforma
- **resumen de logros** (datos de ejemplo): id, usuario, desbloqueados, % promedio, juegos completos, logros raros
- **respuestas de MatchPlay** (datos de ejemplo): id, palabras que las activan, texto. Son las respuestas simuladas de la IA.

### Fijos de la app (no son datos de usuarios; se quedan en `js/data.js`)

- **variantes de error**: id, código, título, texto, consejos, reintentar (sí o no), segundos de espera, botón de la variante, servicio por defecto
- **estado de los servicios**: id, servicio, proveedor, estado (conectado, demo, pendiente o no disponible), texto

### Hoy en el navegador → tabla de Supabase

Hasta conectar Supabase, lo que hace cada persona se guarda en el navegador (`localStorage`, claves `ss.*`). Al conectar, cada clave pasa a su tabla:

| Clave en el navegador | Tabla de Supabase |
|---|---|
| `session`, `accounts` | Supabase Auth y **usuarios** |
| `profile` | **usuarios** (y **cuentas vinculadas**) |
| `myReviews`, `draft.<juego>` | **reseñas** (publicadas y borradores) |
| `votosUtil` | **votos "útil"** |
| `meGustaResenas` | **me gusta de reseñas** |
| `comments.<reseña>` | **comentarios** |
| `diary` | **diario** |
| `friends` | **amigos** |
| `joined`, `inscripciones` | **inscripciones** |
| `chatsMatchplay` | **chats de MatchPlay** |
| `recentGames` | **vistos recientemente** (sin sesión sigue en el navegador) |
| `outbox` | **mensajes de contacto** |
| `usuariosSteam` | Supabase Auth (`user_metadata.usuario`, ya se guarda ahí) |
| `steamPerfil`, `steamBiblioteca`, `steamLogros`, `steamDeseos`, `steamResenas` | Ninguna: son copias de lo que da Steam, para mostrar algo mientras llega lo nuevo |
| `juegosIgdb` | Ninguna: copia de los últimos 100 juegos de IGDB abiertos, para que reseñas, deseos y diario sepan su nombre y portada |
| `hideDemo`, `datosDe.*`, `duenoDatos` | Ninguna: son ayudas del modo demo y se quitan |

## Pantallas

### 1. Inicio
- **Archivo de diseño:** disenos/index.html (comparte archivo con la ventana "Evento del mes")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda empezar a buscar un juego o descubrir qué jugar y qué eventos hay. Sabemos que funciona si la persona usa el buscador o un atajo en su primera visita.
- **Contenido:**
  1. Título, buscador y 3 portadas destacadas
  2. Atajos: Juego random, Recomiéndame algo corto, Torneos de esta semana
  3. Vistos recientemente (solo si ya visitó juegos)
  4. Mejores juegos de la semana (los 6 que más gente marca como "jugando ahora" en IGDB)
  5. Lo más jugado en Steam (los 6 juegos de PC con más jugadores a la vez ayer; se ve solo si Steam responde)
  6. Reseñas destacadas
  7. Eventos: el evento del mes y un sorteo
- **Qué funciona de verdad:**
  - Buscador y Mejores juegos de la semana: Real (IGDB). Si IGDB no responde, se ven los juegos de ejemplo mejor calificados
  - Lo más jugado en Steam: Real (lista de Steam, datos de IGDB)
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
  3. Lista de resultados con portada, de 24 en 24 con "Ver más juegos" (sin texto); con texto, hasta 20
  4. Filtros: género, plataforma, tipo, duración de la historia, año. Si lo escrito es un género ("terror"), se marca ese filtro
  5. Botones Juego random y Limpiar filtros
  6. Lo más jugado en Steam (solo sin búsqueda ni filtros): los 6 juegos de PC con más jugadores a la vez ayer, con su puesto y sus jugadores; cada uno abre su ficha
- **Qué funciona de verdad:**
  - Búsqueda y filtros: Real (IGDB). Si IGDB no responde, busca en los juegos de ejemplo
  - Lo más jugado en Steam: Real (lista de Steam, datos de IGDB)
  - Sugerencias automáticas al escribir (del flujograma): Después
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho): los filtros se abren con el botón "Filtros".
  - Cada filtro cambia la lista y el número de resultados.
  - "Limpiar filtros" muestra todos los juegos otra vez.
  - Con el filtro de duración el número es aproximado ("24+ juegos"), porque IGDB no filtra por horas.
  - Si no hay resultados, se ve un mensaje y no una lista vacía.

### 4. Juego random
- **Archivo de diseño:** disenos/random.html
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda recibir una sugerencia al azar de un género. Sabemos que funciona si la persona abre el juego sugerido.
- **Contenido:**
  1. Selector de género (15 géneros: Acción, Aventura, Carreras, Deportes, Estrategia, Metroidvania, Pelea, Plataformas, Puzzle, Roguelike, RPG, Shooter, Simulación, Supervivencia y Terror)
  2. Juego sugerido (portada, descripción corta, horas de la historia, año, y nota y dificultad si ya tiene reseñas; enlace a su página)
  3. Botón para pedir otro
- **Qué funciona de verdad:** Sugerencia: Real (IGDB, un juego al azar entre los 300 más conocidos del género). Si IGDB no responde, sugiere uno de los juegos de ejemplo
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
  1. Portada, nombre, plataformas y, si está en Steam, una línea de Steam: precio (o descuento), nota de Steam, jugadores conectados y "Ver en Steam"
  2. Botones: Escribir reseña, Lista de deseos, Preguntar a MatchPlay
  3. Datos clave (tiempo, dificultad, calificación, logros)
  4. Pestañas: Reseñas, Guías, Clips, Logros
  5. Sobre el juego (la descripción; si es larga, "Leer más". Si viene de IGDB, dice "Descripción de IGDB, traducida automáticamente")
  6. Ficha del juego
  7. "Si te gusta, prueba"
- **Qué funciona de verdad:**
  - Ficha, datos y "Si te gusta, prueba": Real (IGDB)
  - Dificultad, calificación y horas al 100 %: Real (calculados con reseñas de Supabase)
  - Pestañas Reseñas y Guías, votar "útil": Real (Supabase)
  - Reseñas de Steam en la pestaña Reseñas: Real (comunidad de Steam). Cada reseña lleva al lado del @ la etiqueta de su origen (SAVESLOT o STEAM) y se pueden filtrar por Todas, SaveSlot o Steam. Las de Steam muestran 👍/👎 (Steam no usa nota) y enlazan a la original. Además dicen si su autor tiene cuenta en SaveSlot: **EN SAVESLOT · @usuario** (su Steam está vinculado a una cuenta de SaveSlot, según la tabla **usuarios_steam**) o **SOLO STEAM**.
  - Línea de Steam (precio, nota, jugadores): Real (tabla **juegos**, se actualiza cada día)
  - Editar o eliminar mi reseña: Real (Supabase)
  - Lista de deseos: Real (Supabase)
  - Número de logros: Real si el juego está en Steam; la lista de la pestaña Logros sigue Simulada
  - Pestaña Clips: Después (el diseño dice que llega con la API de Twitch)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con su portada (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - Cada pestaña muestra su contenido y su número.
  - "+ Lista de deseos" cambia de estado y el juego aparece en el Perfil.
  - Las reseñas con spoiler se ven ocultas hasta tocarlas.
  - Si el juego está en Steam, se ven su línea de Steam y sus reseñas de Steam con la etiqueta STEAM.
  - Abre cualquier juego de IGDB por su dirección (`?id=slug`); si no existe, lleva a la página de error de juego, y si IGDB no responde, a la de servicio caído (los juegos de ejemplo se ven igual con sus datos de `js/data.js`).

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
  - Sirve para cualquier juego de IGDB (`?id=slug`), aunque no se haya abierto antes.

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
  5. Google, Discord, Twitch y Steam (cuatro botones con su logo, debajo del botón principal: primero va la cuenta de SaveSlot)
- **Qué funciona de verdad:**
  - Entrar con correo (cuenta de SaveSlot): Real (Supabase)
  - Cuenta de demostración: Real (sesión de invitado de Supabase, sin contraseña, con los datos de ejemplo cargados)
  - Steam: Real (`api/steam/auth.js` en Vercel + sesión de Supabase). Vuelve a la pantalla donde estaba, con Steam vinculada.
  - Google, Discord y Twitch: Real (proveedores de Supabase Auth). Mientras no estén conectados, cada botón lleva a la página de error con la variante «acceso» y el nombre del servicio.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Con el correo mal escrito o sin contraseña, muestra el error junto al campo.
  - Al entrar, el encabezado muestra al usuario en vez de los botones de acceso.
  - La cuenta de demostración entra sin pedir datos y muestra el perfil de ejemplo.
  - Cada botón de servicio lleva a entrar con ese servicio (sin Supabase: a la página de error con su nombre).

### 17. Crear cuenta
- **Archivo de diseño:** disenos/registro.html (paso 1 de 3)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda crear su cuenta gratis. Sabemos que funciona si la persona termina el paso 1 y llega a Editar perfil.
- **Contenido:**
  1. Los 3 pasos
  2. Nombre, correo, usuario, contraseña con medidor de fuerza
  3. Aceptar términos
  4. Crear cuenta
  5. Google, Discord, Twitch y Steam (cuatro botones con su logo, debajo del botón principal: primero va la cuenta de SaveSlot)
- **Qué funciona de verdad:**
  - Crear cuenta con correo (cuenta de SaveSlot): Real (Supabase)
  - Steam: Real (`api/steam/auth.js` en Vercel + sesión de Supabase). La cuenta nace con Steam vinculada y un @ sacado de su nombre de Steam, que puede cambiar en Editar perfil.
  - Google, Discord y Twitch: Real (proveedores de Supabase Auth). Mientras no estén conectados, cada botón lleva a la página de error con la variante «acceso» y el nombre del servicio.
  - Quien entra por primera vez con un servicio elige su @usuario y sigue a Editar perfil (pasos 2 y 3), igual que con el correo.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cada campo vacío o inválido muestra su error.
  - El medidor cambia según la contraseña.
  - Cada botón de servicio lleva a crear la cuenta con ese servicio (sin Supabase: a la página de error con su nombre).
  - Al crear la cuenta lleva a Editar perfil con el aviso "¡Cuenta creada!".

### 18. Perfil
- **Archivo de diseño:** disenos/perfil.html (y la ventana "Cómo ganar XP")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver su actividad y sus juegos en un solo lugar. Sabemos que funciona si la persona entra a Editar perfil, Diario o Logros desde aquí.
- **Contenido:**
  1. Portada, avatar, nombre con el @ de SaveSlot al lado; debajo, los @ de las cuentas vinculadas (Steam con su logo y enlace a su perfil); luego el nivel de SaveSlot y el de Steam (con sus insignias), y "jugando ahora"
  2. Estadísticas (Juegos = biblioteca de Steam si está vinculada; Logros, Reseñas y Lista de deseos suman los de Steam)
  3. 4 juegos favoritos (pueden ser del catálogo o de la biblioteca de Steam)
  4. Actividad reciente: lo jugado en Steam las últimas 2 semanas y lo último del diario, con enlaces a Historial de reseñas y Diario
  5. Géneros más jugados y calificaciones
  6. Biblioteca de Steam: los 6 más jugados, con enlace a Biblioteca
  7. Lista de deseos: la de SaveSlot y la de Steam (con precio y descuento; se ven 6 y "Ver los N de Steam")
  8. Sobre mí, XP, Amigos, conexiones y Mis eventos
  9. Editar perfil y Compartir
- **Qué funciona de verdad:**
  - Datos del perfil, favoritos, actividad, lista de deseos, amigos y Mis eventos: Real (Supabase)
  - Jugando ahora, recientes, nivel e insignias, biblioteca y lista de deseos de Steam: Real (Steam)
  - Quitar de lista de deseos y cancelar inscripción: Real (Supabase; la lista de Steam solo se ve)
  - Conexiones: Steam Real; Xbox Simulado
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
  1. Perfil público: nombre, usuario (@), sobre mí, qué estás jugando
  2. 4 juegos favoritos
  3. Géneros favoritos
  4. Cuentas vinculadas
  5. Guardar o Cancelar
- **Qué funciona de verdad:**
  - Guardar cambios (incluye "qué estás jugando", que define el estado "jugando"): Real (Supabase)
  - Cambiar el @: Real. De 3 a 20 letras, números, punto o guion bajo; avisa si está ocupado. Los datos pasan al nuevo @, y con Steam se guarda en Supabase Auth. La cuenta de demostración no lo puede cambiar. (Hoy solo se compara con los usuarios de ejemplo y las cuentas del navegador; al tener la tabla **usuarios**, se revisa contra todos.)
  - "¿Qué estás jugando ahora?": con Steam vinculada, la primera opción es "Automático: lo que juegues en Steam" y se puede elegir un juego de la biblioteca de Steam o del catálogo; lo de Steam manda cuando estás jugando en Steam.
  - Favoritos: se pueden elegir de la biblioteca de Steam (ordenada por horas) o del catálogo.
  - Vincular Steam: Real (Steam). Vincular Xbox: Simulado
  - Vincular PlayStation o Nintendo: Después (no tienen conexión pública, según el diseño)
  - Foto de perfil: Después (el diseño dice que llega con el almacenamiento de archivos)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - No deja agregar un quinto favorito.
  - Los cambios guardados se ven en el Perfil.
  - Un @ inválido u ocupado muestra su error y no deja guardar.

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
  - Tus reseñas de Steam: Real (comunidad de Steam). Llevan la etiqueta STEAM, muestran si recomiendas el juego y se editan desde Steam; salen con el filtro "Todas" (no tienen nota). Las de SaveSlot llevan la etiqueta SAVESLOT.
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
- **Qué funciona de verdad:**
  - Logros de Steam (los 30 juegos más jugados, resumen y más raros): Real (Steam). Botón "Actualizar" con la hora de la última actualización.
  - Logros de otras plataformas: Simulado
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/, IGDB o Steam).
  - Funciona en celular (375 px de ancho).
  - El filtro de plataforma cambia la lista y, si no hay datos, lo dice.
  - Indica qué es de Steam y qué es de ejemplo.
  - Si en Steam los detalles de juego son privados, explica cómo hacerlos públicos.

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

### 30. Biblioteca
- **Archivo de diseño:** no tiene (pantalla nueva; usa los componentes del kit)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver todos sus juegos de Steam con sus horas. Sabemos que funciona si la persona busca un juego o cambia el orden.
- **Contenido:**
  1. Resumen (juegos, horas jugadas, jugados, sin estrenar)
  2. Jugado últimamente (horas de las últimas 2 semanas)
  3. Orden (más jugados, recientes, A–Z) y buscador
  4. Rejilla de portadas con horas; debajo de cada portada, una etiqueta con el logo y el nombre de la cuenta de la que viene (hoy, Steam); cada juego abre su página en la tienda de Steam
- **Qué funciona de verdad:** Biblioteca: Real (Steam)
- **Está lista cuando:**
  - Funciona en celular (375 px de ancho).
  - El orden y el buscador cambian la rejilla.
  - Sin Steam vinculada, invita a vincularla.
  - Si Steam no responde, lo dice y explica que el perfil debe ser público.

### 31. Menú de la cuenta
- **Archivo de diseño:** no tiene (componente nuevo del kit: `.menu-usuario`, en componentes.html)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ir a su perfil o cerrar sesión desde cualquier página. Sabemos que funciona si la persona cierra sesión sin ir al pie de página.
- **Contenido:** al tocar el nombre o el avatar de la barra: Mi perfil, Editar perfil y Cerrar sesión (en rojo y separado)
- **Qué funciona de verdad:** Cerrar sesión: Real (cierra la sesión de SaveSlot y la de Supabase/Steam)
- **Está lista cuando:**
  - Funciona en celular (375 px de ancho).
  - Se cierra al tocar fuera o con Escape, y se recorre con las flechas.

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
    - En la consola de cada servicio (Google Cloud, Discord y Twitch) la dirección de regreso es `https://jzshrfiezzysbkzdsjzf.supabase.co/auth/v1/callback`. Google está en modo «Prueba»: solo entran sus usuarios de prueba hasta publicar la app.
    - Una sola cuenta, varias formas de entrar: en Editar perfil se vinculan Google, Discord y Twitch a la misma cuenta (vinculación manual de Supabase Auth, activada) y Steam se guarda en la cuenta abierta (`app_metadata.steam_id`). Después se entra a esa cuenta con cualquiera de ellos.
    - Borrar cuenta: la función `borrar_mi_cuenta()` (`supabase/borrar-cuenta.sql`, ya ejecutada) borra la cuenta de quien tiene la sesión y, en cascada, todo lo suyo en la base.
  - Base de datos: reseñas y borradores, votos, me gusta, comentarios, diario, perfil, cuentas vinculadas, misiones, amigos, eventos (torneos y sorteos), inscripciones, notificaciones, chats de MatchPlay, tendencias, destacados de Inicio, vistos recientemente, mensajes de contacto, traducciones y la copia de datos de Steam de cada juego (ver Datos).
  - Presencia: quién está en línea.
  - Su clave pública va en el código; los datos se protegen con reglas de acceso en la base.
- **IGDB** (de Twitch): catálogo de juegos (búsqueda, filtros, ficha y tiempos para terminar). Sus claves (Client ID y Client Secret de Twitch) se guardan en Vercel y se usan solo desde una función en `api/`, que también renueva el token de acceso; nunca van en el código del navegador (IGDB tampoco acepta pedidos directos desde el navegador). Uso no comercial: si SaveSlot se vuelve comercial, hay que pedir permiso a Twitch.
  - La función es `api/igdb.js`. Acepta solo seis pedidos: `?buscar=texto` (hasta 20 juegos, los más conocidos primero), `?id=` (la ficha de un juego por su slug o su número, con "Si te gusta, prueba"), `?populares=1` (los 10 que más gente marca como "jugando ahora" en IGDB, para "Mejores juegos de la semana"), `?explorar=1` (lista de Buscar juegos de 24 en 24, con los filtros de género, plataforma, tipo, duración y año), `?random=1` (un juego al azar entre los 300 más conocidos de un género) y `?steam=1` (los 10 juegos más jugados en Steam: la lista pública de Steam, sin clave, con el pico de jugadores de ayer; IGDB pone los datos de cada juego). `?explorar` también dice cuántos juegos hay en total. Solo muestra juegos principales, remakes, remasters y expansiones que se venden solas (nada de DLC, mods, packs ni ports no oficiales), y solo de **PC y consolas** (PlayStation, Xbox y Nintendo): los juegos que solo salen en celular o navegador no aparecen. Devuelve los juegos con el mismo formato de `js/data.js` y, si algo falla, el nombre de la variante de la página de error (`credenciales`, `limite`, `tiempo`, `api` o `juego`). La app también elige la variante por el código de respuesta (429 límite, 408 o más de 15 s tiempo, 401/403 credenciales, 503 mantenimiento, sin internet) y la página de error trae «Reintentar» para volver.
  - Vercel guarda cada respuesta una hora, para hacer menos consultas a IGDB.
  - Las respuestas usan los mismos nombres de campos que las tablas (minúsculas con guion bajo). La app agrega `v=2` (la versión de ese formato) a cada consulta, para que Vercel no entregue respuestas guardadas con un formato viejo; si el formato cambia otra vez, se sube ese número (`VERSION_API` en `js/app.js`).
  - IGDB tiene la descripción de los juegos solo en inglés. La ficha (`?id=`) la traduce al español:
    - **Por ahora (temporal):** con el enlace gratis de Google Translate, sin clave. No es oficial: va contra las condiciones de Google y puede dejar de funcionar en cualquier momento. Se reemplaza al conectar Supabase.
    - **Al conectar Supabase:** cada traducción se guarda una sola vez y se usa un traductor oficial: **DeepL** (plan gratis de 500.000 caracteres al mes; basta con poner la clave `DEEPL_API_KEY` en Vercel, y la función la usa en lugar de Google).
    - En las listas (`?buscar=` y `?populares=1`) la descripción queda en inglés, para no hacer 20 traducciones por búsqueda. Cada juego trae `idioma_descripcion` (`es` o `en`).
    - Si la traducción falla, la ficha llega igual, en inglés.
  - Mientras no esté conectada (o abriendo los archivos directo en el navegador), la app usa los juegos de `js/data.js`.
  - Cada juego trae `appid_steam`, su número en Steam (IGDB lo guarda en `external_games`; Steam es la fuente 1), para pedirle a Steam precio, nota, logros y reseñas.
- **Steam** (Steam Web API + OpenID): funciones de Vercel en `api/steam/`. La clave `STEAM_API_KEY` y la llave secreta de Supabase (`SUPABASE_SERVICE_ROLE_KEY`) están solo en Vercel. Antes eran Edge Functions de Supabase (`steam-auth` y `steam-data`); ya no se usan.
  - `api/steam/auth.js`: entrar con Steam (OpenID 2.0). Steam devuelve a la persona a la app con un token de un solo uso y la app abre la sesión de Supabase (`verifyOtp`). La cuenta queda con `app_metadata.steam_id`, su @ se guarda en `user_metadata.usuario` y su foto elegida en `user_metadata.foto`.
    - Si esa cuenta de Steam está vinculada a una cuenta de Google, Discord, Twitch o correo, entrar con Steam abre esa cuenta (la busca en **usuarios_steam**). Si no, usa la cuenta creada con Steam (correo interno `steam-<número>@saveslot.invalid`).
    - Vincular Steam a la cuenta abierta: `?action=preparar` (con la sesión) devuelve un permiso firmado que vale 10 minutos; con él, Steam se guarda en esa cuenta en vez de crear otra. Si esa cuenta de Steam ya es de otra cuenta de SaveSlot, vuelve con el error `steam_en_otra_cuenta`.
  - `api/steam/data.js` (con la sesión de Supabase): `profile` (perfil, jugando ahora, recientes de 2 semanas ordenados del último jugado al más antiguo, con sus minutos; nivel e insignias de Steam), `library` (biblioteca con horas), `wishlist` (lista de deseos con precio en COP y descuento), `achievements_summary` (logros de los 30 juegos más jugados y los más raros), `achievements`, `stats` y `my_reviews` (tus reseñas de Steam).
  - `api/steam/resenas.js` (sin sesión): las 10 reseñas en español más útiles de un juego y su nota global en Steam.
  - `api/steam/juego.js` (sin sesión): precio, descuento, nota, logros totales y jugadores conectados de un juego; los guarda en la tabla **juegos** de Supabase y no vuelve a preguntarle a Steam en 24 horas.
  - `api/steam/misiones.js`: las misiones diarias y semanales. Sin sesión dice cuáles salen hoy y esta semana; con la sesión de Steam mide el avance (horas con la foto de **horas_steam**, logros por su hora de desbloqueo y logros raros con el % global de Steam), anota las cumplidas con `cumplir_mision` (la base suma el XP) y, si la persona de Steam no tiene fila en **usuarios**, se la crea.
  - `api/steam/sincronizar.js`: Vercel la ejecuta cada día a las 9:00 UTC (4:00 a. m. en Colombia; `crons` en `vercel.json`) y actualiza hasta 200 juegos de la tabla **juegos**. Solo responde a Vercel (variable `CRON_SECRET`).
  - Steam ya no da un JSON público de reseñas: las reseñas de cada juego y las tuyas se leen de las páginas públicas de la comunidad de Steam. Funciona, pero si Steam cambia esas páginas hay que ajustar `resenas.js` y `my_reviews`.
  - Logros, lista de deseos y reseñas necesitan que en Steam «Detalles de juego» esté en **Público**. Si no, la app explica cómo cambiarlo.
- Siguen **Simulados** solo lo que depende de servicios externos que no están en el MVP: las respuestas de la IA de MatchPlay, los logros de otras plataformas (los de Steam son reales), la vinculación con Xbox y el estado de los servicios que no se pueden revisar (los de IGDB, Steam y Supabase se revisan de verdad en la página de error).

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
   Editar perfil → Formas de entrar (vincular Google, Discord o Twitch a la misma cuenta) · Borrar cuenta → Inicio
   Entrar con Steam (Iniciar sesión o Crear cuenta) → Steam → Perfil, con Steam ya vinculada
   Menú de la cuenta (en la barra, en todas las páginas) → Mi perfil · Editar perfil · Cerrar sesión
   Perfil o Comunidad → Amigos → Perfil de otro usuario
   Iniciar sesión (o entrar como invitado) → la pantalla donde estaba
5. **Ayuda**: desde cualquier pantalla → Contáctanos. Si algo falla → Error.

## Datos

Solo lo que se ve o se guarda en las pantallas.

**Reglas comunes**
- **Cómo se identifican:** las personas, por el id de su cuenta en Supabase Auth (`usuarios.id`); el @usuario es el nombre visible, único, pero puede cambiar. Los juegos, por su número de IGDB (`juego_igdb`, por ejemplo 113112, que nunca cambia); en las direcciones de la web va el slug (`detalle-juego.html?id=hades--1`). El catálogo vive en IGDB: un `juego_igdb` no tiene que estar en la tabla **juegos**. Los ids numéricos los pone Supabase. Las pantallas de detalle reciben el id en la dirección: `?id=…`.
- **Nombres:** tablas y campos en minúsculas, sin tildes, con guion bajo; los mismos en Supabase, `js/data.js` y `js/app.js`.
- **Permisos:** sin sesión solo se puede **ver** lo público. Para agregar, cambiar o borrar hace falta sesión (también la de invitado de la cuenta de demostración). Cada persona solo cambia o borra lo suyo (reglas de acceso de Supabase).
- **Lo que cambia solo la base:** nivel, XP, insignias, misiones cumplidas, cupos ocupados y notificaciones los cambia la base de datos con reglas en SQL; nadie los toca desde la app (así nadie puede subirse el XP ni llenar cupos desde el navegador).
- **Tipos de campo:** texto, texto largo, número, sí/no, fecha, fecha y hora, enlace (URL), imagen (ruta en `assets/`), opción de una lista fija, o lista (varios valores).
- "Calculado" quiere decir que no se guarda: la app o la base lo saca de otros datos.

### juegos
Qué guarda: copia de los datos de Steam de cada juego, para no preguntarle a Steam en cada visita (ya creada; código en `supabase/juegos.sql`).
Tipo de dato: compartida
Se guarda en: Supabase
Desde la app se puede: ver (Detalle de juego). Solo el servidor agrega y cambia (`api/steam/juego.js` al abrir una ficha y `api/steam/sincronizar.js` cada día).
Campos:
- igdb_id: número — el juego (clave) — obligatorio
- slug: texto — el slug de IGDB — opcional
- nombre: texto — nombre del juego — obligatorio
- steam_appid: número — su número en Steam — opcional
- steam_precio, steam_precio_original: texto — precio en COP — opcional
- steam_descuento: número — porcentaje — opcional
- steam_gratis: sí/no — si es gratis — opcional
- steam_nota: texto — "Muy positivas"… — opcional
- steam_nota_pct, steam_resenas: número — % positivo y total de reseñas — opcional
- steam_logros: número — logros totales — opcional
- steam_jugando: número — jugadores conectados — opcional
- actualizado: fecha y hora — última vez que se le preguntó a Steam — obligatorio
Se relaciona con: ninguna.

### traducciones
Qué guarda: la descripción de cada juego ya traducida al español, para traducirla una sola vez.
Tipo de dato: compartida
Se guarda en: Supabase
Desde la app se puede: ver (Detalle de juego, a través de `api/igdb.js`). Solo el servidor agrega.
Campos:
- igdb_id: número — el juego — obligatorio
- idioma: opción (es) — idioma de la traducción — obligatorio
- texto: texto largo — la descripción traducida — obligatorio
- traductor: opción (deepl, google) — quién la tradujo — obligatorio
- creada_el: fecha y hora — cuándo se tradujo — obligatorio
Se relaciona con: el juego (igdb_id).

### usuarios_steam
Qué guarda: las cuentas de SaveSlot vinculadas a Steam, para saber qué autores de reseñas de Steam tienen cuenta en SaveSlot (ya creada; código en `supabase/usuarios_steam.sql`).
Tipo de dato: compartida
Se guarda en: Supabase
Desde la app se puede: ver (Detalle de juego: «También en SaveSlot · @usuario» en las reseñas de Steam de quienes tienen cuenta) · agregar y cambiar la propia (`api/steam/auth.js` al entrar con Steam y el Perfil, una vez por visita). Cada persona solo puede anotar su propio número de Steam: la regla lo compara con `app_metadata.steam_id`.
Campos:
- id: texto — la cuenta de Supabase Auth — obligatorio
- steam_id64: texto, único — su número de Steam — obligatorio
- steam_username: texto — nombre en Steam — opcional
- steam_avatar: enlace — foto de Steam — opcional
- sincronizado_el: fecha y hora — última vez que se anotó — opcional
Se relaciona con: usuarios.id (el @ se lee de `user_metadata.usuario` de Supabase Auth).

### usuarios
Qué guarda: el perfil público de cada cuenta. El correo y la contraseña no van aquí: quedan solo en Supabase Auth.
Tipo de dato: aporte (lo ven todos)
Se guarda en: Supabase
Desde la app se puede: ver (Perfil, Perfil de otro usuario, Amigos, Comunidad, barra) · agregar la propia (Crear cuenta) · cambiar la propia (Editar perfil; lista de deseos desde Detalle de juego y Perfil). Nivel, XP e insignias solo los cambia la base.
Campos:
- id: texto — id de Supabase Auth — obligatorio
- usuario: texto, único — el @ (de 3 a 20 letras, números, punto o guion bajo) — obligatorio
- nombre: texto — nombre visible — obligatorio
- iniciales: texto — para el avatar — obligatorio
- foto: enlace — foto de perfil que subió la persona (en Supabase Storage, carpeta **avatares**). Vacía = la foto de Steam si la tiene, o las iniciales; «iniciales» = sin foto aunque tenga Steam. Hoy se guarda en `user_metadata.foto` de Supabase Auth — opcional
- sobre_mi: texto largo — "Sobre mí" — opcional
- jugando_ahora: texto — el juego (slug de IGDB o `steam-<número>`; "steam" = automático con Steam) — opcional
- miembro_desde: fecha — cuándo se creó la cuenta — obligatorio
- nivel: número — sube cada 1.500 XP (lo cambia la base) — obligatorio
- xp: número — XP dentro del nivel (lo cambia la base) — obligatorio
- favoritos: lista de hasta 4 juegos (slug de IGDB o `steam-<número>`) — opcional
- generos_favoritos: lista de opciones de **generos** — opcional
- lista_deseos: lista de juegos (slug de IGDB) — lista de deseos de SaveSlot — opcional
- insignias: lista de textos — "Fundador beta"… (las pone la base) — opcional
- color: texto (#RRGGBB) — color del avatar — opcional
- forma_de_entrar: opción (correo, google, discord, twitch, steam) — obligatorio
- invitado: sí/no — cuenta de demostración — obligatorio
Se relaciona con: Supabase Auth (id).
- Calculados: estado "en línea" y última conexión (presencia de Supabase), "jugando" (de `jugando_ahora` o de Steam), amigos en común, notas de cada juego (del diario).

### cuentas_vinculadas
Qué guarda: las cuentas de juego que cada persona vinculó.
Tipo de dato: personal (se ve en su perfil)
Se guarda en: Supabase
Desde la app se puede: ver (Perfil, Perfil de otro usuario) · agregar, cambiar y borrar las propias (Editar perfil). Quien entra con Steam la tiene desde el inicio.
Campos:
- usuario: texto — dueño — obligatorio
- plataforma: opción de **cuentas** (steam o xbox; playstation y nintendo son Después) — obligatorio
- nombre: texto — nombre en la plataforma — obligatorio
- estado: opción (verificada, pendiente) — obligatorio
Se relaciona con: usuarios.id. Una por persona y plataforma. Steam es real (su número queda en `app_metadata.steam_id`); Xbox es simulada.

### misiones
Qué guarda: las formas de ganar XP: las de siempre (ventana "Cómo ganar XP") y el grupo de misiones diarias y semanales de juegos (panel "Misiones" del Perfil).
Tipo de dato: compartida
Se guarda en: Supabase
Desde la app se puede: ver (Perfil, ventana "Cómo ganar XP"). Las carga el equipo.
Campos:
- id: número — obligatorio
- clave: texto, única — crear_cuenta, publicar, vincular, torneo, amistad, dia_horas_1… — obligatorio
- texto: texto — "Juega 1 h hoy" — obligatorio
- xp: número — cuánto XP da — obligatorio
- repetible: sí/no — si se gana cada vez o una vez por cosa (vincular: una vez por cuenta) — obligatorio
- frecuencia: opción (siempre, diaria, semanal) — obligatorio
- tipo: opción (horas, logros, logros_raros, juegos) — qué se mide (solo diarias y semanales) — opcional
- meta: número — cuánto hay que lograr (horas en minutos, o cuántos logros o juegos) — opcional
Se relaciona con: ninguna.
Las misiones:
- De siempre: Crear tu cuenta (+50, una vez), Publicar una reseña o guía (+50), Vincular una cuenta de juego (+100, una vez por plataforma), Inscribirte en un torneo (+100) y Aceptar una solicitud de amistad (+10).
- Diarias (cada día salen 3, las mismas para todos): Juega 1 h hoy (+20), Juega 2 h hoy (+35), Consigue 1 logro hoy (+20), Consigue 3 logros hoy (+40), Juega 2 juegos distintos hoy (+30).
- Semanales (cada lunes salen 3): Juega 5 h (+70), Juega 10 h (+120), Consigue 5 logros (+70), Consigue 10 logros (+120), Juega 3 juegos distintos (+80), Consigue un logro raro, de menos del 10 % de jugadores (+150).
- Las diarias y semanales se reinician a las 00:00 de Colombia, se ganan una vez por día o por semana y solo se pueden hacer con Steam vinculada: las elige y las comprueba `api/steam/misiones.js` (ver Integraciones).

### misiones_cumplidas
Qué guarda: qué misiones cumplió cada persona y cuándo; con cada una, la base suma su XP.
Tipo de dato: personal
Se guarda en: Supabase
Desde la app se puede: ver las propias (Perfil). La llena la base sola al publicar, vincular, inscribirse o aceptar una amistad.
Campos:
- id: número — obligatorio
- usuario: texto — obligatorio
- mision: texto — la misión — obligatorio
- referencia: texto — la reseña, cuenta, evento o amistad que la cumplió, o el día o la semana ("dia:2026-11-11", "semana:2026-11-09") en las diarias y semanales (para no contarla dos veces) — opcional
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id y misiones.id. "Crear tu cuenta" la anota la base al crear la fila de usuarios; las diarias y semanales, el servidor (`api/steam/misiones.js`).

### horas_steam
Qué guarda: la foto de las horas de Steam de cada persona al empezar el día y la semana (Steam solo da horas totales: lo jugado hoy es lo de ahora menos esta foto).
Tipo de dato: personal
Se guarda en: Supabase
Desde la app se puede: nada. Solo la usa el servidor (`api/steam/misiones.js`, con la llave secreta).
Campos:
- id: número — obligatorio
- usuario: texto — obligatorio
- periodo: texto — "dia:2026-11-11" o "semana:2026-11-09" — obligatorio
- minutos: texto — los minutos jugados de cada juego ("appid:minutos,…") en ese momento — obligatorio
Se relaciona con: usuarios.id. Una por persona y periodo. Solo cuenta lo jugado desde la primera vez que la persona abre SaveSlot ese día o esa semana.

### resenas
Qué guarda: reseñas y guías publicadas, y los borradores.
Tipo de dato: aporte (los borradores son personales)
Se guarda en: Supabase
Desde la app se puede: ver las publicadas (Inicio, Detalle de juego, Comunidad, Detalle de reseña, Historial, Perfil de otro usuario); los borradores, solo su autor (Escribir reseña) · agregar (Escribir reseña) · cambiar y borrar las propias (Detalle de reseña, Historial, Escribir reseña).
Campos:
- id: número — obligatorio
- juego_igdb: número — el juego — obligatorio
- autor: texto — obligatorio
- tipo: opción (resena, guia) — obligatorio
- estado: opción (publicada, borrador) — obligatorio
- titulo: texto — opcional
- texto: texto largo — 50 caracteres o más para publicar — obligatorio al publicar
- calificacion: número del 1 al 10 — opcional en guías
- dificultad: número del 1 al 10 — opcional
- horas: número — horas jugadas — opcional
- estado_partida: opción de **estados_partida** — opcional
- minutos_lectura: número — solo guías — opcional
- spoiler: sí/no — contiene spoilers — obligatorio
- editada: sí/no — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id (autor) y el juego. Un borrador por persona y juego.
- Calculados: votos "útil", porcentaje de "útil" (guías) y me gusta.

### votos_util
Qué guarda: quién marcó una reseña como útil.
Tipo de dato: aporte
Se guarda en: Supabase
Desde la app se puede: ver (para contarlos) · agregar (Inicio, Detalle de juego, Comunidad, Detalle de reseña). No se cambia ni se borra.
Campos:
- usuario: texto — obligatorio
- resena: número — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id y resenas.id. Uno por persona y reseña; nadie vota su propia reseña. Cada voto crea una notificación para el autor (la base).

### me_gusta_resenas
Qué guarda: a quién le gusta una reseña.
Tipo de dato: aporte
Se guarda en: Supabase
Desde la app se puede: ver (para contarlos) · agregar y borrar el propio (Detalle de reseña).
Campos:
- usuario: texto — obligatorio
- resena: número — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id y resenas.id. Uno por persona y reseña.

### comentarios
Qué guarda: los comentarios de las reseñas.
Tipo de dato: aporte
Se guarda en: Supabase
Desde la app se puede: ver y agregar (Detalle de reseña).
Campos:
- id: número — obligatorio
- resena: número — obligatorio
- autor: texto — obligatorio
- texto: texto largo — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: resenas.id y usuarios.id.

### diario
Qué guarda: los juegos que cada persona registró.
Tipo de dato: personal (lo ven otros en su perfil: juegos en común y actividad)
Se guarda en: Supabase
Desde la app se puede: ver (Diario, Perfil, Perfil de otro usuario, Amigos, Detalle de juego: "Tu progreso") · agregar, cambiar y borrar los propios (Escribir reseña).
Campos:
- id: número — obligatorio
- usuario: texto — obligatorio
- juego_igdb: número — obligatorio
- fecha: fecha — obligatorio
- estado: opción de **estados_partida** — obligatorio
- horas: número — opcional
- calificacion: número del 1 al 10 — opcional
- me_gusta: sí/no — obligatorio
- tiene_resena: sí/no — obligatorio
Se relaciona con: usuarios.id y el juego.

### amigos
Qué guarda: las amistades y las solicitudes, una fila por pareja.
Tipo de dato: personal (entre dos personas)
Se guarda en: Supabase
Desde la app se puede: ver (Amigos, Perfil de otro usuario, Comunidad: las amistades las ven todos; las solicitudes pendientes, solo las dos personas) · agregar (enviar solicitud, en Amigos y Perfil de otro usuario) · cambiar (aceptar: solo quien la recibe) · borrar (rechazar, cancelar o eliminar: cualquiera de los dos).
Campos:
- id: número — obligatorio
- usuario: texto — quien envía la solicitud — obligatorio
- amigo: texto — quien la recibe — obligatorio
- estado: opción (pendiente, aceptada) — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id (dos veces). Una fila por pareja. "Solicitud enviada" o "recibida" lo calcula la app según quién mira.

### eventos
Qué guarda: torneos y sorteos.
Tipo de dato: compartida
Se guarda en: Supabase. Al crear la tabla se cargan los 6 eventos de ejemplo de `js/data.js` (torneos y sorteos).
Desde la app se puede: ver (Inicio, Eventos, Detalle de evento). Los crea el equipo desde el panel de Supabase. Los cupos ocupados los cambia la base.
Campos:
- id: texto — nombre corto, va en la dirección (`copa-2v2`) — obligatorio
- tipo: opción (torneo, sorteo) — obligatorio
- juego_igdb: número — el juego — opcional
- titulo: texto — obligatorio
- descripcion: texto largo — obligatorio
- fecha_hora: fecha y hora — cuándo es (la app arma el texto "Sáb 17 oct · 3:00 p. m.") — obligatorio
- cierre_inscripciones: fecha y hora — hasta cuándo se puede inscribir (también avisa en Notificaciones) — opcional
- organizador: texto — quién lo organiza — obligatorio
- tipo_organizador: opción de **organizadores** — obligatorio
- cupos_ocupados: número — suma uno con cada inscripción (la base) — opcional
- cupos_maximos: número — opcional
- costo: texto — obligatorio
- gratis: sí/no — obligatorio
- xp_para_entrar: número — solo sorteos: XP para entrar gratis (300); al inscribirse, la base lo descuenta — opcional
- premio: texto — obligatorio
- ganador: texto — solo sorteos: la cuenta ganadora, elegida al azar al cierre — opcional
- dias_para_reclamar: número — solo sorteos: días que tiene el ganador para reclamar el premio (7) — opcional
- cronograma: lista de pasos (paso y cuándo) — opcional
- reglas: lista de textos — opcional
- color: texto (#RRGGBB) — color de respaldo — opcional
- destacado: sí/no — el "evento del mes" de Inicio — obligatorio
Se relaciona con: el juego y usuarios.id (ganador).

### inscripciones
Qué guarda: quién se inscribió a cada evento.
Tipo de dato: aporte (cada persona ve las suyas; los demás solo ven cuántos cupos quedan)
Se guarda en: Supabase
Desde la app se puede: ver las propias (Perfil: Mis eventos; Detalle de evento) · agregar (Detalle de evento) · borrar la propia (cancelar, desde el Perfil).
Campos:
- id: número — obligatorio
- usuario: texto — obligatorio
- evento: texto — obligatorio
- equipo: texto — nombre del equipo (solo torneos) — opcional
- companero: texto — @ del compañero (solo torneos) — opcional
- forma: opción (xp; pago es Después) — forma de participar — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id y eventos.id. Una por persona y evento. Inscribirse a un torneo cumple la misión "torneo"; a un sorteo, gasta `xp_para_entrar` (la base).

### notificaciones
Qué guarda: los avisos de cada persona.
Tipo de dato: personal
Se guarda en: Supabase
Desde la app se puede: ver las propias y marcarlas como leídas (ventana Notificaciones). Las crea la base: con cada voto "útil" a una reseña tuya y cuando se acerca el cierre de inscripciones de un evento tuyo.
Hoy: los avisos de ejemplo salen de `js/data.js`; los de baja de precio de la lista de deseos de Steam los crea la app y quedan en el navegador (7 días); "leída" también se guarda en el navegador (al abrir la ventana, todo queda visto).
Campos:
- id: número — obligatorio
- usuario: texto — obligatorio
- tipo: opción (voto_util, cierre_inscripciones) — obligatorio
- texto: texto — obligatorio
- enlace: enlace — a dónde lleva — obligatorio
- fecha: fecha y hora — obligatorio
- leida: sí/no — obligatorio
Se relaciona con: usuarios.id.

### chats_matchplay
Qué guarda: las conversaciones de cada persona con MatchPlay.
Tipo de dato: personal
Se guarda en: Supabase
Desde la app se puede: ver, agregar y borrar los propios (MatchPlay).
Campos:
- id: número — obligatorio
- usuario: texto — obligatorio
- titulo: texto — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id. Un chat tiene varios mensajes (**mensajes_matchplay**); al borrarlo se borran sus mensajes.

### mensajes_matchplay
Qué guarda: cada mensaje de un chat de MatchPlay (las respuestas de la IA son simuladas).
Tipo de dato: personal
Se guarda en: Supabase
Desde la app se puede: ver y agregar en los chats propios · cambiar el voto de una respuesta (MatchPlay).
Campos:
- id: número — obligatorio
- chat: número — obligatorio
- quien: opción (usuario, ia) — obligatorio
- texto: texto largo — obligatorio
- voto: opción (util, no_sirve) — solo respuestas de la IA — opcional
- fecha: fecha y hora — obligatorio
Se relaciona con: chats_matchplay.id.

### tendencias_matchplay
Qué guarda: las preguntas más hechas hoy en MatchPlay.
Tipo de dato: compartida
Se guarda en: Supabase
Desde la app se puede: ver (MatchPlay). Las carga el equipo.
Campos:
- id: número — obligatorio
- etiqueta: texto — obligatorio
- pregunta: texto — obligatorio
- preguntas_hoy: número — obligatorio
Se relaciona con: ninguna.

### destacados_inicio
Qué guarda: las 3 portadas del título de Inicio.
Tipo de dato: compartida
Se guarda en: Supabase
Desde la app se puede: ver (Inicio). Las elige el equipo.
Campos:
- id: número — obligatorio
- juego_igdb: número — obligatorio
- orden: número — obligatorio
Se relaciona con: el juego.

### vistos_recientes
Qué guarda: los últimos 6 juegos que abrió cada persona.
Tipo de dato: personal
Se guarda en: Supabase con sesión; sin sesión, en el navegador (localStorage)
Desde la app se puede: ver (Inicio) · agregar (Detalle de juego).
Campos:
- usuario: texto — obligatorio
- juego_igdb: número — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: usuarios.id y el juego.

### mensajes_contacto
Qué guarda: lo que la gente escribe en Contáctanos.
Tipo de dato: sensible
Se guarda en: Supabase
Desde la app se puede: solo agregar (Contáctanos), con o sin cuenta. Nadie puede ver la lista desde la app; el equipo la lee en el panel de Supabase.
Campos:
- id: número — obligatorio
- nombre: texto — obligatorio
- correo: texto (correo) — obligatorio
- tema: opción de **temas_contacto** — obligatorio
- mensaje: texto largo — obligatorio
- fecha: fecha y hora — obligatorio
Se relaciona con: ninguna.

### No va en Supabase

- **Externos (se piden cada vez):**
  - Catálogo de IGDB: nombre, nombre corto, géneros, plataformas, año, desarrolladora, tipo (AAA o Indie), horas de la historia ("Time to beat": solo la historia principal, con 10 reportes o más y hasta 300 h; si no, "Sin datos"), solo online (en vez de horas dice "Online"), descripción y portada. Ver Integraciones.
  - Mejores juegos de la semana (IGDB) y Lo más jugado en Steam.
  - Cuenta de Steam de la persona: perfil (nombre, enlace, jugando ahora, recientes, nivel e insignias), biblioteca (horas y última vez), logros (por juego, resumen y más raros), lista de deseos (precio y descuento; se cambia desde Steam) y sus reseñas. El navegador guarda una copia para mostrar algo mientras llegan los nuevos.
  - Reseñas de Steam de cada juego (autor, recomienda o no, horas, fecha, votos de "útil").
  - Presencia ("en línea" y última conexión): en tiempo real, no se guarda.
- **Calculados:** dificultad promedio, calificación, número de votos y horas al 100 % de un juego (de las reseñas); estadísticas del perfil; amigos y juegos en común; géneros más jugados.
- **Fijos en el código (`js/data.js`):** son listas cortas que solo cambian con una nueva versión de la app.
  - **generos**: id, nombre, en_buscar (sí/no: sale en los filtros de Buscar; Juego random usa todos)
  - **plataformas**: id, nombre (PC, PlayStation, Xbox, Nintendo)
  - **cuentas**: id, nombre, nota, vincula (sí/no) (Editar perfil)
  - **estados_partida**: id, nombre, etiqueta (color) (Escribir reseña y Diario)
  - **temas_contacto** y **preguntas_frecuentes** (Contáctanos)
  - **atajos_inicio**, **ideas_matchplay**, **reglas_eventos** y **organizadores** (filtro de Eventos)
  - **variantes_error**: id, codigo, titulo, texto, consejos, reintentar, espera, accion, servicio_por_defecto
  - **estado_servicios**: id, servicio, proveedor, estado (conectado, demo, pendiente o no disponible), texto, prueba (opcional: igdb, steam, base o cuentas; con ella la página de error revisa de verdad si el servicio responde)
  - Las opciones de orden y los rangos de los filtros ("Más recientes", "A–Z", "9–10", "< 10 h"…) son parte de la interfaz y siguen en el HTML.
- **Simulados (`js/data.js`):** respuestas_matchplay (las respuestas de la IA), y logros, progreso_logros y resumen_logros de otras plataformas (los de Steam son reales).
- **Archivos (Supabase Storage):** carpeta pública **avatares** (código en `supabase/avatares.sql`, ya creada): las fotos de perfil, en `avatares/<id de Auth>/avatar.jpg`. Cualquiera las ve; cada persona solo sube, cambia o borra la suya (al borrar la cuenta se borra también). Solo imágenes JPG, PNG o WebP de hasta 2 MB (la app las recorta a 256 px antes de subirlas).
- **Después:** clips (necesitan Supabase Storage o Twitch), pagos de eventos y mensajes entre amigos.

### Hoy en el navegador → tabla de Supabase

Hasta conectar Supabase, lo que hace cada persona se guarda en el navegador (`localStorage`, claves `ss.*`). Al conectar, cada clave pasa a su tabla:

| Clave en el navegador | Tabla de Supabase |
|---|---|
| `session`, `accounts` | Supabase Auth y **usuarios** |
| `profile` | **usuarios** (con su lista de deseos), **cuentas_vinculadas** y **misiones_cumplidas** (`missionsDone`) |
| `myReviews`, `draft.<juego>` | **resenas** (publicadas y borradores) |
| `votosUtil` | **votos_util** |
| `meGustaResenas` | **me_gusta_resenas** |
| `comments.<reseña>` | **comentarios** |
| `diary` | **diario** |
| `friends` | **amigos** |
| `joined`, `inscripciones` | **inscripciones** |
| `chatsMatchplay` | **chats_matchplay** y **mensajes_matchplay** |
| `recentGames` | **vistos_recientes** (sin sesión sigue en el navegador) |
| `outbox` | **mensajes_contacto** |
| `usuariosSteam` | Supabase Auth (`user_metadata.usuario`, ya se guarda ahí) |
| `steamPerfil`, `steamBiblioteca`, `steamLogros`, `steamDeseos`, `steamResenas` | Ninguna: son copias de lo que da Steam, para mostrar algo mientras llega lo nuevo |
| `juegos_igdb` | Ninguna: copia de los últimos 100 juegos de IGDB abiertos, para que reseñas, deseos y diario sepan su nombre y portada |
| `avisosPrecio` | **notificaciones** (los avisos de baja de precio) |
| `notisVistas` | **notificaciones** (campo `leida`) |
| `steamRecientesVistos` | Ninguna: cuándo vio la app crecer el tiempo de cada juego reciente de Steam, para ordenarlos del último jugado al más antiguo (Steam no da la fecha de los juegos prestados o de prueba) |
| `steamPreciosAvisados`, `steamPreciosRevisados` | Ninguna: recuerdan qué descuento ya se avisó y cuándo se revisó la lista de deseos de Steam |
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
  - Reseñas de Steam en la pestaña Reseñas: Real (comunidad de Steam). Cada reseña lleva al lado del @ la etiqueta de su origen (SAVESLOT o STEAM) y se pueden filtrar por Todas, SaveSlot o Steam. Las de Steam muestran 👍/👎 (Steam no usa nota) y enlazan a la original. La etiqueta de origen lleva el logo de su plataforma (SaveSlot en azul, Steam con borde). Si el autor de una reseña de Steam también tiene cuenta en SaveSlot (su Steam está vinculado, según la tabla **usuarios_steam**), lleva además **También en SaveSlot · @usuario** (azul, con el logo de SaveSlot); si no, no lleva nada extra.
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
  - Publicar o editar reseña o guía y registrar en el diario: Real (Supabase: tablas **resenas** y **diario**; editar cambia la reseña por su id y la marca como editada; la base suma +50 XP al publicar). Mientras guarda, el botón dice «Guardando…»; si falla, avisa «No pudimos guardar. Intenta de nuevo.» y conserva lo escrito. Con la cuenta de demostración se guarda en el navegador
  - Guardar borrador: Real (Supabase: el botón crea o actualiza el borrador de ese juego, uno por juego; al publicar, ese borrador pasa a publicado). El guardado automático mientras se escribe queda en el navegador
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
  - Entrar con correo (cuenta de SaveSlot): Real (Supabase Auth, signInWithPassword). Si la contraseña no coincide o falta confirmar el correo, lo dice junto al campo.
  - Cuenta de demostración: Real (sesión de invitado de Supabase, sin contraseña, con los datos de ejemplo cargados)
  - Steam: Real (`api/steam/auth.js` en Vercel + sesión de Supabase). Vuelve a la pantalla donde estaba, con Steam vinculada. Si Steam está vinculada a una cuenta de Google, Discord, Twitch o correo, abre esa cuenta.
  - Google, Discord y Twitch: Real (proveedores de Supabase Auth, signInWithOAuth). Vuelven a la pantalla donde estaba la persona. Si el servicio falla, el botón lleva a la página de error con la variante «acceso» y su nombre.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Con el correo mal escrito o sin contraseña, muestra el error junto al campo.
  - Al entrar, el encabezado muestra al usuario en vez de los botones de acceso.
  - La cuenta de demostración entra sin pedir datos y muestra el perfil de ejemplo.
  - Cada botón de servicio lleva a entrar con ese servicio (si falla: a la página de error con su nombre).

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
  - Crear cuenta con correo (cuenta de SaveSlot): Real (Supabase Auth, signUp). Supabase pide confirmar el correo: después de crearla, la pantalla dice "Te enviamos un correo a…" y el enlace del correo lleva a Editar perfil con "¡Cuenta creada!". El @ y el nombre quedan en la cuenta y la fila de **usuarios** se crea al confirmar.
  - Steam: Real (`api/steam/auth.js` en Vercel + sesión de Supabase). La cuenta nace con Steam vinculada y un @ sacado de su nombre de Steam, que puede cambiar en Editar perfil.
  - Google, Discord y Twitch: Real (proveedores de Supabase Auth, signInWithOAuth). Vuelven a la pantalla donde estaba la persona. Si el servicio falla, el botón lleva a la página de error con la variante «acceso» y su nombre.
  - Quien entra por primera vez con Google, Discord o Twitch recibe un @ libre sacado de su nombre en ese servicio (si está ocupado, con números), se crea su fila en **usuarios** y sigue a Editar perfil (pasos 2 y 3) con "¡Cuenta creada!", donde puede cambiar el @. Si ya tenía cuenta, entra con su perfil de la base aunque use otro navegador.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Cada campo vacío o inválido muestra su error.
  - El medidor cambia según la contraseña.
  - Cada botón de servicio lleva a crear la cuenta con ese servicio (si falla: a la página de error con su nombre).
  - Al crear la cuenta con correo, avisa que revise su correo; al confirmarlo (o al entrar por primera vez con un servicio) lleva a Editar perfil con el aviso "¡Cuenta creada!".

### 18. Perfil
- **Archivo de diseño:** disenos/perfil.html (y la ventana "Cómo ganar XP")
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda ver su actividad y sus juegos en un solo lugar. Sabemos que funciona si la persona entra a Editar perfil, Diario o Logros desde aquí.
- **Contenido:**
  1. Portada, avatar, nombre con el @ de SaveSlot al lado; debajo, los @ de las cuentas vinculadas (Steam con su logo y enlace a su perfil); luego el nivel de SaveSlot y el de Steam (con sus insignias), y "jugando ahora"
  2. Estadísticas (Juegos = biblioteca de Steam si está vinculada; Este año = juegos distintos que jugaste este año en Steam (biblioteca y recientes, también prestados o de prueba) y en tu diario, porque Steam no da la fecha de compra; Logros, Reseñas y Lista de deseos suman los de Steam)
  3. 4 juegos favoritos (pueden ser del catálogo o de la biblioteca de Steam)
  4. Actividad reciente: lo jugado en Steam las últimas 2 semanas y lo último del diario, con enlaces a Historial de reseñas y Diario
  5. Géneros más jugados y calificaciones
  6. Biblioteca de Steam: los 6 más jugados, con enlace a Biblioteca
  7. Lista de deseos: la de SaveSlot y la de Steam (con precio y descuento; se ven 6 y "Ver los N de Steam"). "Te avisaremos si bajan de precio": con Steam vinculada, avisa cuando un juego de la lista de Steam entra en oferta (ver Notificaciones)
  8. Sobre mí, XP, Amigos, conexiones y Mis eventos
  9. Editar perfil y Compartir
  10. Misiones: 3 diarias y 3 semanales de juegos, con su XP, su avance (con Steam vinculada) y cuándo se reinician
- **Qué funciona de verdad:**
  - Misiones diarias y semanales: Real (`api/steam/misiones.js` con Steam; la base suma el XP). Sin Steam vinculada se ven con "Vincula Steam para hacerlas"
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
  1. Perfil público: foto, nombre, usuario (@), sobre mí, qué estás jugando
  2. 4 juegos favoritos
  3. Géneros favoritos
  4. Cuentas vinculadas (plataformas y formas de entrar: Google, Discord y Twitch)
  5. Guardar o Cancelar
  6. Borrar cuenta
- **Qué funciona de verdad:**
  - Guardar cambios (incluye "qué estás jugando", que define el estado "jugando"): Real (Supabase)
  - Cambiar el @: Real. De 3 a 20 letras, números, punto o guion bajo; avisa si está ocupado. Los datos pasan al nuevo @, y con Steam se guarda en Supabase Auth. La cuenta de demostración no lo puede cambiar. (Hoy solo se compara con los usuarios de ejemplo y las cuentas del navegador; al tener la tabla **usuarios**, se revisa contra todos.)
  - "¿Qué estás jugando ahora?": con Steam vinculada, la primera opción es "Automático: lo que juegues en Steam" y se puede elegir un juego de la biblioteca de Steam o del catálogo; lo de Steam manda cuando estás jugando en Steam.
  - Favoritos: búsqueda sencilla: se escribe el nombre y se autocompleta con cualquier juego de IGDB, lo tengas o no (busca mientras escribes, desde 2 letras; sin texto no sugiere nada). Enter o «Agregar» lo suma.
  - Vincular Steam: Real (Steam). Si la cuenta es de Google, Discord, Twitch o correo, Steam se guarda en ESA cuenta (no crea otra) y después también se puede entrar con Steam a ella. Si esa cuenta de Steam ya está en otra cuenta de SaveSlot, avisa que hay que entrar con Steam, borrar esa cuenta y volver a vincularla. Vincular Xbox: Simulado
  - Formas de entrar (Google, Discord y Twitch): Real (Supabase Auth, vinculación manual). Vincula o desvincula cada servicio en la misma cuenta, para entrar con cualquiera de ellos (siempre queda al menos una forma de entrar). Si ese servicio ya es de otra cuenta de SaveSlot, avisa igual que con Steam. La cuenta de demostración no puede. La cuenta creada al entrar con Steam también puede: después se entra a ella con Steam o con el servicio vinculado.
  - Borrar cuenta: Real (Supabase, función `borrar_mi_cuenta` en supabase/borrar-cuenta.sql). Pide confirmar; borra la cuenta y en cascada su perfil, reseñas, diario, amigos y cuentas vinculadas, su foto subida y lo guardado en ese navegador, cierra la sesión y vuelve a Inicio. No toca las cuentas de Steam, Google, Discord ni Twitch.
  - Vincular PlayStation o Nintendo: Después (no tienen conexión pública, según el diseño)
  - Foto de perfil: Real (Supabase Storage). Por defecto se usa la foto de Steam (si está vinculada) o las iniciales. "Cambiar foto" sube una imagen propia, recortada en cuadrado; "Usar la de Steam" vuelve a la de Steam y "Quitar foto" deja las iniciales. Al guardar, queda en la cuenta (`user_metadata.foto`) y se ve en el Perfil y en la barra. Sin sesión de Supabase (cuentas de correo de prueba y la de demostración), o si la subida falla, la foto queda solo en ese navegador y la app lo avisa.
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, con sus portadas (de assets/ o de IGDB).
  - Funciona en celular (375 px de ancho).
  - No deja agregar un quinto favorito.
  - Los cambios guardados se ven en el Perfil.
  - Un @ inválido u ocupado muestra su error y no deja guardar.
  - Una foto que no es JPG, PNG o WebP, o de más de 8 MB, muestra su error; una foto guardada se ve en el Perfil y en la barra.

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
  - Tus reseñas de Steam: Real (comunidad de Steam). Llevan la etiqueta Steam (con su logo), muestran si recomiendas el juego y se editan desde Steam; salen con el filtro "Todas" (no tienen nota). Las de SaveSlot llevan la etiqueta SaveSlot (con su logo).
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
- **Número de la campana:** cuenta solo los avisos y solicitudes que todavía no has visto; al abrir la ventana se quita (lo visto se guarda en el navegador, `ss.notisVistas`).
- **Qué funciona de verdad:** Avisos: Real (Supabase): votos "útil" a tus reseñas y cierre de inscripciones de tus eventos. Real (Steam): baja de precio de un juego de tu lista de deseos de Steam (se revisa cada 6 horas al abrir cualquier página; el aviso queda 7 días y se guarda en el navegador)
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
- **Qué funciona de verdad:** Enviar mensaje: Real (Supabase: se agrega a **mensajes_contacto** con guardarDatos(); el tema se guarda con su id. Mientras envía, el botón dice «Guardando…»; si falla, avisa «No pudimos guardar. Intenta de nuevo.» y conserva lo escrito)
- **Está lista cuando:**
  - Se ve igual al diseño aprobado, sin la tarjeta de correo y redes.
  - Funciona en celular (375 px de ancho).
  - No deja enviar con campos vacíos o correo inválido.
  - Al enviar sale la ventana "Mensaje guardado".
  - Las preguntas frecuentes se abren y cierran.

### 28. Ventana: Mensaje guardado
- **Archivo de diseño:** disenos/contacto.html (ventana emergente)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda confirmar que su mensaje quedó guardado. Sabemos que funciona si la persona no envía el mismo mensaje dos veces.
- **Texto:** «Tu mensaje le llegó al equipo de SaveSlot. Te responderemos a tu correo.»
- **Está lista cuando:**
  - Se ve igual al diseño aprobado.
  - Funciona en celular (375 px de ancho).
  - Se cierra y deja el formulario vacío.

### 29. Error y estado de servicios
- **Archivo de diseño:** disenos/error.html (variantes: servicio caído, límite de consultas, tiempo agotado, credenciales, mantenimiento, sin conexión, prototipo, estado de servicios; «plataforma sin API», «pagos» y «función no disponible» se quitaron porque ninguna pantalla lleva a ellas: Editar perfil y Detalle de evento ya lo explican ahí mismo)
- **Objetivo:** Esta pantalla existe para que el gamer casual pueda entender qué falló y qué hacer. Sabemos que funciona si la persona toca "Reintentar" o "Ir al inicio" en vez de cerrar la página.
- **Contenido:**
  1. Título y explicación del error
  2. Qué puedes hacer
  3. Botones: Reintentar, Ir al inicio, Reportar el problema
  4. Estado de los servicios
- **Qué funciona de verdad:**
  - Estado de los servicios: Real para catálogo (IGDB), Steam, base de datos y cuentas (Supabase): se revisan al abrir la página y dicen «Con fallas» si no responden. Los demás son fijos (data.js).
  - Errores de IGDB: según lo que responda, lleva a la variante que corresponde (límite de consultas, tiempo agotado a los 15 s, credenciales, mantenimiento, sin conexión o servicio caído) con «Reintentar» para volver a la página.
  - «Acceso»: sale si falla entrar con Google, Discord o Twitch, con «Reintentar» y «Entrar de otra forma».
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

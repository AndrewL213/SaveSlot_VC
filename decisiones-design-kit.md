# Auditoría del design kit — SaveSlot (página web)

> Este archivo tiene dos partes: la **auditoría** (propuestas, filas 1 a 99) y, al final, las **decisiones finales** con lo que quedó en `css/tokens.css` y `css/components.css`. Si una propuesta y una decisión no coinciden, manda la decisión.

**Qué se revisó:** carpeta `disenos/` de este repositorio (17 pantallas HTML, `css/styles.css` y 6 archivos JS que generan parte de la interfaz), versión del 2-nov-2026 (commit `ced7d25`).
**Cómo se midió:** se leyó todo el código y se abrieron las 18 vistas en un navegador (escritorio 1440 px y móvil 390 px; perfil, diario y editar perfil con sesión iniciada; detalle de evento con un torneo y un sorteo). Se registraron los estilos reales de cada elemento visible.

- **"Código"** = cuántas veces aparece el valor escrito en los archivos (como `var(--token)` o como valor fijo).
- **"Pantalla"** = cuántos elementos visibles lo usan, sumando las 18 vistas de escritorio.
- **Tipo:** *Accidental* = valores casi iguales que nadie decidió → se propone uno solo. *Intencional* = versiones distintas a propósito → se proponen variantes con nombre.
- Las filas están numeradas de corrido en todas las tablas para responder por número.

## Resumen

- La base está bien: 21 colores en variables (`:root`), una sola fuente y componentes con clase propia.
- Los problemas vienen de **estilos escritos a mano** (326 atributos `style=""` en HTML y JS) y de **colores en hexadecimal** donde ya había variable.
- El CSS dice "grilla de 8 px", pero los rellenos más usados después de 12 son **14, 10, 18 y 6** (fuera de esa grilla).
- Hay **14 radios de borde**, **22 tamaños de letra** y **6 sombras** distintas.

---

## 1. Colores

| n.º | elemento | versiones encontradas | dónde | tipo | propuesta |
|---|---|---|---|---|---|
| 1 | `--bg` fondo de página | `#12161D` · rgb(18,22,29) · hsl(218,23%,9%). Código: 12 `var()` + 2 hex + 17 `theme-color`. Pantalla: 35 fondos, 18 cabeceras (al 92 %), 4 textos | Fondo general, campos de formulario, texto del chip activo, color de la barra del navegador en las 17 pantallas | Intencional | Mantener `--bg`. |
| 2 | `--bg-deep` fondo hundido | `#0E1218` · rgb(14,18,24) · hsl(216,26%,7%). Código: 2 `var()` + 1 rgba. Pantalla: 19 | Footer (todas), barra lateral de MatchPlay, barra inferior móvil | Intencional | Mantener `--bg-deep`. |
| 3 | `--surface` superficie | `#1B222C` · rgb(27,34,44) · hsl(215,24%,14%). Código: 24. Pantalla: 117 fondos + 2 bordes | Tarjetas, paneles, reseñas, datos, buscador del header, burbuja del bot, modal, anillo del avatar del perfil | Intencional | Mantener `--surface`. |
| 4 | `--surface-2` superficie elevada | `#242D3A` · rgb(36,45,58) · hsl(215,23%,18%). Código: 17. Pantalla: 167 | Botón secundario, chips, avatares, encabezado de tabla, radio-card, spoiler, pestaña activa, hover del menú | Intencional | Mantener `--surface-2`. |
| 5 | Hover de fila de tabla | `#202834` · rgb(32,40,52) · hsl(216,24%,16%). Código: 2 hex (CSS y `pages-cuenta.js`) | Diario (hover de fila), página de error (fila del servicio caído) | Accidental (queda entre `--surface` y `--surface-2` sin variable) | Usar `--surface-2`. |
| 6 | `--line` bordes | `#2E3A4A` · rgb(46,58,74) · hsl(214,23%,24%). Código: 54 `var()` (el más referenciado). Pantalla: 467 bordes, 14 fondos | Bordes y separadores en las 18 vistas, calaveras y barras de dificultad apagadas, medidores vacíos | Intencional | Mantener `--line`. |
| 7 | `--fg` texto principal | `#E6EBF1` · rgb(230,235,241) · hsl(213,28%,92%). Código: 41 `var()` + 7 hex. Pantalla: 530 textos, 4 fondos | Texto principal, fondo del toast y del chip activo. El hex se repite en 4 badges (`color:#E6EBF1`) y 2 íconos SVG | Accidental (hex en vez de variable) | Mantener `--fg` y cambiar los 7 hex por `var(--fg)` o `currentColor`. |
| 8 | `--fg-soft` texto secundario | `#C3CDD8` · rgb(195,205,216) · hsl(211,21%,81%). Código: 9. Pantalla: 119 | Migas de pan, barra de prototipo, listas, respuestas de preguntas frecuentes | Intencional | Mantener `--fg-soft`. |
| 9 | `--muted` texto atenuado | `#9AA8B8` · rgb(154,168,184) · hsl(212,17%,66%). Código: 29 `var()` + 5 hex. Pantalla: 547 textos (el color más visto) + 21 íconos | Metadatos, menú, etiquetas en mayúsculas, ícono de lupa (hex fijo en SVG) | Accidental (hex en los SVG) | Mantener `--muted`; íconos con `currentColor`. |
| 10 | `--placeholder` | `#75849A` · rgb(117,132,154) · hsl(216,15%,53%). Código: 3. Pantalla: 21 | Texto de ayuda dentro de campos, créditos del footer, botón borrar chat | Intencional | Mantener `--placeholder`. |
| 11 | Blanco sobre imagen | `#FFFFFF` · rgb(255,255,255). Código: 2. Pantalla: 22 | Título y número de ranking sobre portadas (inicio, juego, perfil, juego random, editar perfil) | Intencional (más contraste sobre foto) | Crear `--on-image: #FFFFFF`. |
| 12 | `--accent` azul primario | `#3DA9F5` · rgb(61,169,245) · hsl(205,90%,60%). Código: 30 `var()` + 5 hex. Pantalla: 66 fondos + 13 bordes | Botón primario, badge acento, medidores, chip azul activo, bordes de foco y de buscadores, logo y favicon (hex), borde de voto (hex en JS), tarjeta del evento del mes (hex) | Accidental (hex en logo, JS y tarjeta) | Mantener `--accent`; reemplazar los hex por la variable. |
| 13 | `--accent-ink` texto sobre azul | `#08131C` · rgb(8,19,28) · hsl(207,56%,7%). Código: 9 `var()` + 3 hex. Pantalla: 55 | Texto de botones primarios y badges, íconos del botón enviar en MatchPlay (hex), base de `.glass` | Accidental (hex en SVG) | Mantener `--accent-ink`. |
| 14 | `--accent-text` azul para texto | `#6CC0FA` · rgb(108,192,250) · hsl(205,93%,70%). Código: 18 `var()` + 3 hex. Pantalla: 52 | Enlaces, eyebrow, iniciales de avatar, contorno de foco, pestaña activa móvil, íconos de modales (hex) | Intencional (azul más claro para que el texto pase AA) | Mantener; íconos con `currentColor`. |
| 15 | `--accent-hover` | `#9AD4FB` · rgb(154,212,251) · hsl(204,92%,79%). Código: 2 `var()` + 1 hex. Pantalla: 2 | Hover de enlaces; también como borde del badge "EVENTO DEL MES" (inicio, eventos) | Accidental (color de hover usado como borde) | Solo para hover. El badge usa la variante "Sobre imagen" (fila 82). |
| 16 | `--accent-deep` azul oscuro | `#1A3157` · rgb(26,49,87) · hsl(217,54%,22%). Código: 0 `var()` + 4 hex. Pantalla: 4 | Tarjeta del evento del mes, banda de torneos, fondo de íconos de modales. La variable existe, pero nunca se usa | Accidental (siempre en hex) | Usar `var(--accent-deep)` en los 4 sitios. |
| 17 | Burbuja del usuario | `#173350` · rgb(23,51,80) · hsl(211,55%,20%). Código: 1 (`--user-bubble`) | MatchPlay, mensajes del usuario | Accidental (casi igual a `#1A3157`) | Unificar con `--accent-deep` y borrar `--user-bubble`. |
| 18 | Azul sobre fondo claro | `#0B5FA0` · rgb(11,95,160) · hsl(206,87%,34%). Código: 1 | Botón "Deshacer" dentro del toast (el toast tiene fondo claro) | Intencional | Crear `--accent-on-light`. |
| 19 | `--good` verde logros + `--good-deep` | `#4CC870` · rgb(76,200,112) · hsl(137,53%,54%) (código 15 `var()` + 2 hex; pantalla 43 textos, 15 fondos, 5 bordes) · `#1D3A2B` · rgb(29,58,43) (0 `var()`, 3 hex) | Notas /10, badge de logro, punto "jugando ahora", medidores de logros, texto "Listo", banda de sorteos, fondo del ícono de éxito | Accidental (`--good-deep` solo en hex) | Mantener ambas y usarlas con `var()`. |
| 20 | Banda por defecto | `#13392B` · rgb(19,57,43) · hsl(158,50%,15%). Código: 1 | Color de respaldo de la banda superior de juego y evento | Accidental (casi igual a `#1D3A2B`) | Usar `--good-deep`. |
| 21 | `--bad` rojo + `--bad-deep` | `#F0616D` · rgb(240,97,109) · hsl(355,83%,66%) (16 `var()` + 3 hex; pantalla 15 textos, 12 fondos, 4 bordes) · `#2A1E24` · rgb(42,30,36) (3 `var()` + 2 hex) | Errores de formulario, calaveras y barras de dificultad, corazón "Me gusta", hover de borrar chat, ícono de la página de error | Accidental (hex en SVG y JS) | Mantener y usar con `var()`. |
| 22 | Ámbar sin variable | `#E0A23B` · rgb(224,162,59) · hsl(37,73%,55%). Código: 4 hex. Pantalla: 9 | Aviso "solo inscripción de pago" (detalle de evento), fuerza de contraseña media (crear cuenta), estado "pendiente" de cuentas vinculadas (editar perfil) | Intencional (estado de aviso) | Crear `--warn: #E0A23B` y `--warn-deep`. |
| 23 | `--ai` morado IA + `--ai-deep` | `#A99BFF` · rgb(169,155,255) · hsl(248,100%,80%) (9 `var()`; pantalla 24 textos, 7 bordes) · `#25213F` · rgb(37,33,63) (3 `var()`; pantalla 20) | Etiqueta "IA", barra de prototipo, insignia de MatchPlay, tarjeta de MatchPlay en Contáctanos | Intencional | Mantener. |
| 24 | Negros translúcidos para capas | rgba(0,0,0,.5) · .55 · .6 · .65 | Degradado de portadas (.55), ranking sobre portada (.6), botón "quitar favorito" en editar perfil (.65, en línea) | Accidental | Una sola: `--overlay: rgba(0,0,0,.6)`. |
| 25 | Fondo oscuro detrás de modales | rgba(5,8,12,.75) · rgba(5,8,12,.6) | Modal (.75); panel deslizable de MatchPlay en móvil (.6) | Accidental | Una sola: `--scrim: rgba(5,8,12,.7)`. |
| 26 | Barras translúcidas | rgba(18,22,29,.92) (`--bg`) · rgba(14,18,24,.96) (`--bg-deep`) | Header (todas) · barra inferior móvil | Accidental (mismo papel, dos bases y dos opacidades) | Ambas `rgba(14,18,24,.94)` con desenfoque. |
| 27 | Blancos translúcidos | rgba(255,255,255,.08) · rgba(255,255,255,.3) | Hover del botón cerrar de la barra de prototipo (.08); borde de badges de plataforma sobre la banda del juego (.3) | Intencional (usos distintos) | `--hover-veil: .08` y `--on-image-line: .3`. |
| 28 | Vidrio sobre banda | rgba(8,19,28,.45) · radio 10 | Cajas de datos sobre la banda del evento (torneo y sorteo) | Intencional | Mantener como `--glass`. |
| 29 | Colores de portada y de evento (contenido) | 12 colores por juego: `#2F6B4F` `#7C7566` `#2456C4` `#5B3F96` `#B8343E` `#6B3A1E` `#2B3A55` `#8A2B2B` `#3E5A2A` `#7A2E2E` `#3A3F45` `#5A2D6B`; 6 por evento: `#1F4A8A` `#2456C4` `#5B3F96` `#2B5A3F` `#6B3A1E` `#B8343E`. Pantalla: 54 fondos | `data.js` y `api.js` (la paleta de 8 está copiada en los dos). Fondo de portada mientras carga la imagen y color de la banda del juego | Intencional (identidad de cada juego), con duplicados accidentales: `#8A2B2B`≈`#7A2E2E`, `#2F6B4F`≈`#2B5A3F` | Una sola "paleta de contenido" de 8 colores en `data.js`; `api.js` la importa. |
| 30 | Banner del perfil | `#1F4A8A` · rgb(31,74,138) · hsl(216,63%,33%). Código: 1 en línea | Perfil (franja superior) | Accidental (color de evento reutilizado a mano) | Usar `--accent-deep` o un color de la paleta de contenido. |
| 31 | Banda superior del juego | `color-mix(color del juego 55 %, #12161D)` | Detalle de juego | Intencional | Mantener, con `var(--bg)` en lugar de `#12161D`. |

## 2. Tipografía

| n.º | elemento | versiones encontradas | dónde | tipo | propuesta |
|---|---|---|---|---|---|
| 32 | Familia principal **Figtree** | Cargada desde **Google Fonts** (`fonts.googleapis.com`, con `preconnect`) en las 17 pantallas. Pesos pedidos: 400, 500, 600, 700, 800. Pantalla: 2.535 elementos (todos) | Toda la web, incluido el logo y el atajo `/` | Intencional | Mantener. Quitar el peso 500 de la URL: ningún elemento lo usa (se descarga sin necesidad). |
| 33 | ⚠️ **RIESGO** — fuentes de respaldo `system-ui, -apple-system, "Segoe UI", sans-serif` | No se cargan de **ningún lado**: solo funcionan si están instaladas en el equipo | Toda la web, cuando Figtree no llega: sin internet, con la web instalada como app (tiene `manifest`), o si una red bloquea Google Fonts. En Windows se vería Segoe UI, en Mac/iPhone San Francisco y en Android Roboto, con otros anchos y alturas | Intencional (respaldo), pero es un riesgo | Guardar Figtree (woff2) en `assets/fuentes/` y cargarla con `@font-face` desde el repo. Mantener el respaldo como último recurso. |
| 34 | Pesos | 400 texto · 600 menú, atajo `/`, toast · 700 botones, labels, badges · 800 títulos, números, logo · 500 sin uso | Toda la web | Intencional | Escala de 4 pesos: 400 / 600 / 700 / 800. |
| 35 | Título principal (h1) | 52 (inicio) · 48 (juego) · 46 (evento) · 44 `.page-title` (10 pantallas) · 36 (MatchPlay) · 32 (perfil) · 30 (escribir reseña) · 28 (buscar). Todos 800, interletrado −.02em. Casi todos en línea con `clamp()` distintos | Todas las pantallas | Intencional (portada vs. página interna) + accidental (6 tamaños sobrantes) | **Título hero** `clamp(34px,5vw,52px)` para inicio, juego y evento. **Título de página** `clamp(30px,4vw,44px)` para todas las demás. |
| 36 | Título de sección (h2) | 26 (`.section-head`, inicio; 22 en móvil) · 24 en línea (×8) · 22 en línea (×11) · 20 (×4) · 18 (×2) · 34 (juego random) · 30 (iniciar sesión) · 28 (crear cuenta) | Inicio, eventos, logros, evento, contacto, editar perfil, error, perfil, juego, MatchPlay, login, registro | Accidental | **H2** 24/800 (22 en móvil) en toda la web. Login, registro y juego random usan el Título de página. |
| 37 | Título de tarjeta (h3 / negritas) | 18/800 (`.card h3`) · 17/700 (portadas) · 19/700 · 20/700 · 16/700 | Tarjetas, portadas, filas de logros, eventos y footer | Accidental | **H3** 18/700; negrita en línea 16/700. |
| 38 | Etiquetas en mayúsculas | Eyebrow 13/700/.12em azul · panel 12/800/.1em · tabla y dato 12/700/.08em · en línea 13/700/.08em y .06em | Eyebrow: 5 pantallas. Resto: perfil, juego, diario, error, logros | Eyebrow intencional; el resto accidental | **Eyebrow** 13/700/.12em `--accent-text`. **Etiqueta** 12/700/.08em `--muted` para todo lo demás. |
| 39 | Texto de párrafo | 16/400/1.55 (base) · 15/400 (casillas, tablas) · 17/400 (subtítulos de 5 pantallas) · 18/400 (texto destacado) | Toda la web | Accidental (15 y 17) | **Base** 16/400/1.55. **Destacado** 18/400. El 15 pasa a 16 y el 17 a 18. |
| 40 | Texto pequeño | 14/400 (340 elementos, el tamaño más usado) · 13/400 (163: ayudas, créditos, barra de prototipo) · 12/400 (contadores) · 11/700 (etiqueta IA, "Pronto") | Toda la web | Accidental | **Pequeño** 14 y **Nota** 12. El 11 pasa a 12. El 13 queda a decidir (12 o 14). |
| 41 | Textos de control | Botón 16/700 · botón pequeño 14/700 · label 15/700 · menú 15/600 · chip 14/400 · chip de MatchPlay 13/400 · pestaña móvil 11/700 | Formularios, header, chips, barra inferior | Intencional (cada control) + accidental (el 15 queda fuera de escala) | Botón 16/700 · botón sm 14/700 · label 14/700 · menú 14/600 · chip 14 · pestaña móvil 12/700. |
| 42 | Números grandes | Dato 26/800/1.1 (diario, logros) · dato del juego 28/800/1 (22 en móvil) · nota 18/800 · 15/800 en tabla | Diario, logros, juego | Accidental (mismo uso, dos tamaños) | **Número** 28/800/1.1 (22 en móvil). |
| 43 | Logo | 22/800 (20 en móvil) | Header | Intencional | Mantener. |
| 44 | Altura de línea | 1.55 texto · 1.15 títulos · 1.2 portadas y perfil · 1.1 · 1 · 1.3 y 1.35 (en línea) | Toda la web | Accidental (1.1, 1, 1.3 y 1.35) | Tres valores: `--lh-text` 1.55 · `--lh-title` 1.15 · `--lh-tight` 1.2. |
| 45 | Interletrado de títulos | −.01em (CSS de h1–h3) · −.02em (en línea en títulos grandes) | Todos los títulos | Intencional (más cerrado cuanto más grande) | Tokens: `--tracking-title` −.01em y `--tracking-display` −.02em. |

## 3. Espaciados

| n.º | elemento | versiones encontradas | dónde | tipo | propuesta |
|---|---|---|---|---|---|
| 46 | Escala de rellenos | 12 (856 usos) · 14 (420) · 10 (286) · 8 (258) · 18 (176) · 6 (173) · 16 (154) · 32 (114) · 3 (108) · 22 (76) · 20 (70) · 40 (50) · 28 (25) · 4 · 7 · 24 · 36 · 48 · 56 · 80. El CSS dice "grilla de 8 px", pero 3, 6, 7, 10, 14, 18, 22 y 36 están fuera | Toda la web | Accidental | Escala de 4 px con tokens: **4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64 · 80**. Mapeo: 3→4, 6/7→8, 10→12, 14→16, 18→16, 22→24, 28→32, 36→40, 56→64. |
| 47 | Separaciones (gap) | 8 (236) · 12 (109) · 10 (103) · 6 (99) · 4 (46) · 16 (42) · 40 · 14 · 20 · 18 · 48 · 28 · 24 · 2 · 32 · 22 · 26 | Toda la web (98 `gap` escritos en línea) | Accidental | Misma escala que la fila 46. |
| 48 | Relleno de tarjetas | Tarjeta y reseña 18 · dato 16 · panel 22 (18 en móvil) · panel en línea 28 (contacto, escribir reseña) · modal 28 (20 en móvil) · radio-card 16 · spoiler 14 · vidrio 12 · vacío 28 · evento destacado 28 | Todas | Accidental | Tarjeta **16** · Panel **24** (16 en móvil) · Modal y tarjeta destacada **32** (24 en móvil). |
| 49 | Relleno de controles | Botón 12/20 · botón sm 8/14 · chip 8/14 · chip MatchPlay 6/12 · campo 12 · select de filtros 8/12 · menú 10/14 · pestaña 12/16 · segmentado 10 · ítem de chat 10/12 · badge 3/8 · etiqueta IA 1/6 · atajo 3/6 · ranking 3/7 | Formularios, header, chips, badges | Accidental | Botón 12/20 · sm y chip 8/16 · menú y chat 12/16 · badge 4/8 · etiqueta pequeña 2/6. |
| 50 | Ritmo de página | Página: 40 arriba, 80 abajo y 40 entre bloques (móvil 24/48/32) · margen lateral 32 (móvil 16) · sección 18 · columnas 28 · banda hero 28/36 (móvil 18/24) · chat 28/32 · footer 40 y 48 | Todas | Intencional (página) + accidental (18, 28, 36) | Mantener 40/80/40 y 32/16 lateral. Sección **16**, columnas **32**, banda **32/40** (móvil **16/24**). |
| 51 | Márgenes | Casi todo en 0 (se maqueta con `gap`) · `auto` para empujar · −64 px (avatar sobre el banner del perfil) · 8 y 10 abajo en línea | Perfil, escribir reseña, editar perfil | −64 intencional; 8 y 10 accidentales | Quitar márgenes en línea y usar `gap`. Mantener el −64. |
| 52 | Alturas mínimas de controles | 24 (ayuda) · 28 (pregunta frecuente) · 32 (cerrar barra, borrar chat, valorar respuesta, barras de dificultad) · 36 (chip MatchPlay, "leer reseña", quitar favorito) · 40 (botón sm, chip, fantasma, ítem de chat) · 44 (botón de ícono, buscador del header, segmentado, filtros, cerrar modal) · 48 (botón, campo, pestaña) · 52 (pestaña móvil) | Toda la web | Intencional (tamaños) + accidental (8 alturas) | Tres tamaños: **32** (solo escritorio, dentro de listas) · **40** (sm) · **48** (normal); 52 se queda en la barra móvil. |
| 53 | Anchos máximos | Contenedor 1280 · chat 880 · buscador grande 760 · modal 480 · títulos 820 y 480 (en línea) | Inicio, MatchPlay, modales, login | Intencional | Tokens `--maxw` (ya existe), `--maxw-text` 880, `--maxw-search` 760, `--maxw-modal` 480. |

## 4. Bordes y sombras

| n.º | elemento | versiones encontradas | dónde | tipo | propuesta |
|---|---|---|---|---|---|
| 54 | Radios muy pequeños | 2 (barras en línea) · 3 (calaveras, medidor de contraseña) · 4 (badges, atajo `/`, medidores, ranking, etiqueta IA) | Juego, crear cuenta, inicio, eventos, logros | Accidental | **4** (`--radius-xs`). |
| 55 | Radios pequeños | 6 (enlaces del menú ×90, portada pequeña, cerrar barra, borrar chat, valorar) · 7 (botones del segmentado) · 8 (botones, campos, buscador del header, spoiler, ítem de chat; 176 elementos) | Toda la web | Accidental | **8** (`--radius-sm`, que ya existe y no se usa en ningún lado). |
| 56 | Radios medianos | 10 (portadas, vidrio, segmentado, toast, avatar cuadrado) · 12 (tarjetas, reseñas, datos, radio-card, buscador grande, vacío) · 14 (paneles, tablas, burbujas, caja de MatchPlay) | Toda la web | Accidental | **12** (`--radius`, que existe pero solo se usa una vez). Los paneles quedan a decidir: 12 o 16. |
| 57 | Radios grandes | 16 (banner y cabecera del perfil) · 18 (modal, avatar de editar perfil) · 20 (hoja inferior en móvil) | Perfil, editar perfil, modales | Accidental | **16** (`--radius-lg`). |
| 58 | Píldora y círculo | 999 px (chips, píldora del usuario) · 50 % (avatares, puntos, cerrar modal, quitar favorito) | Toda la web | Intencional | `--radius-pill` y `--radius-round`. |
| 59 | Burbujas de chat | 14 14 4 14 (usuario) · 14 14 14 4 (bot) | MatchPlay | Intencional (la esquina recta señala quién habla) | Igual, pero con 16 y 4 para seguir la escala. |
| 60 | Borde de 1 px sólido | ≈540 elementos con `--line` | Toda la web | Intencional | Mantener como borde base. |
| 61 | Borde destacado | 1,5 px (buscador grande, caja de MatchPlay) · 2 px (radio-card marcada, subrayado de pestaña, contorno de foco, avatar de editar perfil, anillo de portada en hover) | Inicio, buscar, MatchPlay, evento, juego, comunidad | Accidental (1,5 px se dibuja como 1 px en la mayoría de pantallas; así se vio en la prueba) | **2 px** para todo lo destacado. |
| 62 | Anillos de avatar | 6 px (avatar del perfil) · 5 px (punto "jugando ahora") | Perfil | Accidental | **6 px** los dos (o 4 px en móvil). |
| 63 | Borde discontinuo | 1 px `dashed` | Spoiler (juego, comunidad), estado vacío, tarjeta de demo en iniciar sesión | Intencional (contenido oculto, vacío o de prueba) | Mantener como variante "discontinuo". |
| 64 | Sombras | 1) Brillo del botón primario: `0 8px 20px -12px rgba(61,169,245,.8)` · 2) Tarjeta en hover: `0 14px 30px -16px rgba(0,0,0,.8)` · 3) Portada en hover: `0 0 0 2px accent, 0 16px 32px -16px rgba(0,0,0,.85)` · 4) Modal: `0 30px 80px rgba(0,0,0,.6)` · 5) Toast: `0 10px 30px rgba(0,0,0,.5)` · 6) Panel de chat móvil: `20px 0 60px rgba(0,0,0,.6)` | Botones, tarjetas, portadas, modales, toasts, MatchPlay | 1 intencional; 2 y 3 accidentales entre sí; 4, 5 y 6 accidentales entre sí | Tres sombras: `--shadow-hover` 0 16px 32px −16px rgba(0,0,0,.8) · `--shadow-overlay` 0 24px 64px rgba(0,0,0,.6) · `--shadow-glow` (la 1). El anillo de 2 px queda como borde destacado (fila 61). |
| 65 | Contorno de foco | 2 px `--accent-text`, separación 2 px, radio 6 | Toda la web (teclado) | Intencional | Mantener; radio a 8. |

## 5. Componentes que se repiten

| n.º | elemento | versiones encontradas | dónde | tipo | propuesta |
|---|---|---|---|---|---|
| 66 | Botón | Primario, Secundario y Fantasma en tamaño normal (48) y pequeño (40), más "ancho completo". "Peligro" existe en el CSS pero no se usa. En línea: botón de 36 ("leer reseña", diario), redondo de 36 ("quitar favorito", editar perfil) y cuadrado de 48 (enviar, MatchPlay) | Las 18 pantallas (header: "Iniciar sesión" secundario + "Crear cuenta" primario) | Intencional (variantes) + accidental (los tres en línea) | **Botón**: Primario · Secundario · Fantasma · Peligro, en tamaños md (48) y sm (40). Nuevo **Botón de ícono** (48 y 40, cuadrado o redondo). Usar Peligro en "Desvincular". |
| 67 | Botones sueltos sin la clase `.btn` | Botón de ícono 44 · cerrar modal 44 redondo · cerrar barra de prototipo 32 · borrar chat 32 · "Deshacer" del toast 40 subrayado · "¿Cómo se calcula?" 24 · "Útil / No me sirve" 32 · ítem de chat 40 · ojo de contraseña (ícono sin borde, en línea) | Header, modales, MatchPlay, juego, perfil, login | Accidental (9 estilos para el mismo tipo de botón) | Pasan a **Botón de ícono** o **Botón fantasma sm**. "¿Cómo se calcula?" queda como enlace. |
| 68 | Selector 1–10 | Nota: botón secundario con fondo azul en línea · Dificultad: botón secundario con fondo rojo/gris en línea, 32 de alto y sin borde | Escribir reseña | Accidental (se reutiliza el botón y se pisa con estilos en línea) | Componente **Selector 1–10** con variantes **Nota** (azul) y **Dificultad** (rojo). |
| 69 | Indicador de dificultad | Calaveras 14×18 radio 3 (ver) · barras 32 de alto radio 8 (editar) | Juego · escribir reseña | Intencional (ver y elegir) con aspecto distinto | Misma forma en los dos: barras con radio 4. |
| 70 | Estado "presionado" | "Me gusta": borde rojo en línea · "Útil / No me sirve": borde azul · chip presionado: fondo claro | Escribir reseña, MatchPlay, filtros | Accidental (tres estilos para lo mismo) | Un estado **Seleccionado** común (borde 2 px + texto en color). |
| 71 | Tarjeta base | `.card` (relleno 18, radio 12) · `.review` (exactamente igual) · `.card-link` (con hover que la eleva) | Inicio, juego, comunidad, logros, perfil, contacto, MatchPlay | Accidental (`.review` duplica `.card`) | **Tarjeta** con variante **Enlace**; la reseña usa `.card`. |
| 72 | Dato numérico | `.stat`: número 26 + texto 13 · `.fact`: etiqueta 12 en mayúsculas + número 28. Misma caja (16, radio 12) | Diario, logros · juego | Accidental | Un componente **Dato** (etiqueta arriba, número 28). |
| 73 | Panel | Relleno 22 y radio 14 (19 usos) · relleno 28 en línea (contacto, escribir reseña) · cabecera del perfil sin borde superior y radio 0 0 16 16 | Buscar, contacto, eventos, juego, editar perfil, error, juego random, perfil | Intencional (contenedor grande) con valores accidentales | **Panel** con relleno 24 y radio 12 o 16 (decidir). |
| 74 | Tarjetas de color (en línea) | Evento del mes (`#1A3157` + borde azul + 28) · MatchPlay (morado IA) · aviso (borde `#E0A23B`) · demo (fondo `--bg`, borde azul discontinuo) · dato con borde azul | Inicio, eventos, contacto, evento, iniciar sesión, juego | Intencional, pero hecho con estilos en línea | Modificadores de **Tarjeta**: Destacada · IA · Aviso · Demo. |
| 75 | Opción de inscripción (radio-card) | Normal · marcada (borde 2 px azul) · desactivada (opacidad .6) | Detalle de evento | Intencional | Mantener (radio 12, relleno 16). |
| 76 | Spoiler y estado vacío | Spoiler: `--surface-2`, discontinuo, radio 8, relleno 14 · Vacío: discontinuo, radio 12, relleno 28 | Juego, comunidad · listas vacías | Intencional | Mantener; radio 12 y relleno 16/32. |
| 77 | Modal / hoja inferior | Escritorio: centrado, 480 de ancho, radio 18, relleno 28 · móvil: hoja desde abajo, radio 20 arriba | Popup del evento del mes, "Necesitas una cuenta", "Publicado", inscripción | Intencional (se adapta al móvil) | Mantener; radio 16 y relleno 32 (24 en móvil). |
| 78 | Toast | Fondo claro (`--fg`), texto oscuro, radio 10, con acción "Deshacer" `#0B5FA0` | Lista de deseos, chats, cuentas, inscripciones, votos | Intencional | Mantener; radio 12 y acción con `--accent-on-light`. |
| 79 | Portada | Normal 3:4 radio 10 · pequeña 48×64 radio 6 · 64×86 (en línea) · 220 de ancho (en línea) | Inicio, perfil, editar perfil · buscar, diario, logros · escribir reseña · juego, juego random | Intencional (tamaños) con medidas en línea | Tamaños **S** 48×64 · **M** 64×86 · **L** fluida · **XL** 220. Radios 8 (S/M) y 12 (L/XL). |
| 80 | Chip | Normal 40/14 px · de MatchPlay 36/13 px · activo con fondo claro (buscar, diario, eventos, logros) · activo azul `.accent` (editar perfil, juego random) | 8 pantallas | Intencional (tamaño) + **a decidir** si el doble estilo activo es a propósito | **Chip** md (40) y sm (36). Un solo estilo activo, o dos con nombre: "Filtro" (claro) y "Preferencia" (azul). |
| 81 | Badge y etiquetas | Acento · Logro (verde) · Contorno · Contorno con color y borde en línea sobre la banda (`#E6EBF1`, `#9AD4FB`, blanco .3) · Contorno a 14 px (juego random) · estados de cuentas en línea (ok / demo / pendiente / no) · etiqueta IA · "Pronto" · ranking · atajo `/` · contador de pestaña | Inicio, eventos, evento, juego, juego random, logros, perfil, editar perfil, login, registro | Intencional (variantes) + accidental (estilos en línea y el tamaño 14) | **Badge** 12/700: Acento · Logro · Contorno · Sobre imagen · IA · Aviso · Error. Los estados de cuenta usan esas variantes. |
| 82 | Campo de formulario | `.input/.select/.textarea` (fondo `--bg`, radio 8, relleno 12, 48) · select de filtros en línea (fondo `--surface`, 44, relleno 8/12) · contraseña con ojo (campo sin borde dentro de una caja, en línea) | Buscar, contacto, crear cuenta, evento, editar perfil, escribir reseña, login · filtros de comunidad, diario y eventos · login y registro | Intencional (campo) + accidental (filtro y contraseña en línea) | **Campo** md (48) y sm (40, para filtros) · **Campo con ícono** para contraseña. |
| 83 | Buscadores | Del header (superficie, borde gris, radio 8, 44) · grande (borde azul 1,5, radio 12) · caja de MatchPlay (borde azul 1,5, radio 14) | Todas · inicio y buscar · MatchPlay | Header intencional; grande y MatchPlay accidentales entre sí | **Buscador** (header) y **Buscador destacado** (radio 12, borde 2 px azul) para inicio, buscar y MatchPlay. |
| 84 | Casillas y radios | Color de acento nativo, 20×20 | Registro, evento, contacto | Intencional | Mantener. |
| 85 | Mensajes de campo | Error (borde rojo + texto 14 rojo) · correcto (texto verde) · ayuda 13 · contador "Faltan N caracteres" / "✓ Listo" | Login, registro, escribir reseña, contacto | Intencional | Mantener; la ayuda sigue la escala de la fila 40. |
| 86 | Header | Fijo arriba con desenfoque. Con sesión: notificaciones + píldora de usuario. Sin sesión: botones "Iniciar sesión" y "Crear cuenta". Enlaces del menú 15/600, radio 6 | Las 18 pantallas | Intencional (dos estados) | Mantener; menú 14/600 y radio 8. |
| 87 | Navegación móvil | Barra inferior de 5 pestañas (52 de alto) · buscador plegable · panel deslizable de chats · filtros plegables | Todas (móvil) | Intencional | Mantener. |
| 88 | Pestañas | Subrayadas (`.tabs`, 48, subrayado azul 2 px) · segmentadas (`.seg`, radio 10/7) · subrayadas con `border:0` en línea en una pantalla | Juego, comunidad · login, registro, escribir reseña | Intencional (dos tipos) + accidental (la versión en línea) | **Pestañas** y **Control segmentado** (radio 12 fuera, 8 dentro). |
| 89 | Migas de pan | 14 px `--fg-soft` · en dos pantallas con color `--muted` en línea | Juego, evento · diario, logros | Accidental | Siempre `--fg-soft`. |
| 90 | Encabezado de sección | `.section-head` (h2 26 + enlace "Ver…") · `.panel-title` (12 en mayúsculas) · h2 sueltos de 20 a 24 en línea | Inicio · perfil · el resto | Accidental | **Encabezado de sección** (H2 24 + enlace opcional) y **Encabezado de panel** (Etiqueta, fila 38). |
| 91 | Banda superior (hero) | Por juego (color del juego mezclado con el fondo) · torneo `#1A3157` · sorteo `#1D3A2B` · por defecto `#13392B` | Juego, evento | Intencional | Mantener; torneo `--accent-deep`, sorteo y por defecto `--good-deep`. |
| 92 | Footer | `--bg-deep`, columnas de enlaces 14 `--muted`, créditos 13 `--placeholder` | Las 18 pantallas | Intencional | Mantener. |
| 93 | Avatar | Persona (redondo): 34 header · 38 reseña · 132 perfil (96 en móvil, anillo 6) · en crear cuenta con fondo azul. Cuadrados: 48 radio 10 (logros) · 56 radio 14 (error, MatchPlay) · 84 radio 18 con borde azul (editar perfil) · insignia IA 32 radio 8 · ícono de modal 72 redondo | Header, reseñas, perfil, crear cuenta, logros, error, MatchPlay, editar perfil, modales | Redondo = persona y cuadrado = ícono, intencional; los radios de los cuadrados son accidentales | **Avatar** (redondo) en 32 · 40 · 96 · 132. **Ícono en caja** (cuadrado, radio 12) en 32 · 48 · 56 · 72. |
| 94 | Íconos | SVG de trazo (tipo Feather). Tamaños 18 · 20 · 22 · 28 · 34 · 36 (+ logo 28×20). Grosor 2 (×11) · 2,4 · 2,6 · 3 (logo). Color fijo en hex (7 colores, solo 1 con `currentColor`). Además se usan caracteres como íconos: ✕ (cerrar, quitar favorito, borrar chat) y ♥ (Me gusta) | Header, buscadores, modales, error, MatchPlay, login, editar perfil, escribir reseña | Accidental | Íconos SVG con `currentColor`, grosor 2, tamaños **16 · 20 · 24** (+ 36 en modales). Cambiar ✕ y ♥ por SVG. |
| 95 | Medidores | Barra de 8 px radio 4 (azul o verde) · fuerza de contraseña (4 segmentos, ámbar en línea) · calaveras | Perfil (XP), logros, juego, crear cuenta | Intencional | Mantener; colores con variables (`--warn` para el ámbar). |
| 96 | Mensajes de chat | Burbuja del usuario (`#173350`) · del bot (superficie + borde) · de error (borde rojo) · insignia IA 32 | MatchPlay | Intencional | Mantener; usuario con `--accent-deep` (fila 17). |
| 97 | Tabla | Caja con radio 14, encabezado 12 en mayúsculas, celdas con relleno 12, hover `#202834`; en móvil el diario se vuelve tarjetas | Diario, error | Intencional | Mantener; radio 12 y hover `--surface-2`. |
| 98 | Barra de prototipo | Fondo `--ai-deep`, borde `--ai`, texto 13, botón cerrar 32 | Las 18 pantallas (se puede ocultar) | Intencional | Mantener; texto 12 o 14 según la fila 40. |
| 99 | Carga (skeleton) | Degradado animado, radio 10 | Juego, buscar (mientras cargan datos) | Intencional | Mantener; radio 12. |

---

## Decisiones finales (4-nov-2026)

Lo que quedó en el kit. Entre paréntesis, la fila de la auditoría de la que sale.

### Nombres y colores
- Las variables se nombran por función y en español (`--color-primario`, no `--accent`).
- `--color-primario` #3DA9F5 (12) · `--color-primario-hover` #9AD4FB (15) · `--color-texto-sobre-primario` #08131C (13)
- `--color-secundario` **#A99BFF, el morado de IA** (23). Se eligió como segundo color de marca por ser la identidad de MatchPlay.
- `--color-fondo` #12161D (1) · `--color-superficie` #1B222C (3) · `--color-superficie-elevada` #242D3A (4) · `--color-borde` #2E3A4A (6)
- `--color-texto` #E6EBF1 (7) · `--color-texto-suave` #9AA8B8 (9)
- `--color-exito` #4CC870 (19) · `--color-error` #F0616D (21) · `--color-aviso` #E0A23B (22)
- **Cambio de aspecto aceptado:** el texto suave #C3CDD8 (8) desaparece; todo el texto secundario usa #9AA8B8.
- Los fondos oscuros de color (azul, verde, rojo y morado "deep", filas 16, 19, 21 y 23) y las capas translúcidas (24, 25 y 26) no tienen variable propia: se obtienen mezclando las variables con `color-mix`.

### Tipografía
- Una sola fuente: **Figtree**, cargada desde Google Fonts con `@import` al inicio de `tokens.css`, con los pesos 400, 700 y 800. Respaldo: Arial. El riesgo de la fila 33 (sin internet se ve el respaldo) sigue abierto.
- Tamaños: `--texto-xs` 12 · `--texto-sm` 14 · `--texto-base` 16 · `--texto-lg` 18 · `--texto-xl` 24 · `--texto-2xl` 30–44 · `--texto-3xl` 34–52 (35 a 42).
- Pesos: `--peso-normal` 400 · `--peso-fuerte` 700 · `--peso-titulos` 800. El 600 se elimina: el menú pasa a 700 (34).
- El número grande del componente Dato queda en 24 px, no en 28 (42).

### Espacios, bordes y sombras
- Espacios de `--espacio-1` a `--espacio-8`: 4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 (46). Las medidas mayores se calculan con estas.
- Radios: `--radio-sm` 8 · `--radio-md` 12 · `--radio-lg` 16 · `--radio-total` 999 (54 a 58). **Cambio de aspecto aceptado:** las etiquetas pasan de radio 4 a 8. Los paneles quedan en 16 (56 y 73).
- Sombras: `--sombra-suave` (hover) y `--sombra-media` (modales y avisos) (64). El brillo azul del botón primario se elimina.
- Medidas de apoyo, para que los componentes no tengan valores sueltos: `--borde-fino` 1 · `--borde-grueso` 2 · `--alto-control` 48 · `--alto-control-sm` 40 · `--interlineado-texto` 1.55 · `--interlineado-titulos` 1.15 · `--ancho-maximo` 1280 · `--ancho-modal` 480 · `--transicion` 0.18 s.
- El contorno de foco usa `--color-primario`, no el azul claro de texto (65).

### Componentes
- Incluidos: botón, campo, buscador, etiqueta, chip, tarjeta, panel, dato, pestañas, control segmentado, navegación, portada, avatar, medidor, modal, aviso flotante y estado vacío.
- **Chip:** un solo estilo activo, el de fondo claro (80).
- **Avatar:** dos tamaños, 40 y 80 px, con iniciales o con foto (93).
- **Navegación:** en celular no usa desenfoque de fondo. Con desenfoque, la barra fija de abajo quedaba atrapada dentro del encabezado.
- **Aviso flotante:** su botón de acción usa el color del fondo subrayado, en vez del azul sobre claro (18).
- Quedan fuera por ahora y se agregan al kit cuando una pantalla los necesite (regla 3 de CLAUDE.md): selector 1–10 (68), indicador de dificultad (69), opción de inscripción (75), spoiler (76), migas de pan (89), encabezado de sección (90), banda superior (91), footer (92), íconos (94), mensajes de chat (96), tabla (97), barra de prototipo (98) y carga (99).

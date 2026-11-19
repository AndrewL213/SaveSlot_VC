# Web administrativa de SaveSlot

> **Actualización (noviembre):** la parte de **moderación** (perfiles, reseñas, guías y clips) ya está hecha **en este mismo repositorio**: `pages/admin.html`, `js/admin.js` y `supabase/administracion.sql` (sección 35 de `spec.md`). Ya crea la tabla `administradores` y la función `es_admin()` del paso 1. Lo que sigue pendiente de este documento es la gestión de **eventos**; si se hace, conviene agregarla como otra pestaña de `pages/admin.html` en vez de un repositorio aparte.

Instrucciones para construir la web administrativa en **otro repositorio de GitHub** y conectarla con SaveSlot.

Sirve para que el equipo cree, edite y borre **torneos y sorteos** sin escribir SQL, vea quién se inscribió y elija al ganador de un sorteo.

> Esto todavía no está en `spec.md`. El paso 0 es agregarlo allí (regla 5 de CLAUDE.md).

---

## Cómo funciona (la idea en 4 líneas)

- **Repositorio aparte** (`saveslot-admin`) y **proyecto aparte en Vercel** (por ejemplo `saveslot-admin.vercel.app`).
- **La misma base de Supabase** que SaveSlot: misma dirección y misma **llave publicable**. Nunca la llave secreta (regla 9).
- **Las mismas cuentas**: se entra con el correo y la contraseña de SaveSlot.
- **Quién es administrador lo decide la base**: una tabla `administradores` y reglas de acceso (RLS). Aunque alguien copie la web, sin estar en esa tabla la base no lo deja cambiar nada.

```
saveslot-pi.vercel.app  ──┐
                          ├──>  Supabase (mismas tablas: eventos, inscripciones…)
saveslot-admin.vercel.app ┘       └─ reglas: solo quien está en "administradores" puede cambiar eventos
```

---

## Paso 0 · Agregarla a spec.md (en este repositorio)

Agregar una sección **«33. Web administrativa»** con:

- **Objetivo:** que el equipo publique eventos sin SQL. Funciona si un torneo nuevo aparece en Eventos sin tocar el SQL Editor.
- **Quién entra:** solo cuentas que estén en la tabla `administradores` (se agregan a mano en el SQL Editor).
- **Qué puede hacer:**
  - crear, editar y borrar eventos, con su cronograma y sus reglas;
  - marcar el «evento del mes» (destacado);
  - ver los inscritos de cada evento;
  - elegir el ganador de un sorteo.
- **Qué no puede hacer:** cambiar usuarios, reseñas ni XP, ni cobrar (los pagos siguen en «Después»).

---

## Paso 1 · La base (en este repositorio: `supabase/esquema.sql`)

Agregar al final de `supabase/esquema.sql` una sección «Administración» con este SQL. Después hay que ejecutarlo en el **SQL Editor** de Supabase (regla 9).

```sql
-- ===== Administración: quién puede crear y cambiar eventos =====

-- administradores: las cuentas (de Supabase Auth) que pueden usar la web administrativa.
-- Nadie la lee ni la cambia desde la app: se llena a mano en el SQL Editor.
create table if not exists public.administradores (
  auth_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.administradores enable row level security;
revoke all on table public.administradores from anon, authenticated;

-- ¿La cuenta abierta es administradora? (la usan las reglas y la web administrativa)
create or replace function public.es_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.administradores where auth_id = auth.uid())
$$;
revoke all on function public.es_admin() from public;
grant execute on function public.es_admin() to anon, authenticated;

-- Eventos, cronograma y reglas: todos los ven (ya existe); solo un administrador agrega, cambia o borra
drop policy if exists "eventos: admin agrega" on public.eventos;
create policy "eventos: admin agrega" on public.eventos for insert to authenticated with check ((select public.es_admin()));
drop policy if exists "eventos: admin cambia" on public.eventos;
create policy "eventos: admin cambia" on public.eventos for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
drop policy if exists "eventos: admin borra" on public.eventos;
create policy "eventos: admin borra" on public.eventos for delete to authenticated using ((select public.es_admin()));
grant insert, update, delete on table public.eventos to authenticated;

drop policy if exists "eventos_cronograma: admin agrega" on public.eventos_cronograma;
create policy "eventos_cronograma: admin agrega" on public.eventos_cronograma for insert to authenticated with check ((select public.es_admin()));
drop policy if exists "eventos_cronograma: admin cambia" on public.eventos_cronograma;
create policy "eventos_cronograma: admin cambia" on public.eventos_cronograma for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
drop policy if exists "eventos_cronograma: admin borra" on public.eventos_cronograma;
create policy "eventos_cronograma: admin borra" on public.eventos_cronograma for delete to authenticated using ((select public.es_admin()));
grant insert, update, delete on table public.eventos_cronograma to authenticated;

drop policy if exists "eventos_reglas: admin agrega" on public.eventos_reglas;
create policy "eventos_reglas: admin agrega" on public.eventos_reglas for insert to authenticated with check ((select public.es_admin()));
drop policy if exists "eventos_reglas: admin cambia" on public.eventos_reglas;
create policy "eventos_reglas: admin cambia" on public.eventos_reglas for update to authenticated using ((select public.es_admin())) with check ((select public.es_admin()));
drop policy if exists "eventos_reglas: admin borra" on public.eventos_reglas;
create policy "eventos_reglas: admin borra" on public.eventos_reglas for delete to authenticated using ((select public.es_admin()));
grant insert, update, delete on table public.eventos_reglas to authenticated;

-- Inscripciones: cada persona ve las suyas (ya existe); un administrador ve todas
drop policy if exists "inscripciones: admin ve todas" on public.inscripciones;
create policy "inscripciones: admin ve todas" on public.inscripciones for select to authenticated using ((select public.es_admin()));
```

**Hacer administradora a una cuenta** (en el SQL Editor; cambia el correo):

```sql
insert into public.administradores (auth_id)
select id from auth.users where email = 'correo-de-la-persona@ejemplo.com'
on conflict do nothing;
```

**Quitarla:** `delete from public.administradores where auth_id = (select id from auth.users where email = '…');`

**Probar que la regla funciona** (antes de construir nada): entra en SaveSlot con una cuenta que **no** sea administradora, abre la consola del navegador (F12) y ejecuta:

```js
await clienteSupabase.from('eventos').update({ titulo: 'prueba' }).eq('id', 1).select()
```

Debe responder con `data: []` (no cambió nada). Con una cuenta administradora sí cambia (vuelve a dejar el título como estaba).

---

## Paso 2 · Crear el repositorio nuevo

1. En GitHub: **New repository** → nombre `saveslot-admin` → público o privado (da igual: no lleva claves secretas) → con README.
2. Clonarlo en el computador y crear esta estructura (mismas reglas que SaveSlot: HTML, CSS y JS sin compilación; nombres en minúsculas, sin tildes ni espacios):

```
saveslot-admin/
├─ index.html          ← Entrar (correo y contraseña)
├─ eventos.html        ← Lista de eventos
├─ evento.html         ← Crear o editar un evento (?id=… para editar)
├─ inscritos.html      ← Inscritos de un evento y ganador del sorteo (?id=…)
├─ css/
│  └─ admin.css        ← solo lo propio de esta web (pocas líneas)
├─ js/
│  ├─ supabase.js      ← conexión (misma dirección y llave publicable que SaveSlot)
│  └─ admin.js         ← comportamiento de las 4 pantallas
├─ vercel.json         ← cabeceras de seguridad
├─ CLAUDE.md           ← reglas del proyecto (copiar las de SaveSlot y ajustar)
└─ README.md
```

### El design kit: el mismo de SaveSlot

No copies los archivos: enlázalos desde SaveSlot publicado. Así, si el kit cambia, la web administrativa cambia igual:

```html
<link rel="stylesheet" href="https://saveslot-pi.vercel.app/css/tokens.css">
<link rel="stylesheet" href="https://saveslot-pi.vercel.app/css/components.css">
<link rel="stylesheet" href="css/admin.css">
```

Usa solo componentes del kit (`componentes.html` de SaveSlot): `.navegacion`, `.panel`, `.tabla`, `.grupo-campo`, `.campo`, `.boton`, `.chip`, `.etiqueta`, `.modal`, `.aviso-flotante`, `.vacio`.

### Cada página carga, al final del `<body>`

```html
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.49.4/dist/umd/supabase.js" integrity="sha384-rwykjmWNwVxboyFmvK9OXN0wj9hnMHA2aAHtits54DuACyCq0M2PrSNxhRb+hvXT" crossorigin="anonymous"></script>
<script src="js/supabase.js"></script>
<script src="js/admin.js"></script>
```

(La misma versión y el mismo `integrity` que usa SaveSlot.)

### `js/supabase.js`

Copia **la dirección y la llave publicable** del `js/supabase.js` de SaveSlot (son públicas: van en el navegador). Nunca la llave secreta.

```js
// Conexión con la misma base de SaveSlot (llave publicable: los datos se protegen con reglas en la base)
var SUPABASE_URL = 'https://jzshrfiezzysbkzdsjzf.supabase.co';
var SUPABASE_LLAVE_PUBLICABLE = '…la misma de SaveSlot…';
var clienteSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_LLAVE_PUBLICABLE);
```

---

## Paso 3 · Las 4 pantallas

### A. Entrar (`index.html`)

- Formulario de correo y contraseña (`.grupo-campo`, `.campo`, `.boton`).
- Al enviar: `clienteSupabase.auth.signInWithPassword({ email, password })`.
- Después pregunta a la base si es administradora: `clienteSupabase.rpc('es_admin')`.
  - `true` → ir a `eventos.html`.
  - `false` → mensaje «Tu cuenta no es administradora» y `clienteSupabase.auth.signOut()`.
- Las cuentas que entran a SaveSlot solo con Google, Discord, Twitch o Steam no tienen contraseña: el administrador debe tener una cuenta de correo (o ponerle contraseña con «¿La olvidaste?» en SaveSlot).

Al principio de **cada** página (menos Entrar), revisar la sesión:

```js
async function exigirAdmin() {
  var sesion = (await clienteSupabase.auth.getSession()).data.session;
  var admin = sesion ? (await clienteSupabase.rpc('es_admin')).data : false;
  if (!admin) location.replace('index.html');
  return admin;
}
```

(Esto es solo comodidad: la seguridad real son las reglas del paso 1.)

### B. Lista de eventos (`eventos.html`)

- Una `.tabla` con: fecha, tipo (`.etiqueta`), título, cupos (`cupos_ocupados / cupos_maximos`), destacado y acciones (Editar, Inscritos, Borrar).
- Filtros con `.chip`: Próximos · Pasados · Todos (por `fecha_hora`).
- Botón «Nuevo evento» → `evento.html`.
- Borrar pide confirmación (`.modal`): «Se borran también su cronograma, sus reglas y sus inscripciones». La base los borra sola (`on delete cascade`).

```js
var { data: eventos, error } = await clienteSupabase.from('eventos').select('*').order('fecha_hora', { ascending: false });
```

### C. Crear o editar un evento (`evento.html`, `evento.html?id=12`)

Un campo por columna de `eventos` (ver `supabase/esquema.sql` de SaveSlot):

| Campo | Columna | Cómo |
|---|---|---|
| Tipo | `tipo` | `torneo` o `sorteo` (dos `.chip` o un select) |
| Título | `titulo` | obligatorio |
| Dirección | `slug` | se arma sola del título («Copa 2v2» → `copa-2v2`), única, editable |
| Juego | `juego_igdb` | número de IGDB del juego (ver «Buscar el juego» abajo) |
| Descripción | `descripcion` | obligatoria |
| Fecha y hora | `fecha_hora` | `<input type="datetime-local">`; se guarda con zona horaria |
| Cierre de inscripciones | `cierre_inscripciones` | antes de `fecha_hora` |
| Organizador | `organizador` | texto. **No** usar nombres de empresas reales como si fueran oficiales |
| Tipo de organizador | `tipo_organizador` | `Marcas y organizadores`, `Desarrolladoras oficiales` o `SaveSlot` |
| Cupos | `cupos_maximos` | número mayor que 0 (vacío = sin límite) |
| Costo | `costo` y `gratis` | texto del costo y casilla «Gratis» (los pagos reales son «Después») |
| XP para entrar | `xp_para_entrar` | solo sorteos |
| Premio | `premio` | obligatorio |
| Días para reclamar | `dias_para_reclamar` | solo sorteos |
| Color | `color` | `<input type="color">` (formato `#RRGGBB`) |
| Evento del mes | `destacado` | casilla. Solo uno a la vez: al marcar uno, desmarcar los demás |

**Cronograma** (`eventos_cronograma`: `paso`, `cuando`, `orden`) y **reglas** (`eventos_reglas`: `texto`, `orden`): listas con «+ Agregar» y «Quitar».

Guardar:

```js
// 1. El evento (nuevo o cambiado)
var respuesta = id
  ? await clienteSupabase.from('eventos').update(datos).eq('id', id).select().single()
  : await clienteSupabase.from('eventos').insert(datos).select().single();
if (respuesta.error) { /* mostrarlo junto al formulario */ }
var evento = respuesta.data;

// 2. Cronograma y reglas: se borran las de antes y se guardan las de ahora (con su orden)
await clienteSupabase.from('eventos_cronograma').delete().eq('evento_id', evento.id);
await clienteSupabase.from('eventos_cronograma').insert(pasos.map(function (p, i) { return { evento_id: evento.id, paso: p.paso, cuando: p.cuando, orden: i + 1 }; }));
await clienteSupabase.from('eventos_reglas').delete().eq('evento_id', evento.id);
await clienteSupabase.from('eventos_reglas').insert(reglas.map(function (t, i) { return { evento_id: evento.id, texto: t, orden: i + 1 }; }));

// 3. Evento del mes: solo uno
if (datos.destacado) await clienteSupabase.from('eventos').update({ destacado: false }).neq('id', evento.id).eq('destacado', true);
```

Errores frecuentes de la base, en palabras simples:
- `23505` → «Ya existe un evento con esa dirección (slug)».
- `23514` → «Un dato no es válido» (por ejemplo, cupos en 0 o un color mal escrito).
- `42501` o `data: []` → «Tu cuenta no tiene permiso».

**Buscar el juego:** el buscador de juegos de SaveSlot (`/api/igdb?buscar=`) hoy solo responde a su propio sitio. Hay dos opciones:
- **Simple:** buscar el juego en SaveSlot, abrir su ficha y copiar el número de IGDB.
- **Mejor:** en el paso 5, SaveSlot deja que la web administrativa use su buscador. Así el formulario busca por nombre y guarda `id_igdb`:

```js
var r = await fetch('https://saveslot-pi.vercel.app/api/igdb?buscar=' + encodeURIComponent(texto));
var juegos = (await r.json()).juegos; // cada uno con nombre, portada e id_igdb
```

### D. Inscritos y ganador (`inscritos.html?id=12`)

```js
var { data: inscritos } = await clienteSupabase.from('inscripciones')
  .select('fecha, equipo, companero, usuario_id').eq('evento_id', id).order('fecha');
var { data: personas } = await clienteSupabase.from('usuarios')
  .select('id, usuario, nombre').in('id', inscritos.map(function (i) { return i.usuario_id; }));
```

- Una `.tabla` con @, nombre, equipo y compañero (torneos) y fecha.
- En sorteos: botón «Elegir ganador al azar» (o elegir uno de la lista), con confirmación. Guarda `ganador_id`:

```js
await clienteSupabase.from('eventos').update({ ganador_id: idDeLaPersona }).eq('id', id);
```

---

## Paso 4 · Publicarla en Vercel

1. En Vercel: **Add New → Project → Import** `saveslot-admin`. Framework: **Other**. Sin comando de build. **Deploy**.
2. Queda en `https://saveslot-admin.vercel.app` (o el nombre que Vercel asigne; se puede cambiar en Settings → Domains).
3. `vercel.json` con cabeceras de seguridad (como SaveSlot). Que nadie la pueda meter en un iframe y que solo hable con Supabase y con SaveSlot:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://saveslot-pi.vercel.app https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://jzshrfiezzysbkzdsjzf.supabase.co https://saveslot-pi.vercel.app; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    }
  ]
}
```

(`X-Robots-Tag: noindex` hace que Google no la muestre en búsquedas.)

4. En **Supabase → Authentication → URL Configuration → Redirect URLs**, agregar `https://saveslot-admin.vercel.app/**` (por si después se usan enlaces por correo en la web administrativa).

---

## Paso 5 · Vincularla con SaveSlot (en este repositorio)

Estos cambios van en SaveSlot (pedírselos a Claude aquí, con plan y aprobación como siempre):

1. **`spec.md`**: la sección del paso 0.
2. **`supabase/esquema.sql`**: la sección del paso 1, y ejecutarla en el SQL Editor.
3. **Menú de la cuenta** (`.menu-usuario`): un enlace «Administración» que abre `https://saveslot-admin.vercel.app` en otra pestaña. Solo se muestra si `clienteSupabase.rpc('es_admin')` responde `true` (a los demás no les aparece).
4. **`api/igdb.js`** (opcional, para buscar juegos por nombre): responder con `Access-Control-Allow-Origin: https://saveslot-admin.vercel.app` solo a ese origen y solo en `?buscar=`.
5. **`pantallas.md`**: una fila «33. Web administrativa» con el enlace al repositorio.
6. **`README.md`**: un párrafo «Web administrativa» con el enlace al repositorio y a la página publicada.

---

## Paso 6 · Revisar antes de darla por lista

- [ ] Una cuenta que **no** es administradora no puede entrar (y la prueba de la consola del paso 1 no cambia nada).
- [ ] Un torneo nuevo aparece en **Eventos** de SaveSlot con su cronograma y sus reglas, sin tocar SQL.
- [ ] Editar el título se ve en SaveSlot al recargar.
- [ ] Solo un evento queda como «evento del mes» y es el que abre la ventana del Inicio.
- [ ] Un sorteo muestra sus inscritos y guarda el ganador.
- [ ] Borrar un evento lo quita de SaveSlot (y sus inscripciones).
- [ ] Funciona en celular (375 px de ancho).
- [ ] En el repositorio no hay ninguna clave secreta (solo la llave publicable de Supabase).

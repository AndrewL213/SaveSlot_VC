-- supabase/juegos.sql · Tabla "juegos" del catálogo de SaveSlot.
-- Ya está creada en el proyecto SaveSlot_VC (se ejecutó en el editor SQL de Supabase).
-- Este archivo es para saber cómo está hecha y poder crearla otra vez si hace falta.
--
-- Guarda cada juego de IGDB con sus datos de Steam (precio, descuento, nota, logros y jugadores).
-- La llenan las funciones de Vercel:
--   api/steam/juego.js       → al abrir la ficha de un juego (si sus datos tienen más de 24 h)
--   api/steam/sincronizar.js → cada día a las 9:00 UTC (crons de vercel.json)

create table if not exists public.juegos (
  igdb_id bigint primary key,           -- número del juego en IGDB (nunca cambia)
  slug text unique,                     -- id que va en las direcciones (detalle-juego.html?id=...)
  nombre text not null,
  steam_appid bigint,                   -- número en Steam (null si no está en Steam)
  steam_precio text,                    -- ej. "COL$ 58.800,00"
  steam_precio_original text,           -- solo si está en oferta
  steam_descuento int not null default 0,
  steam_gratis boolean not null default false,
  steam_nota text,                      -- ej. "Muy positivas"
  steam_nota_pct int,                   -- % de reseñas que recomiendan el juego
  steam_resenas int,                    -- cuántas reseñas tiene en Steam
  steam_logros int,                     -- logros totales del juego
  steam_jugando int,                    -- jugadores conectados ahora mismo
  actualizado timestamptz not null default now()
);

comment on table public.juegos is 'Juegos de IGDB con sus datos de Steam (precio, descuento, nota, logros y jugadores). Solo el servidor (Vercel) escribe.';
create index if not exists juegos_steam_appid on public.juegos (steam_appid);

-- Cualquiera puede leer el catálogo; nadie escribe desde el navegador
-- (solo la llave secreta del servidor, que se salta estas reglas).
alter table public.juegos enable row level security;
drop policy if exists "Todos pueden leer los juegos" on public.juegos;
create policy "Todos pueden leer los juegos" on public.juegos for select using (true);

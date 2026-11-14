-- supabase/usuarios_xbox.sql · Cuentas de Xbox vinculadas (las usa solo el servidor: api/xbox/)
--
-- Una fila por cuenta de SaveSlot con Xbox vinculada: el número de la cuenta de Xbox (xuid), el gamertag
-- y el refresh_token de Microsoft, para traer los juegos y logros sin pedir que entre otra vez.
-- Nadie la ve desde la app (sin permisos para anon ni authenticated): la lee y escribe api/xbox/ con la
-- llave secreta. La fila pública que ven todos es la de cuentas_vinculadas (plataforma 'xbox').
-- Se puede correr varias veces.

create table if not exists public.usuarios_xbox (
  id uuid primary key references auth.users(id) on delete cascade,
  xuid text unique not null,
  gamertag text,
  refresh_token text,
  sincronizado_el timestamptz default now()
);

alter table public.usuarios_xbox enable row level security;
revoke all on public.usuarios_xbox from anon, authenticated;

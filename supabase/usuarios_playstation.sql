-- supabase/usuarios_playstation.sql · Cuentas de PlayStation vinculadas (las usa solo el servidor: api/playstation.js)
--
-- Una fila por cuenta de SaveSlot con PlayStation vinculada: el número de la cuenta de PSN (account_id)
-- y el ID de PSN (online_id). No guarda tokens: el servidor lee los trofeos públicos con la cuenta de PSN
-- de SaveSlot (PSN_NPSSO en Vercel).
-- Nadie la ve desde la app (sin permisos para anon ni authenticated). La fila pública que ven todos es la
-- de cuentas_vinculadas (plataforma 'playstation'). Se puede correr varias veces.

create table if not exists public.usuarios_playstation (
  id uuid primary key references auth.users(id) on delete cascade,
  account_id text unique not null,
  online_id text not null,
  sincronizado_el timestamptz default now()
);

alter table public.usuarios_playstation enable row level security;
revoke all on public.usuarios_playstation from anon, authenticated;

-- cuentas_vinculadas ahora acepta 'playstation' (también está en esquema.sql)
alter table public.cuentas_vinculadas drop constraint if exists cuentas_vinculadas_plataforma_check;
alter table public.cuentas_vinculadas add constraint cuentas_vinculadas_plataforma_check
  check (plataforma in ('steam', 'xbox', 'playstation'));

-- psn_sesion: la sesión de PlayStation Network del servidor (una sola fila, id = 1). api/_psn.js usa el NPSSO
-- (PSN_NPSSO en Vercel) una vez, guarda aquí el access token (~1 hora) y el refresh token (~2 meses) y después
-- solo renueva con el refresh token. Son como contraseñas: nadie la ve desde la app.
create table if not exists public.psn_sesion (
  id int primary key default 1 check (id = 1),
  access_token text,
  refresh_token text,
  access_vence timestamptz,
  refresh_vence timestamptz,
  actualizado_el timestamptz default now()
);

alter table public.psn_sesion enable row level security;
revoke all on public.psn_sesion from anon, authenticated;

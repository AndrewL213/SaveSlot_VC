-- supabase/usuarios_epic.sql · Tabla "usuarios_epic": qué cuenta de SaveSlot tiene cada cuenta de Epic Games.
-- Se ejecuta una vez en Supabase › SQL Editor (se puede volver a ejecutar sin problema).
--
-- La llena y la lee solo api/epic/auth.js (en Vercel, con la llave secreta del servidor):
--   · al entrar con Epic: busca aquí la cuenta de SaveSlot de esa cuenta de Epic (si no hay, crea una);
--   · al vincular Epic en Editar perfil: anota la cuenta abierta;
--   · al desvincular: borra la fila.
-- Desde la app nadie la ve ni la cambia (sin reglas = sin acceso).

create table if not exists public.usuarios_epic (
  id uuid primary key references auth.users (id) on delete cascade,  -- la cuenta de SaveSlot
  epic_id text not null unique,                                       -- el número de la cuenta de Epic (account_id)
  epic_nombre text,                                                   -- su nombre visible en Epic
  sincronizado_el timestamp with time zone                            -- última vez que se anotó
);

alter table public.usuarios_epic enable row level security;
revoke all on table public.usuarios_epic from anon, authenticated;

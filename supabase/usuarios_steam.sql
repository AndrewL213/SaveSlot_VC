-- supabase/usuarios_steam.sql · Tabla "usuarios_steam": cuentas de SaveSlot vinculadas a Steam.
-- Ya existe en el proyecto SaveSlot_VC. Este archivo describe cómo está hecha.
--
-- La llenan:
--   api/steam/auth.js → cada vez que alguien entra con Steam (con la llave secreta del servidor)
--   js/app.js (Perfil) → la propia persona anota su fila una vez por visita
-- La usa api/steam/resenas.js para marcar las reseñas de Steam como
-- "También en SaveSlot · @usuario" (el @ sale de user_metadata.usuario de Supabase Auth).

create table if not exists public.usuarios_steam (
  id uuid primary key references auth.users (id) on delete cascade,  -- la cuenta de SaveSlot
  steam_id64 text unique,                                            -- su número de Steam (64 bits)
  steam_username text,                                               -- nombre en Steam
  steam_avatar text,                                                 -- foto de Steam
  sincronizado_el timestamp with time zone                           -- última vez que se anotó
);

alter table public.usuarios_steam enable row level security;
drop policy if exists "Los perfiles son públicos" on public.usuarios_steam;
create policy "Los perfiles son públicos" on public.usuarios_steam
  for select using (true);
-- Cada persona solo escribe SU fila y solo con SU número de Steam: el que Supabase guardó en
-- app_metadata.steam_id al entrar con Steam (así nadie puede hacerse pasar por otra cuenta de Steam).
-- Las cuentas sin Steam (correo o invitado) no tienen steam_id, así que no pueden escribir aquí.
drop policy if exists "El usuario puede actualizar su propio perfil" on public.usuarios_steam;
create policy "El usuario puede actualizar su propio perfil" on public.usuarios_steam
  for all to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and steam_id64 = (auth.jwt() -> 'app_metadata' ->> 'steam_id'));

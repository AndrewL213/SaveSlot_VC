-- supabase/usuarios_steam.sql · Tabla "usuarios_steam": cuentas de SaveSlot vinculadas a Steam.
-- Ya existe en el proyecto SaveSlot_VC. Este archivo describe cómo está hecha.
--
-- La llenan:
--   api/steam/auth.js → cada vez que alguien entra con Steam (con la llave secreta del servidor)
--   js/app.js (Perfil) → la propia persona anota su fila una vez por visita
-- La usa api/steam/resenas.js para marcar las reseñas de Steam como
-- "EN SAVESLOT · @usuario" (el @ sale de user_metadata.usuario de Supabase Auth) o "SOLO STEAM".

create table if not exists public.usuarios_steam (
  id uuid primary key references auth.users (id) on delete cascade,  -- la cuenta de SaveSlot
  steam_id64 text unique,                                            -- su número de Steam (64 bits)
  steam_username text,                                               -- nombre en Steam
  steam_avatar text,                                                 -- foto de Steam
  sincronizado_el timestamp with time zone                           -- última vez que se anotó
);

alter table public.usuarios_steam enable row level security;
create policy "Los perfiles son públicos" on public.usuarios_steam
  for select using (true);
create policy "El usuario puede actualizar su propio perfil" on public.usuarios_steam
  for all using (auth.uid() = id);

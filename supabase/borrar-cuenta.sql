-- supabase/borrar-cuenta.sql · Función "borrar_mi_cuenta": la persona borra su propia cuenta.
-- La usa js/app.js (Editar perfil → Borrar cuenta) con clienteSupabase.rpc('borrar_mi_cuenta').
-- Se ejecuta una vez en Supabase → SQL Editor (también está al final de esquema.sql).
--
-- Borra la fila de auth.users de quien tiene la sesión (auth.uid()); nunca la de otra persona.
-- Con eso se borran en cascada: su fila de usuarios (y con ella reseñas, diario, amigos, favoritos,
-- lista de deseos, cuentas vinculadas...) y su fila de usuarios_steam.
-- "security definer" deja que la función borre en auth.users, cosa que la persona sola no puede.

create or replace function public.borrar_mi_cuenta()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Necesitas una sesión para borrar tu cuenta';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.borrar_mi_cuenta() from public, anon;
grant execute on function public.borrar_mi_cuenta() to authenticated;

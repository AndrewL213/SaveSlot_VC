-- supabase/avatares.sql · Fotos de perfil en Supabase Storage (carpeta pública "avatares").
-- Se ejecuta en Supabase › SQL Editor. Se puede ejecutar más de una vez.
--
-- Cada persona sube su foto a avatares/<su id de Auth>/avatar.jpg desde Editar perfil (js/app.js, subirFoto)
-- y solo puede subir, cambiar o borrar lo de su propia carpeta. Cualquiera puede ver las fotos.
-- La dirección de la foto elegida se guarda en la cuenta (user_metadata.foto).
-- Mientras esto no se ejecute, la foto que suba alguien se guarda solo en su navegador.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatares', 'avatares', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "avatares: ver" on storage.objects;
create policy "avatares: ver" on storage.objects for select
  using (bucket_id = 'avatares');

drop policy if exists "avatares: subir la propia" on storage.objects;
create policy "avatares: subir la propia" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatares: cambiar la propia" on storage.objects;
create policy "avatares: cambiar la propia" on storage.objects for update to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "avatares: borrar la propia" on storage.objects;
create policy "avatares: borrar la propia" on storage.objects for delete to authenticated
  using (bucket_id = 'avatares' and (storage.foldername(name))[1] = auth.uid()::text);

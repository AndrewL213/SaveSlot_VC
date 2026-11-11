-- supabase/limpiar-ejemplos.sql · Borra las personas de ejemplo y lo de prueba.
-- Se ejecuta una vez en Supabase › SQL Editor. NO se puede deshacer.
-- Primero ejecuta el bloque 1 (solo muestra qué se va a borrar) y después el bloque 2.
--
-- Qué borra:
--   · Las personas de ejemplo (las que no tienen cuenta: auth_id vacío), como samluq o kenvel. En cascada se
--     borra todo lo suyo: reseñas, borradores, comentarios, diario, amistades, favoritos, géneros, lista de
--     deseos, insignias, cuentas vinculadas, inscripciones, avisos, chats y misiones cumplidas.
--   · Las cuentas de invitado de Supabase (las creaba el antiguo botón "Entrar con la cuenta de demostración";
--     el botón "Entrar como invitado" ya no crea cuentas).
--   · Los mensajes de prueba de Contáctanos (los que empiezan por "PRUEBA").
-- Qué NO borra: las cuentas reales (correo, Google, Discord, Twitch o Steam) y lo suyo, ni los eventos,
-- misiones, tendencias y destacados.

-- ============================================================================
-- 1. REVISAR (no borra nada)
-- ============================================================================

-- Personas de ejemplo que se van a borrar
select id, usuario, nombre from public.usuarios where auth_id is null order by id;

-- Cuántas reseñas, comentarios y entradas del diario son de ellas
select
  (select count(*) from public.resenas r join public.usuarios u on u.id = r.usuario_id where u.auth_id is null) as resenas,
  (select count(*) from public.comentarios c join public.usuarios u on u.id = c.usuario_id where u.auth_id is null) as comentarios,
  (select count(*) from public.diario d join public.usuarios u on u.id = d.usuario_id where u.auth_id is null) as diario;

-- Cuentas de invitado de Supabase que se van a borrar
select count(*) as cuentas_de_invitado from auth.users where is_anonymous;

-- Mensajes de prueba de Contáctanos que se van a borrar
select id, nombre, correo, created_at from public.mensajes_contacto where nombre ilike 'PRUEBA%';

-- Cuentas reales: NO se borran (revisa que estén las tuyas)
select u.id, u.email, u.created_at, f.usuario
from auth.users u left join public.usuarios f on f.auth_id = u.id
where not u.is_anonymous order by u.created_at;

-- ============================================================================
-- 2. BORRAR (todo junto: si algo falla, no se borra nada)
-- ============================================================================
begin;
delete from public.usuarios where auth_id is null;                  -- personas de ejemplo y, en cascada, todo lo suyo
delete from auth.users where is_anonymous;                          -- cuentas de invitado
delete from public.mensajes_contacto where nombre ilike 'PRUEBA%';  -- mensajes de prueba
commit;

-- supabase/eventos-ejemplo.sql · Pone al día los 6 eventos de ejemplo (torneos y sorteos)
--
-- Para qué: los eventos de ejemplo tenían textos de plantilla ("[MARCA]", "[VALOR]", "El indicado") y fechas
-- que ya pasaron. Este archivo les pone fechas futuras y textos completos, y dice en cada uno que es de ejemplo.
-- No usa marcas ni organizadores reales: son eventos de SaveSlot o de organizadores de ejemplo.
--
-- Mantiene el número y el slug de cada evento: las inscripciones que ya existen no se pierden. Los cupos
-- ocupados se cuentan con las inscripciones reales (no con números inventados).
-- Cuando estas fechas pasen, se vuelve a correr con fechas nuevas (o se cargan eventos reales; ver
-- "web administrativa" en pantallas.md). Se puede correr varias veces.
--
-- Se ejecuta en el SQL Editor de Supabase.

update public.eventos as e set
  titulo = v.titulo,
  descripcion = 'Evento de ejemplo del prototipo: puedes inscribirte, pero no se juega ni se entregan premios de verdad. ' || v.descripcion,
  fecha_hora = v.fecha_hora::timestamptz,
  cierre_inscripciones = v.cierre::timestamptz,
  organizador = v.organizador,
  tipo_organizador = v.tipo_organizador,
  cupos_maximos = v.cupos_maximos,
  costo = v.costo,
  gratis = v.gratis,
  xp_para_entrar = v.xp,
  premio = v.premio,
  destacado = v.destacado,
  cupos_ocupados = (select count(*) from public.inscripciones i where i.evento_id = e.id)
from (values
  ('copa-2v2', 'Copa SaveSlot de Rocket League 2v2',
   'Torneo abierto para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.',
   '2026-12-12 15:00-05', '2026-12-11 23:59-05', 'SaveSlot', 'SaveSlot', 64, '15.000 COP por equipo', false, null::integer,
   'Insignia de campeón en tu perfil y 1.000 XP', true),
  ('rl-oficial', 'Torneo relámpago 3v3 de Rocket League',
   'Torneo rápido de una tarde, para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.',
   '2026-11-29 20:00-05', '2026-11-28 23:59-05', 'SaveSlot', 'SaveSlot', 48, 'Gratis', true, null,
   '500 XP para cada jugador del equipo ganador', false),
  ('liga-valorant', 'Liga universitaria de Valorant',
   'Liga por equipos para estudiantes universitarios. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.',
   '2027-01-23 10:00-05', '2027-01-22 23:59-05', 'Liga universitaria (organizador de ejemplo)', 'Marcas y organizadores', 32, '20.000 COP por equipo', false, null,
   'Insignia de campeón y 1.500 XP para cada jugador', false),
  ('giftcard-50', 'Gift card de 50 USD para tu tienda favorita',
   'El ganador se elige al azar al cierre y se anuncia aquí y por correo. Tiene 7 días para reclamar el premio.',
   '2026-12-20 20:00-05', '2026-12-20 20:00-05', 'SaveSlot', 'SaveSlot', null, '300 XP o 5.000 COP', true, 300,
   'Una gift card de 50 USD', false),
  ('speedrun-fnaf', 'Speedrun de vacaciones: Five Nights at Freddy''s',
   'Gana quien termine el juego en menos tiempo. Cada jugador graba su partida y envía el video antes del cierre.',
   '2027-01-10 18:00-05', '2027-01-09 23:59-05', 'Comunidad speedrun (organizador de ejemplo)', 'Marcas y organizadores', 100, 'Gratis', true, null,
   'Insignia de speedrunner y 800 XP', false),
  ('codigo-pokemon', 'Código de descarga de Pokémon Legends: Z-A',
   'El ganador se elige al azar al cierre y se anuncia aquí y por correo. Tiene 7 días para reclamar el premio.',
   '2027-02-14 23:59-05', '2027-02-14 23:59-05', 'SaveSlot', 'SaveSlot', null, '300 XP', true, 300,
   'Un código de descarga del juego', false)
) as v (slug, titulo, descripcion, fecha_hora, cierre, organizador, tipo_organizador, cupos_maximos, costo, gratis, xp, premio, destacado)
where e.slug = v.slug;

-- Revisar: los 6 eventos, con su fecha y cuántos inscritos tienen
select slug, titulo, fecha_hora, cierre_inscripciones, organizador, costo, premio, cupos_ocupados, destacado
from public.eventos order by fecha_hora;

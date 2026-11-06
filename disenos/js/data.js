/* SaveSlot — datos de ejemplo.
   Se usan mientras no haya claves de API configuradas (ver js/config.js).
   Las horas, notas y votos son valores de ejemplo para el prototipo. */
window.SS_DATA = {
  games: [
    { id: 'zelda-totk', name: 'The Legend of Zelda: Tears of the Kingdom', short: 'Zelda: TOTK', genres: ['Aventura'], platforms: ['Nintendo'], year: 2023, dev: 'Nintendo EPD', type: 'AAA', hoursMain: 60, hours100: 220, difficulty: 6, rating: 4.8, votes: 12430, color: '#2F6B4F', achievements: 139,
      desc: 'Mundo abierto enorme donde cada puzzle tiene varias soluciones gracias a Ultramano.' },
    { id: 'nier-automata', name: 'NieR: Automata', short: 'NieR: Automata', genres: ['RPG', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2017, dev: 'PlatinumGames', type: 'AAA', hoursMain: 20, hours100: 70, difficulty: 6, rating: 4.7, votes: 8120, color: '#7C7566', achievements: 50,
      desc: 'Combate ágil y una historia que cambia por completo con cada final.' },
    { id: 'rocket-league', name: 'Rocket League', short: 'Rocket League', genres: ['Deportes'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2015, dev: 'Psyonix', type: 'AAA', hoursMain: null, hours100: null, difficulty: 7, rating: 4.3, votes: 9840, color: '#2456C4', achievements: 88,
      desc: 'Fútbol con autos. Partidas de 5 minutos y torneos oficiales varias veces al día.' },
    { id: 'valorant', name: 'Valorant', short: 'Valorant', genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'], year: 2020, dev: 'Riot Games', type: 'AAA', hoursMain: null, hours100: null, difficulty: 8, rating: 4.2, votes: 7650, color: '#5B3F96', achievements: 0,
      desc: 'Shooter táctico 5v5 con agentes de habilidades únicas.' },
    { id: 'pokemon-legends-za', name: 'Pokémon Legends Z-A', short: 'Pokémon Legends Z-A', genres: ['RPG'], platforms: ['Nintendo'], year: 2025, dev: 'Game Freak', type: 'AAA', hoursMain: 30, hours100: 80, difficulty: 3, rating: 4.4, votes: 5310, color: '#B8343E', achievements: 0,
      desc: 'Captura y combate en tiempo real dentro de Ciudad Luminalia.' },
    { id: 'fnaf-into-the-pit', name: "Five Nights at Freddy's: Into the Pit", short: 'FNAF: Into the Pit', genres: ['Terror'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2024, dev: 'Mega Cat Studios', type: 'Indie', hoursMain: 6, hours100: 10, difficulty: 5, rating: 4.1, votes: 2140, color: '#6B3A1E', achievements: 24,
      desc: 'Aventura de terror corta con tensión constante y pocos sustos baratos.' },
    { id: 'hollow-knight', name: 'Hollow Knight', short: 'Hollow Knight', genres: ['Aventura', 'Metroidvania'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2017, dev: 'Team Cherry', type: 'Indie', hoursMain: 27, hours100: 60, difficulty: 7, rating: 4.7, votes: 9010, color: '#2B3A55', achievements: 63,
      desc: 'Metroidvania exigente con un mundo para explorar sin prisa.' },
    { id: 'hades', name: 'Hades', short: 'Hades', genres: ['Roguelike', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2020, dev: 'Supergiant Games', type: 'Indie', hoursMain: 22, hours100: 95, difficulty: 6, rating: 4.8, votes: 7720, color: '#8A2B2B', achievements: 49,
      desc: 'Escapa del inframundo partida a partida mientras la historia avanza.' },
    { id: 'elden-ring', name: 'Elden Ring', short: 'Elden Ring', genres: ['RPG', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox'], year: 2022, dev: 'FromSoftware', type: 'AAA', hoursMain: 55, hours100: 130, difficulty: 8, rating: 4.8, votes: 11200, color: '#3E5A2A', achievements: 42,
      desc: 'Mundo abierto oscuro y desafiante con libertad total para explorar.' },
    { id: 'ghost-of-tsushima', name: 'Ghost of Tsushima', short: 'Ghost of Tsushima', genres: ['Aventura', 'Acción'], platforms: ['PlayStation', 'PC'], year: 2020, dev: 'Sucker Punch', type: 'AAA', hoursMain: 25, hours100: 60, difficulty: 5, rating: 4.7, votes: 6400, color: '#7A2E2E', achievements: 52,
      desc: 'Samurái en mundo abierto con combate preciso y un viento que te guía.' },
    { id: 'inside', name: 'Inside', short: 'Inside', genres: ['Terror', 'Plataformas'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2016, dev: 'Playdead', type: 'Indie', hoursMain: 3, hours100: 5, difficulty: 4, rating: 4.6, votes: 4300, color: '#3A3F45', achievements: 14,
      desc: 'Plataformas oscuro y sin diálogos. Se termina en una tarde.' },
    { id: 'hades-ii', name: 'Hades II', short: 'Hades II', genres: ['Roguelike', 'Acción'], platforms: ['PC', 'Nintendo'], year: 2025, dev: 'Supergiant Games', type: 'Indie', hoursMain: 30, hours100: 100, difficulty: 6, rating: 4.7, votes: 3100, color: '#5A2D6B', achievements: 50,
      desc: 'Secuela de Hades con nueva protagonista, Melínoe, y nuevas armas.' }
  ],
  reviews: [
    { id: 'r1', game: 'nier-automata', user: 'kenvel', initials: 'KV', date: '2026-10-05', hours: 42, score: 9, diff: 6, useful: 128, likes: 64, text: 'La segunda vuelta no es relleno: cambia todo lo que creías saber. Juégalo completo antes de opinar.' },
    { id: 'r2', game: 'rocket-league', user: 'juanvi', initials: 'JV', date: '2026-10-03', hours: 300, score: 8, diff: 7, useful: 74, likes: 31, text: 'Fácil de empezar, difícil de dominar. Si llegas a Diamante, revisa la guía de aéreos de la comunidad.' },
    { id: 'r3', game: 'zelda-totk', user: 'andresh', initials: 'AH', date: '2026-09-28', hours: 48, score: 10, diff: 6, useful: 203, likes: 112, text: 'Ultramano cambia cómo resuelves todo. Haz las islas del cielo antes de bajar al subsuelo.' },
    { id: 'r4', game: 'zelda-totk', user: 'mlopez', initials: 'ML', date: '2026-09-21', hours: 31, score: 8, diff: 5, useful: 88, likes: 40, text: 'Enorme y generoso. El rendimiento baja en zonas con muchos efectos, pero nunca me sacó del juego.' },
    { id: 'r5', game: 'zelda-totk', user: 'valer1a', initials: 'VR', date: '2026-09-15', hours: 190, score: 9, diff: 7, useful: 61, likes: 27, spoiler: true, text: 'El final conecta con todo lo que pasó en el cielo. Que la batalla contra Ganondorf sea en caída libre es lo mejor del juego.' },
    { id: 'r6', game: 'hollow-knight', user: 'd4ni', initials: 'DA', date: '2026-09-10', hours: 60, score: 10, diff: 8, useful: 140, likes: 77, text: 'Cada zona tiene identidad propia. Los jefes opcionales son los mejores del género.' },
    { id: 'r7', game: 'hades', user: 'kenvel', initials: 'KV', date: '2026-08-30', hours: 70, score: 10, diff: 6, useful: 96, likes: 52, text: 'Cada muerte te deja algo: una conversación, una mejora, una pista de la historia. Nunca se siente como perder el tiempo.' },
    { id: 'r8', game: 'valorant', user: 'juanvi', initials: 'JV', date: '2026-08-22', hours: 410, score: 7, diff: 8, useful: 58, likes: 19, text: 'Muy bueno con amigos, frustrante en solitario. Aprende dos agentes bien antes de probar todos.' },
    { id: 'r9', game: 'elden-ring', user: 'd4ni', initials: 'DA', date: '2026-08-14', hours: 120, score: 10, diff: 9, useful: 117, likes: 66, text: 'Si un jefe te bloquea, ve a explorar y vuelve más fuerte. El mundo abierto es la mejor ayuda de dificultad.' },
    { id: 'r10', game: 'inside', user: 'lau_plays', initials: 'LP', date: '2026-08-02', hours: 4, score: 9, diff: 4, useful: 45, likes: 22, text: 'Tres horas que se quedan contigo. Juégalo de noche, con audífonos y sin leer nada antes.' }
  ],
  // Reseñas del usuario de demostración (historial de reseñas)
  myReviews: [
    { id: 'm1', game: 'zelda-totk', date: '2026-10-07', hours: 48, score: 10, diff: 6, useful: 34, likes: 21, state: 'Terminado', text: 'Ultramano convierte cada problema en un juguete. Me pasé horas construyendo puentes absurdos y nunca sentí que perdía el tiempo.' },
    { id: 'm2', game: 'fnaf-into-the-pit', date: '2026-10-04', hours: 6, score: 7, diff: 5, useful: 12, likes: 6, state: 'Terminado', text: 'Corto y con buena tensión. Los saltos de tiempo están bien pensados, aunque el final se siente apurado.' },
    { id: 'm3', game: 'nier-automata', date: '2026-10-02', hours: 21, score: 9, diff: 6, useful: 27, likes: 15, state: 'Rejugado', spoiler: true, text: 'En la segunda partida con 9S entiendes por qué la primera era solo la mitad. El final E me hizo llorar con los créditos.' },
    { id: 'm4', game: 'valorant', date: '2026-09-19', hours: 9, score: 5, diff: 8, useful: 4, likes: 2, state: 'Abandonado', text: 'Técnicamente impecable, pero no es para mí. Demasiado castigo para alguien que juega un rato los fines de semana.' },
    { id: 'm5', game: 'hollow-knight', date: '2026-08-12', hours: 27, score: 9, diff: 7, useful: 41, likes: 25, state: 'Rejugado', text: 'Volví para sacar los finales que me faltaban. El Panteón es duro, pero cada intento enseña algo.' }
  ],
  comments: [
    { review: 'm1', user: 'kenvel', initials: 'KV', when: 'hace 2 días', text: 'Lo de los puentes absurdos es lo mejor del juego, jaja.' },
    { review: 'm1', user: 'd4ni', initials: 'DA', when: 'hace 1 día', text: '¿Ya probaste el subsuelo completo? Cambia mucho la experiencia.' },
    { review: 'm3', user: 'juanvi', initials: 'JV', when: 'hace 5 días', text: 'El final E es de lo mejor que he jugado.' },
    { review: 'r1', user: 'mlopez', initials: 'ML', when: 'hace 3 días', text: 'Totalmente, la ruta C es otro juego.' },
    { review: 'r3', user: 'kenvel', initials: 'KV', when: 'hace 1 semana', text: 'Buen consejo lo de las islas del cielo primero.' },
    { review: 'r6', user: 'valer1a', initials: 'VR', when: 'hace 4 días', text: 'Los Hermanos Mantis son mi jefe favorito.' }
  ],
  // Personas de la comunidad. rel: friend | in (te envió solicitud) | out (enviaste) | none (sugerencia)
  users: [
    { user: 'kenvel', name: 'Kenneth Velásquez', initials: 'KV', rel: 'friend', status: 'playing', game: 'nier-automata', level: 18, since: '2024-02-02', bio: 'RPGs japoneses y bandas sonoras que se quedan en la cabeza.', favorites: ['nier-automata', 'hades', 'elden-ring', 'hollow-knight'], played: { 'nier-automata': 9, 'hades': 10, 'zelda-totk': 9, 'hollow-knight': 8, 'inside': 8 }, color: '#7C7566' },
    { user: 'juanvi', name: 'Juan Vigoya', initials: 'JV', rel: 'friend', status: 'playing', game: 'rocket-league', level: 21, since: '2023-11-20', bio: 'Competitivo. Diamante en Rocket League, Oro en Valorant.', favorites: ['rocket-league', 'valorant', 'elden-ring', 'zelda-totk'], played: { 'rocket-league': 8, 'valorant': 7, 'zelda-totk': 9, 'nier-automata': 10 }, color: '#2456C4' },
    { user: 'd4ni', name: 'Daniela Arango', initials: 'DA', rel: 'friend', status: 'playing', game: 'hollow-knight', level: 15, since: '2024-05-09', bio: 'Metroidvanias y soulslikes. Si tiene jefes difíciles, me interesa.', favorites: ['hollow-knight', 'elden-ring', 'hades', 'inside'], played: { 'hollow-knight': 10, 'elden-ring': 10, 'hades': 9, 'zelda-totk': 8 }, color: '#2B3A55' },
    { user: 'mlopez', name: 'María López', initials: 'ML', rel: 'friend', status: 'online', level: 9, since: '2025-01-15', bio: 'Aventuras tranquilas después del trabajo.', favorites: ['zelda-totk', 'pokemon-legends-za', 'inside', 'ghost-of-tsushima'], played: { 'zelda-totk': 8, 'pokemon-legends-za': 9, 'inside': 9 }, color: '#2F6B4F' },
    { user: 'lau_plays', name: 'Laura Peña', initials: 'LP', rel: 'friend', status: 'online', level: 11, since: '2024-09-01', bio: 'Indies cortos y juegos de terror con buena historia.', favorites: ['inside', 'fnaf-into-the-pit', 'hades-ii', 'hollow-knight'], played: { 'inside': 9, 'fnaf-into-the-pit': 8, 'hollow-knight': 9 }, color: '#3A3F45' },
    { user: 'valer1a', name: 'Valeria Ríos', initials: 'VR', rel: 'friend', status: 'offline', last: 'hace 2 h', level: 14, since: '2024-04-22', bio: 'Completista. Si tiene 100 %, lo saco.', favorites: ['zelda-totk', 'ghost-of-tsushima', 'pokemon-legends-za', 'hades'], played: { 'zelda-totk': 9, 'ghost-of-tsushima': 10, 'hades': 8 }, color: '#7A2E2E' },
    { user: 'nico.gg', name: 'Nicolás Gómez', initials: 'NG', rel: 'friend', status: 'offline', last: 'hace 1 día', level: 7, since: '2025-06-30', bio: 'Shooters con amigos los viernes.', favorites: ['valorant', 'rocket-league', 'elden-ring', 'hades'], played: { 'valorant': 8, 'rocket-league': 7 }, color: '#5B3F96' },
    { user: 'tatan', name: 'Sebastián Cruz', initials: 'SC', rel: 'in', status: 'online', level: 6, since: '2025-08-12', bio: 'Nuevo en SaveSlot. Busco gente para Rocket League.', favorites: ['rocket-league', 'pokemon-legends-za', 'zelda-totk', 'hades'], played: { 'rocket-league': 8, 'zelda-totk': 10 }, color: '#2456C4', mutual: 2 },
    { user: 'cami.rpg', name: 'Camila Torres', initials: 'CT', rel: 'in', status: 'offline', last: 'hace 3 h', level: 13, since: '2024-12-03', bio: 'RPGs largos y diarios de juego muy detallados.', favorites: ['nier-automata', 'pokemon-legends-za', 'elden-ring', 'zelda-totk'], played: { 'nier-automata': 10, 'elden-ring': 9 }, color: '#B8343E', mutual: 3 },
    { user: 'feli_fps', name: 'Felipe Ruiz', initials: 'FR', rel: 'none', status: 'online', level: 10, since: '2025-03-18', bio: 'Torneos de la universidad.', favorites: ['valorant', 'rocket-league', 'ghost-of-tsushima', 'hades'], played: { 'valorant': 9, 'rocket-league': 8 }, color: '#5B3F96', mutual: 4 },
    { user: 'ana.indie', name: 'Ana Moreno', initials: 'AM', rel: 'none', status: 'offline', last: 'hace 5 h', level: 8, since: '2025-02-10', bio: 'Indies, pixel art y bandas sonoras.', favorites: ['hollow-knight', 'inside', 'hades', 'hades-ii'], played: { 'hollow-knight': 9, 'inside': 10, 'hades': 9 }, color: '#5A2D6B', mutual: 2 }
  ],
  guides: [
    { game: 'zelda-totk', title: 'Las 4 regiones en el orden recomendado', mins: 12, useful: 94 },
    { game: 'zelda-totk', title: 'Cómo conseguir la armadura Zonai', mins: 6, useful: 88 },
    { game: 'valorant', title: 'Agentes para empezar si vienes de CS', mins: 8, useful: 89 },
    { game: 'nier-automata', title: 'Todos los finales sin perderte ninguno', mins: 15, useful: 91 },
    { game: 'rocket-league', title: 'Aéreos básicos en 10 minutos', mins: 10, useful: 86 }
  ],
  events: [
    { id: 'copa-2v2', type: 'Torneo', game: 'rocket-league', title: 'Copa SaveSlot de Rocket League 2v2', when: 'Sáb 17 oct · 3:00 p. m.', org: '[MARCA] + [ORGANIZADOR]', orgType: 'Marcas y organizadores', slots: 41, max: 64, cost: '[VALOR]', free: false, color: '#1F4A8A', featured: true },
    { id: 'rl-oficial', type: 'Torneo', game: 'rocket-league', title: 'Torneo oficial 3v3 cada [X] horas', when: 'Hoy · próximo a las [HORA]', org: 'Oficial · Psyonix (desarrolladora)', orgType: 'Desarrolladoras oficiales', slots: null, max: null, cost: 'Gratis', free: true, color: '#2456C4' },
    { id: 'liga-valorant', type: 'Torneo', game: 'valorant', title: 'Liga universitaria Bogotá', when: 'Sáb 24 oct · 10:00 a. m.', org: '[MARCA] + [ORGANIZADOR]', orgType: 'Marcas y organizadores', slots: 12, max: 32, cost: '[VALOR]', free: false, color: '#5B3F96' },
    { id: 'giftcard-50', type: 'Sorteo', game: null, title: 'Gift card de 50 USD para tu tienda favorita', when: 'Cierra el domingo · 8:00 p. m.', org: 'SaveSlot', orgType: 'SaveSlot', slots: 1284, max: null, cost: '300 XP o [VALOR]', free: true, color: '#2B5A3F' },
    { id: 'speedrun-fnaf', type: 'Torneo', game: 'fnaf-into-the-pit', title: 'Speedrun de Halloween', when: 'Vie 30 oct · 6:00 p. m.', org: '[ORGANIZADOR] (independiente)', orgType: 'Marcas y organizadores', slots: 58, max: 100, cost: 'Gratis', free: true, color: '#6B3A1E' },
    { id: 'codigo-pokemon', type: 'Sorteo', game: 'pokemon-legends-za', title: 'Código de descarga de Pokémon Legends Z-A', when: 'Cierra el 31 oct', org: '[MARCA]', orgType: 'Marcas y organizadores', slots: 3020, max: null, cost: '300 XP', free: true, color: '#B8343E' }
  ],
  trending: [
    { tag: 'En tendencia · Rocket League', q: '¿Cada cuánto hay torneos en Rocket League?', meta: '2,1k preguntas hoy' },
    { tag: 'Lanzamientos', q: '¿Qué juegos nuevos salen esta semana?', meta: '1,6k preguntas hoy' },
    { tag: 'En tendencia · Pokémon Legends Z-A', q: '¿Qué hago primero en Pokémon Legends Z-A?', meta: '1,2k preguntas hoy' },
    { tag: 'Guía', q: '¿Cuánto dura Hollow Knight al 100%?', meta: '860 preguntas hoy' }
  ],
  achievements: [
    { game: 'zelda-totk', name: 'Primer santuario', desc: 'Completa tu primer santuario', pct: 92, got: true },
    { game: 'zelda-totk', name: 'Explorador del cielo', desc: 'Visita todas las islas del cielo', pct: 14, got: true },
    { game: 'zelda-totk', name: 'Maestro Zonai', desc: 'Fusiona 50 dispositivos distintos', pct: 8, got: false },
    { game: 'fnaf-into-the-pit', name: 'Sin un rasguño', desc: 'Termina sin recibir daño', pct: 3.1, got: true },
    { game: 'nier-automata', name: 'Final E', desc: 'Llega al final verdadero', pct: 22, got: true }
  ],
  diarySeed: [
    { game: 'zelda-totk', date: '2026-10-07', state: 'Terminado', hours: 48, score: 10, like: true, review: true },
    { game: 'fnaf-into-the-pit', date: '2026-10-04', state: 'Terminado', hours: 6, score: 7, like: false, review: true },
    { game: 'nier-automata', date: '2026-10-02', state: 'Rejugado', hours: 21, score: 9, like: true, review: true },
    { game: 'hades', date: '2026-09-27', state: 'Terminado', hours: 24, score: 8, like: false, review: false },
    { game: 'valorant', date: '2026-09-19', state: 'Abandonado', hours: 9, score: 5, like: false, review: true },
    { game: 'pokemon-legends-za', date: '2026-09-08', state: 'Terminado', hours: 31, score: 8, like: true, review: false },
    { game: 'inside', date: '2026-08-30', state: 'Terminado', hours: 3, score: 9, like: true, review: false },
    { game: 'hollow-knight', date: '2026-08-12', state: 'Rejugado', hours: 27, score: 9, like: true, review: true }
  ]
};

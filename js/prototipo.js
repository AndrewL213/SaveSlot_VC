/* Andamio temporal: se borra cuando todas las pantallas usen el design kit.
   Es la unión de los 7 archivos JS de disenos/js/ (v3), en el orden en que los cargan las páginas.
   Cambios respecto a disenos/: (1) las rutas a páginas pasan por ssRuta / SS_RAIZ, porque
   index.html y 404.html están en la raíz y las demás en pages/, con los nombres de la app;
   (2) cada juego tiene su portada de assets/ (campo image). */

var SS_RAIZ = /\/pages\//.test(location.pathname) ? '../' : '';
// Devuelve la ruta a una página desde la carpeta actual: index.html y 404.html están en la raíz.
function ssRuta(archivo) { return SS_RAIZ + (/^(index|404)\.html/.test(archivo) ? '' : 'pages/') + archivo; }
// Igual que safeBack de los diseños, pero devuelve la ruta correcta desde la carpeta actual.
function ssVolver(v) { return (v && /^[a-z0-9\-]+\.html(\?[^<>"'\s]*)?$/i.test(v)) ? ssRuta(v) : null; }

/* ===================== config.js ===================== */
/* SaveSlot — configuración.
   IMPORTANTE: este archivo se publica. No pongan aquí secretos (client secrets, claves de Claude/Gemini, tokens).
   - RAWG_KEY: la clave de RAWG sí puede usarse desde el navegador (es la forma documentada por RAWG),
     pero tiene cupo mensual. Si la dejan vacía, la web usa los datos de ejemplo de js/data.js.
   - AI_ENDPOINT: URL de una función serverless propia (Vercel/Netlify/Cloudflare) que llame a Claude o Gemini
     guardando la clave en el servidor. Vacío = MatchPlay responde en modo demo.
   Estado de cada API: ver claude/apis-saveslot.md en el proyecto. */
window.SS_CONFIG = {
  RAWG_KEY: '',
  AI_ENDPOINT: '',
  // Tiempo máximo de espera de una API antes de mostrar la página de error (ms)
  TIMEOUT_MS: 8000,
  // Plataformas sin API pública: al intentar vincularlas se muestra la página de error tipo "plataforma"
  PLATFORMS_WITHOUT_API: ['PlayStation', 'Nintendo']
};

/* ===================== data.js ===================== */
/* SaveSlot — datos de ejemplo.
   Se usan mientras no haya claves de API configuradas (ver js/config.js).
   Las horas, notas y votos son valores de ejemplo para el prototipo. */
window.SS_DATA = {
  games: [
    { id: 'zelda-totk', name: 'The Legend of Zelda: Tears of the Kingdom', short: 'Zelda: TOTK', genres: ['Aventura'], platforms: ['Nintendo'], year: 2023, dev: 'Nintendo EPD', type: 'AAA', hoursMain: 60, hours100: 220, difficulty: 6, rating: 4.8, votes: 12430, color: '#2F6B4F', image: SS_RAIZ + 'assets/portada-zelda-totk.jpg', achievements: 139,
      desc: 'Mundo abierto enorme donde cada puzzle tiene varias soluciones gracias a Ultramano.' },
    { id: 'nier-automata', name: 'NieR: Automata', short: 'NieR: Automata', genres: ['RPG', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2017, dev: 'PlatinumGames', type: 'AAA', hoursMain: 20, hours100: 70, difficulty: 6, rating: 4.7, votes: 8120, color: '#7C7566', image: SS_RAIZ + 'assets/portada-nier-automata.jpg', achievements: 50,
      desc: 'Combate ágil y una historia que cambia por completo con cada final.' },
    { id: 'rocket-league', name: 'Rocket League', short: 'Rocket League', genres: ['Deportes'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2015, dev: 'Psyonix', type: 'AAA', hoursMain: null, hours100: null, difficulty: 7, rating: 4.3, votes: 9840, color: '#2456C4', image: SS_RAIZ + 'assets/portada-rocket-league.jpg', achievements: 88,
      desc: 'Fútbol con autos. Partidas de 5 minutos y torneos oficiales varias veces al día.' },
    { id: 'valorant', name: 'Valorant', short: 'Valorant', genres: ['Shooter'], platforms: ['PC', 'PlayStation', 'Xbox'], year: 2020, dev: 'Riot Games', type: 'AAA', hoursMain: null, hours100: null, difficulty: 8, rating: 4.2, votes: 7650, color: '#5B3F96', image: SS_RAIZ + 'assets/portada-valorant.jpg', achievements: 0,
      desc: 'Shooter táctico 5v5 con agentes de habilidades únicas.' },
    { id: 'pokemon-legends-za', name: 'Pokémon Legends Z-A', short: 'Pokémon Legends Z-A', genres: ['RPG'], platforms: ['Nintendo'], year: 2025, dev: 'Game Freak', type: 'AAA', hoursMain: 30, hours100: 80, difficulty: 3, rating: 4.4, votes: 5310, color: '#B8343E', image: SS_RAIZ + 'assets/portada-pokemon-legends-za.png', achievements: 0,
      desc: 'Captura y combate en tiempo real dentro de Ciudad Luminalia.' },
    { id: 'fnaf-into-the-pit', name: "Five Nights at Freddy's: Into the Pit", short: 'FNAF: Into the Pit', genres: ['Terror'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2024, dev: 'Mega Cat Studios', type: 'Indie', hoursMain: 6, hours100: 10, difficulty: 5, rating: 4.1, votes: 2140, color: '#6B3A1E', image: SS_RAIZ + 'assets/portada-fnaf-into-the-pit.jpg', achievements: 24,
      desc: 'Aventura de terror corta con tensión constante y pocos sustos baratos.' },
    { id: 'hollow-knight', name: 'Hollow Knight', short: 'Hollow Knight', genres: ['Aventura', 'Metroidvania'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2017, dev: 'Team Cherry', type: 'Indie', hoursMain: 27, hours100: 60, difficulty: 7, rating: 4.7, votes: 9010, color: '#2B3A55', image: SS_RAIZ + 'assets/portada-hollow-knight.jpg', achievements: 63,
      desc: 'Metroidvania exigente con un mundo para explorar sin prisa.' },
    { id: 'hades', name: 'Hades', short: 'Hades', genres: ['Roguelike', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2020, dev: 'Supergiant Games', type: 'Indie', hoursMain: 22, hours100: 95, difficulty: 6, rating: 4.8, votes: 7720, color: '#8A2B2B', image: SS_RAIZ + 'assets/portada-hades.jpg', achievements: 49,
      desc: 'Escapa del inframundo partida a partida mientras la historia avanza.' },
    { id: 'elden-ring', name: 'Elden Ring', short: 'Elden Ring', genres: ['RPG', 'Acción'], platforms: ['PC', 'PlayStation', 'Xbox'], year: 2022, dev: 'FromSoftware', type: 'AAA', hoursMain: 55, hours100: 130, difficulty: 8, rating: 4.8, votes: 11200, color: '#3E5A2A', image: SS_RAIZ + 'assets/portada-elden-ring.jpg', achievements: 42,
      desc: 'Mundo abierto oscuro y desafiante con libertad total para explorar.' },
    { id: 'ghost-of-tsushima', name: 'Ghost of Tsushima', short: 'Ghost of Tsushima', genres: ['Aventura', 'Acción'], platforms: ['PlayStation', 'PC'], year: 2020, dev: 'Sucker Punch', type: 'AAA', hoursMain: 25, hours100: 60, difficulty: 5, rating: 4.7, votes: 6400, color: '#7A2E2E', image: SS_RAIZ + 'assets/portada-ghost-of-tsushima.jpg', achievements: 52,
      desc: 'Samurái en mundo abierto con combate preciso y un viento que te guía.' },
    { id: 'inside', name: 'Inside', short: 'Inside', genres: ['Terror', 'Plataformas'], platforms: ['PC', 'PlayStation', 'Xbox', 'Nintendo'], year: 2016, dev: 'Playdead', type: 'Indie', hoursMain: 3, hours100: 5, difficulty: 4, rating: 4.6, votes: 4300, color: '#3A3F45', image: SS_RAIZ + 'assets/portada-inside.jpg', achievements: 14,
      desc: 'Plataformas oscuro y sin diálogos. Se termina en una tarde.' },
    { id: 'hades-ii', name: 'Hades II', short: 'Hades II', genres: ['Roguelike', 'Acción'], platforms: ['PC', 'Nintendo'], year: 2025, dev: 'Supergiant Games', type: 'Indie', hoursMain: 30, hours100: 100, difficulty: 6, rating: 4.7, votes: 3100, color: '#5A2D6B', image: SS_RAIZ + 'assets/portada-hades-ii.jpg', achievements: 50,
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

/* ===================== api.js ===================== */
/* SaveSlot — capa de datos.
   Usa RAWG si hay clave en js/config.js; si no, los datos de ejemplo.
   Cualquier fallo de una API externa termina en ' + ssRuta('404.html') + ' con el motivo. */
(function () {
  const CFG = window.SS_CONFIG || {};
  const DATA = window.SS_DATA;

  // Tipos de error que entiende 404.html
  function errorTypeFromStatus(status) {
    if (status === 429) return 'limite';
    if (status === 401 || status === 403) return 'credenciales';
    if (status === 503) return 'mantenimiento';
    if (status >= 500) return 'api';
    return 'api';
  }

  function fail(tipo, servicio, detalle) {
    const params = new URLSearchParams({ tipo: tipo, servicio: servicio || '', volver: location.pathname.split('/').pop() + location.search });
    if (detalle) params.set('detalle', String(detalle).slice(0, 120));
    location.href = '' + ssRuta('404.html') + '?' + params.toString();
  }

  async function request(url, servicio, opts) {
    if (!navigator.onLine) { fail('sin-conexion', servicio); throw new Error('offline'); }
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), CFG.TIMEOUT_MS || 8000);
    let res;
    try {
      res = await fetch(url, Object.assign({ signal: ctrl.signal }, opts || {}));
    } catch (e) {
      clearTimeout(t);
      fail(e.name === 'AbortError' ? 'tiempo' : 'api', servicio, e.message);
      throw e;
    }
    clearTimeout(t);
    if (!res.ok) { fail(errorTypeFromStatus(res.status), servicio, 'HTTP ' + res.status); throw new Error('HTTP ' + res.status); }
    return res.json();
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // RAWG → formato SaveSlot
  const palette = ['#2F6B4F', '#7C7566', '#2456C4', '#5B3F96', '#B8343E', '#6B3A1E', '#2B3A55', '#8A2B2B'];
  function fromRawg(g, i) {
    const plats = (g.parent_platforms || []).map((p) => p.platform.name).map((n) => n === 'PC' ? 'PC' : n);
    return {
      id: 'rawg-' + g.id, rawgId: g.id, name: g.name, short: g.name, genres: (g.genres || []).map((x) => x.name),
      platforms: plats, year: g.released ? Number(g.released.slice(0, 4)) : null, dev: '', type: '',
      hoursMain: g.playtime || null, hours100: null, difficulty: null, rating: g.rating || null, votes: g.ratings_count || 0,
      color: palette[i % palette.length], image: g.background_image || '', achievements: g.achievements_count || 0, desc: ''
    };
  }

  function matches(g, f) {
    if (f.q) {
      const q = f.q.toLowerCase();
      if (!(g.name.toLowerCase().includes(q) || g.short.toLowerCase().includes(q) || g.genres.join(' ').toLowerCase().includes(q))) return false;
    }
    if (f.genres && f.genres.length && !f.genres.some((x) => g.genres.includes(x))) return false;
    if (f.platforms && f.platforms.length && !f.platforms.some((x) => g.platforms.includes(x))) return false;
    if (f.type && f.type !== 'Todos' && g.type !== f.type) return false;
    if (f.length === 'corto' && !(g.hoursMain && g.hoursMain < 10)) return false;
    if (f.length === 'medio' && !(g.hoursMain && g.hoursMain >= 10 && g.hoursMain <= 40)) return false;
    if (f.length === 'largo' && !(g.hoursMain && g.hoursMain > 40)) return false;
    if (f.from && g.year && g.year < f.from) return false;
    if (f.to && g.year && g.year > f.to) return false;
    return true;
  }

  const api = {
    usingDemo: !CFG.RAWG_KEY,
    fail: fail,

    async searchGames(filters) {
      filters = filters || {};
      if (CFG.RAWG_KEY && filters.q) {
        const url = 'https://api.rawg.io/api/games?page_size=20&key=' + encodeURIComponent(CFG.RAWG_KEY) + '&search=' + encodeURIComponent(filters.q);
        const json = await request(url, 'RAWG');
        return json.results.map(fromRawg).filter((g) => matches(g, Object.assign({}, filters, { q: '' })));
      }
      await wait(250);
      return DATA.games.filter((g) => matches(g, filters));
    },

    async getGame(id) {
      const local = DATA.games.find((g) => g.id === id);
      if (local) { await wait(150); return local; }
      if (CFG.RAWG_KEY && id && id.indexOf('rawg-') === 0) {
        const g = await request('https://api.rawg.io/api/games/' + id.slice(5) + '?key=' + encodeURIComponent(CFG.RAWG_KEY), 'RAWG');
        const mapped = fromRawg(g, 0);
        mapped.desc = (g.description_raw || '').slice(0, 280);
        mapped.dev = (g.developers || []).map((d) => d.name).join(', ');
        return mapped;
      }
      return null;
    },

    async askAI(history) {
      if (CFG.AI_ENDPOINT) {
        const json = await request(CFG.AI_ENDPOINT, 'MatchPlay (IA)', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history })
        });
        return json.reply;
      }
      await wait(700);
      return demoReply(history[history.length - 1].text);
    },

    // Vincular plataformas: Steam (OpenID) y Xbox (OpenXBL) son posibles; PlayStation y Nintendo no tienen API pública
    async linkPlatform(name) {
      if ((CFG.PLATFORMS_WITHOUT_API || []).includes(name)) { fail('plataforma', name); throw new Error('no-api'); }
      await wait(600);
      return { ok: true, demo: true };
    }
  };

  function demoReply(t) {
    const s = t.toLowerCase();
    if (s.includes('rocket')) return 'Los torneos oficiales de Rocket League se juegan varias veces al día desde el menú del juego. En SaveSlot tienes además la Copa 2v2 del sábado: revisa los cupos en Eventos.';
    if (s.includes('hollow') || s.includes('dura')) return 'Hollow Knight: unas 27 h la historia principal y unas 60 h al 100%, según los votos de la comunidad.';
    if (s.includes('pokémon') || s.includes('pokemon')) return 'En Pokémon Legends Z-A conviene completar las misiones secundarias temprano: dan dinero y objetos de evolución.';
    if (s.includes('nier') || s.includes('parecido')) return 'Si te gustó NieR: Automata, prueba Hades (≈22 h), Hollow Knight (≈27 h) o Ghost of Tsushima (≈25 h). Si eliges uno, empieza por Hades.';
    if (s.includes('corto') || s.includes('finde') || s.includes('terror')) return 'Para un fin de semana: Inside (≈3 h) o FNAF: Into the Pit (≈6 h). Los dos dan miedo sin depender de sustos baratos.';
    if (s.includes('nuevo') || s.includes('salen') || s.includes('lanzamiento')) return 'Cuando conectemos la API de catálogo te mostraré los lanzamientos de la semana en tus plataformas. Por ahora puedes ver los mejores juegos de la semana en Inicio.';
    return 'Buena pregunta. En modo demo respondo con ejemplos; cuando MatchPlay esté conectado a la IA revisaré tu biblioteca y las reseñas para darte una respuesta completa.';
  }

  window.SS_API = api;
})();

/* ===================== app.js ===================== */
/* SaveSlot — núcleo: almacenamiento, sesión, layout, utilidades. */
(function () {
  const DATA = window.SS_DATA;

  // ---------- Utilidades ----------
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const params = new URLSearchParams(location.search);
  const gameById = (id) => DATA.games.find((g) => g.id === id);
  const fmt = (n) => Number(n).toLocaleString('es-CO');

  // ---------- Almacenamiento (localStorage con respaldo en memoria) ----------
  const mem = {};
  const store = {
    get(k, def) {
      try { const v = localStorage.getItem('ss.' + k); return v == null ? (k in mem ? mem[k] : def) : JSON.parse(v); }
      catch (e) { return k in mem ? mem[k] : def; }
    },
    set(k, v) { mem[k] = v; try { localStorage.setItem('ss.' + k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
  };

  // ---------- Sesión (demo: sin backend, se guarda en el navegador) ----------
  const auth = {
    user() { return store.get('session', null); },
    login(u) { store.set('session', u); },
    logout() { store.set('session', null); },
    require(actionText) {
      if (auth.user()) return true;
      modal({
        icon: 'user', title: 'Necesitas una cuenta',
        text: 'Para ' + (actionText || 'hacer esto') + ', crea tu cuenta gratis. Lo que escribiste se guarda.',
        actions: [
          { label: 'Crear cuenta gratis', href: '' + ssRuta('crear-cuenta.html') + '?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search), primary: true },
          { label: 'Ya tengo cuenta', href: '' + ssRuta('iniciar-sesion.html') + '?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search) }
        ]
      });
      return false;
    }
  };

  // ---------- Perfil del usuario (XP, favoritos, diario, etc.) ----------
  const profile = {
    get() {
      return store.get('profile', {
        xp: 1240, level: 12, bio: 'Gamer casual. Aventura, RPG y algo de terror los fines de semana.',
        since: '2024-03-14', favorites: ['nier-automata', 'zelda-totk', 'hollow-knight', 'fnaf-into-the-pit'],
        wishlist: ['hades-ii', 'ghost-of-tsushima', 'elden-ring'], genres: ['Aventura', 'RPG', 'Terror'],
        accounts: { Steam: 'samluq_steam', PlayStation: null, Xbox: null, Nintendo: null },
        playing: 'zelda-totk', missionsDone: ['calificar', 'guia']
      });
    },
    save(p) { store.set('profile', p); },
    addXP(n) { const p = profile.get(); p.xp += n; while (p.xp >= 1500) { p.xp -= 1500; p.level += 1; } profile.save(p); return p; }
  };

  const diary = {
    all() { return store.get('diary', DATA.diarySeed.slice()); },
    add(e) { const d = diary.all(); d.unshift(e); d.sort((a, b) => b.date.localeCompare(a.date)); store.set('diary', d); }
  };

  // ---------- Reseñas propias (historial) ----------
  const reviews = {
    mine() {
      let list = store.get('myReviews', null);
      if (!list) {
        // Migra reseñas publicadas antes de v3 (clave "reviews") y suma las de ejemplo
        const old = store.get('reviews', []).map((r, i) => Object.assign({ id: 'u' + i, date: new Date().toISOString().slice(0, 10), likes: 0 }, r));
        list = old.concat(DATA.myReviews.map((r) => Object.assign({}, r)));
        store.set('myReviews', list);
      }
      const u = auth.user() || { user: 'samluq', initials: 'SL' };
      return list.map((r) => Object.assign({}, r, { user: u.user, initials: u.initials, mine: true }));
    },
    raw() { reviews.mine(); return store.get('myReviews', []); },
    save(list) { store.set('myReviews', list); },
    all() { return reviews.mine().concat(DATA.reviews); },
    byId(id) { return reviews.all().find((r) => r.id === id); },
    comments(id) { return store.get('comments.' + id, null) || DATA.comments.filter((c) => c.review === id); }
  };

  // ---------- Amigos (estado de relación guardado en el navegador) ----------
  const friends = {
    rel(u) { const m = store.get('friends', {}); return m[u] || ((DATA.users.find((x) => x.user === u) || {}).rel) || 'none'; },
    set(u, r) { const m = store.get('friends', {}); m[u] = r; store.set('friends', m); },
    list(r) { return DATA.users.filter((x) => friends.rel(x.user) === r); },
    user(u) { return DATA.users.find((x) => x.user === u); }
  };
  const STATUS_TXT = (f) => f.status === 'playing' ? 'Jugando ' + ((DATA.games.find((g) => g.id === f.game) || {}).short || '') : f.status === 'online' ? 'En línea' : 'Desconectado · ' + (f.last || 'hace un rato');
  function avatar(f, size) {
    size = size || 44;
    return '<span class="av av-' + f.status + '" style="--av:' + (f.color || '#2E3A4A') + ';width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .36) + 'px">' + esc(f.initials) + '<i aria-hidden="true"></i></span>';
  }
  // Enlace al perfil de una persona (el propio va a perfil.html)
  const userHref = (u) => { const me = auth.user(); return me && me.user === u ? '' + ssRuta('perfil.html') + '' : '' + ssRuta('perfil-usuario.html') + '?u=' + encodeURIComponent(u); };

  // ---------- UI: toast y modal ----------
  let toastTimer;
  function toast(msg, opts) {
    opts = opts || {};
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (opts.action ? '<button type="button" class="toast-action">' + esc(opts.action) + '</button>' : '');
    el.hidden = false;
    if (opts.action) $('.toast-action', el).addEventListener('click', () => { el.hidden = true; if (opts.onAction) opts.onAction(); });
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, opts.action ? 6000 : 2800);
  }
  // Estado de carga en botones (H1, Doherty): feedback inmediato antes de terminar la acción
  function busy(btn, text, ms) {
    return new Promise((res) => {
      if (!btn) return res();
      const old = btn.innerHTML; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + esc(text);
      setTimeout(() => { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = old; res(); }, ms || 500);
    });
  }
  // Escala única de calificación: todo se muestra sobre 10 (H4 consistencia)
  const score10 = (r) => r ? (Math.round(r * 2 * 10) / 10).toFixed(1).replace('.', ',') : '—';
  // Vistos recientemente (H6 reconocer en vez de recordar)
  const recent = {
    all() { return store.get('recentGames', []); },
    add(id) { const r = recent.all().filter((x) => x !== id); r.unshift(id); store.set('recentGames', r.slice(0, 6)); }
  };

  const ICONS = {
    user: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6CC0FA" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    check: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4CC870" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    alert: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F0616D" stroke-width="2" stroke-linecap="round"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/></svg>',
    trophy: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6CC0FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/></svg>'
  };
  const ICON_BG = { user: '#1A3157', check: '#1D3A2B', alert: '#2A1E24', trophy: '#1A3157' };

  function modal(o) {
    closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
      '<button class="close" aria-label="Cerrar">✕</button>' +
      (o.icon ? '<span class="icon" style="background:' + ICON_BG[o.icon] + '">' + ICONS[o.icon] + '</span>' : '') +
      '<h2 id="m-title" style="font-size:24px">' + esc(o.title) + '</h2>' +
      (o.text ? '<p class="soft">' + esc(o.text) + '</p>' : '') +
      (o.html || '') +
      '<div class="actions">' + (o.actions || []).map((a, i) =>
        a.href ? '<a class="btn ' + (a.primary ? 'btn-primary' : 'btn-secondary') + '" href="' + esc(a.href) + '">' + esc(a.label) + '</a>'
               : '<button class="btn ' + (a.primary ? 'btn-primary' : 'btn-secondary') + '" data-i="' + i + '">' + esc(a.label) + '</button>').join('') + '</div></div>';
    document.body.appendChild(wrap);
    const close = () => closeModal();
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    $('.close', wrap).addEventListener('click', close);
    $$('[data-i]', wrap).forEach((b) => b.addEventListener('click', () => { const a = o.actions[b.dataset.i]; if (a.onClick) a.onClick(); if (!a.keepOpen) close(); }));
    document.addEventListener('keydown', escClose);
    const first = $('.actions .btn', wrap); if (first) first.focus();
  }
  function escClose(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() { const m = $('.modal-backdrop'); if (m) m.remove(); document.removeEventListener('keydown', escClose); }

  // ---------- Componentes ----------
  function cover(g, opts) {
    opts = opts || {};
    const bg = g.image ? 'background-image:url(' + esc(g.image) + ');background-size:cover;background-position:center;' : '';
    if (opts.small) return '<span class="cover cover-sm" style="--c:' + g.color + ';' + bg + '" aria-hidden="true"></span>';
    return '<div class="cover" style="--c:' + g.color + ';' + bg + (opts.style || '') + '">' + (opts.rank ? '<span class="rank">#' + opts.rank + '</span>' : '') + (opts.noTitle ? '' : '<b>' + esc(g.short) + '</b>') + '</div>';
  }
  function gameTile(g, rank) {
    return '<a class="game-tile" href="' + ssRuta('detalle-juego.html') + '?id=' + encodeURIComponent(g.id) + '">' + cover(g, { rank: rank }) +
      '<div class="meta"><span>' + esc(g.genres[0] || '') + '</span><span class="score" aria-label="Nota de la comunidad ' + score10(g.rating) + ' de 10">' + (g.rating ? score10(g.rating) : '') + '</span></div></a>';
  }
  function skulls(n) { let s = '<div class="skulls" aria-label="Dificultad ' + n + ' de 10">'; for (let i = 1; i <= 10; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return s + '</div>'; }

  // ---------- Layout ----------
  const NAV = [
    ['' + ssRuta('index.html') + '', 'Inicio', 'inicio'], ['' + ssRuta('buscar-juegos.html') + '', 'Juegos', 'juegos'], ['' + ssRuta('comunidad.html') + '', 'Comunidad', 'comunidad'],
    ['' + ssRuta('eventos.html') + '', 'Eventos', 'eventos'], ['' + ssRuta('matchplay.html') + '', 'MatchPlay', 'matchplay']
  ];
  const LOGO = '<svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true"><rect x="1.5" y="1.5" width="25" height="17" rx="3" fill="none" stroke="#3DA9F5" stroke-width="3"/><rect x="6" y="12" width="16" height="3" fill="#3DA9F5"/></svg>';

  function renderLayout() {
    const section = document.body.dataset.section || '';
    const u = auth.user();
    const p = profile.get();
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML =
      '<div class="container">' +
      '<a class="logo" href="' + ssRuta('index.html') + '">' + LOGO + 'SaveSlot</a>' +
      '<button class="icon-btn search-toggle" aria-label="Buscar" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button>' +
      '<nav class="main-nav" aria-label="Principal">' + NAV.map((n) => '<a href="' + n[0] + '"' + (n[2] === section ? ' aria-current="page"' : '') + '>' + n[1] + '</a>').join('') + '</nav>' +
      '<form class="header-search" role="search" action="' + ssRuta('buscar-juegos.html') + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA8B8" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<label class="sr-only" for="hq">Buscar juegos</label><input id="hq" name="q" type="search" list="ss-games" autocomplete="off" placeholder="Buscar juegos" value="' + esc(section === 'juegos' ? (params.get('q') || '') : '') + '"><kbd class="kbd hide-sm" title="Atajo: pulsa / para buscar">/</kbd></form>' +
      (u ? '<a class="icon-btn hide-sm" href="' + ssRuta('amigos.html') + '" aria-label="Amigos" title="Amigos"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.5 2.4 3.5 5.2"/></svg>' + (friends.list('in').length ? '<span class="dot" style="background:var(--good)"></span>' : '') + '</a><button class="icon-btn" id="notif" aria-label="Notificaciones, 2 nuevas"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg><span class="dot"></span></button>' +
           '<a class="user-pill" href="' + ssRuta('perfil.html') + '"><span class="avatar">' + esc(u.initials) + '</span><span><b>' + esc(u.name.split(' ')[0]) + '</b><span>Nivel ' + p.level + '</span></span></a>'
         : '<a class="btn btn-secondary btn-sm hide-sm" href="' + ssRuta('iniciar-sesion.html') + '">Iniciar sesión</a><a class="btn btn-primary btn-sm" href="' + ssRuta('crear-cuenta.html') + '">Crear cuenta</a>') +
      '</div>';
    document.body.prepend(header);
    // Sugerencias de nombres de juegos para todos los buscadores (H5, H6)
    if (!$('#ss-games')) { const dl = document.createElement('datalist'); dl.id = 'ss-games'; dl.innerHTML = DATA.games.map((g) => '<option value="' + esc(g.name) + '">').join(''); document.body.appendChild(dl); }
    $$('input[type="search"]').forEach((i) => { if (!i.getAttribute('list')) { i.setAttribute('list', 'ss-games'); i.setAttribute('autocomplete', 'off'); } });
    // Atajo de teclado "/" para buscar (H7 flexibilidad)
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      e.preventDefault(); const f = $('.header-search', header); f.classList.add('open'); $('input', f).focus();
    });
    if (window.SS_API && SS_API.usingDemo && !store.get('hideDemo', false)) {
      const bar = document.createElement('div');
      bar.className = 'demo-bar';
      bar.innerHTML = '<span>Prototipo académico: los datos de juegos son de ejemplo hasta conectar las APIs. <a href="' + ssRuta('404.html') + '?tipo=demo">Más información</a></span><button type="button" class="demo-close" aria-label="Ocultar aviso del prototipo">✕</button>';
      header.after(bar);
      $('.demo-close', bar).addEventListener('click', () => { store.set('hideDemo', true); bar.remove(); });
    }
    const tgl = $('.search-toggle', header);
    tgl.addEventListener('click', () => { const f = $('.header-search', header); f.classList.toggle('open'); tgl.setAttribute('aria-expanded', f.classList.contains('open')); if (f.classList.contains('open')) $('input', f).focus(); });

    // Barra inferior para móviles (zona del pulgar)
    const TAB_SECTION = { comunidad: 'juegos', cuenta: 'perfil', ayuda: '' };
    const active = TAB_SECTION[section] !== undefined ? TAB_SECTION[section] : section;
    const ICON = {
      inicio: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
      juegos: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="13.5" r="1"/>',
      eventos: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
      matchplay: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.7A8 8 0 1 1 21 12z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/>',
      perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
    };
    const TABS = [['' + ssRuta('index.html') + '', 'Inicio', 'inicio'], ['' + ssRuta('buscar-juegos.html') + '', 'Juegos', 'juegos'], ['' + ssRuta('eventos.html') + '', 'Eventos', 'eventos'], ['' + ssRuta('matchplay.html') + '', 'MatchPlay', 'matchplay'], [u ? '' + ssRuta('perfil.html') + '' : '' + ssRuta('iniciar-sesion.html') + '', u ? 'Perfil' : 'Entrar', 'perfil']];
    const tabbar = document.createElement('nav');
    tabbar.className = 'tabbar';
    tabbar.setAttribute('aria-label', 'Navegación principal');
    tabbar.innerHTML = TABS.map((t) => '<a href="' + t[0] + '"' + (t[2] === active ? ' aria-current="page"' : '') + '><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[t[2]] + '</svg><span>' + t[1] + '</span></a>').join('');
    document.body.appendChild(tabbar);
    const nb = $('#notif', header);
    if (nb) nb.addEventListener('click', () => { const req = friends.list('in'); modal({ icon: 'trophy', title: 'Notificaciones', html: '<div class="stack" style="width:100%;text-align:left;gap:10px">' + (req.length ? '<a class="card card-link" href="' + ssRuta('amigos.html') + '#solicitudes"><b>' + req.length + ' solicitudes de amistad</b><span class="small muted">' + req.map((r) => esc(r.name)).join(', ') + '</span></a>' : '') + '<a class="card card-link" href="' + ssRuta('detalle-resena.html') + '?id=m1"><span>Kenneth y Daniela comentaron tu reseña de Zelda: TOTK.</span></a><a class="card card-link" href="' + ssRuta('historial-resenas.html') + '"><span>Tu reseña de NieR: Automata recibió 12 votos de “útil”.</span></a><a class="card card-link" href="' + ssRuta('detalle-evento.html') + '?id=copa-2v2"><span>La Copa SaveSlot 2v2 cierra inscripciones el viernes.</span></a></div>', actions: [{ label: 'Cerrar' }] }); });

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="container">' +
      '<div style="display:flex;flex-direction:column;gap:10px;max-width:320px"><b style="font-size:20px">SaveSlot</b><span class="muted small">Tu solución gamer. Todos tus juegos y sus comunidades en un solo lugar.</span></div>' +
      '<nav aria-label="Pie de página">' +
      '<div><b>Explora</b><a href="' + ssRuta('buscar-juegos.html') + '">Juegos</a><a href="' + ssRuta('juego-random.html') + '">Juego random</a><a href="' + ssRuta('eventos.html') + '">Eventos</a></div>' +
      '<div><b>Cuenta</b><a href="' + ssRuta('perfil.html') + '">Mi perfil</a><a href="' + ssRuta('amigos.html') + '">Amigos</a><a href="' + ssRuta('historial-resenas.html') + '">Historial de reseñas</a><a href="' + ssRuta('diario.html') + '">Diario</a><a href="' + ssRuta('logros.html') + '">Logros</a>' + (u ? '<a href="#" id="logout">Cerrar sesión</a>' : '<a href="' + ssRuta('iniciar-sesion.html') + '">Iniciar sesión</a>') + '</div>' +
      '<div><b>Ayuda</b><a href="' + ssRuta('contacto.html') + '">Contáctanos</a><a href="' + ssRuta('404.html') + '?tipo=estado">Estado de servicios</a><a href="' + ssRuta('eventos.html') + '#reglas">Reglas de eventos</a></div>' +
      '</nav>' +
      '<p class="credits">Proyecto académico sin fines comerciales · Creación Digital, Universidad El Bosque. Nombres de juegos y marcas pertenecen a sus dueños. Datos de juegos: ejemplo' + (window.SS_API && !SS_API.usingDemo ? ' y <a href="https://rawg.io" target="_blank" rel="noopener">RAWG</a>' : '') + '.</p>' +
      '</div>';
    document.body.appendChild(footer);
    const lo = $('#logout', footer);
    if (lo) lo.addEventListener('click', (e) => { e.preventDefault(); auth.logout(); location.href = '' + ssRuta('index.html') + ''; });
  }

  // Simulación de fallos para probar la página de error: ?simular=limite|api|tiempo|mantenimiento|sin-conexion|credenciales
  function checkSimulation() {
    const s = params.get('simular');
    if (s && document.body.dataset.page !== 'error') { SS_API.fail(s, params.get('servicio') || 'API de prueba'); return true; }
    return false;
  }
  window.addEventListener('offline', () => toast('Sin conexión. Algunas funciones no estarán disponibles.'));
  window.addEventListener('online', () => toast('Conexión recuperada'));
  if (false) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  window.SS = { $, $$, esc, params, store, auth, profile, diary, reviews, friends, avatar, STATUS_TXT, userHref, toast, busy, score10, recent, modal, closeModal, cover, gameTile, skulls, gameById, fmt, DATA };

  document.addEventListener('DOMContentLoaded', () => {
    if (checkSimulation()) return;
    renderLayout();
    const page = document.body.dataset.page;
    const init = window.SS_PAGES && window.SS_PAGES[page];
    if (init) {
      Promise.resolve().then(init).catch((e) => { console.error(e); });
    }
  });
})();

/* ===================== pages-juegos.js ===================== */
/* SaveSlot — páginas de juegos, búsqueda, eventos y reseñas. */
window.SS_PAGES = window.SS_PAGES || {};
(function (P) {
  const { $, $$, esc, params, store, auth, profile, diary, reviews: RV, friends, avatar, userHref, toast, busy, score10, recent, modal, cover, gameTile, skulls, gameById, fmt, DATA } = window.SS;
  const API = window.SS_API;

  function skeletonTiles(n) { return Array.from({ length: n }, () => '<div class="skeleton" style="aspect-ratio:3/4"></div>').join(''); }
  function userReviews() { return RV.mine(); }

  function reviewCard(r, opts) {
    const g = gameById(r.game);
    const f = friends.user(r.user);
    const av = f ? avatar(f, 38) : '<span class="avatar">' + esc(r.initials) + '</span>';
    const nCom = RV.comments(r.id).length;
    const head = '<div class="who">' + av + '<div style="line-height:1.3"><a class="user-link" href="' + userHref(r.user) + '"><b>' + esc(r.user) + '</b></a>' + (f && friends.rel(f.user) === 'friend' ? ' <span class="badge badge-friend">AMIGO</span>' : '') + '<br><span class="muted xs">' +
      (opts && opts.showGame && g ? 'sobre ' + esc(g.short) + ' · ' : '') + esc(r.hours) + ' h jugadas</span></div><span class="score-pill" style="margin-left:auto">' + esc(r.score) + '<small>/10</small></span></div>';
    const body = r.spoiler
      ? '<div class="spoiler"><span class="muted">Esta reseña tiene spoilers.</span><button class="btn btn-secondary btn-sm" data-reveal>Mostrar de todas formas</button></div><p hidden>' + esc(r.text) + '</p>'
      : '<p>' + esc(r.text) + '</p>';
    return '<article class="review' + (g ? '" style="--c:' + g.color : '') + '">' + head + body + '<div class="row small muted" style="gap:10px"><button class="btn btn-secondary btn-sm" data-useful>Útil · <span>' + fmt(r.useful || 0) + '</span></button><span>♥ ' + fmt(r.likes || 0) + '</span><span>' + nCom + (nCom === 1 ? ' comentario' : ' comentarios') + '</span>' +
      (r.id ? '<a class="link-strong" style="margin-left:auto" href="' + ssRuta('detalle-resena.html') + '?id=' + encodeURIComponent(r.id) + '">Leer y comentar →</a>' : '') + '</div></article>';
  }
  function bindReviewActions(root) {
    $$('[data-reveal]', root).forEach((b) => b.addEventListener('click', () => { const box = b.closest('.spoiler'); box.nextElementSibling.hidden = false; box.remove(); }));
    $$('[data-useful]', root).forEach((b) => b.addEventListener('click', () => {
      if (!auth.require('votar reseñas')) return;
      if (b.dataset.done) return; b.dataset.done = '1'; const s = $('span', b); s.textContent = fmt(Number(s.textContent.replace(/\D/g, '')) + 1); b.style.borderColor = '#3DA9F5'; toast('Gracias por tu voto');
    }));
  }

  // ---------- Inicio ----------
  P.inicio = async function () {
    $('#top-games').innerHTML = skeletonTiles(6);
    const games = await API.searchGames({});
    const top = games.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 6);
    $('#top-games').innerHTML = top.map((g, i) => gameTile(g, i + 1)).join('');
    const all = DATA.reviews.filter((r) => !r.spoiler);
    $('#reviews').innerHTML = all.slice(0, 3).map((r) => reviewCard(r, { showGame: true })).join('');
    bindReviewActions($('#reviews'));
    const feat = DATA.events.find((e) => e.featured);
    const raffle = DATA.events.find((e) => e.type === 'Sorteo');
    $('#events-home').innerHTML = eventFeature(feat) + eventCard(raffle);
    // Popup del evento del mes, una vez por sesión del navegador
    const seen = store.get('popupSeen', false); store.set('popupSeen', true);
    const rv = recent.all().map(gameById).filter(Boolean);
    if (rv.length && $('#recent-wrap')) { $('#recent-wrap').hidden = false; $('#recent-games').innerHTML = rv.map((g) => gameTile(g)).join(''); }
    if (!seen) setTimeout(() => modal({
      icon: 'trophy', title: feat.title, text: 'Evento del mes. Arma tu equipo y compite. ' + feat.when + ' · ' + feat.slots + ' de ' + feat.max + ' cupos ocupados.',
      actions: [{ label: 'Ver evento', href: '' + ssRuta('detalle-evento.html') + '?id=' + feat.id, primary: true }]
    }), 900);
  };

  // ---------- Eventos ----------
  function eventFeature(e) {
    return '<a class="card card-link event-feature" href="' + ssRuta('detalle-evento.html') + '?id=' + e.id + '" style="flex:2 1 520px;padding:28px;gap:12px;--c:' + e.color + '">' +
      '<span class="row" style="gap:8px"><span class="badge badge-accent">' + e.type.toUpperCase() + '</span><span class="badge badge-outline" style="color:#E6EBF1;border-color:#9AD4FB">EVENTO DEL MES</span></span>' +
      '<b style="font-size:30px;line-height:1.1">' + esc(e.title) + '</b><span class="soft">' + esc(e.when) + ' · Organiza: ' + esc(e.org) + '</span>' +
      '<span class="row"><span class="btn btn-primary">Ver evento</span><span class="soft small">' + e.slots + ' de ' + e.max + ' cupos ocupados</span></span></a>';
  }
  function eventCard(e) {
    const g = e.game ? gameById(e.game) : null;
    const badge = e.type === 'Torneo' ? 'badge-accent' : 'badge-good';
    const slots = e.max ? e.slots + ' / ' + e.max : (e.slots ? fmt(e.slots) + ' participantes' : 'Sin límite');
    return '<a class="card card-link" href="' + ssRuta('detalle-evento.html') + '?id=' + e.id + '" style="padding:0;overflow:hidden;gap:0;flex:1 1 300px">' +
      '<div class="event-art" style="--c:' + e.color + '"><span class="badge ' + badge + '">' + e.type.toUpperCase() + '</span></div>' +
      '<div style="padding:18px;display:flex;flex-direction:column;gap:6px;flex:1"><span class="muted xs">' + esc(g ? g.short : 'Cualquier tienda') + '</span><b style="font-size:19px;line-height:1.2">' + esc(e.title) + '</b>' +
      '<span class="soft small">' + esc(e.when) + '</span><span class="muted xs">' + esc(e.org) + '</span>' +
      '<div class="row between small" style="margin-top:auto;padding-top:10px;border-top:1px solid var(--line)"><span>' + slots + '</span><b style="color:var(--accent-text)">' + esc(e.cost) + '</b></div></div></a>';
  }

  P.eventos = function () {
    const feat = DATA.events.find((e) => e.featured);
    $('#featured').outerHTML = eventFeature(feat).replace('flex:2 1 520px;', '');
    let tab = 'Todos', org = 'Todos';
    function render() {
      const list = DATA.events.filter((e) => (tab === 'Todos' || (tab === 'Torneos' && e.type === 'Torneo') || (tab === 'Sorteos' && e.type === 'Sorteo') || (tab === 'Gratis' && e.free)) && (org === 'Todos' || e.orgType === org));
      $('#event-grid').innerHTML = list.length ? list.map(eventCard).join('') : '<div class="empty">No hay eventos con estos filtros. <button class="btn btn-secondary btn-sm" id="clear">Ver todos</button></div>';
      const c = $('#clear'); if (c) c.addEventListener('click', () => { tab = 'Todos'; org = 'Todos'; $('#org').value = 'Todos'; syncTabs(); render(); });
    }
    function syncTabs() { $$('#event-tabs .chip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tab === tab)); }
    $$('#event-tabs .chip').forEach((b) => b.addEventListener('click', () => { tab = b.dataset.tab; syncTabs(); render(); }));
    $('#org').addEventListener('change', (e) => { org = e.target.value; render(); });
    syncTabs(); render();
  };

  P.evento = function () {
    const e = DATA.events.find((x) => x.id === params.get('id'));
    if (!e) { location.replace('' + ssRuta('404.html') + ''); return; }
    document.title = e.title + ' · SaveSlot';
    const isT = e.type === 'Torneo';
    const g = e.game ? gameById(e.game) : null;
    const p = profile.get();
    const joined = store.get('joined', []);
    $('#band').style.setProperty('--band', isT ? '#1A3157' : '#1D3A2B');
    $('#crumb').textContent = e.type === 'Torneo' ? 'Torneos' : 'Sorteos';
    $('#crumb-title').textContent = e.title;
    $('#ev-badges').innerHTML = '<span class="badge ' + (isT ? 'badge-accent' : 'badge-good') + '">' + e.type.toUpperCase() + '</span>' + (g ? '<span class="badge badge-outline" style="color:#E6EBF1">' + esc(g.short.toUpperCase()) + '</span>' : '') + '<span class="badge badge-outline" style="color:#E6EBF1">ORGANIZA ' + esc(e.org.toUpperCase()) + '</span>';
    $('#ev-title').textContent = e.title;
    $('#ev-facts').innerHTML = [['Fecha', e.when], [isT ? 'Cupos' : 'Participantes', e.max ? e.slots + ' / ' + e.max : (e.slots ? fmt(e.slots) : 'Sin límite')], ['Costo', e.cost], ['Premio', isT ? '[PREMIO]' : 'El indicado']].map((f) => '<div class="glass"><span class="xs soft">' + f[0] + '</span><br><b>' + esc(f[1]) + '</b></div>').join('');
    $('#about').innerHTML = isT
      ? '<h2 style="font-size:24px">Sobre el torneo</h2><p class="soft">Torneo abierto para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.</p>' +
        '<h2 style="font-size:24px">Cronograma</h2><ol class="stack" style="margin:0;padding-left:20px;gap:8px"><li><b>Inscripciones</b> <span class="muted">hasta el día anterior, 11:59 p. m.</span></li><li><b>Check-in</b> <span class="muted">30 minutos antes</span></li><li><b>Llaves</b> <span class="muted">a la hora del evento</span></li><li><b>Final transmitida</b> <span class="muted">en el canal del organizador</span></li></ol>'
      : '<h2 style="font-size:24px">Sobre el sorteo</h2><p class="soft">El ganador se elige al azar al cierre y se anuncia aquí y por correo. Tiene 7 días para reclamar el premio.</p>';
    $('#rules').innerHTML = '<li>' + (isT ? 'Todos los jugadores deben tener su cuenta de juego vinculada en SaveSlot.' : 'Una participación gratis y una de pago por persona.') + '</li><li>' + (isT ? 'Si no haces check-in, pierdes el cupo y se reembolsa la inscripción.' : 'Sin suscripción ni cargos recurrentes.') + '</li><li>El organizador puede cambiar la hora avisando con 24 h.</li>';

    const free = e.free;
    const paidOnly = !free;
    $('#join-form').innerHTML =
      '<h2 style="font-size:22px">' + (isT ? 'Inscribe a tu equipo' : 'Participa') + '</h2>' +
      (joined.includes(e.id) ? '<div class="card" style="border-color:var(--good)"><b class="ok-text">Ya estás inscrito en este evento.</b><a class="link-strong" href="' + ssRuta('perfil.html') + '">Ver en mi perfil</a></div>' : '') +
      (isT ? '<div class="field"><label for="team">Nombre del equipo</label><input class="input" id="team" required maxlength="40" placeholder="Ej. Los Salvados"><span class="error-text" id="team-err" hidden>Escribe el nombre de tu equipo.</span></div>' +
             '<div class="field"><label for="mate">Compañero de equipo</label><input class="input" id="mate" maxlength="40" placeholder="Usuario de SaveSlot"><span class="hint">Le enviaremos una invitación para confirmar.</span></div>' : '') +
      '<fieldset style="border:0;margin:0;padding:0" class="stack"><legend class="label" style="margin-bottom:10px">Cómo participar</legend>' +
      (free ? (function () { const lack = !isT && p.xp < 300; return '<label class="radio-card' + (lack ? ' disabled' : '') + '"><input type="radio" name="modo" value="xp"' + (lack ? ' disabled' : ' checked') + '><span class="grow"><b>Gratis' + (isT ? '' : ' con 300 XP') + '</b><br><span class="small muted">' + (isT ? 'Sin costo de inscripción.' : (lack ? 'Tienes ' + fmt(p.xp) + ' XP: te faltan ' + fmt(300 - p.xp) + '. Gánalos reseñando juegos.' : 'Tienes ' + fmt(p.xp) + ' XP. Te quedarán ' + fmt(p.xp - 300) + '.')) + '</span></span></label>'; })() : '') +
      (isT && free ? '' : '<label class="radio-card disabled"><input type="radio" name="modo" value="pago" disabled><span class="grow"><b>' + (isT ? 'Pagar inscripción' : 'Participación de pago') + '</b><br><span class="small muted">No disponible todavía: el prototipo no tiene pagos conectados. No se te cobrará nada.</span></span><b>[VALOR]</b></label>') +
      (paidOnly ? '<div class="card" style="border-color:#E0A23B"><b>Este torneo solo admite inscripción de pago.</b><span class="small soft">Mientras conectamos los pagos, mira los eventos gratuitos.</span><a class="link-strong small" href="' + ssRuta('eventos.html') + '">Ver eventos gratis</a></div>' : '') +
      '</fieldset>' +
      '<label class="check"><input type="checkbox" id="terms"><span>Acepto el reglamento y la política de reembolsos.</span></label><span class="error-text" id="terms-err" hidden>Debes aceptar el reglamento para continuar.</span>' +
      '<button class="btn btn-primary btn-block" type="submit"' + (paidOnly ? ' disabled' : '') + '>' + (isT ? 'Inscribirme' : 'Participar') + '</button>';

    $('#join-form').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      if (!auth.require('inscribirte en eventos')) return;
      let ok = true;
      const team = $('#team');
      if (team) { const bad = !team.value.trim(); team.setAttribute('aria-invalid', bad); $('#team-err').hidden = !bad; if (bad) ok = false; }
      const terms = $('#terms'); $('#terms-err').hidden = terms.checked; if (!terms.checked) ok = false;
      if (!ok) return;
      const modo = ($('input[name="modo"]:checked') || {}).value;
      if (!modo) { toast('Elige cómo participar'); return; }
      if (modo === 'pago') { API.fail('pagos', 'Pasarela de pagos'); return; }
      await busy($('#join-form button[type="submit"]'), 'Inscribiendo…', 600);
      if (!isT) {
        const pr = profile.get(); if (pr.xp < 300) { toast('No tienes XP suficiente. Completa misiones para ganar más.'); return; }
        pr.xp -= 300; profile.save(pr);
      } else { profile.addXP(100); }
      const j = store.get('joined', []); if (!j.includes(e.id)) j.push(e.id); store.set('joined', j);
      modal({ icon: 'check', title: isT ? '¡Estás inscrito!' : '¡Ya participas!', text: isT ? 'Tu equipo tiene cupo. Recibirás el recordatorio del check-in y lo verás en Mis eventos de tu perfil.' : 'Te avisaremos por correo si ganas. Lo verás en Mis eventos de tu perfil.', actions: [{ label: 'Listo', primary: true, onClick: () => location.reload() }] });
    });
  };

  // ---------- Búsqueda ----------
  P.buscar = async function () {
    const form = $('#filters');
    const ft = $('#filters-toggle');
    if (ft) ft.addEventListener('click', () => { form.classList.toggle('open'); ft.setAttribute('aria-expanded', form.classList.contains('open')); ft.textContent = form.classList.contains('open') ? 'Ocultar filtros' : 'Filtros'; });
    const q = $('#sq'); q.value = params.get('q') || '';
    const gsel = params.get('genero'); if (gsel) { const c = $('input[name="genre"][value="' + CSS.escape(gsel) + '"]'); if (c) c.checked = true; }
    let type = 'Todos', length = '';
    $$('[data-type]').forEach((b) => b.addEventListener('click', () => { type = b.dataset.type; $$('[data-type]').forEach((x) => x.setAttribute('aria-pressed', x === b)); run(); }));
    $$('[data-length]').forEach((b) => b.addEventListener('click', () => { length = length === b.dataset.length ? '' : b.dataset.length; $$('[data-length]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.length === length)); run(); }));
    form.addEventListener('change', run);
    $('#search-form').addEventListener('submit', (e) => { e.preventDefault(); history.replaceState(null, '', '?q=' + encodeURIComponent(q.value)); run(); });
    $('#clear-all').addEventListener('click', () => { form.reset(); q.value = ''; type = 'Todos'; length = ''; $$('[data-type]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.type === 'Todos')); $$('[data-length]').forEach((x) => x.setAttribute('aria-pressed', false)); run(); });
    async function run() {
      const f = {
        q: q.value.trim(), genres: $$('input[name="genre"]:checked').map((i) => i.value), platforms: $$('input[name="plat"]:checked').map((i) => i.value),
        type: type, length: length, from: Number($('#y1').value) || null, to: Number($('#y2').value) || null
      };
      $('#results').innerHTML = '<div class="skeleton" style="height:120px"></div><div class="skeleton" style="height:120px"></div>';
      const list = await API.searchGames(f);
      $('#count').textContent = list.length + (list.length === 1 ? ' juego' : ' juegos') + (f.q ? ' para “' + f.q + '”' : '');
      $('#results').innerHTML = list.length ? list.map(resultRow).join('')
        : '<div class="empty"><b style="color:var(--fg)">No encontramos juegos con esos filtros.</b><span>Revisa la ortografía o quita algún filtro. También puedes preguntarle a MatchPlay.</span><a class="btn btn-secondary btn-sm" href="' + ssRuta('matchplay.html') + '?q=' + encodeURIComponent(f.q || 'Recomiéndame un juego') + '">Preguntar a MatchPlay</a></div>';
    }
    function resultRow(g) {
      return '<a class="card card-link" href="' + ssRuta('detalle-juego.html') + '?id=' + encodeURIComponent(g.id) + '" style="flex-direction:row;align-items:center;gap:18px;flex-wrap:wrap;padding:14px">' +
        '<span class="cover cover-sm" style="--c:' + g.color + ';width:64px;height:86px' + (g.image ? ';background-image:url(' + g.image + ');background-size:cover;background-position:center' : '') + '"></span>' +
        '<span class="grow" style="display:flex;flex-direction:column;gap:4px;flex:1 1 240px"><b style="font-size:19px">' + esc(g.name) + '</b><span class="muted small">' + esc(g.genres.join(', ')) + ' · ' + (g.year || '') + ' · ' + esc(g.platforms.join(', ')) + '</span>' + (g.type ? '<span><span class="badge badge-outline">' + esc(g.type) + '</span></span>' : '') + '</span>' +
        '<span style="display:grid;grid-template-columns:repeat(3,auto);gap:2px 24px;font-size:13px;color:var(--muted);text-align:right"><span>Nota</span><span>Historia</span><span>Dificultad</span><b class="score" style="font-size:16px">' + score10(g.rating) + '</b><b style="font-size:16px;color:var(--fg)">' + (g.hoursMain ? g.hoursMain + ' h' : 'Online') + '</b><b style="font-size:16px;color:var(--fg)">' + (g.difficulty ? g.difficulty + '/10' : '—') + '</b></span></a>';
    }
    run();
  };

  // ---------- Juego random ----------
  P.random = function () {
    const genres = Array.from(new Set(DATA.games.flatMap((g) => g.genres))).sort();
    let genre = params.get('genero') || 'Aventura', idx = 0;
    const box = $('#genres');
    box.innerHTML = genres.map((n) => '<button class="chip accent" data-g="' + esc(n) + '">' + esc(n) + '</button>').join('');
    function render() {
      $$('[data-g]', box).forEach((b) => b.setAttribute('aria-pressed', b.dataset.g === genre));
      const pool = DATA.games.filter((g) => g.genres.includes(genre));
      const g = pool[idx % pool.length];
      $('#pick').innerHTML = cover(g, { style: 'width:220px;max-width:100%;flex:none' }) +
        '<div class="stack grow" style="flex:999 1 340px;gap:12px"><span class="eyebrow">Tu juego random de ' + esc(genre.toLowerCase()) + '</span><h2 style="font-size:34px">' + esc(g.name) + '</h2><p class="soft">' + esc(g.desc) + '</p>' +
        '<div class="row"><span class="badge badge-outline" style="font-size:14px">Historia: ' + (g.hoursMain ? g.hoursMain + ' h' : 'Online') + '</span><span class="badge badge-outline" style="font-size:14px">Dificultad: ' + g.difficulty + '/10</span><span class="badge badge-outline" style="font-size:14px">Nota: ' + score10(g.rating) + '/10</span></div>' +
        '<div class="row"><a class="btn btn-primary" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '">Ver juego</a><button class="btn btn-secondary" id="reroll"' + (pool.length < 2 ? ' disabled title="Solo hay un juego de este género por ahora"' : '') + '>Dame otro</button></div></div>';
      const r = $('#reroll'); if (r) r.addEventListener('click', () => { idx++; render(); });
    }
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-g]'); if (!b) return; genre = b.dataset.g; idx = Math.floor(Math.random() * 3); render(); });
    render();
  };

  // ---------- Página de juego ----------
  P.juego = async function () {
    const id = params.get('id') || 'zelda-totk';
    const g = await API.getGame(id);
    if (!g) { location.replace('' + ssRuta('404.html') + ''); return; }
    document.title = g.short + ' · SaveSlot';
    recent.add(g.id);
    const p = profile.get();
    $('#band').style.setProperty('--band', 'color-mix(in srgb,' + g.color + ' 55%, #12161D)');
    $('#crumb-genre').textContent = g.genres[0] || 'Juegos';
    $('#crumb-genre').href = '' + ssRuta('buscar-juegos.html') + '?genero=' + encodeURIComponent(g.genres[0] || '');
    $('#crumb-title').textContent = g.short;
    $('#g-cover').outerHTML = cover(g, { style: 'width:220px;max-width:100%;flex:none' });
    $('#g-eyebrow').textContent = g.genres.join(' · ') + (g.year ? ' · ' + g.year : '');
    $('#g-title').textContent = g.name;
    $('#g-plats').innerHTML = g.platforms.map((x) => '<span class="badge badge-outline" style="color:#E6EBF1;border-color:rgba(255,255,255,.3)">' + esc(x.toUpperCase()) + '</span>').join('') +
      (g.rating ? '<span style="margin-left:8px"><b class="score">' + score10(g.rating) + '/10</b> <span class="soft small">· nota de la comunidad · ' + fmt(g.votes) + ' calificaciones</span></span>' : '');
    $('#write').href = '' + ssRuta('escribir-resena.html') + '?id=' + g.id;
    $('#ask').href = '' + ssRuta('matchplay.html') + '?q=' + encodeURIComponent('Dame consejos para ' + g.short);
    const wish = $('#wish');
    const inWish = () => profile.get().wishlist.includes(g.id);
    const syncWish = () => { wish.textContent = inWish() ? '✓ En tu lista de deseos' : '+ Lista de deseos'; };
    syncWish();
    wish.addEventListener('click', () => {
      if (!auth.require('guardar juegos en tu lista de deseos')) return;
      const toggle = () => { const pr = profile.get(); pr.wishlist = inWish() ? pr.wishlist.filter((x) => x !== g.id) : pr.wishlist.concat(g.id); profile.save(pr); syncWish(); };
      toggle();
      toast(inWish() ? 'Añadido a tu lista de deseos' : 'Quitado de tu lista de deseos', { action: 'Deshacer', onAction: toggle });
    });
    const mine = diary.all().filter((d) => d.game === g.id);
    $('#facts').innerHTML =
      '<div class="fact"><span class="k">Dificultad</span><span class="v">' + (g.difficulty || '—') + '<span class="muted" style="font-size:18px">/10</span></span>' + (g.difficulty ? skulls(g.difficulty) : '') + '<span class="xs muted">Votada por la comunidad</span><button type="button" class="help-link" id="diff-help">¿Cómo se calcula?</button></div>' +
      '<div class="fact"><span class="k">Historia principal</span><span class="v">' + (g.hoursMain ? g.hoursMain + ' h' : 'Online') + '</span><span class="xs muted">Promedio de jugadores</span></div>' +
      '<div class="fact"><span class="k">Completar 100%</span><span class="v">' + (g.hours100 ? g.hours100 + ' h' : '—') + '</span><span class="xs muted">Promedio de jugadores</span></div>' +
      '<div class="fact" style="border-color:var(--accent)"><span class="k" style="color:var(--accent-text)">Tu progreso</span>' + (auth.user() && mine.length ? '<span class="v">' + mine[0].hours + ' h</span><span class="xs muted">' + esc(mine[0].state) + ' · ' + mine[0].score + '/10</span>' : '<span class="soft small">Vincula tu cuenta o regístralo en tu diario.</span><a class="link-strong small" href="' + ssRuta('escribir-resena.html') + '?id=' + g.id + '">Registrar juego</a>') + '</div>';

    const dh = $('#diff-help');
    if (dh) dh.addEventListener('click', () => modal({ title: 'Dificultad de 1 a 10', text: 'Es el promedio de lo que votan los jugadores al reseñar: 1 es relajado y 10 es brutal. Las horas son el promedio de quienes registraron el juego en su diario.', actions: [{ label: 'Entendido', primary: true }] }));
    // Pestañas
    const reviews = DATA.reviews.filter((r) => r.game === g.id).concat(userReviews().filter((r) => r.game === g.id));
    const guides = DATA.guides.filter((x) => x.game === g.id);
    const ach = DATA.achievements.filter((x) => x.game === g.id);
    const panels = {
      rev: () => reviews.length ? reviews.map((r) => reviewCard(r)).join('') : '<div class="empty"><b style="color:var(--fg)">Todavía no hay reseñas.</b><span>Sé la primera persona en reseñar este juego.</span><a class="btn btn-primary btn-sm" href="' + ssRuta('escribir-resena.html') + '?id=' + g.id + '">Escribir reseña</a></div>',
      gui: () => guides.length ? guides.map((x) => '<div class="card"><div class="row between"><b>' + esc(x.title) + '</b><span class="muted small">' + x.mins + ' min</span></div><span class="ok-text">' + x.useful + '% la marcó como útil</span></div>').join('') : '<div class="empty">Aún no hay guías. <a class="link-strong" href="' + ssRuta('escribir-resena.html') + '?id=' + g.id + '&tipo=guia">Escribir la primera</a></div>',
      cli: () => '<div class="empty"><b style="color:var(--fg)">Los clips llegarán con la API de Twitch.</b><span>Mientras tanto puedes subir el tuyo desde “Escribir reseña › Clip”.</span></div>',
      ach: () => ach.length ? ach.map((a) => '<div class="card" style="flex-direction:row;align-items:center;gap:12px"><span class="avatar" style="border-radius:8px;width:44px;height:44px;background:' + (a.got ? 'var(--accent)' : 'var(--surface-2)') + ';color:' + (a.got ? 'var(--accent-ink)' : 'var(--muted)') + '">' + (a.got ? '✓' : '?') + '</span><span class="grow"><b>' + esc(a.name) + '</b><br><span class="small muted">' + esc(a.desc) + '</span></span><span class="small muted">' + String(a.pct).replace('.', ',') + '% lo tiene</span></div>').join('') : '<div class="empty">No hay logros registrados para este juego.</div>'
    };
    $('#tabs').innerHTML = [['rev', 'Reseñas', reviews.length], ['gui', 'Guías', guides.length], ['cli', 'Clips', 0], ['ach', 'Logros', g.achievements]].map((t, i) =>
      '<button role="tab" aria-selected="' + (i === 0) + '" data-tab="' + t[0] + '">' + t[1] + '<span class="count">' + fmt(t[2]) + '</span></button>').join('');
    function show(k) { $$('#tabs [role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === k)); $('#panel').innerHTML = panels[k](); bindReviewActions($('#panel')); }
    $('#tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) show(b.dataset.tab); });
    show('rev');

    $('#ficha').innerHTML = [['Desarrolla', g.dev || '—'], ['Lanzamiento', g.year || '—'], ['Género', g.genres.join(', ')], ['Tipo', g.type || '—'], ['Plataformas', g.platforms.join(', ')]].map((r) => '<dt class="muted">' + r[0] + '</dt><dd style="margin:0">' + esc(r[1]) + '</dd>').join('');
    const similar = DATA.games.filter((x) => x.id !== g.id && x.genres.some((y) => g.genres.includes(y))).slice(0, 3);
    $('#similar').innerHTML = similar.map((s) => '<a class="row" style="color:var(--fg);flex-wrap:nowrap" href="' + ssRuta('detalle-juego.html') + '?id=' + s.id + '">' + cover(s, { small: true }) + '<span style="line-height:1.3"><b>' + esc(s.short) + '</b><br><span class="small muted">' + esc(s.genres.join(', ')) + '</span></span></a>').join('') || '<span class="muted small">Sin sugerencias por ahora.</span>';
  };

  // ---------- Escribir reseña / guía / clip ----------
  P.resena = function () {
    const g = gameById(params.get('id') || 'zelda-totk');
    if (!g) { location.replace('' + ssRuta('404.html') + ''); return; }
    let kind = params.get('tipo') === 'guia' ? 'guia' : (params.get('tipo') === 'clip' ? 'clip' : 'resena');
    let score = 8, diff = g.difficulty || 5, like = false;
    $('#r-cover').outerHTML = '<span class="cover cover-sm" style="--c:' + g.color + ';width:64px;height:86px' + (g.image ? ';background-image:url(' + g.image + ');background-size:cover;background-position:center' : '') + '" aria-hidden="true"></span>';
    $('#r-title').textContent = g.name;
    $('#cancel').href = '' + ssRuta('detalle-juego.html') + '?id=' + g.id;
    $('#fecha').value = new Date().toISOString().slice(0, 10);
    $('#fecha').max = $('#fecha').value;
    const draftKey = 'draft.' + g.id;
    const editId = params.get('editar');
    const editing = editId ? RV.raw().find((r) => r.id === editId && r.game === g.id) : null;
    const draft = editing ? null : store.get(draftKey, null);
    if (editing) {
      score = editing.score; diff = editing.diff || diff;
      $('#txt').value = editing.text; $('#horas').value = editing.hours || ''; $('#spoiler').checked = !!editing.spoiler;
      if (editing.state) $('#estado').value = editing.state; if (editing.date) $('#fecha').value = editing.date;
      $('#kind').hidden = true; $('#save-draft').hidden = true; $('#cancel').href = '' + ssRuta('historial-resenas.html') + '';
      $('#review-form button[type="submit"]').textContent = 'Guardar cambios';
    }
    if (draft) { $('#txt').value = draft.text || ''; $('#tit').value = draft.title || ''; $('#saved').hidden = false; }

    function scoreButtons(el, cur, cls, label) {
      el.innerHTML = Array.from({ length: 10 }, (_, i) => i + 1).map((n) => '<button type="button" class="btn ' + cls + '" aria-pressed="' + (n === cur) + '" aria-label="' + label + ' ' + n + ' de 10" data-n="' + n + '" style="padding:0;min-height:48px">' + (cls.includes('score') ? n : '') + '</button>').join('');
    }
    function renderScores() {
      scoreButtons($('#scores'), score, 'btn-secondary score-btn', 'Calificación');
      $$('#scores [data-n]').forEach((b) => { if (Number(b.dataset.n) === score) { b.style.background = 'var(--accent)'; b.style.color = 'var(--accent-ink)'; } });
      scoreButtons($('#diffs'), diff, 'btn-secondary', 'Dificultad');
      $$('#diffs [data-n]').forEach((b) => { b.style.minHeight = '32px'; b.style.background = Number(b.dataset.n) <= diff ? 'var(--bad)' : 'var(--line)'; b.style.border = '0'; });
      $('#score-label').textContent = score + '/10'; $('#diff-label').textContent = diff + '/10';
    }
    $('#scores').addEventListener('click', (e) => { const b = e.target.closest('[data-n]'); if (b) { score = Number(b.dataset.n); renderScores(); } });
    $('#diffs').addEventListener('click', (e) => { const b = e.target.closest('[data-n]'); if (b) { diff = Number(b.dataset.n); renderScores(); } });
    $('#like').addEventListener('click', () => { like = !like; $('#like').setAttribute('aria-pressed', like); $('#like').style.borderColor = like ? 'var(--bad)' : 'var(--line)'; });
    renderScores();

    function setKind(k) {
      kind = k;
      $$('#kind [role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.k === k));
      $('#text-block').hidden = k === 'clip'; $('#clip-block').hidden = k !== 'clip';
      $('#txt-label').textContent = k === 'guia' ? 'Tu guía' : 'Tu reseña';
      $('#eyebrow').textContent = k === 'guia' ? 'Nueva guía' : (k === 'clip' ? 'Nuevo clip' : 'Nueva reseña');
    }
    $('#kind').addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) setKind(b.dataset.k); });
    setKind(kind);
    if (editing) $('#eyebrow').textContent = 'Editar reseña';

    const txt = $('#txt');
    const count = () => {
      const n = txt.value.trim().length;
      $('#chars').textContent = (n >= 50 ? '✓ Listo para publicar · ' : 'Faltan ' + (50 - n) + ' caracteres · ') + txt.value.length + ' / 2.000';
      $('#chars').classList.toggle('counter-ok', n >= 50);
      if (n >= 50) { txt.setAttribute('aria-invalid', 'false'); $('#txt-err').hidden = true; }
    };
    txt.addEventListener('input', () => { count(); store.set(draftKey, { text: txt.value, title: $('#tit').value }); $('#saved').hidden = false; });
    count();
    $('#save-draft').addEventListener('click', () => { store.set(draftKey, { text: txt.value, title: $('#tit').value }); toast('Borrador guardado'); });

    $('#review-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      if (kind === 'clip') { API.fail('funcion', 'Subida de clips'); return; }
      const bad = txt.value.trim().length < 50;
      txt.setAttribute('aria-invalid', bad); $('#txt-err').hidden = !bad;
      if (bad) { txt.focus(); return; }
      if (!auth.require('publicar tu ' + (kind === 'guia' ? 'guía' : 'reseña'))) return;
      const fields = { hours: Number($('#horas').value) || 0, score: score, diff: diff, spoiler: $('#spoiler').checked, text: txt.value.trim(), state: $('#estado').value, date: $('#fecha').value };
      if (editing) {
        await busy($('#review-form button[type="submit"]'), 'Guardando…', 400);
        const list = RV.raw(); const i = list.findIndex((r) => r.id === editing.id); Object.assign(list[i], fields, { edited: true }); RV.save(list);
        modal({ icon: 'check', title: 'Reseña actualizada', text: 'Los cambios ya se ven en tu historial y en la página del juego.', actions: [{ label: 'Ver reseña', href: '' + ssRuta('detalle-resena.html') + '?id=' + editing.id, primary: true }, { label: 'Ir al historial', href: '' + ssRuta('historial-resenas.html') + '' }] });
        return;
      }
      await busy($('#review-form button[type="submit"]'), 'Publicando…', 500);
      let newId = null;
      if (kind === 'resena') {
        const list = RV.raw(); newId = 'u' + Date.now();
        list.unshift(Object.assign({ id: newId, game: g.id, useful: 0, likes: 0 }, fields));
        RV.save(list);
      }
      diary.add({ game: g.id, date: $('#fecha').value, state: $('#estado').value, hours: Number($('#horas').value) || 0, score: score, like: like, review: kind === 'resena' });
      store.set(draftKey, null);
      const pr = profile.addXP(50);
      modal({ icon: 'check', title: (kind === 'guia' ? 'Guía' : 'Reseña') + ' publicada', text: 'Ganaste 50 XP. Vas en ' + fmt(pr.xp) + ' / 1.500 XP del nivel ' + pr.level + '.', actions: newId ? [{ label: 'Ver mi reseña', href: '' + ssRuta('detalle-resena.html') + '?id=' + newId, primary: true }, { label: 'Ir al historial', href: '' + ssRuta('historial-resenas.html') + '' }] : [{ label: 'Ver en el juego', href: '' + ssRuta('detalle-juego.html') + '?id=' + g.id, primary: true }, { label: 'Ver mi diario', href: '' + ssRuta('diario.html') + '' }] });
    });
  };

  // ---------- Comunidad ----------
  P.comunidad = function () {
    let tab = 'rev', sort = 'utiles';
    function render() {
      $$('#com-tabs [role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
      $('#com-sort-wrap').hidden = tab === 'gui';
      if (tab !== 'gui') {
        let all = userReviews().concat(DATA.reviews);
        if (tab === 'ami') all = DATA.reviews.filter((r) => friends.rel(r.user) === 'friend');
        all.sort(sort === 'utiles' ? (a, b) => (b.useful || 0) - (a.useful || 0) : (a, b) => String(b.date).localeCompare(String(a.date)));
        $('#com-list').innerHTML = all.map((r) => reviewCard(r, { showGame: true })).join('') || '<div class="empty">Tus amigos todavía no publican reseñas. <a class="link-strong" href="' + ssRuta('amigos.html') + '">Busca amigos</a></div>';
        bindReviewActions($('#com-list'));
      } else {
        $('#com-list').innerHTML = DATA.guides.map((x) => { const g = gameById(x.game); return '<a class="card card-link" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '"><span class="xs muted">' + esc(g.short.toUpperCase()) + ' · ' + x.mins + ' MIN</span><b style="font-size:18px">' + esc(x.title) + '</b><span class="ok-text">' + x.useful + '% la marcó como útil</span></a>'; }).join('');
      }
    }
    $('#com-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
    $('#com-sort').addEventListener('change', (e) => { sort = e.target.value; render(); });
    render();
  };

  // ---------- Logros ----------
  P.logros = function () {
    let plat = 'Todas';
    const rows = [
      { game: 'zelda-totk', got: 86, total: 139, plat: 'Nintendo' }, { game: 'fnaf-into-the-pit', got: 24, total: 24, plat: 'Steam' },
      { game: 'nier-automata', got: 17, total: 50, plat: 'Steam' }, { game: 'rocket-league', got: 16, total: 88, plat: 'Steam' }, { game: 'hollow-knight', got: 41, total: 63, plat: 'Steam' }
    ];
    function render() {
      const list = rows.filter((r) => plat === 'Todas' || r.plat === plat);
      $('#by-game').innerHTML = list.length ? list.map((r) => {
        const g = gameById(r.game); const pct = Math.round(r.got / r.total * 100);
        return '<a class="card card-link" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '" style="flex-direction:row;align-items:center;gap:16px;flex-wrap:wrap">' + cover(g, { small: true }) +
          '<span class="grow" style="flex:1 1 220px;display:flex;flex-direction:column;gap:6px"><b style="font-size:18px">' + esc(g.short) + '</b><span class="meter' + (pct === 100 ? ' good' : '') + '" style="max-width:420px"><i style="width:' + pct + '%"></i></span></span>' +
          '<span>' + (pct === 100 ? '<b class="score">100%</b> · ' : '') + '<b>' + r.got + '</b> <span class="muted">/ ' + r.total + '</span></span><span class="badge badge-outline">' + r.plat.toUpperCase() + '</span></a>';
      }).join('') : '<div class="empty">No tienes logros sincronizados de ' + esc(plat) + '. <a class="link-strong" href="' + ssRuta('editar-perfil.html') + '#cuentas">Vincular cuenta</a></div>';
    }
    $$('[data-plat]').forEach((b) => b.addEventListener('click', () => { plat = b.dataset.plat; $$('[data-plat]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); }));
    $('#rare').innerHTML = DATA.achievements.slice().sort((a, b) => a.pct - b.pct).map((a) => { const g = gameById(a.game); return '<div class="card" style="flex-direction:row;align-items:center;gap:12px"><span class="avatar" style="border-radius:10px;width:48px;height:48px;background:' + (a.got ? 'var(--accent)' : 'var(--surface-2)') + ';color:' + (a.got ? 'var(--accent-ink)' : 'var(--muted)') + '">' + (a.got ? '★' : '?') + '</span><span><b>' + esc(a.name) + '</b><br><span class="xs muted">' + esc(g.short) + ' · ' + String(a.pct).replace('.', ',') + '% lo tiene' + (a.got ? '' : ' · te falta') + '</span></span></div>'; }).join('');
    render();
  };
})(window.SS_PAGES);

/* ===================== pages-cuenta.js ===================== */
/* SaveSlot — cuenta, perfil, diario, MatchPlay, contacto y página de error. */
window.SS_PAGES = window.SS_PAGES || {};
(function (P) {
  const { $, $$, esc, params, store, auth, profile, diary, toast, busy: busyBtn, modal, cover, skulls, gameById, fmt, DATA } = window.SS;
  const API = window.SS_API;
  const MONTHS = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const safeBack = (v) => (v && /^[a-z0-9\-]+\.html(\?[^<>"'\s]*)?$/i.test(v)) ? v : null;
  const emailOk = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  const initialsOf = (n) => n.trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase() || 'S';

  function setError(input, errEl, msg) {
    input.setAttribute('aria-invalid', !!msg);
    errEl.textContent = msg || ''; errEl.hidden = !msg;
    return !msg;
  }

  // ---------- Login ----------
  P.login = function () {
    if (auth.user()) { location.replace(ssVolver(params.get('volver')) || '' + ssRuta('perfil.html') + ''); return; }
    $('#to-signup').href = '' + ssRuta('crear-cuenta.html') + '' + location.search;
    $('#toggle-pw').addEventListener('click', () => { const i = $('#pw'); i.type = i.type === 'password' ? 'text' : 'password'; $('#toggle-pw').setAttribute('aria-label', i.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña'); });
    $$('[data-oauth]').forEach((b) => b.addEventListener('click', () => toast('Entrar con ' + b.dataset.oauth + ' estará disponible pronto. Por ahora usa tu correo.')));
    $('#login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const em = $('#em'), pw = $('#pw');
      const a = setError(em, $('#em-err'), emailOk(em.value) ? '' : (em.value ? 'Al correo le falta algo. Ejemplo: samuel@correo.com' : 'Escribe tu correo.'));
      const b = setError(pw, $('#pw-err'), pw.value.length >= 8 ? '' : 'La contraseña tiene al menos 8 caracteres.');
      if (!a || !b) return;
      const accounts = store.get('accounts', {});
      const acc = accounts[em.value.toLowerCase()];
      if (!acc) { setError(em, $('#em-err'), 'x'); $('#em-err').innerHTML = 'No hay una cuenta con ' + esc(em.value) + '. Revisa si está bien escrito o <a href="' + ssRuta('crear-cuenta.html') + '' + esc(location.search) + '">crea una cuenta</a>.'; return; }
      await busyBtn($('#login-form button[type="submit"]'), 'Entrando…', 400);
      auth.login({ name: acc.name, user: acc.user, initials: initialsOf(acc.name), email: em.value.toLowerCase() });
      location.href = ssVolver(params.get('volver')) || '' + ssRuta('perfil.html') + '';
    });
    $('#demo').addEventListener('click', () => {
      auth.login({ name: 'Samuel D Luq', user: 'samluq', initials: 'SL', email: 'demo@saveslot' });
      location.href = ssVolver(params.get('volver')) || '' + ssRuta('perfil.html') + '';
    });
  };

  // ---------- Registro ----------
  P.registro = function () {
    if (auth.user()) { location.replace('' + ssRuta('perfil.html') + ''); return; }
    $('#to-login').href = '' + ssRuta('iniciar-sesion.html') + '' + location.search;
    $$('[data-oauth]').forEach((b) => b.addEventListener('click', () => toast('Registrarte con ' + b.dataset.oauth + ' estará disponible pronto. Por ahora usa tu correo.')));
    const pw = $('#pw');
    pw.addEventListener('input', () => {
      const v = pw.value; let s = 0;
      if (v.length >= 8) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
      $$('#strength i').forEach((i, k) => { i.style.background = k < s ? (s >= 3 ? 'var(--good)' : '#E0A23B') : 'var(--line)'; });
      $('#strength-text').textContent = ['Escribe al menos 8 caracteres.', 'Débil. Agrega mayúsculas y números.', 'Regular. Agrega un número o símbolo.', 'Buena. Agrega un símbolo para hacerla fuerte.', 'Fuerte.'][s];
    });
    $('#us').addEventListener('input', (e) => { const ok = /^[a-z0-9_.]{3,20}$/i.test(e.target.value); $('#us-msg').className = ok ? 'ok-text' : 'error-text'; $('#us-msg').textContent = e.target.value ? (ok ? 'Disponible' : 'Usa de 3 a 20 letras, números, punto o guion bajo.') : ''; });
    $('#signup-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nm = $('#nm'), em = $('#em'), us = $('#us');
      const ok = [
        setError(nm, $('#nm-err'), nm.value.trim().length >= 2 ? '' : 'Escribe tu nombre.'),
        setError(em, $('#em-err'), emailOk(em.value) ? '' : 'Revisa el correo. Ejemplo: tu@correo.com'),
        setError(us, $('#us-msg'), /^[a-z0-9_.]{3,20}$/i.test(us.value) ? '' : 'Usa de 3 a 20 letras, números, punto o guion bajo.'),
        setError(pw, $('#pw-err'), pw.value.length >= 8 ? '' : 'La contraseña necesita al menos 8 caracteres.'),
        setError($('#terms'), $('#terms-err'), $('#terms').checked ? '' : 'Debes aceptar los términos para crear la cuenta.')
      ].every(Boolean);
      if (!ok) return;
      const accounts = store.get('accounts', {});
      if (accounts[em.value.toLowerCase()]) { setError(em, $('#em-err'), 'Ya existe una cuenta con ese correo. Inicia sesión.'); return; }
      // Prototipo: la contraseña NO se guarda. Una versión real usaría un backend con hash.
      accounts[em.value.toLowerCase()] = { name: nm.value.trim(), user: us.value.trim() };
      store.set('accounts', accounts);
      auth.login({ name: nm.value.trim(), user: us.value.trim(), initials: initialsOf(nm.value), email: em.value.toLowerCase() });
      const pr = profile.get(); pr.since = new Date().toISOString().slice(0, 10); profile.save(pr);
      location.href = '' + ssRuta('editar-perfil.html') + '?nuevo=1';
    });
  };

  // ---------- Perfil ----------
  P.perfil = function () {
    const u = auth.user();
    if (!u) { location.replace('' + ssRuta('iniciar-sesion.html') + '?volver=perfil.html'); return; }
    const p = profile.get();
    const d = diary.all();
    const since = new Date(p.since + 'T12:00:00');
    $('#avatar').textContent = u.initials;
    $('#name').textContent = u.name;
    $('#handle').textContent = '@' + u.user;
    $('#level').textContent = 'NIVEL ' + p.level;
    $('#bio').textContent = p.bio || 'Todavía no escribiste nada sobre ti.';
    $('#since').textContent = since.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    $('#xp-bar').style.width = Math.round(p.xp / 1500 * 100) + '%';
    $('#xp-text').textContent = fmt(p.xp) + ' / 1.500 XP · nivel ' + (p.level + 1) + ' a ' + fmt(1500 - p.xp) + ' XP';
    const xh = $('#xp-help');
    if (xh) xh.addEventListener('click', () => modal({ title: 'Cómo ganar XP', html: '<ul class="soft" style="text-align:left;margin:0;padding-left:20px;display:flex;flex-direction:column;gap:6px;width:100%"><li>Publicar una reseña o guía: +50 XP</li><li>Vincular una cuenta de juego: +100 XP</li><li>Inscribirte en un torneo: +100 XP</li><li>Cada 1.500 XP subes de nivel. Puedes usar 300 XP para entrar gratis a un sorteo.</li></ul>', actions: [{ label: 'Entendido', primary: true }] }));

    const playing = p.playing ? gameById(p.playing) : null;
    $('#activity').innerHTML = playing
      ? '<a class="row card-link" style="flex-wrap:nowrap;background:var(--bg);border-radius:10px;padding:12px;color:var(--fg)" href="' + ssRuta('detalle-juego.html') + '?id=' + playing.id + '">' + cover(playing, { small: true }) + '<span style="line-height:1.35"><span class="xs" style="color:var(--good);font-weight:700">● Jugando ahora</span><br><b>' + esc(playing.short) + '</b><br><span class="xs muted">Dato de Steam (demo)</span></span></a>'
      : '<span class="muted small">No está jugando nada en este momento.</span>';
    $('#status-dot').hidden = !playing;

    $('#connections').innerHTML = Object.keys(p.accounts).map((k) => '<div class="row between" style="background:var(--bg);border-radius:8px;padding:10px 12px"><span><b>' + k + '</b> <span class="muted small">' + esc(p.accounts[k] || '') + '</span></span>' +
      (p.accounts[k] ? '<span class="ok-text xs">Verificada</span>' : '<a class="xs link-strong" href="' + ssRuta('editar-perfil.html') + '#cuentas">Vincular</a>') + '</div>').join('');

    const thisYear = d.filter((x) => x.date.slice(0, 4) === String(new Date().getFullYear()));
    const reviews = SS.reviews.mine();
    $('#stats').innerHTML = [['Juegos', d.length, '' + ssRuta('diario.html') + ''], ['Este año', thisYear.length, '' + ssRuta('diario.html') + ''], ['Reseñas', reviews.length, '' + ssRuta('historial-resenas.html') + ''], ['Logros', '1.912', '' + ssRuta('logros.html') + ''], ['Lista de deseos', p.wishlist.length, '#deseos']]
      .map((s) => '<a href="' + s[2] + '" class="stat card-link" style="text-align:center;border-radius:0;border:0;border-right:1px solid var(--line)"><b>' + s[1] + '</b><span>' + s[0] + '</span></a>').join('');

    $('#favorites').innerHTML = p.favorites.slice(0, 4).map((id) => { const g = gameById(id); return g ? '<a class="game-tile" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '">' + cover(g) + '</a>' : ''; }).join('') +
      Array.from({ length: Math.max(0, 4 - p.favorites.length) }, () => '<a class="empty" href="' + ssRuta('editar-perfil.html') + '#favoritos" style="aspect-ratio:3/4">+ Elegir favorito</a>').join('');
    $('#fav-count').textContent = Math.min(4, p.favorites.length) + ' de 4';

    $('#recent').innerHTML = d.slice(0, 6).map((x) => { const g = gameById(x.game); if (!g) return ''; return '<a class="game-tile" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '">' + cover(g, { noTitle: true }) + '<span class="xs" style="font-weight:700;color:' + (x.state === 'Abandonado' ? 'var(--bad)' : 'var(--good)') + '">' + (x.state === 'Abandonado' ? 'Abandonado' : x.score + '/10') + (x.like ? ' <span style="color:var(--bad)">♥</span>' : '') + '</span></a>'; }).join('') || '<div class="empty">Aún no registras juegos. <a class="link-strong" href="' + ssRuta('buscar-juegos.html') + '">Busca uno</a></div>';

    // Géneros más jugados: horas del diario por género
    const hours = {};
    d.forEach((x) => { const g = gameById(x.game); if (!g) return; g.genres.forEach((gen) => { hours[gen] = (hours[gen] || 0) + (x.hours || 0) / g.genres.length; }); });
    const total = Object.values(hours).reduce((a, b) => a + b, 0) || 1;
    const top = Object.entries(hours).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const max = top.length ? top[0][1] : 1;
    $('#genres').innerHTML = top.map(([gen, h]) => '<span>' + esc(gen) + '</span><span class="meter" style="height:10px"><i style="width:' + Math.round(h / max * 100) + '%"></i></span><b style="text-align:right">' + Math.round(h / total * 100) + '%</b>').join('') || '<span class="muted small">Registra juegos para ver tus géneros.</span>';
    $('#fav-genres').textContent = 'Favoritos: ' + p.genres.join(', ');

    // Distribución de calificaciones (1–10)
    const counts = Array(10).fill(0); d.forEach((x) => { if (x.score) counts[x.score - 1]++; });
    const cmax = Math.max(1, ...counts); const n = d.filter((x) => x.score).length;
    const avg = n ? (d.reduce((a, x) => a + (x.score || 0), 0) / n) : 0;
    $('#hist').innerHTML = counts.map((c, i) => '<span title="' + (i + 1) + '/10: ' + c + ' juegos" style="height:' + Math.round(c / cmax * 80) + 'px;background:var(--good);border-radius:3px 3px 0 0"></span>').join('');
    $('#hist').setAttribute('aria-label', 'Distribución de tus calificaciones. Promedio ' + avg.toFixed(1));
    $('#avg').textContent = avg.toFixed(1).replace('.', ',') + ' · ' + n + ' juegos';

    $('#wishlist').innerHTML = p.wishlist.map((id) => { const g = gameById(id); return g ? '<div class="card" style="flex-direction:row;align-items:center;gap:12px">' + cover(g, { small: true }) + '<a class="grow" style="color:var(--fg)" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '"><b>' + esc(g.short) + '</b><br><span class="xs muted">' + esc(g.platforms.join(', ')) + '</span></a><button class="btn btn-ghost btn-sm" data-rm="' + g.id + '" aria-label="Quitar ' + esc(g.short) + ' de la lista">Quitar</button></div>' : ''; }).join('') || '<div class="empty">Tu lista de deseos está vacía. Agrega juegos desde su página.</div>';
    $('#wishlist').addEventListener('click', (e) => {
      const b = e.target.closest('[data-rm]'); if (!b) return;
      const id = b.dataset.rm, card = b.closest('.card'), pr = profile.get(), pos = pr.wishlist.indexOf(id);
      pr.wishlist = pr.wishlist.filter((x) => x !== id); profile.save(pr); card.hidden = true;
      toast('Quitado de tu lista de deseos', { action: 'Deshacer', onAction: () => { const q = profile.get(); q.wishlist.splice(pos, 0, id); profile.save(q); card.hidden = false; } });
    });

    const joined = store.get('joined', []);
    function renderEvents() {
      const j = store.get('joined', []);
      $('#my-events').innerHTML = j.length ? j.map((id) => { const ev = DATA.events.find((x) => x.id === id); return ev ? '<div class="card" style="gap:6px"><a href="' + ssRuta('detalle-evento.html') + '?id=' + ev.id + '" style="color:var(--fg)"><b>' + esc(ev.title) + '</b></a><span class="muted small">' + esc(ev.when) + '</span><button type="button" class="help-link" data-leave="' + ev.id + '">Cancelar inscripción</button></div>' : ''; }).join('') : '<span class="muted small">No estás inscrito en eventos. <a class="link-strong" href="' + ssRuta('eventos.html') + '">Ver eventos</a></span>';
    }
    renderEvents();
    $('#my-events').addEventListener('click', (e) => {
      const b = e.target.closest('[data-leave]'); if (!b) return;
      const id = b.dataset.leave; store.set('joined', store.get('joined', []).filter((x) => x !== id)); renderEvents();
      toast('Inscripción cancelada', { action: 'Deshacer', onAction: () => { const j = store.get('joined', []); j.push(id); store.set('joined', j); renderEvents(); } });
    });
    $('#share').addEventListener('click', () => { const url = location.href.split('?')[0]; if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast('Enlace del perfil copiado'), () => toast(url)); else toast(url); });
  };

  // ---------- Editar perfil ----------
  P.editar = function () {
    const u = auth.user();
    if (!u) { location.replace('' + ssRuta('iniciar-sesion.html') + '?volver=editar-perfil.html'); return; }
    let p = profile.get();
    if (params.get('nuevo')) $('#welcome').hidden = false;
    $('#nm').value = u.name; $('#us').value = u.user; $('#bio').value = p.bio || '';
    $('#avatar').textContent = u.initials;

    function renderFavs() {
      $('#favs').innerHTML = p.favorites.map((id) => { const g = gameById(id); return '<div style="position:relative">' + cover(g) + '<button type="button" class="btn btn-secondary btn-sm" data-unfav="' + id + '" aria-label="Quitar ' + esc(g.short) + '" style="position:absolute;top:6px;right:6px;min-height:36px;width:36px;padding:0;border-radius:50%;background:rgba(0,0,0,.65)">✕</button></div>'; }).join('') +
        Array.from({ length: 4 - p.favorites.length }, () => '<div class="empty" style="aspect-ratio:3/4">Espacio libre</div>').join('');
      $('#fav-hint').textContent = p.favorites.length >= 4 ? 'Ya tienes 4 favoritos. Quita uno para elegir otro.' : 'Puedes elegir ' + (4 - p.favorites.length) + ' más (máximo 4).';
      $('#fav-add').disabled = p.favorites.length >= 4;
      $('#fav-select').disabled = p.favorites.length >= 4;
      $('#fav-select').innerHTML = '<option value="">Elige un juego</option>' + DATA.games.filter((g) => !p.favorites.includes(g.id)).map((g) => '<option value="' + g.id + '">' + esc(g.short) + '</option>').join('');
    }
    $('#favs').addEventListener('click', (e) => { const b = e.target.closest('[data-unfav]'); if (!b) return; p.favorites = p.favorites.filter((x) => x !== b.dataset.unfav); renderFavs(); });
    $('#fav-add').addEventListener('click', () => { const v = $('#fav-select').value; if (!v) { toast('Elige un juego de la lista'); return; } if (p.favorites.length >= 4) return; p.favorites.push(v); renderFavs(); });
    renderFavs();

    const genres = Array.from(new Set(DATA.games.flatMap((g) => g.genres))).sort();
    $('#genre-chips').innerHTML = genres.map((g) => '<button type="button" class="chip accent" data-genre="' + esc(g) + '" aria-pressed="' + p.genres.includes(g) + '">' + esc(g) + '</button>').join('');
    $('#genre-chips').addEventListener('click', (e) => { const b = e.target.closest('[data-genre]'); if (!b) return; const g = b.dataset.genre; p.genres = p.genres.includes(g) ? p.genres.filter((x) => x !== g) : p.genres.concat(g); b.setAttribute('aria-pressed', p.genres.includes(g)); });

    $('#playing').innerHTML = '<option value="">Nada por ahora</option>' + DATA.games.map((g) => '<option value="' + g.id + '"' + (p.playing === g.id ? ' selected' : '') + '>' + esc(g.short) + '</option>').join('');

    const NOTES = { Steam: 'Se conecta con tu cuenta de Steam', Xbox: 'Se conecta mediante OpenXBL (servicio de terceros)', PlayStation: 'No tiene conexión pública: registra tus juegos a mano', Nintendo: 'No tiene conexión pública: registra tus juegos a mano' };
    const NOAPI = (window.SS_CONFIG && SS_CONFIG.PLATFORMS_WITHOUT_API) || [];
    function renderAccounts() {
      $('#accounts').innerHTML = Object.keys(p.accounts).map((k) => '<div class="row" style="background:var(--surface-2);border-radius:10px;padding:14px;' + (p.accounts[k] ? '' : 'border:1px dashed var(--line)') + '"><span class="grow"><b>' + k + '</b><br><span class="xs muted">' + NOTES[k] + '</span></span>' +
        (p.accounts[k] ? '<span class="ok-text small">Vinculada · ' + esc(p.accounts[k]) + '</span><button type="button" class="btn btn-secondary btn-sm" data-unlink="' + k + '">Desvincular</button>'
                       : (NOAPI.includes(k) ? '<a class="btn btn-secondary btn-sm" href="' + ssRuta('buscar-juegos.html') + '" title="' + k + ' no ofrece API pública: registra tus juegos en el diario">Registrar a mano</a>' : '<button type="button" class="btn btn-primary btn-sm" data-link="' + k + '">Vincular</button>')) + '</div>').join('');
    }
    $('#accounts').addEventListener('click', async (e) => {
      const l = e.target.closest('[data-link]'), ul = e.target.closest('[data-unlink]');
      if (ul) { const k = ul.dataset.unlink, prev = p.accounts[k]; p.accounts[k] = null; renderAccounts(); toast(k + ' desvinculada. Guarda los cambios para confirmar.', { action: 'Deshacer', onAction: () => { p.accounts[k] = prev; renderAccounts(); } }); return; }
      if (!l) return;
      l.disabled = true; l.textContent = 'Conectando…';
      try { await API.linkPlatform(l.dataset.link); p.accounts[l.dataset.link] = u.user + '_' + l.dataset.link.toLowerCase(); renderAccounts(); toast(l.dataset.link + ' vinculada (demo) · +100 XP'); profile.addXP(100); p.xp = profile.get().xp; p.level = profile.get().level; }
      catch (err) { /* api.js ya redirige a 404.html */ }
    });
    renderAccounts();

    $('#edit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const nm = $('#nm');
      if (!setError(nm, $('#nm-err'), nm.value.trim().length >= 2 ? '' : 'Escribe tu nombre visible.')) return;
      p.bio = $('#bio').value.trim().slice(0, 190); p.playing = $('#playing').value || null;
      profile.save(p);
      auth.login(Object.assign({}, u, { name: nm.value.trim(), initials: initialsOf(nm.value) }));
      toast('Cambios guardados');
      setTimeout(() => { location.href = '' + ssRuta('perfil.html') + ''; }, 600);
    });
  };

  // ---------- Diario ----------
  P.diario = function () {
    if (!auth.user()) { location.replace('' + ssRuta('iniciar-sesion.html') + '?volver=diario.html'); return; }
    let state = 'Todos';
    const years = Array.from(new Set(diary.all().map((x) => x.date.slice(0, 4)))).sort().reverse();
    $('#yr').innerHTML = years.map((y) => '<option>' + y + '</option>').join('');
    const COL = { Terminado: 'var(--good)', Rejugado: 'var(--accent-text)', Abandonado: 'var(--bad)', 'En progreso': 'var(--muted)' };
    function render() {
      const y = $('#yr').value;
      const all = diary.all().filter((x) => x.date.slice(0, 4) === y);
      const list = all.filter((x) => state === 'Todos' || (state === 'Con reseña' ? x.review : x.state === state));
      const scored = all.filter((x) => x.score);
      $('#summary').innerHTML = [['Juegos registrados en ' + y, all.length], ['Horas jugadas', fmt(all.reduce((a, x) => a + (x.hours || 0), 0)) + ' h'], ['Terminados', all.filter((x) => x.state === 'Terminado').length], ['Calificación promedio', scored.length ? (scored.reduce((a, x) => a + x.score, 0) / scored.length).toFixed(1).replace('.', ',') : '—']]
        .map((s) => '<div class="stat"><b>' + s[1] + '</b><span>' + s[0] + '</span></div>').join('');
      let prevMonth = '';
      $('#rows').innerHTML = list.map((x) => {
        const g = gameById(x.game); if (!g) return '';
        const m = MONTHS[Number(x.date.slice(5, 7)) - 1]; const show = m !== prevMonth; prevMonth = m;
        return '<tr><td style="width:90px">' + (show ? '<span style="display:inline-flex;flex-direction:column;align-items:center;background:var(--bg);border-radius:8px;padding:6px 10px;line-height:1.1"><b style="font-size:13px;letter-spacing:.06em">' + m + '</b><span class="xs muted">' + y + '</span></span>' : '') + '</td>' +
          '<td style="font-size:22px;font-weight:800;color:var(--muted);width:60px">' + x.date.slice(8, 10) + '</td>' +
          '<td><a class="row" style="flex-wrap:nowrap;color:var(--fg)" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '">' + cover(g, { small: true }) + '<span style="line-height:1.3"><b>' + esc(g.short) + '</b><br><span class="xs muted">' + esc(g.platforms[0]) + '</span></span></a></td>' +
          '<td><span style="font-size:13px;font-weight:700;border:1px solid ' + COL[x.state] + ';color:' + COL[x.state] + ';border-radius:999px;padding:3px 10px;white-space:nowrap">' + esc(x.state) + '</span></td>' +
          '<td class="soft">' + (x.hours || 0) + ' h</td><td class="score">' + (x.score ? x.score + '/10' : '—') + '</td>' +
          '<td style="text-align:center;font-size:18px;color:' + (x.like ? 'var(--bad)' : 'var(--line)') + '" aria-label="' + (x.like ? 'Te gustó' : 'Sin me gusta') + '">♥</td>' +
          '<td style="text-align:center">' + (x.review ? '<a href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '" class="btn btn-secondary btn-sm" aria-label="Leer reseña" style="min-height:36px;padding:6px 10px">Leer</a>' : '') + '</td></tr>';
      }).join('') || '<tr><td colspan="8"><div class="empty">No hay registros con este filtro.</div></td></tr>';
    }
    $$('[data-state]').forEach((b) => b.addEventListener('click', () => { state = b.dataset.state; $$('[data-state]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); }));
    $('#yr').addEventListener('change', render);
    render();
  };

  // ---------- MatchPlay ----------
  P.matchplay = function () {
    let chats = store.get('chats', [
      { id: 'c1', when: Date.now() - 2 * 3600e3, title: 'Juegos parecidos a NieR', msgs: [{ r: 'u', text: 'Terminé NieR: Automata y quiero algo parecido. Tengo unas 30 horas este mes.' }, { r: 'b', text: 'Si te gustó NieR: Automata, prueba Hades (≈22 h), Hollow Knight (≈27 h) o Ghost of Tsushima (≈25 h). Si eliges uno, empieza por Hades.' }] },
      { id: 'c2', when: Date.now() - 3 * 86400e3, title: 'Orden de regiones en TOTK', msgs: [{ r: 'u', text: '¿En qué orden hago las regiones de Zelda: TOTK?' }, { r: 'b', text: 'La comunidad recomienda: Rito, Zora, Goron y Gerudo. Antes de Gerudo conviene tener al menos 8 corazones.' }] },
      { id: 'c3', when: Date.now() - 12 * 86400e3, title: 'Terror corto para el finde', msgs: [{ r: 'u', text: 'Un juego de terror corto para el fin de semana.' }, { r: 'b', text: 'Inside (≈3 h) o FNAF: Into the Pit (≈6 h).' }] }
    ]);
    let active = null, busy = false;
    const save = () => store.set('chats', chats);
    const u = auth.user();
    $('#greet').textContent = 'Hola' + (u ? ', ' + u.name.split(' ')[0] : '') + '. ¿En qué te ayudo hoy?';
    $('#mode').textContent = API.usingDemo || !window.SS_CONFIG.AI_ENDPOINT ? 'Modo demo: respuestas de ejemplo hasta conectar la IA.' : 'Conectado a la IA.';

    function group(t) { const d = (Date.now() - t) / 86400e3; return d < 1 ? 'Hoy' : (d < 7 ? 'Últimos 7 días' : 'Últimos 30 días'); }
    function renderList() {
      const q = $('#chat-search').value.toLowerCase();
      const groups = {};
      chats.filter((c) => !q || c.title.toLowerCase().includes(q)).sort((a, b) => b.when - a.when).forEach((c) => { (groups[group(c.when)] = groups[group(c.when)] || []).push(c); });
      $('#chat-list').innerHTML = ['Hoy', 'Últimos 7 días', 'Últimos 30 días'].filter((g) => groups[g]).map((g) => '<span class="xs muted" style="font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:10px 6px 2px">' + g + '</span>' +
        groups[g].map((c) => '<div class="row" style="flex-wrap:nowrap;gap:2px"><button class="chat-item" data-open="' + c.id + '" aria-current="' + (c.id === active) + '">' + esc(c.title) + '</button><button class="chat-del" data-del="' + c.id + '" aria-label="Borrar chat ' + esc(c.title) + '">✕</button></div>').join('')).join('') || '<span class="muted small" style="padding:8px">Sin chats.</span>';
    }
    function renderChat() {
      const c = chats.find((x) => x.id === active);
      $('#empty-state').hidden = !!c; $('#thread').hidden = !c;
      if (!c) return;
      $('#thread').innerHTML = c.msgs.map((m) => m.r === 'u'
        ? '<div class="msg-row user"><div class="bubble user">' + esc(m.text) + '</div></div>'
        : '<div class="msg-row"><span class="ai-badge">IA</span><div class="bubble bot' + (m.error ? ' err' : '') + '">' + esc(m.text) + (m.error ? ' <a href="' + ssRuta('404.html') + '?tipo=api&servicio=MatchPlay%20(IA)&volver=matchplay.html">Ver detalles</a>'
          : '<span class="src">Fuente: reseñas y guías de la comunidad de SaveSlot. Verifica los datos importantes.</span><span class="fb"><button type="button" data-fb="up" aria-pressed="' + (m.fb === 'up') + '">Útil</button><button type="button" data-fb="down" aria-pressed="' + (m.fb === 'down') + '">No me sirve</button></span>') + '</div></div>').join('') +
        (busy ? '<div class="msg-row"><span class="ai-badge">IA</span><div class="bubble bot muted">Buscando en reseñas y guías…</div></div>' : '');
      $('#thread').lastElementChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
    async function ask(text) {
      text = text.trim(); if (!text || busy) return;
      let c = chats.find((x) => x.id === active);
      if (!c) { c = { id: 'n' + Date.now(), when: Date.now(), title: text.length > 34 ? text.slice(0, 34) + '…' : text, msgs: [] }; chats.unshift(c); active = c.id; }
      c.msgs.push({ r: 'u', text: text }); c.when = Date.now(); busy = true; save(); renderList(); renderChat();
      $('#msg').value = '';
      try { const reply = await API.askAI(c.msgs); c.msgs.push({ r: 'b', text: reply }); }
      catch (e) { c.msgs.push({ r: 'b', text: 'No pude responder ahora: el servicio de IA no está disponible.', error: true }); }
      busy = false; save(); renderChat();
    }
    $('#trending').innerHTML = DATA.trending.map((t, i) => '<button class="card card-link" data-t="' + i + '" style="text-align:left;cursor:pointer"><span class="xs" style="font-weight:700;color:var(--accent-text);text-transform:uppercase">' + esc(t.tag) + '</span><b style="font-size:16px;line-height:1.3">' + esc(t.q) + '</b><span class="xs muted">' + esc(t.meta) + '</span></button>').join('');
    $('#trending').addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (b) ask(DATA.trending[b.dataset.t].q); });
    $('#chat-list').addEventListener('click', (e) => {
      const o = e.target.closest('[data-open]'), d = e.target.closest('[data-del]');
      if (o) { active = o.dataset.open; renderList(); renderChat(); }
      if (d) {
        const idx = chats.findIndex((x) => x.id === d.dataset.del), removed = chats[idx], wasActive = active === removed.id;
        chats = chats.filter((x) => x.id !== removed.id); if (wasActive) active = null; save(); renderList(); renderChat();
        toast('Chat borrado', { action: 'Deshacer', onAction: () => { chats.splice(idx, 0, removed); if (wasActive) active = removed.id; save(); renderList(); renderChat(); } });
      }
    });
    $('#thread').addEventListener('click', (e) => {
      const b = e.target.closest('[data-fb]'); if (!b) return;
      const c = chats.find((x) => x.id === active); const bots = c.msgs.filter((m) => m.r === 'b');
      const rows = $$('#thread .bubble.bot'); const i = rows.indexOf(b.closest('.bubble'));
      if (bots[i]) { bots[i].fb = b.dataset.fb; save(); renderChat(); toast(b.dataset.fb === 'up' ? 'Gracias, nos ayuda a mejorar' : 'Gracias. Prueba a darme más detalles'); }
    });
    // Plantillas de preguntas para evitar prompts vagos (H5 en IA)
    $$('[data-prompt]').forEach((b) => b.addEventListener('click', () => { const i = $('#msg'); i.value = b.dataset.prompt; i.focus(); i.setSelectionRange(i.value.length, i.value.length); }));
    $('#new-chat').addEventListener('click', () => { active = null; renderList(); renderChat(); $('#msg').focus(); });
    $('#chat-search').addEventListener('input', renderList);
    $('#composer').addEventListener('submit', (e) => { e.preventDefault(); ask($('#msg').value); });
    // Móvil: la biblioteca de chats se abre como panel lateral
    const side = $('.chat-side'), tg = $('#chats-toggle');
    function setDrawer(open) {
      side.classList.toggle('open', open); tg.setAttribute('aria-expanded', open);
      let scrim = $('.chat-scrim');
      if (open && !scrim) { scrim = document.createElement('div'); scrim.className = 'chat-scrim'; scrim.addEventListener('click', () => setDrawer(false)); document.body.appendChild(scrim); }
      if (!open && scrim) scrim.remove();
    }
    tg.addEventListener('click', () => setDrawer(!side.classList.contains('open')));
    side.addEventListener('click', (e) => { if (e.target.closest('[data-open]') || e.target.closest('#new-chat')) setDrawer(false); });
    renderList(); renderChat();
    if (params.get('q')) ask(params.get('q'));
  };

  // ---------- Contacto ----------
  P.contacto = function () {
    $('#contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = [
        setError($('#n'), $('#n-err'), $('#n').value.trim() ? '' : 'Escribe tu nombre.'),
        setError($('#e'), $('#e-err'), emailOk($('#e').value) ? '' : 'Revisa el correo. Ejemplo: tu@correo.com'),
        setError($('#m'), $('#m-err'), $('#m').value.trim().length >= 10 ? '' : 'Cuéntanos un poco más (mínimo 10 caracteres).')
      ].every(Boolean);
      if (!ok) return;
      const box = store.get('outbox', []); box.push({ name: $('#n').value, email: $('#e').value, topic: $('#t').value, msg: $('#m').value, at: new Date().toISOString() }); store.set('outbox', box);
      e.target.reset();
      modal({ icon: 'check', title: 'Mensaje guardado', text: 'El prototipo todavía no tiene servidor de correo, así que tu mensaje quedó guardado en este navegador. Si es urgente, escríbenos al correo de contacto.', actions: [{ label: 'Volver al inicio', href: '' + ssRuta('index.html') + '', primary: true }, { label: 'Cerrar' }] });
    });
  };

  // ---------- Página de error (APIs y limitantes) ----------
  P.error = function () {
    const CFG = window.SS_CONFIG || {};
    const tipo = params.get('tipo') || (navigator.onLine ? 'api' : 'sin-conexion');
    const svc = (params.get('servicio') || '').slice(0, 60);
    const S = svc || 'Un servicio externo';
    const T = {
      api: { code: 'API-500', title: S + ' no está respondiendo', text: 'Intentamos traer la información pero el servicio externo no respondió como esperábamos. Suele ser algo temporal.', tips: ['Vuelve a intentarlo en unos segundos.', 'Si sigue fallando, revisa el estado de los servicios abajo.', 'Mientras tanto puedes usar la búsqueda con los datos guardados.'], retry: true },
      limite: { code: 'API-429', title: 'Llegamos al límite de consultas', text: 'Las APIs gratuitas que usa SaveSlot tienen un cupo de consultas por minuto, hora o día. ' + (svc ? svc + ' nos pidió esperar' : 'Nos pidieron esperar') + ' antes de seguir.', tips: ['Espera un momento: el botón “Reintentar” se activa solo.', 'Las páginas que ya visitaste se cargan más rápido.', 'Si pasa seguido, avísanos desde Contáctanos.'], retry: true, wait: 60 },
      tiempo: { code: 'API-408', title: 'La respuesta tardó demasiado', text: S + ' tardó más de ' + Math.round((CFG.TIMEOUT_MS || 8000) / 1000) + ' segundos en responder, así que dejamos de esperar.', tips: ['Revisa tu conexión.', 'Vuelve a intentarlo.'], retry: true },
      credenciales: { code: 'API-401', title: 'No pudimos conectarnos con ' + S, text: 'La clave de acceso de SaveSlot para este servicio no es válida o venció (por ejemplo, la clave de desarrollo de Riot expira cada 24 horas).', tips: ['No es un problema de tu cuenta.', 'El equipo debe renovar la clave del servicio.'], retry: false },
      mantenimiento: { code: 'API-503', title: S + ' está en mantenimiento', text: 'El servicio avisó que está en mantenimiento. Volverá a funcionar cuando termine.', tips: ['Intenta de nuevo más tarde.'], retry: true },
      'sin-conexion': { code: 'NET-0', title: 'No hay conexión a internet', text: 'Tu dispositivo está sin conexión, así que no podemos cargar información nueva.', tips: ['Revisa el wifi o los datos móviles.', 'Cuando vuelva la conexión, pulsa “Reintentar”.'], retry: true },
      plataforma: { code: 'LIM-PLAT', title: svc ? svc + ' todavía no se puede vincular' : 'Esta plataforma no se puede vincular', text: (svc || 'Esta plataforma') + ' no ofrece una API pública para que webs como SaveSlot lean tus juegos, logros o actividad. No vamos a usar métodos no oficiales que pidan tus credenciales.', tips: ['Registra tus juegos a mano en tu diario.', 'Vincula Steam o Xbox, que sí están disponibles.', 'Te avisaremos si la plataforma abre su API.'], retry: false, cta: ['Registrar en mi diario', '' + ssRuta('buscar-juegos.html') + ''] },
      pagos: { code: 'LIM-PAY', title: 'Los pagos aún no están disponibles', text: 'SaveSlot es un prototipo académico y no tiene una pasarela de pagos conectada. Ningún cobro se realizó.', tips: ['Usa la opción gratis con XP cuando el evento la tenga.', 'Revisa los eventos gratuitos en la pestaña “Gratis”.'], retry: false, cta: ['Ver eventos gratis', '' + ssRuta('eventos.html') + ''] },
      funcion: { code: 'LIM-FEAT', title: S + ' aún no está disponible', text: 'Esta función depende de una API que el equipo todavía está solicitando. Por ahora no la puedes usar.', tips: ['Usa la alternativa disponible (correo y contraseña, o subir texto).', 'Revisa el estado de los servicios abajo.'], retry: false },
      demo: { code: 'DEMO', title: 'Estás viendo el prototipo de SaveSlot', text: 'Mientras conectamos las APIs (catálogo de juegos, cuentas e IA), la web usa datos de ejemplo y guarda tu actividad solo en este navegador.', tips: ['Puedes crear una cuenta, reseñar, llenar tu diario y chatear con MatchPlay en modo demo.', 'Borrar los datos del navegador borra tu actividad.'], retry: false, cta: ['Explorar juegos', '' + ssRuta('buscar-juegos.html') + ''] },
      estado: { code: 'STATUS', title: 'Estado de los servicios', text: 'Qué partes de SaveSlot están conectadas a servicios reales y cuáles funcionan en modo demo.', tips: [], retry: false }
    };
    const t = T[tipo] || T.api;
    document.title = t.title + ' · SaveSlot';
    $('#code').textContent = 'Código ' + t.code;
    $('#title').textContent = t.title;
    $('#text').textContent = t.text;
    $('#tips').innerHTML = t.tips.map((x) => '<li>' + esc(x) + '</li>').join('');
    $('#tips-wrap').hidden = !t.tips.length;
    const detalle = params.get('detalle');
    if (detalle) { $('#detail').hidden = false; $('#detail').textContent = ' · Detalle técnico: ' + detalle; }
    const back = ssVolver(params.get('volver'));
    const retry = $('#retry');
    if (t.retry && back) {
      retry.hidden = false; retry.href = back.replace(/([?&])simular=[^&]*&?/, '$1').replace(/[?&]$/, '');
      if (t.wait) {
        let s = t.wait; retry.setAttribute('aria-disabled', 'true'); retry.style.pointerEvents = 'none'; retry.style.opacity = '.5';
        const tick = () => { retry.textContent = 'Reintentar en ' + s + ' s'; if (s-- <= 0) { retry.textContent = 'Reintentar'; retry.removeAttribute('aria-disabled'); retry.style.pointerEvents = ''; retry.style.opacity = ''; return; } setTimeout(tick, 1000); };
        tick();
      }
    }
    if (t.cta) { const c = $('#cta'); c.hidden = false; c.textContent = t.cta[0]; c.href = t.cta[1]; }
    const st = (label, kind) => '<span style="font-size:13px;font-weight:700;border-radius:999px;padding:3px 10px;white-space:nowrap;border:1px solid ' + ({ ok: 'var(--good)', demo: 'var(--ai)', pend: '#E0A23B', no: 'var(--bad)' }[kind]) + ';color:' + ({ ok: 'var(--good)', demo: 'var(--ai)', pend: '#E0A23B', no: 'var(--bad)' }[kind]) + '">' + label + '</span>';
    const rows = [
      ['Catálogo de juegos', 'RAWG / IGDB', CFG.RAWG_KEY ? st('Conectado', 'ok') : st('Modo demo', 'demo')],
      ['MatchPlay (IA)', 'Claude / Gemini', CFG.AI_ENDPOINT ? st('Conectado', 'ok') : st('Modo demo', 'demo')],
      ['Cuentas: Steam', 'Steam Web API + OpenID', st('Pendiente de clave', 'pend')],
      ['Cuentas: Xbox', 'OpenXBL (tercero)', st('Pendiente de clave', 'pend')],
      ['Cuentas: PlayStation', '—', st('Sin API pública', 'no')],
      ['Cuentas: Nintendo', '—', st('Sin API pública', 'no')],
      ['Inicio de sesión con Google / Discord', 'OAuth2', st('Pendiente', 'pend')],
      ['Clips y transmisiones', 'Twitch API', st('Pendiente de clave', 'pend')],
      ['Pagos de eventos', 'Pasarela de pagos', st('No disponible', 'no')],
      ['Cuentas y actividad del usuario', 'Navegador (local)', st('Modo demo', 'demo')]
    ];
    $('#status').innerHTML = rows.map((r) => '<tr' + (svc && (r[0].includes(svc) || r[1].includes(svc)) ? ' style="background:#202834"' : '') + '><td><b>' + esc(r[0]) + '</b></td><td class="muted">' + esc(r[1]) + '</td><td>' + r[2] + '</td></tr>').join('');
  };
})(window.SS_PAGES);

/* ===================== pages-social.js ===================== */
/* SaveSlot — amigos, perfil público, historial de reseñas y detalle de reseña. */
window.SS_PAGES = window.SS_PAGES || {};
(function (P) {
  const { $, $$, esc, params, store, auth, profile, diary, reviews: RV, friends, avatar, STATUS_TXT, userHref, toast, busy, modal, cover, gameById, fmt, DATA } = window.SS;
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const dateTxt = (d) => { if (!d) return ''; const [y, m, dd] = d.split('-'); return Number(dd) + ' ' + MONTHS[Number(m) - 1] + ' ' + y; };
  const me = () => auth.user() || { name: 'Invitado', user: 'invitado', initials: 'TÚ' };
  const myScores = () => { const m = {}; diary.all().forEach((x) => { if (x.score && !(x.game in m)) m[x.game] = x.score; }); return m; };
  const common = (f) => { const mine = myScores(); return Object.keys(f.played || {}).filter((id) => id in mine); };
  const bannerFor = (ids) => { const c = ids.map(gameById).filter(Boolean).map((g) => g.color); while (c.length < 3) c.push('#1F4A8A'); return 'linear-gradient(115deg,' + c[0] + ' 0%,' + c[1] + ' 45%,' + c[2] + ' 100%)'; };
  const statusLine = (f) => '<span class="status st-' + f.status + '">' + esc(STATUS_TXT(f)) + '</span>';

  // ---------- Perfil propio: amigos y banner ----------
  const basePerfil = P.perfil;
  P.perfil = function () {
    basePerfil();
    if (!auth.user()) return;
    const p = profile.get();
    $('#banner').style.background = bannerFor(p.favorites);
    const list = friends.list('friend').sort((a, b) => ['playing', 'online', 'offline'].indexOf(a.status) - ['playing', 'online', 'offline'].indexOf(b.status));
    $('#fr-count').textContent = '· ' + list.length;
    $('#friends-mini').innerHTML = list.slice(0, 8).map((f) => '<a href="' + userHref(f.user) + '" title="' + esc(f.name + ' · ' + STATUS_TXT(f)) + '">' + avatar(f, 44) + '</a>').join('') || '<span class="muted small">Aún no tienes amigos. <a class="link-strong" href="' + ssRuta('amigos.html') + '#sugerencias">Ver sugerencias</a></span>';
    const req = friends.list('in');
    if (req.length) { const r = $('#fr-req'); r.hidden = false; r.innerHTML = avatar(req[0], 32) + '<span class="small"><b>' + req.length + ' solicitudes</b> de amistad pendientes</span><span style="margin-left:auto" aria-hidden="true">→</span>'; }
  };

  // ---------- Lista de amigos ----------
  P.amigos = function () {
    if (!auth.user()) { location.replace('' + ssRuta('iniciar-sesion.html') + '?volver=amigos.html'); return; }
    let tab = ({ '#solicitudes': 'in', '#sugerencias': 'none', '#en-linea': 'on' })[location.hash] || 'all';
    let q = '';
    $('#my-handle').textContent = '@' + me().user;
    $('#copy-handle').addEventListener('click', () => { const t = '@' + me().user; if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast('Usuario copiado'), () => toast(t)); else toast(t); });

    function stats() {
      const fr = friends.list('friend');
      $('#f-stats').innerHTML = [[fr.length, 'Amigos'], [fr.filter((f) => f.status !== 'offline').length, 'En línea'], [fr.filter((f) => f.status === 'playing').length, 'Jugando ahora']]
        .map((s) => '<div class="hs"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('');
    }
    function card(f) {
      const rel = friends.rel(f.user);
      const g = f.status === 'playing' ? gameById(f.game) : null;
      const cm = common(f);
      const commons = cm.slice(0, 4).map((id) => { const x = gameById(id); return x ? cover(x, { small: true }) : ''; }).join('');
      let actions = '';
      if (rel === 'friend') actions = '<a class="btn btn-secondary btn-sm" href="' + userHref(f.user) + '">Ver perfil</a><button class="btn btn-secondary btn-sm" data-msg="' + f.user + '">Mensaje<span class="soon">Pronto</span></button><button class="btn btn-ghost btn-sm" data-rm="' + f.user + '" aria-label="Eliminar a ' + esc(f.name) + ' de tus amigos">Eliminar</button>';
      else if (rel === 'in') actions = '<button class="btn btn-primary btn-sm" data-accept="' + f.user + '">Aceptar</button><button class="btn btn-secondary btn-sm" data-reject="' + f.user + '">Rechazar</button><a class="btn btn-ghost btn-sm" href="' + userHref(f.user) + '">Ver perfil</a>';
      else if (rel === 'out') actions = '<span class="badge badge-outline">SOLICITUD ENVIADA</span><button class="btn btn-ghost btn-sm" data-cancel="' + f.user + '">Cancelar</button>';
      else actions = '<button class="btn btn-primary btn-sm" data-add="' + f.user + '">+ Agregar</button><a class="btn btn-ghost btn-sm" href="' + userHref(f.user) + '">Ver perfil</a>';
      return '<article class="friend-card' + (g ? ' is-playing" style="--c:' + g.color : '') + '">' +
        '<div class="row" style="flex-wrap:nowrap;gap:14px">' + avatar(f, 56) + '<div class="grow" style="line-height:1.35"><a class="user-link" href="' + userHref(f.user) + '"><b style="font-size:17px">' + esc(f.name) + '</b></a><br><span class="xs muted">@' + esc(f.user) + ' · Nivel ' + f.level + '</span><br>' + statusLine(f) + '</div></div>' +
        (g ? '<a class="now-playing" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '">' + cover(g, { small: true }) + '<span><span class="xs" style="color:var(--good);font-weight:800;letter-spacing:.06em">EN JUEGO</span><br><b>' + esc(g.short) + '</b></span></a>' : '') +
        (rel === 'none' || rel === 'in' ? '<span class="xs muted">' + (f.mutual || 0) + ' amigos en común · ' + cm.length + ' juegos en común</span>' : cm.length ? '<div class="row" style="gap:8px"><span class="commons">' + commons + '</span><span class="xs muted">' + cm.length + ' juegos en común</span></div>' : '<span class="xs muted">Sin juegos en común todavía</span>') +
        '<div class="row" style="gap:6px;margin-top:auto">' + actions + '</div></article>';
    }
    function render() {
      stats();
      const counts = { all: friends.list('friend').length, on: friends.list('friend').filter((f) => f.status !== 'offline').length, in: friends.list('in').length, none: friends.list('none').length + friends.list('out').length };
      $('#f-tabs').innerHTML = [['all', 'Todos'], ['on', 'En línea'], ['in', 'Solicitudes'], ['none', 'Sugerencias']].map((t) =>
        '<button role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '<span class="count' + (t[0] === 'in' && counts.in ? ' count-hot' : '') + '">' + counts[t[0]] + '</span></button>').join('');
      let list = tab === 'all' ? friends.list('friend') : tab === 'on' ? friends.list('friend').filter((f) => f.status !== 'offline') : tab === 'in' ? friends.list('in') : friends.list('none').concat(friends.list('out'));
      const order = ['playing', 'online', 'offline'];
      list = list.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
      if (q) list = list.filter((f) => (f.name + ' ' + f.user).toLowerCase().includes(q));
      const empty = { all: 'Aún no tienes amigos. Revisa las sugerencias.', on: 'Ninguno de tus amigos está en línea ahora.', in: 'No tienes solicitudes pendientes.', none: 'No hay más sugerencias por ahora.' }[tab];
      $('#f-list').innerHTML = list.map(card).join('') || '<div class="empty" style="grid-column:1/-1">' + (q ? 'Nadie coincide con “' + esc(q) + '”. <button class="btn btn-secondary btn-sm" id="clear-q">Limpiar búsqueda</button>' : esc(empty)) + '</div>';
      const cq = $('#clear-q'); if (cq) cq.addEventListener('click', () => { q = ''; $('#f-q').value = ''; render(); });
    }
    $('#f-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
    $('#f-q').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase().replace(/^@/, ''); render(); });
    $('#f-list').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const u = b.dataset.rm || b.dataset.accept || b.dataset.reject || b.dataset.add || b.dataset.cancel || b.dataset.msg; if (!u) return;
      const f = friends.user(u), prev = friends.rel(u);
      const undo = () => { friends.set(u, prev); render(); };
      if (b.dataset.msg) { toast('Los mensajes directos llegarán en una próxima versión'); return; }
      if (b.dataset.rm) { friends.set(u, 'none'); toast(f.name + ' ya no está en tus amigos', { action: 'Deshacer', onAction: undo }); }
      if (b.dataset.accept) { friends.set(u, 'friend'); profile.addXP(10); toast('Ahora eres amigo de ' + f.name + ' · +10 XP'); }
      if (b.dataset.reject) { friends.set(u, 'none'); toast('Solicitud rechazada', { action: 'Deshacer', onAction: undo }); }
      if (b.dataset.add) { friends.set(u, 'out'); toast('Solicitud enviada a ' + f.name, { action: 'Deshacer', onAction: undo }); }
      if (b.dataset.cancel) { friends.set(u, 'none'); toast('Solicitud cancelada'); }
      render();
    });
    $('#add-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const inp = $('#add-u'), err = $('#add-err'); const v = inp.value.trim().replace(/^@/, '').toLowerCase();
      const show = (m) => { err.textContent = m; err.hidden = !m; inp.setAttribute('aria-invalid', !!m); };
      if (!v) { show('Escribe el usuario de tu amigo, por ejemplo @feli_fps.'); inp.focus(); return; }
      if (v === me().user) { show('Ese es tu propio usuario.'); return; }
      const f = friends.user(v);
      if (!f) { show('No encontramos a @' + v + '. Revisa que esté bien escrito; también puedes ver la pestaña Sugerencias.'); return; }
      const rel = friends.rel(v);
      if (rel === 'friend') { show('@' + v + ' ya está en tus amigos.'); return; }
      show('');
      await busy($('#add-form button[type="submit"]'), 'Enviando…', 400);
      if (rel === 'in') { friends.set(v, 'friend'); toast('Tenía una solicitud tuya pendiente: ahora son amigos'); }
      else { friends.set(v, 'out'); toast('Solicitud enviada a ' + f.name); }
      inp.value = ''; tab = rel === 'in' ? 'all' : 'none'; render();
    });

    // Actividad reciente de amigos
    const feed = DATA.reviews.filter((r) => friends.rel(r.user) === 'friend').slice(0, 5).map((r) => { const f = friends.user(r.user), g = gameById(r.game); return '<a class="feed-item" href="' + ssRuta('detalle-resena.html') + '?id=' + r.id + '">' + avatar(f, 32) + '<span class="small"><b>' + esc(f.name.split(' ')[0]) + '</b> reseñó <b>' + esc(g.short) + '</b> <span class="score">' + r.score + '/10</span><br><span class="xs muted">' + dateTxt(r.date) + '</span></span></a>'; });
    const playing = friends.list('friend').filter((f) => f.status === 'playing').map((f) => { const g = gameById(f.game); return '<a class="feed-item" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '">' + avatar(f, 32) + '<span class="small"><b>' + esc(f.name.split(' ')[0]) + '</b> está jugando <b>' + esc(g.short) + '</b><br><span class="xs" style="color:var(--good)">Ahora</span></span></a>'; });
    $('#feed').innerHTML = playing.concat(feed).join('') || '<span class="muted small">Sin actividad reciente.</span>';
    render();
  };

  // ---------- Perfil público de otra persona ----------
  P.usuario = function () {
    const f = friends.user(params.get('u'));
    if (!f) { location.replace('' + ssRuta('404.html') + ''); return; }
    if (auth.user() && auth.user().user === f.user) { location.replace('' + ssRuta('perfil.html') + ''); return; }
    document.title = f.name + ' · SaveSlot';
    $('#banner').style.background = bannerFor(f.favorites);
    $('#u-avatar').innerHTML = avatar(f, 124);
    $('#u-name').textContent = f.name;
    $('#u-handle').textContent = '@' + f.user;
    $('#u-badges').innerHTML = '<span class="badge badge-accent">NIVEL ' + f.level + '</span>' + statusLine(f);
    $('#u-bio').textContent = f.bio;
    $('#u-since').textContent = 'Miembro desde ' + new Date(f.since + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    function actions() {
      const rel = friends.rel(f.user);
      $('#u-actions').innerHTML = rel === 'friend' ? '<span class="badge badge-friend" style="padding:8px 12px">✓ AMIGOS</span><button class="btn btn-secondary" data-act="msg">Mensaje<span class="soon">Pronto</span></button><button class="btn btn-ghost" data-act="rm">Eliminar amigo</button>'
        : rel === 'in' ? '<button class="btn btn-primary" data-act="accept">Aceptar solicitud</button><button class="btn btn-secondary" data-act="reject">Rechazar</button>'
          : rel === 'out' ? '<span class="badge badge-outline" style="padding:8px 12px">SOLICITUD ENVIADA</span><button class="btn btn-ghost" data-act="cancel">Cancelar</button>'
            : '<button class="btn btn-primary" data-act="add">+ Agregar amigo</button>';
    }
    actions();
    $('#u-actions').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (!auth.require('agregar amigos')) return;
      const prev = friends.rel(f.user), a = b.dataset.act;
      if (a === 'msg') { toast('Los mensajes directos llegarán en una próxima versión'); return; }
      const next = { rm: 'none', accept: 'friend', reject: 'none', cancel: 'none', add: 'out' }[a];
      friends.set(f.user, next); actions();
      toast({ rm: 'Eliminado de tus amigos', accept: 'Ahora son amigos', reject: 'Solicitud rechazada', cancel: 'Solicitud cancelada', add: 'Solicitud enviada' }[a], a === 'rm' || a === 'add' ? { action: 'Deshacer', onAction: () => { friends.set(f.user, prev); actions(); } } : {});
    });

    const g = f.status === 'playing' ? gameById(f.game) : null;
    $('#u-activity').innerHTML = g ? '<a class="now-playing" style="--c:' + g.color + '" href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '">' + cover(g, { small: true }) + '<span><span class="xs" style="color:var(--good);font-weight:800">● JUGANDO AHORA</span><br><b>' + esc(g.short) + '</b></span></a>' : '<span class="muted small">' + esc(STATUS_TXT(f)) + '</span>';

    const mutual = friends.list('friend').filter((x) => x.user !== f.user).slice(0, f.mutual || 3);
    $('#u-mutual-n').textContent = mutual.length;
    $('#u-mutual').innerHTML = mutual.map((x) => '<a href="' + userHref(x.user) + '" title="' + esc(x.name) + '">' + avatar(x, 40) + '</a>').join('') || '<span class="muted small">Ninguno</span>';

    const revs = DATA.reviews.filter((r) => r.user === f.user);
    const cm = common(f);
    $('#u-stats').innerHTML = [[Object.keys(f.played).length + 18, 'Juegos'], [revs.length, 'Reseñas'], [cm.length, 'En común'], [f.mutual || mutual.length, 'Amigos en común']].map((s) => '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('');
    $('#u-favs').innerHTML = f.favorites.map((id) => { const x = gameById(id); return x ? '<a class="game-tile" href="' + ssRuta('detalle-juego.html') + '?id=' + x.id + '">' + cover(x) + '</a>' : ''; }).join('');
    const mine = myScores();
    $('#u-common').innerHTML = cm.length ? cm.map((id) => { const x = gameById(id), a = f.played[id], b = mine[id];
      return '<a class="compare-row" href="' + ssRuta('detalle-juego.html') + '?id=' + x.id + '">' + cover(x, { small: true }) + '<b class="grow">' + esc(x.short) + '</b>' +
        '<span class="cmp"><span class="xs muted">' + esc(f.name.split(' ')[0]) + '</span><span class="meter" style="width:90px"><i style="width:' + a * 10 + '%"></i></span><b>' + a + '</b></span>' +
        '<span class="cmp"><span class="xs muted">Tú</span><span class="meter good" style="width:90px"><i style="width:' + b * 10 + '%"></i></span><b>' + b + '</b></span></a>'; }).join('')
      : '<div class="empty">Todavía no tienen juegos en común en el diario.</div>';
    $('#u-reviews').innerHTML = revs.map((r) => { const x = gameById(r.game); return '<a class="card card-link" href="' + ssRuta('detalle-resena.html') + '?id=' + r.id + '" style="--c:' + x.color + '"><div class="row" style="flex-wrap:nowrap">' + cover(x, { small: true }) + '<span class="grow"><b>' + esc(x.short) + '</b><br><span class="xs muted">' + dateTxt(r.date) + '</span></span><span class="score-pill">' + r.score + '<small>/10</small></span></div><p class="soft small clamp-3">' + esc(r.spoiler ? 'Contiene spoilers. Ábrela para leerla.' : r.text) + '</p><span class="xs muted">♥ ' + r.likes + ' · Útil ' + r.useful + '</span></a>'; }).join('') || '<div class="empty">Aún no publica reseñas.</div>';
  };

  // ---------- Historial de reseñas ----------
  P.historial = function () {
    if (!auth.user()) { location.replace('' + ssRuta('iniciar-sesion.html') + '?volver=historial-resenas.html'); return; }
    let q = '', band = 'all', sort = 'recientes';
    function summary() {
      const all = RV.mine();
      const avg = all.length ? all.reduce((a, r) => a + r.score, 0) / all.length : 0;
      $('#h-stats').innerHTML = [[all.length, 'Reseñas'], [fmt(all.reduce((a, r) => a + (r.likes || 0), 0)), 'Me gusta recibidos'], [fmt(all.reduce((a, r) => a + (r.useful || 0), 0)), 'Votos de “útil”'], [avg.toFixed(1).replace('.', ','), 'Nota promedio']]
        .map((s) => '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('');
    }
    function row(r) {
      const g = gameById(r.game); if (!g) return '';
      const nC = RV.comments(r.id).length;
      return '<article class="history-row" style="--c:' + g.color + '" data-id="' + r.id + '">' +
        '<a href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '" class="hr-cover" tabindex="-1" aria-hidden="true">' + cover(g, { noTitle: true }) + '</a>' +
        '<div class="hr-body"><div class="row between" style="gap:8px"><div><a class="user-link" href="' + ssRuta('detalle-resena.html') + '?id=' + r.id + '"><b style="font-size:18px">' + esc(g.short) + '</b></a><br><span class="xs muted">' + dateTxt(r.date) + ' · ' + esc(r.state || 'Terminado') + ' · ' + (r.hours || 0) + ' h' + (r.edited ? ' · Editada' : '') + '</span></div><span class="score-pill">' + r.score + '<small>/10</small></span></div>' +
        '<p class="soft clamp-2">' + (r.spoiler ? '<span class="badge badge-outline" style="margin-right:6px">SPOILER</span>' : '') + esc(r.text) + '</p>' +
        '<div class="row between" style="gap:8px"><span class="xs muted">♥ ' + (r.likes || 0) + ' · Útil ' + (r.useful || 0) + ' · ' + nC + (nC === 1 ? ' comentario' : ' comentarios') + '</span>' +
        '<span class="row" style="gap:4px"><a class="btn btn-secondary btn-sm" href="' + ssRuta('detalle-resena.html') + '?id=' + r.id + '">Ver</a><a class="btn btn-secondary btn-sm" href="' + ssRuta('escribir-resena.html') + '?id=' + g.id + '&editar=' + r.id + '">Editar</a><button class="btn btn-ghost btn-sm" data-del="' + r.id + '" aria-label="Eliminar reseña de ' + esc(g.short) + '">Eliminar</button></span></div></div></article>';
    }
    function render() {
      summary();
      const all = RV.mine();
      let list = all.filter((r) => { const g = gameById(r.game); return (!q || (g.name + ' ' + r.text).toLowerCase().includes(q)) && (band === 'all' || (band === '9' ? r.score >= 9 : band === '7' ? r.score >= 7 && r.score <= 8 : r.score <= 6)); });
      const by = { recientes: (a, b) => b.date.localeCompare(a.date), antiguas: (a, b) => a.date.localeCompare(b.date), nota: (a, b) => b.score - a.score, utiles: (a, b) => (b.useful || 0) - (a.useful || 0) }[sort];
      list.sort(by);
      $('#h-count').textContent = 'Mostrando ' + list.length + ' de ' + all.length + ' reseñas';
      $('#h-list').innerHTML = list.map(row).join('') || (all.length
        ? '<div class="empty">Ninguna reseña coincide con los filtros. <button class="btn btn-secondary btn-sm" id="h-clear">Limpiar filtros</button></div>'
        : '<div class="empty"><b style="color:var(--fg)">Aún no escribes reseñas.</b><span>Cuenta qué te pareció el último juego que terminaste.</span><a class="btn btn-primary btn-sm" href="' + ssRuta('buscar-juegos.html') + '">Escribir mi primera reseña</a></div>');
      const c = $('#h-clear'); if (c) c.addEventListener('click', () => { q = ''; band = 'all'; $('#h-q').value = ''; $$('#h-score [data-s]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.s === 'all')); render(); });
    }
    $('#h-q').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); render(); });
    $('#h-score').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; band = b.dataset.s; $$('#h-score [data-s]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); });
    $('#h-sort').addEventListener('change', (e) => { sort = e.target.value; render(); });
    $('#h-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-del]'); if (!b) return;
      const list = RV.raw(), i = list.findIndex((r) => r.id === b.dataset.del); if (i < 0) return;
      const [gone] = list.splice(i, 1); RV.save(list); render();
      toast('Reseña eliminada', { action: 'Deshacer', onAction: () => { const l = RV.raw(); l.splice(i, 0, gone); RV.save(l); render(); } });
    });
    render();
  };

  // ---------- Detalle de una reseña ----------
  P.verresena = function () {
    const r = RV.byId(params.get('id'));
    if (!r) { location.replace('' + ssRuta('404.html') + ''); return; }
    const g = gameById(r.game);
    const f = r.mine ? null : friends.user(r.user);
    const author = r.mine ? Object.assign({ status: 'online', color: '#1F4A8A', name: me().name, level: profile.get().level }, { user: r.user, initials: r.initials }) : (f || { user: r.user, initials: r.initials, name: r.user, status: 'offline', color: '#2E3A4A', level: '—' });
    document.title = 'Reseña de ' + g.short + ' · SaveSlot';
    $('#band').style.setProperty('--band', 'color-mix(in srgb,' + g.color + ' 60%, #12161D)');
    $('#crumb-game').textContent = g.short; $('#crumb-game').href = '' + ssRuta('detalle-juego.html') + '?id=' + g.id;
    $('#v-cover').outerHTML = '<a href="' + ssRuta('detalle-juego.html') + '?id=' + g.id + '" class="game-tile" style="width:160px;flex:none">' + cover(g) + '</a>';
    $('#v-eyebrow').textContent = 'Reseña · ' + g.genres.join(' · ');
    $('#v-title').textContent = g.name;
    $('#v-author').innerHTML = avatar(author, 40) + '<span style="line-height:1.3"><a class="user-link" href="' + userHref(r.user) + '"><b>' + esc(author.name) + '</b></a> <span class="muted small">@' + esc(r.user) + '</span><br><span class="xs soft">' + dateTxt(r.date) + (r.edited ? ' · editada' : '') + '</span></span>';
    $('#v-score').innerHTML = '<b>' + r.score + '</b><span>/10</span>';
    $('#v-score').style.setProperty('--p', r.score * 10);
    $('#v-body').innerHTML = r.spoiler ? '<div class="spoiler"><span class="muted">Esta reseña tiene spoilers.</span><button class="btn btn-secondary btn-sm" id="reveal">Mostrar de todas formas</button></div><p hidden id="v-txt"></p>' : '<p id="v-txt"></p>';
    $('#v-txt').textContent = r.text;
    const rv = $('#reveal'); if (rv) rv.addEventListener('click', () => { rv.closest('.spoiler').remove(); $('#v-txt').hidden = false; });

    let liked = false, useful = false;
    function acts() {
      $('#v-actions').innerHTML = '<button class="btn btn-secondary like-btn" aria-pressed="' + liked + '" id="a-like">♥ Me gusta · ' + fmt((r.likes || 0) + (liked ? 1 : 0)) + '</button>' +
        '<button class="btn btn-secondary" aria-pressed="' + useful + '" id="a-useful">Útil · ' + fmt((r.useful || 0) + (useful ? 1 : 0)) + '</button><button class="btn btn-secondary" id="a-share">Compartir</button>' +
        (r.mine ? '<a class="btn btn-secondary" href="' + ssRuta('escribir-resena.html') + '?id=' + g.id + '&editar=' + r.id + '" style="margin-left:auto">Editar</a><a class="btn btn-ghost" href="' + ssRuta('historial-resenas.html') + '">Ir a mi historial</a>' : '');
    }
    acts();
    $('#v-actions').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.id === 'a-share') { const u = location.href; if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => toast('Enlace copiado'), () => toast(u)); else toast(u); return; }
      if (!auth.require(b.id === 'a-like' ? 'dar me gusta' : 'votar reseñas')) return;
      if (r.mine) { toast('No puedes votar tu propia reseña'); return; }
      if (b.id === 'a-like') liked = !liked; else useful = !useful;
      acts();
    });

    $('#v-facts').innerHTML = [['Estado', r.state || 'Terminado'], ['Horas jugadas', (r.hours || 0) + ' h'], ['Dificultad votada', (r.diff || '—') + '/10'], ['Nota de la comunidad', SS.score10(g.rating) + '/10']].map((x) => '<dt class="muted">' + x[0] + '</dt><dd style="margin:0">' + esc(x[1]) + '</dd>').join('');
    const rel = r.mine ? 'me' : friends.rel(r.user);
    $('#v-about').innerHTML = '<h2 class="panel-title">Sobre quien escribe</h2><a class="row" style="flex-wrap:nowrap;color:var(--fg)" href="' + userHref(r.user) + '">' + avatar(author, 52) + '<span style="line-height:1.35"><b>' + esc(author.name) + '</b><br><span class="xs muted">Nivel ' + author.level + '</span><br>' + (f ? statusLine(f) : '') + '</span></a>' +
      (f && f.bio ? '<p class="small soft">' + esc(f.bio) + '</p>' : '') +
      (rel === 'none' && f ? '<button class="btn btn-secondary btn-sm" id="v-add">+ Agregar amigo</button>' : rel === 'friend' ? '<span class="badge badge-friend" style="align-self:flex-start">✓ AMIGOS</span>' : '');
    const va = $('#v-add'); if (va) va.addEventListener('click', () => { if (!auth.require('agregar amigos')) return; friends.set(f.user, 'out'); va.outerHTML = '<span class="badge badge-outline" style="align-self:flex-start">SOLICITUD ENVIADA</span>'; toast('Solicitud enviada a ' + f.name); });
    const more = RV.all().filter((x) => x.game === g.id && x.id !== r.id).slice(0, 3);
    $('#v-more').innerHTML = more.map((x) => '<a class="feed-item" href="' + ssRuta('detalle-resena.html') + '?id=' + x.id + '"><span class="avatar" style="width:32px;height:32px;font-size:12px">' + esc(x.initials) + '</span><span class="small"><b>@' + esc(x.user) + '</b> <span class="score">' + x.score + '/10</span><br><span class="xs muted clamp-2">' + esc(x.spoiler ? 'Contiene spoilers' : x.text) + '</span></span></a>').join('') || '<span class="muted small">Es la única reseña de este juego.</span><a class="link-strong small" href="' + ssRuta('escribir-resena.html') + '?id=' + g.id + '">Escribe la tuya</a>';

    // Comentarios
    const key = 'comments.' + r.id;
    const u = auth.user();
    $('#c-av').textContent = u ? u.initials : '?';
    function renderC() {
      const list = RV.comments(r.id);
      $('#c-count').textContent = '· ' + list.length;
      $('#c-list').innerHTML = list.map((c, i) => { const cf = friends.user(c.user); return '<div class="comment">' + (cf ? avatar(cf, 36) : '<span class="avatar">' + esc(c.initials) + '</span>') + '<div class="grow"><div class="row" style="gap:8px"><a class="user-link" href="' + userHref(c.user) + '"><b class="small">@' + esc(c.user) + '</b></a><span class="xs muted">' + esc(c.when) + '</span>' + (u && c.user === u.user ? '<button class="help-link" style="margin-left:auto" data-cdel="' + i + '">Eliminar</button>' : '') + '</div><p class="small" style="margin-top:2px"></p></div></div>'; }).join('') || '<div class="empty">Sé la primera persona en comentar.</div>';
      $$('#c-list .comment p').forEach((p, i) => { p.textContent = list[i].text; });
    }
    renderC();
    $('#c-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const t = $('#c-txt').value.trim();
      if (!t) { $('#c-txt').focus(); toast('Escribe algo antes de comentar'); return; }
      if (!auth.require('comentar')) return;
      await busy($('#c-form button[type="submit"]'), 'Enviando…', 350);
      const list = RV.comments(r.id).slice(); list.push({ review: r.id, user: auth.user().user, initials: auth.user().initials, when: 'ahora', text: t });
      store.set(key, list); $('#c-txt').value = ''; renderC();
    });
    $('#c-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cdel]'); if (!b) return;
      const list = RV.comments(r.id).slice(), i = Number(b.dataset.cdel); const [gone] = list.splice(i, 1); store.set(key, list); renderC();
      toast('Comentario eliminado', { action: 'Deshacer', onAction: () => { const l = RV.comments(r.id).slice(); l.splice(i, 0, gone); store.set(key, l); renderC(); } });
    });
  };
})(window.SS_PAGES);

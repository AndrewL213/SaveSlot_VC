/* SaveSlot · data.js
   Datos simulados de la app, separados del diseño. Una lista por tipo de dato, con los
   nombres de la sección Datos de spec.md (minúsculas, con guion bajo) y un id único en
   cada elemento: el slug de IGDB en los juegos, el @ en los usuarios y un nombre corto en lo demás.
   Las imágenes van como rutas desde la raíz ("assets/…"); app.js les pone ../ con rutaRecurso().
   Las pantallas los leen solo con obtenerDatos("…") de js/app.js: cuando se conecten
   Supabase e IGDB, cambia esa función y no este archivo ni las pantallas.
   Origen: disenos/js/data.js (diseño v3). Portadas desde assets/. */

const DATOS = {
  juegos: [
    {
      id: "the-legend-of-zelda-tears-of-the-kingdom",
      id_igdb: 119388,
      nombre: "The Legend of Zelda: Tears of the Kingdom",
      nombre_corto: "Zelda: TOTK",
      generos: [
        "Aventura"
      ],
      plataformas: [
        "Nintendo"
      ],
      anio: 2023,
      desarrolladora: "Nintendo EPD",
      tipo: "AAA",
      horas_historia: 60,
      horas100: 220,
      dificultad: 6,
      calificacion: 9.6,
      votos: 12430,
      logros_totales: 139,
      descripcion: "Mundo abierto enorme donde cada puzzle tiene varias soluciones gracias a Ultramano.",
      portada: "assets/portada-zelda-totk.jpg",
      color: "#2F6B4F"
    },
    {
      id: "nier-automata",
      id_igdb: 11208,
      nombre: "NieR: Automata",
      nombre_corto: "NieR: Automata",
      generos: [
        "RPG",
        "Acción"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox",
        "Nintendo"
      ],
      anio: 2017,
      desarrolladora: "PlatinumGames",
      tipo: "AAA",
      horas_historia: 20,
      horas100: 70,
      dificultad: 6,
      calificacion: 9.4,
      votos: 8120,
      logros_totales: 50,
      descripcion: "Combate ágil y una historia que cambia por completo con cada final.",
      portada: "assets/portada-nier-automata.jpg",
      color: "#7C7566"
    },
    {
      id: "rocket-league",
      id_igdb: 11198,
      solo_online: true,
      nombre: "Rocket League",
      nombre_corto: "Rocket League",
      generos: [
        "Deportes"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox",
        "Nintendo"
      ],
      anio: 2015,
      desarrolladora: "Psyonix",
      tipo: "AAA",
      horas_historia: null,
      horas100: null,
      dificultad: 7,
      calificacion: 8.6,
      votos: 9840,
      logros_totales: 88,
      descripcion: "Fútbol con autos. Partidas de 5 minutos y torneos oficiales varias veces al día.",
      portada: "assets/portada-rocket-league.jpg",
      color: "#2456C4"
    },
    {
      id: "valorant",
      id_igdb: 126459,
      solo_online: true,
      nombre: "Valorant",
      nombre_corto: "Valorant",
      generos: [
        "Shooter"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox"
      ],
      anio: 2020,
      desarrolladora: "Riot Games",
      tipo: "AAA",
      horas_historia: null,
      horas100: null,
      dificultad: 8,
      calificacion: 8.4,
      votos: 7650,
      logros_totales: 0,
      descripcion: "Shooter táctico 5v5 con agentes de habilidades únicas.",
      portada: "assets/portada-valorant.jpg",
      color: "#5B3F96"
    },
    {
      id: "pokemon-legends-z-a",
      id_igdb: 288327,
      nombre: "Pokémon Legends Z-A",
      nombre_corto: "Pokémon Legends Z-A",
      generos: [
        "RPG"
      ],
      plataformas: [
        "Nintendo"
      ],
      anio: 2025,
      desarrolladora: "Game Freak",
      tipo: "AAA",
      horas_historia: 30,
      horas100: 80,
      dificultad: 3,
      calificacion: 8.8,
      votos: 5310,
      logros_totales: 0,
      descripcion: "Captura y combate en tiempo real dentro de Ciudad Luminalia.",
      portada: "assets/portada-pokemon-legends-za.png",
      color: "#B8343E"
    },
    {
      id: "five-nights-at-freddys-into-the-pit",
      id_igdb: 283679,
      nombre: "Five Nights at Freddy's: Into the Pit",
      nombre_corto: "FNAF: Into the Pit",
      generos: [
        "Terror"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox",
        "Nintendo"
      ],
      anio: 2024,
      desarrolladora: "Mega Cat Studios",
      tipo: "Indie",
      horas_historia: 6,
      horas100: 10,
      dificultad: 5,
      calificacion: 8.2,
      votos: 2140,
      logros_totales: 24,
      descripcion: "Aventura de terror corta con tensión constante y pocos sustos baratos.",
      portada: "assets/portada-fnaf-into-the-pit.jpg",
      color: "#6B3A1E"
    },
    {
      id: "hollow-knight",
      id_igdb: 14593,
      nombre: "Hollow Knight",
      nombre_corto: "Hollow Knight",
      generos: [
        "Aventura",
        "Metroidvania"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox",
        "Nintendo"
      ],
      anio: 2017,
      desarrolladora: "Team Cherry",
      tipo: "Indie",
      horas_historia: 27,
      horas100: 60,
      dificultad: 7,
      calificacion: 9.4,
      votos: 9010,
      logros_totales: 63,
      descripcion: "Metroidvania exigente con un mundo para explorar sin prisa.",
      portada: "assets/portada-hollow-knight.jpg",
      color: "#2B3A55"
    },
    {
      id: "hades--1",
      id_igdb: 113112,
      nombre: "Hades",
      nombre_corto: "Hades",
      generos: [
        "Roguelike",
        "Acción"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox",
        "Nintendo"
      ],
      anio: 2020,
      desarrolladora: "Supergiant Games",
      tipo: "Indie",
      horas_historia: 22,
      horas100: 95,
      dificultad: 6,
      calificacion: 9.6,
      votos: 7720,
      logros_totales: 49,
      descripcion: "Escapa del inframundo partida a partida mientras la historia avanza.",
      portada: "assets/portada-hades.jpg",
      color: "#8A2B2B"
    },
    {
      id: "elden-ring",
      id_igdb: 119133,
      nombre: "Elden Ring",
      nombre_corto: "Elden Ring",
      generos: [
        "RPG",
        "Acción"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox"
      ],
      anio: 2022,
      desarrolladora: "FromSoftware",
      tipo: "AAA",
      horas_historia: 55,
      horas100: 130,
      dificultad: 8,
      calificacion: 9.6,
      votos: 11200,
      logros_totales: 42,
      descripcion: "Mundo abierto oscuro y desafiante con libertad total para explorar.",
      portada: "assets/portada-elden-ring.jpg",
      color: "#3E5A2A"
    },
    {
      id: "ghost-of-tsushima",
      id_igdb: 75235,
      nombre: "Ghost of Tsushima",
      nombre_corto: "Ghost of Tsushima",
      generos: [
        "Aventura",
        "Acción"
      ],
      plataformas: [
        "PlayStation",
        "PC"
      ],
      anio: 2020,
      desarrolladora: "Sucker Punch",
      tipo: "AAA",
      horas_historia: 25,
      horas100: 60,
      dificultad: 5,
      calificacion: 9.4,
      votos: 6400,
      logros_totales: 52,
      descripcion: "Samurái en mundo abierto con combate preciso y un viento que te guía.",
      portada: "assets/portada-ghost-of-tsushima.jpg",
      color: "#7A2E2E"
    },
    {
      id: "inside",
      id_igdb: 7342,
      nombre: "Inside",
      nombre_corto: "Inside",
      generos: [
        "Terror",
        "Plataformas"
      ],
      plataformas: [
        "PC",
        "PlayStation",
        "Xbox",
        "Nintendo"
      ],
      anio: 2016,
      desarrolladora: "Playdead",
      tipo: "Indie",
      horas_historia: 3,
      horas100: 5,
      dificultad: 4,
      calificacion: 9.2,
      votos: 4300,
      logros_totales: 14,
      descripcion: "Plataformas oscuro y sin diálogos. Se termina en una tarde.",
      portada: "assets/portada-inside.jpg",
      color: "#3A3F45"
    },
    {
      id: "hades-ii",
      id_igdb: 228525,
      nombre: "Hades II",
      nombre_corto: "Hades II",
      generos: [
        "Roguelike",
        "Acción"
      ],
      plataformas: [
        "PC",
        "Nintendo"
      ],
      anio: 2025,
      desarrolladora: "Supergiant Games",
      tipo: "Indie",
      horas_historia: 30,
      horas100: 100,
      dificultad: 6,
      calificacion: 9.4,
      votos: 3100,
      logros_totales: 50,
      descripcion: "Secuela de Hades con nueva protagonista, Melínoe, y nuevas armas.",
      portada: "assets/portada-hades-ii.jpg",
      color: "#5A2D6B"
    }
  ],
  resenas: [
    {
      id: "r1",
      juego_igdb: 11208,
      autor: "kenvel",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "La segunda vuelta no es relleno: cambia todo lo que creías saber. Juégalo completo antes de opinar.",
      calificacion: 9,
      dificultad: 6,
      horas: 42,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 128,
      me_gusta: 64,
      fecha: "2026-10-05"
    },
    {
      id: "r2",
      juego_igdb: 11198,
      autor: "juanvi",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Fácil de empezar, difícil de dominar. Si llegas a Diamante, revisa la guía de aéreos de la comunidad.",
      calificacion: 8,
      dificultad: 7,
      horas: 300,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 74,
      me_gusta: 31,
      fecha: "2026-10-03"
    },
    {
      id: "r3",
      juego_igdb: 119388,
      autor: "andresh",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Ultramano cambia cómo resuelves todo. Haz las islas del cielo antes de bajar al subsuelo.",
      calificacion: 10,
      dificultad: 6,
      horas: 48,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 203,
      me_gusta: 112,
      fecha: "2026-09-28"
    },
    {
      id: "r4",
      juego_igdb: 119388,
      autor: "mlopez",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Enorme y generoso. El rendimiento baja en zonas con muchos efectos, pero nunca me sacó del juego.",
      calificacion: 8,
      dificultad: 5,
      horas: 31,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 88,
      me_gusta: 40,
      fecha: "2026-09-21"
    },
    {
      id: "r5",
      juego_igdb: 119388,
      autor: "valer1a",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "El final conecta con todo lo que pasó en el cielo. Que la batalla contra Ganondorf sea en caída libre es lo mejor del juego.",
      calificacion: 9,
      dificultad: 7,
      horas: 190,
      minutos_lectura: null,
      spoiler: true,
      votos_util: 61,
      me_gusta: 27,
      fecha: "2026-09-15"
    },
    {
      id: "r6",
      juego_igdb: 14593,
      autor: "d4ni",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Cada zona tiene identidad propia. Los jefes opcionales son los mejores del género.",
      calificacion: 10,
      dificultad: 8,
      horas: 60,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 140,
      me_gusta: 77,
      fecha: "2026-09-10"
    },
    {
      id: "r7",
      juego_igdb: 113112,
      autor: "kenvel",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Cada muerte te deja algo: una conversación, una mejora, una pista de la historia. Nunca se siente como perder el tiempo.",
      calificacion: 10,
      dificultad: 6,
      horas: 70,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 96,
      me_gusta: 52,
      fecha: "2026-08-30"
    },
    {
      id: "r8",
      juego_igdb: 126459,
      autor: "juanvi",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Muy bueno con amigos, frustrante en solitario. Aprende dos agentes bien antes de probar todos.",
      calificacion: 7,
      dificultad: 8,
      horas: 410,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 58,
      me_gusta: 19,
      fecha: "2026-08-22"
    },
    {
      id: "r9",
      juego_igdb: 119133,
      autor: "d4ni",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Si un jefe te bloquea, ve a explorar y vuelve más fuerte. El mundo abierto es la mejor ayuda de dificultad.",
      calificacion: 10,
      dificultad: 9,
      horas: 120,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 117,
      me_gusta: 66,
      fecha: "2026-08-14"
    },
    {
      id: "r10",
      juego_igdb: 7342,
      autor: "lau_plays",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Tres horas que se quedan contigo. Juégalo de noche, con audífonos y sin leer nada antes.",
      calificacion: 9,
      dificultad: 4,
      horas: 4,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 45,
      me_gusta: 22,
      fecha: "2026-08-02"
    },
    {
      id: "m1",
      juego_igdb: 119388,
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Ultramano convierte cada problema en un juguete. Me pasé horas construyendo puentes absurdos y nunca sentí que perdía el tiempo.",
      calificacion: 10,
      dificultad: 6,
      horas: 48,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 34,
      me_gusta: 21,
      fecha: "2026-10-07"
    },
    {
      id: "m2",
      juego_igdb: 283679,
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Corto y con buena tensión. Los saltos de tiempo están bien pensados, aunque el final se siente apurado.",
      calificacion: 7,
      dificultad: 5,
      horas: 6,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 12,
      me_gusta: 6,
      fecha: "2026-10-04"
    },
    {
      id: "m3",
      juego_igdb: 11208,
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "En la segunda partida con 9S entiendes por qué la primera era solo la mitad. El final E me hizo llorar con los créditos.",
      calificacion: 9,
      dificultad: 6,
      horas: 21,
      minutos_lectura: null,
      spoiler: true,
      votos_util: 27,
      me_gusta: 15,
      fecha: "2026-10-02"
    },
    {
      id: "m4",
      juego_igdb: 126459,
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Técnicamente impecable, pero no es para mí. Demasiado castigo para alguien que juega un rato los fines de semana.",
      calificacion: 5,
      dificultad: 8,
      horas: 9,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 4,
      me_gusta: 2,
      fecha: "2026-09-19"
    },
    {
      id: "m5",
      juego_igdb: 14593,
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Volví para sacar los finales que me faltaban. El Panteón es duro, pero cada intento enseña algo.",
      calificacion: 9,
      dificultad: 7,
      horas: 27,
      minutos_lectura: null,
      spoiler: false,
      votos_util: 41,
      me_gusta: 25,
      fecha: "2026-08-12"
    },
    {
      id: "g1",
      juego_igdb: 119388,
      autor: "cami.rpg",
      tipo: "guia",
      estado: "publicada",
      titulo: "Las 4 regiones en el orden recomendado",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutos_lectura: 12,
      spoiler: false,
      votos_util: null,
      porcentaje_util: 94,
      me_gusta: 0,
      fecha: null
    },
    {
      id: "g2",
      juego_igdb: 119388,
      autor: "kenvel",
      tipo: "guia",
      estado: "publicada",
      titulo: "Cómo conseguir la armadura Zonai",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutos_lectura: 6,
      spoiler: false,
      votos_util: null,
      porcentaje_util: 88,
      me_gusta: 0,
      fecha: null
    },
    {
      id: "g3",
      juego_igdb: 126459,
      autor: "feli_fps",
      tipo: "guia",
      estado: "publicada",
      titulo: "Agentes para empezar si vienes de CS",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutos_lectura: 8,
      spoiler: false,
      votos_util: null,
      porcentaje_util: 89,
      me_gusta: 0,
      fecha: null
    },
    {
      id: "g4",
      juego_igdb: 11208,
      autor: "kenvel",
      tipo: "guia",
      estado: "publicada",
      titulo: "Todos los finales sin perderte ninguno",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutos_lectura: 15,
      spoiler: false,
      votos_util: null,
      porcentaje_util: 91,
      me_gusta: 0,
      fecha: null
    },
    {
      id: "g5",
      juego_igdb: 11198,
      autor: "juanvi",
      tipo: "guia",
      estado: "publicada",
      titulo: "Aéreos básicos en 10 minutos",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutos_lectura: 10,
      spoiler: false,
      votos_util: null,
      porcentaje_util: 86,
      me_gusta: 0,
      fecha: null
    }
  ],
  comentarios: [
    {
      id: "c1",
      resena: "m1",
      autor: "kenvel",
      texto: "Lo de los puentes absurdos es lo mejor del juego, jaja.",
      fecha: "2026-10-07"
    },
    {
      id: "c2",
      resena: "m1",
      autor: "d4ni",
      texto: "¿Ya probaste el subsuelo completo? Cambia mucho la experiencia.",
      fecha: "2026-10-08"
    },
    {
      id: "c3",
      resena: "m3",
      autor: "juanvi",
      texto: "El final E es de lo mejor que he jugado.",
      fecha: "2026-10-04"
    },
    {
      id: "c4",
      resena: "r1",
      autor: "mlopez",
      texto: "Totalmente, la ruta C es otro juego.",
      fecha: "2026-10-06"
    },
    {
      id: "c5",
      resena: "r3",
      autor: "kenvel",
      texto: "Buen consejo lo de las islas del cielo primero.",
      fecha: "2026-10-02"
    },
    {
      id: "c6",
      resena: "r6",
      autor: "valer1a",
      texto: "Los Hermanos Mantis son mi jefe favorito.",
      fecha: "2026-10-05"
    }
  ],
  usuarios: [
    {
      usuario: "samluq",
      nombre: "Samuel D Luq",
      iniciales: "SL",
      nivel: 12,
      miembro_desde: "2024-03-14",
      sobre_mi: "Gamer casual. Aventura, RPG y algo de terror los fines de semana.",
      jugando_ahora: "the-legend-of-zelda-tears-of-the-kingdom",
      estado: "en-linea",
      favoritos: [
        "nier-automata",
        "the-legend-of-zelda-tears-of-the-kingdom",
        "hollow-knight",
        "five-nights-at-freddys-into-the-pit"
      ],
      xp: 1240,
      generos_favoritos: ["Aventura", "RPG", "Terror"],
      lista_deseos: ["hades-ii", "ghost-of-tsushima", "elden-ring"],
      cuentas_vinculadas: [{ plataforma: "Steam", nombre: "samluq_steam", estado: "verificada" }],
      insignias: [
        "Fundador beta"
      ],
      color: "#1F4A8A",
      id: "samluq"
    },
    {
      usuario: "kenvel",
      nombre: "Kenneth Velásquez",
      iniciales: "KV",
      nivel: 18,
      miembro_desde: "2024-02-02",
      sobre_mi: "RPGs japoneses y bandas sonoras que se quedan en la cabeza.",
      jugando_ahora: "nier-automata",
      estado: "jugando",
      favoritos: [
        "nier-automata",
        "hades--1",
        "elden-ring",
        "hollow-knight"
      ],
      insignias: [],
      color: "#7C7566",
      id: "kenvel",
      notas: {"nier-automata": 9, "hades--1": 10, "the-legend-of-zelda-tears-of-the-kingdom": 9, "hollow-knight": 8, "inside": 8},
      ultima_conexion: null,
      amigos_en_comun: 0
    },
    {
      usuario: "juanvi",
      nombre: "Juan Vigoya",
      iniciales: "JV",
      nivel: 21,
      miembro_desde: "2023-11-20",
      sobre_mi: "Competitivo. Diamante en Rocket League, Oro en Valorant.",
      jugando_ahora: "rocket-league",
      estado: "jugando",
      favoritos: [
        "rocket-league",
        "valorant",
        "elden-ring",
        "the-legend-of-zelda-tears-of-the-kingdom"
      ],
      insignias: [],
      color: "#2456C4",
      id: "juanvi",
      notas: {"rocket-league": 8, "valorant": 7, "the-legend-of-zelda-tears-of-the-kingdom": 9, "nier-automata": 10},
      ultima_conexion: null,
      amigos_en_comun: 0
    },
    {
      usuario: "d4ni",
      nombre: "Daniela Arango",
      iniciales: "DA",
      nivel: 15,
      miembro_desde: "2024-05-09",
      sobre_mi: "Metroidvanias y soulslikes. Si tiene jefes difíciles, me interesa.",
      jugando_ahora: "hollow-knight",
      estado: "jugando",
      favoritos: [
        "hollow-knight",
        "elden-ring",
        "hades--1",
        "inside"
      ],
      insignias: [],
      color: "#2B3A55",
      id: "d4ni",
      notas: {"hollow-knight": 10, "elden-ring": 10, "hades--1": 9, "the-legend-of-zelda-tears-of-the-kingdom": 8},
      ultima_conexion: null,
      amigos_en_comun: 0
    },
    {
      usuario: "mlopez",
      nombre: "María López",
      iniciales: "ML",
      nivel: 9,
      miembro_desde: "2025-01-15",
      sobre_mi: "Aventuras tranquilas después del trabajo.",
      jugando_ahora: null,
      estado: "en-linea",
      favoritos: [
        "the-legend-of-zelda-tears-of-the-kingdom",
        "pokemon-legends-z-a",
        "inside",
        "ghost-of-tsushima"
      ],
      insignias: [],
      color: "#2F6B4F",
      id: "mlopez",
      notas: {"the-legend-of-zelda-tears-of-the-kingdom": 8, "pokemon-legends-z-a": 9, "inside": 9},
      ultima_conexion: null,
      amigos_en_comun: 0
    },
    {
      usuario: "lau_plays",
      nombre: "Laura Peña",
      iniciales: "LP",
      nivel: 11,
      miembro_desde: "2024-09-01",
      sobre_mi: "Indies cortos y juegos de terror con buena historia.",
      jugando_ahora: null,
      estado: "en-linea",
      favoritos: [
        "inside",
        "five-nights-at-freddys-into-the-pit",
        "hades-ii",
        "hollow-knight"
      ],
      insignias: [],
      color: "#3A3F45",
      id: "lau_plays",
      notas: {"inside": 9, "five-nights-at-freddys-into-the-pit": 8, "hollow-knight": 9},
      ultima_conexion: null,
      amigos_en_comun: 0
    },
    {
      usuario: "valer1a",
      nombre: "Valeria Ríos",
      iniciales: "VR",
      nivel: 14,
      miembro_desde: "2024-04-22",
      sobre_mi: "Completista. Si tiene 100 %, lo saco.",
      jugando_ahora: null,
      estado: "desconectado",
      favoritos: [
        "the-legend-of-zelda-tears-of-the-kingdom",
        "ghost-of-tsushima",
        "pokemon-legends-z-a",
        "hades--1"
      ],
      insignias: [],
      color: "#7A2E2E",
      id: "valer1a",
      notas: {"the-legend-of-zelda-tears-of-the-kingdom": 9, "ghost-of-tsushima": 10, "hades--1": 8},
      ultima_conexion: "hace 2 h",
      amigos_en_comun: 0
    },
    {
      usuario: "nico.gg",
      nombre: "Nicolás Gómez",
      iniciales: "NG",
      nivel: 7,
      miembro_desde: "2025-06-30",
      sobre_mi: "Shooters con amigos los viernes.",
      jugando_ahora: null,
      estado: "desconectado",
      favoritos: [
        "valorant",
        "rocket-league",
        "elden-ring",
        "hades--1"
      ],
      insignias: [],
      color: "#5B3F96",
      id: "nico.gg",
      notas: {"valorant": 8, "rocket-league": 7},
      ultima_conexion: "hace 1 día",
      amigos_en_comun: 0
    },
    {
      usuario: "tatan",
      nombre: "Sebastián Cruz",
      iniciales: "SC",
      nivel: 6,
      miembro_desde: "2025-08-12",
      sobre_mi: "Nuevo en SaveSlot. Busco gente para Rocket League.",
      jugando_ahora: null,
      estado: "en-linea",
      favoritos: [
        "rocket-league",
        "pokemon-legends-z-a",
        "the-legend-of-zelda-tears-of-the-kingdom",
        "hades--1"
      ],
      insignias: [],
      color: "#2456C4",
      id: "tatan",
      notas: {"rocket-league": 8, "the-legend-of-zelda-tears-of-the-kingdom": 10},
      ultima_conexion: null,
      amigos_en_comun: 2
    },
    {
      usuario: "cami.rpg",
      nombre: "Camila Torres",
      iniciales: "CT",
      nivel: 13,
      miembro_desde: "2024-12-03",
      sobre_mi: "RPGs largos y diarios de juego muy detallados.",
      jugando_ahora: null,
      estado: "desconectado",
      favoritos: [
        "nier-automata",
        "pokemon-legends-z-a",
        "elden-ring",
        "the-legend-of-zelda-tears-of-the-kingdom"
      ],
      insignias: [],
      color: "#B8343E",
      id: "cami.rpg",
      notas: {"nier-automata": 10, "elden-ring": 9},
      ultima_conexion: "hace 3 h",
      amigos_en_comun: 3
    },
    {
      usuario: "feli_fps",
      nombre: "Felipe Ruiz",
      iniciales: "FR",
      nivel: 10,
      miembro_desde: "2025-03-18",
      sobre_mi: "Torneos de la universidad.",
      jugando_ahora: null,
      estado: "en-linea",
      favoritos: [
        "valorant",
        "rocket-league",
        "ghost-of-tsushima",
        "hades--1"
      ],
      insignias: [],
      color: "#5B3F96",
      id: "feli_fps",
      notas: {"valorant": 9, "rocket-league": 8},
      ultima_conexion: null,
      amigos_en_comun: 4
    },
    {
      usuario: "ana.indie",
      nombre: "Ana Moreno",
      iniciales: "AM",
      nivel: 8,
      miembro_desde: "2025-02-10",
      sobre_mi: "Indies, pixel art y bandas sonoras.",
      jugando_ahora: null,
      estado: "desconectado",
      favoritos: [
        "hollow-knight",
        "inside",
        "hades--1",
        "hades-ii"
      ],
      insignias: [],
      color: "#5A2D6B",
      id: "ana.indie",
      notas: {"hollow-knight": 9, "inside": 10, "hades--1": 9},
      ultima_conexion: "hace 5 h",
      amigos_en_comun: 2
    },
    {
      usuario: "andresh",
      nombre: "andresh",
      iniciales: "AH",
      nivel: null,
      miembro_desde: null,
      sobre_mi: null,
      jugando_ahora: null,
      estado: null,
      favoritos: [],
      insignias: [],
      color: null,
      id: "andresh"
    }
  ],
  amigos: [
    {
      id: "a1",
      usuario: "samluq",
      amigo: "kenvel",
      estado: "amigos",
      fecha: null
    },
    {
      id: "a2",
      usuario: "samluq",
      amigo: "juanvi",
      estado: "amigos",
      fecha: null
    },
    {
      id: "a3",
      usuario: "samluq",
      amigo: "d4ni",
      estado: "amigos",
      fecha: null
    },
    {
      id: "a4",
      usuario: "samluq",
      amigo: "mlopez",
      estado: "amigos",
      fecha: null
    },
    {
      id: "a5",
      usuario: "samluq",
      amigo: "lau_plays",
      estado: "amigos",
      fecha: null
    },
    {
      id: "a6",
      usuario: "samluq",
      amigo: "valer1a",
      estado: "amigos",
      fecha: null
    },
    {
      id: "a7",
      usuario: "samluq",
      amigo: "nico.gg",
      estado: "amigos",
      fecha: null
    },
    {
      id: "a8",
      usuario: "samluq",
      amigo: "tatan",
      estado: "solicitud recibida",
      fecha: null
    },
    {
      id: "a9",
      usuario: "samluq",
      amigo: "cami.rpg",
      estado: "solicitud recibida",
      fecha: null
    }
  ],
  eventos: [
    {
      id: "copa-2v2",
      tipo: "torneo",
      juego_igdb: 11198,
      titulo: "Copa SaveSlot de Rocket League 2v2",
      fecha_hora: "Sáb 17 oct · 3:00 p. m.",
      organizador: "[MARCA] + [ORGANIZADOR]",
      tipo_organizador: "Marcas y organizadores",
      cupos_ocupados: 41,
      cupos_maximos: 64,
      costo: "[VALOR]",
      gratis: false,
      premio: "[PREMIO]",
      descripcion: "Torneo abierto para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.",
      cronograma: [
        {
          paso: "Inscripciones",
          cuando: "hasta el día anterior, 11:59 p. m."
        },
        {
          paso: "Check-in",
          cuando: "30 minutos antes"
        },
        {
          paso: "Llaves",
          cuando: "a la hora del evento"
        },
        {
          paso: "Final transmitida",
          cuando: "en el canal del organizador"
        }
      ],
      reglas: [
        "Todos los jugadores deben tener su cuenta de juego vinculada en SaveSlot.",
        "Si no haces check-in, pierdes el cupo y se reembolsa la inscripción.",
        "El organizador puede cambiar la hora avisando con 24 h."
      ],
      color: "#1F4A8A",
      destacado: true
    },
    {
      id: "rl-oficial",
      tipo: "torneo",
      juego_igdb: 11198,
      titulo: "Torneo oficial 3v3 cada [X] horas",
      fecha_hora: "Hoy · próximo a las [HORA]",
      organizador: "Oficial · Psyonix (desarrolladora)",
      tipo_organizador: "Desarrolladoras oficiales",
      cupos_ocupados: null,
      cupos_maximos: null,
      costo: "Gratis",
      gratis: true,
      premio: "[PREMIO]",
      descripcion: "Torneo abierto para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.",
      cronograma: [
        {
          paso: "Inscripciones",
          cuando: "hasta el día anterior, 11:59 p. m."
        },
        {
          paso: "Check-in",
          cuando: "30 minutos antes"
        },
        {
          paso: "Llaves",
          cuando: "a la hora del evento"
        },
        {
          paso: "Final transmitida",
          cuando: "en el canal del organizador"
        }
      ],
      reglas: [
        "Todos los jugadores deben tener su cuenta de juego vinculada en SaveSlot.",
        "Si no haces check-in, pierdes el cupo y se reembolsa la inscripción.",
        "El organizador puede cambiar la hora avisando con 24 h."
      ],
      color: "#2456C4",
      destacado: false
    },
    {
      id: "liga-valorant",
      tipo: "torneo",
      juego_igdb: 126459,
      titulo: "Liga universitaria Bogotá",
      fecha_hora: "Sáb 24 oct · 10:00 a. m.",
      organizador: "[MARCA] + [ORGANIZADOR]",
      tipo_organizador: "Marcas y organizadores",
      cupos_ocupados: 12,
      cupos_maximos: 32,
      costo: "[VALOR]",
      gratis: false,
      premio: "[PREMIO]",
      descripcion: "Torneo abierto para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.",
      cronograma: [
        {
          paso: "Inscripciones",
          cuando: "hasta el día anterior, 11:59 p. m."
        },
        {
          paso: "Check-in",
          cuando: "30 minutos antes"
        },
        {
          paso: "Llaves",
          cuando: "a la hora del evento"
        },
        {
          paso: "Final transmitida",
          cuando: "en el canal del organizador"
        }
      ],
      reglas: [
        "Todos los jugadores deben tener su cuenta de juego vinculada en SaveSlot.",
        "Si no haces check-in, pierdes el cupo y se reembolsa la inscripción.",
        "El organizador puede cambiar la hora avisando con 24 h."
      ],
      color: "#5B3F96",
      destacado: false
    },
    {
      id: "giftcard-50",
      tipo: "sorteo",
      juego_igdb: null,
      titulo: "Gift card de 50 USD para tu tienda favorita",
      fecha_hora: "Cierra el domingo · 8:00 p. m.",
      organizador: "SaveSlot",
      tipo_organizador: "SaveSlot",
      cupos_ocupados: 1284,
      cupos_maximos: null,
      costo: "300 XP o [VALOR]",
      gratis: true,
      premio: "El indicado",
      descripcion: "El ganador se elige al azar al cierre y se anuncia aquí y por correo. Tiene 7 días para reclamar el premio.",
      cronograma: [],
      reglas: [
        "Una participación gratis y una de pago por persona.",
        "Sin suscripción ni cargos recurrentes.",
        "El organizador puede cambiar la hora avisando con 24 h."
      ],
      color: "#2B5A3F",
      destacado: false
    },
    {
      id: "speedrun-fnaf",
      tipo: "torneo",
      juego_igdb: 283679,
      titulo: "Speedrun de Halloween",
      fecha_hora: "Vie 30 oct · 6:00 p. m.",
      organizador: "[ORGANIZADOR] (independiente)",
      tipo_organizador: "Marcas y organizadores",
      cupos_ocupados: 58,
      cupos_maximos: 100,
      costo: "Gratis",
      gratis: true,
      premio: "[PREMIO]",
      descripcion: "Torneo abierto para cualquier rango. Las partidas se juegan en servidores de Sudamérica y los resultados se reportan aquí mismo.",
      cronograma: [
        {
          paso: "Inscripciones",
          cuando: "hasta el día anterior, 11:59 p. m."
        },
        {
          paso: "Check-in",
          cuando: "30 minutos antes"
        },
        {
          paso: "Llaves",
          cuando: "a la hora del evento"
        },
        {
          paso: "Final transmitida",
          cuando: "en el canal del organizador"
        }
      ],
      reglas: [
        "Todos los jugadores deben tener su cuenta de juego vinculada en SaveSlot.",
        "Si no haces check-in, pierdes el cupo y se reembolsa la inscripción.",
        "El organizador puede cambiar la hora avisando con 24 h."
      ],
      color: "#6B3A1E",
      destacado: false
    },
    {
      id: "codigo-pokemon",
      tipo: "sorteo",
      juego_igdb: 288327,
      titulo: "Código de descarga de Pokémon Legends Z-A",
      fecha_hora: "Cierra el 31 oct",
      organizador: "[MARCA]",
      tipo_organizador: "Marcas y organizadores",
      cupos_ocupados: 3020,
      cupos_maximos: null,
      costo: "300 XP",
      gratis: true,
      premio: "El indicado",
      descripcion: "El ganador se elige al azar al cierre y se anuncia aquí y por correo. Tiene 7 días para reclamar el premio.",
      cronograma: [],
      reglas: [
        "Una participación gratis y una de pago por persona.",
        "Sin suscripción ni cargos recurrentes.",
        "El organizador puede cambiar la hora avisando con 24 h."
      ],
      color: "#B8343E",
      destacado: false
    }
  ],
  notificaciones: [
    {
      id: "n1",
      usuario: "samluq",
      tipo: "voto-util",
      texto: "Tu reseña de NieR: Automata recibió 12 votos de “útil”.",
      enlace: "historial-resenas.html",
      fecha: "2026-10-08"
    },
    {
      id: "n2",
      usuario: "samluq",
      tipo: "cierre-inscripciones",
      texto: "La Copa SaveSlot 2v2 cierra inscripciones el viernes.",
      enlace: "detalle-evento.html?id=copa-2v2",
      fecha: "2026-10-07"
    }
  ],
  destacados_inicio: [
    {
      id: "d1",
      juego_igdb: 119388
    },
    {
      id: "d2",
      juego_igdb: 113112
    },
    {
      id: "d3",
      juego_igdb: 14593
    }
  ],
  logros: [
    {
      id: "l1",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      nombre: "Primer santuario",
      descripcion: "Completa tu primer santuario",
      porcentaje: 92,
      obtenido: true,
      plataforma: null
    },
    {
      id: "l2",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      nombre: "Explorador del cielo",
      descripcion: "Visita todas las islas del cielo",
      porcentaje: 14,
      obtenido: true,
      plataforma: null
    },
    {
      id: "l3",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      nombre: "Maestro Zonai",
      descripcion: "Fusiona 50 dispositivos distintos",
      porcentaje: 8,
      obtenido: false,
      plataforma: null
    },
    {
      id: "l4",
      juego: "five-nights-at-freddys-into-the-pit",
      nombre: "Sin un rasguño",
      descripcion: "Termina sin recibir daño",
      porcentaje: 3.1,
      obtenido: true,
      plataforma: null
    },
    {
      id: "l5",
      juego: "nier-automata",
      nombre: "Final E",
      descripcion: "Llega al final verdadero",
      porcentaje: 22,
      obtenido: true,
      plataforma: null
    }
  ],
  tendencias_matchplay: [
    {
      id: "t1",
      etiqueta: "En tendencia · Rocket League",
      pregunta: "¿Cada cuánto hay torneos en Rocket League?",
      preguntas_hoy: 2100
    },
    {
      id: "t2",
      etiqueta: "Lanzamientos",
      pregunta: "¿Qué juegos nuevos salen esta semana?",
      preguntas_hoy: 1600
    },
    {
      id: "t3",
      etiqueta: "En tendencia · Pokémon Legends Z-A",
      pregunta: "¿Qué hago primero en Pokémon Legends Z-A?",
      preguntas_hoy: 1200
    },
    {
      id: "t4",
      etiqueta: "Guía",
      pregunta: "¿Cuánto dura Hollow Knight al 100%?",
      preguntas_hoy: 860
    }
  ],
  chats_matchplay: [
    {
      id: "c1",
      usuario: "samluq",
      titulo: "Juegos parecidos a NieR",
      horas_atras: 2,
      mensajes: [
        {
          quien: "usuario",
          texto: "Terminé NieR: Automata y quiero algo parecido. Tengo unas 30 horas este mes."
        },
        {
          quien: "ia",
          texto: "Si te gustó NieR: Automata, prueba Hades (≈22 h), Hollow Knight (≈27 h) o Ghost of Tsushima (≈25 h). Si eliges uno, empieza por Hades."
        }
      ]
    },
    {
      id: "c2",
      usuario: "samluq",
      titulo: "Orden de regiones en TOTK",
      horas_atras: 72,
      mensajes: [
        {
          quien: "usuario",
          texto: "¿En qué orden hago las regiones de Zelda: TOTK?"
        },
        {
          quien: "ia",
          texto: "La comunidad recomienda: Rito, Zora, Goron y Gerudo. Antes de Gerudo conviene tener al menos 8 corazones."
        }
      ]
    },
    {
      id: "c3",
      usuario: "samluq",
      titulo: "Terror corto para el finde",
      horas_atras: 288,
      mensajes: [
        {
          quien: "usuario",
          texto: "Un juego de terror corto para el fin de semana."
        },
        {
          quien: "ia",
          texto: "Inside (≈3 h) o FNAF: Into the Pit (≈6 h)."
        }
      ]
    }
  ],
  respuestas_matchplay: [
    {
      id: "ia1",
      palabras: [
        "rocket"
      ],
      texto: "Los torneos oficiales de Rocket League se juegan varias veces al día desde el menú del juego. En SaveSlot tienes además la Copa 2v2 del sábado: revisa los cupos en Eventos."
    },
    {
      id: "ia2",
      palabras: [
        "hollow",
        "dura"
      ],
      texto: "Hollow Knight: unas 27 h la historia principal y unas 60 h al 100%, según los votos de la comunidad."
    },
    {
      id: "ia3",
      palabras: [
        "pokémon",
        "pokemon"
      ],
      texto: "En Pokémon Legends Z-A conviene completar las misiones secundarias temprano: dan dinero y objetos de evolución."
    },
    {
      id: "ia4",
      palabras: [
        "nier",
        "parecido"
      ],
      texto: "Si te gustó NieR: Automata, prueba Hades (≈22 h), Hollow Knight (≈27 h) o Ghost of Tsushima (≈25 h). Si eliges uno, empieza por Hades."
    },
    {
      id: "ia5",
      palabras: [
        "corto",
        "finde",
        "terror"
      ],
      texto: "Para un fin de semana: Inside (≈3 h) o FNAF: Into the Pit (≈6 h). Los dos dan miedo sin depender de sustos baratos."
    },
    {
      id: "ia6",
      palabras: [
        "nuevo",
        "salen",
        "lanzamiento"
      ],
      texto: "Cuando conectemos el catálogo de juegos te mostraré los lanzamientos de la semana en tus plataformas. Por ahora puedes ver los mejores juegos de la semana en Inicio."
    },
    {
      id: "ia7",
      palabras: [],
      texto: "Buena pregunta. En modo demo respondo con ejemplos; cuando MatchPlay esté conectado a la IA revisaré tu biblioteca y las reseñas para darte una respuesta completa."
    }
  ],
  diario: [
    {
      id: "dia1",
      usuario: "samluq",
      juego_igdb: 119388,
      fecha: "2026-10-07",
      estado: "Terminado",
      horas: 48,
      calificacion: 10,
      me_gusta: true,
      tiene_resena: true
    },
    {
      id: "dia2",
      usuario: "samluq",
      juego_igdb: 283679,
      fecha: "2026-10-04",
      estado: "Terminado",
      horas: 6,
      calificacion: 7,
      me_gusta: false,
      tiene_resena: true
    },
    {
      id: "dia3",
      usuario: "samluq",
      juego_igdb: 11208,
      fecha: "2026-10-02",
      estado: "Rejugado",
      horas: 21,
      calificacion: 9,
      me_gusta: true,
      tiene_resena: true
    },
    {
      id: "dia4",
      usuario: "samluq",
      juego_igdb: 113112,
      fecha: "2026-09-27",
      estado: "Terminado",
      horas: 24,
      calificacion: 8,
      me_gusta: false,
      tiene_resena: false
    },
    {
      id: "dia5",
      usuario: "samluq",
      juego_igdb: 126459,
      fecha: "2026-09-19",
      estado: "Abandonado",
      horas: 9,
      calificacion: 5,
      me_gusta: false,
      tiene_resena: true
    },
    {
      id: "dia6",
      usuario: "samluq",
      juego_igdb: 288327,
      fecha: "2026-09-08",
      estado: "Terminado",
      horas: 31,
      calificacion: 8,
      me_gusta: true,
      tiene_resena: false
    },
    {
      id: "dia7",
      usuario: "samluq",
      juego_igdb: 7342,
      fecha: "2026-08-30",
      estado: "Terminado",
      horas: 3,
      calificacion: 9,
      me_gusta: true,
      tiene_resena: false
    },
    {
      id: "dia8",
      usuario: "samluq",
      juego_igdb: 14593,
      fecha: "2026-08-12",
      estado: "Rejugado",
      horas: 27,
      calificacion: 9,
      me_gusta: true,
      tiene_resena: true
    }
  ],
  progreso_logros: [
    {
      id: "p1",
      usuario: "samluq",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      obtenidos: 86,
      totales: 139,
      plataforma: "Nintendo"
    },
    {
      id: "p2",
      usuario: "samluq",
      juego: "five-nights-at-freddys-into-the-pit",
      obtenidos: 24,
      totales: 24,
      plataforma: "Steam"
    },
    {
      id: "p3",
      usuario: "samluq",
      juego: "nier-automata",
      obtenidos: 17,
      totales: 50,
      plataforma: "Steam"
    },
    {
      id: "p4",
      usuario: "samluq",
      juego: "rocket-league",
      obtenidos: 16,
      totales: 88,
      plataforma: "Steam"
    },
    {
      id: "p5",
      usuario: "samluq",
      juego: "hollow-knight",
      obtenidos: 41,
      totales: 63,
      plataforma: "Steam"
    }
  ],
  resumen_logros: [
    {
      id: "rl1",
      usuario: "samluq",
      desbloqueados: 1912,
      promedio: 38,
      juegos_completos: 7,
      raros: 24
    }
  ],

  /* ---------- Fijos de la app: listas que antes estaban escritas en el HTML ---------- */
  // Géneros que entiende IGDB (api/igdb.js). en_buscar: aparecen en los filtros de Buscar, en este orden;
  // Juego random usa todos, en orden alfabético.
  generos: [
    { id: "aventura", nombre: "Aventura", en_buscar: true },
    { id: "rpg", nombre: "RPG", en_buscar: true },
    { id: "accion", nombre: "Acción", en_buscar: true },
    { id: "terror", nombre: "Terror", en_buscar: true },
    { id: "shooter", nombre: "Shooter", en_buscar: true },
    { id: "deportes", nombre: "Deportes", en_buscar: true },
    { id: "roguelike", nombre: "Roguelike", en_buscar: true },
    { id: "carreras", nombre: "Carreras", en_buscar: false },
    { id: "estrategia", nombre: "Estrategia", en_buscar: false },
    { id: "metroidvania", nombre: "Metroidvania", en_buscar: false },
    { id: "pelea", nombre: "Pelea", en_buscar: false },
    { id: "plataformas", nombre: "Plataformas", en_buscar: false },
    { id: "puzzle", nombre: "Puzzle", en_buscar: false },
    { id: "simulacion", nombre: "Simulación", en_buscar: false },
    { id: "supervivencia", nombre: "Supervivencia", en_buscar: false }
  ],
  // Plataformas de los juegos (filtro de Buscar; api/igdb.js usa los mismos nombres)
  plataformas: [
    { id: "pc", nombre: "PC" },
    { id: "playstation", nombre: "PlayStation" },
    { id: "xbox", nombre: "Xbox" },
    { id: "nintendo", nombre: "Nintendo" }
  ],
  // Cuentas de juego que se pueden vincular (Editar perfil). Steam es real (api/steam);
  // Xbox, simulado; PlayStation y Nintendo no tienen conexión pública.
  cuentas: [
    { id: "steam", nombre: "Steam", nota: "Se conecta con tu cuenta de Steam", vincula: true },
    { id: "playstation", nombre: "PlayStation", nota: "No tiene conexión pública: registra tus juegos a mano", vincula: false },
    { id: "xbox", nombre: "Xbox", nota: "Se conecta mediante OpenXBL (servicio de terceros)", vincula: true },
    { id: "nintendo", nombre: "Nintendo", nota: "No tiene conexión pública: registra tus juegos a mano", vincula: false }
  ],
  // Estado de una partida (Escribir reseña y Diario), con el color de su etiqueta
  estados_partida: [
    { id: "terminado", nombre: "Terminado", etiqueta: "etiqueta--exito" },
    { id: "rejugado", nombre: "Rejugado", etiqueta: "etiqueta--primario" },
    { id: "en-progreso", nombre: "En progreso", etiqueta: "etiqueta--contorno" },
    { id: "abandonado", nombre: "Abandonado", etiqueta: "etiqueta--error" }
  ],
  // Temas de Contáctanos (el id es el que va en la dirección: contacto.html?tema=torneo)
  temas_contacto: [
    { id: "cuenta", nombre: "Problema con mi cuenta" },
    { id: "eventos", nombre: "Eventos y pagos" },
    { id: "torneo", nombre: "Quiero organizar un torneo" },
    { id: "reporte", nombre: "Reportar contenido" },
    { id: "otro", nombre: "Otro" }
  ],
  // Preguntas frecuentes de Contáctanos
  preguntas_frecuentes: [
    { id: "vincular", pregunta: "¿Por qué no puedo vincular PlayStation o Nintendo?", respuesta: "No ofrecen una conexión pública para webs como SaveSlot. Puedes registrar tus juegos a mano en tu diario." },
    { id: "xp", pregunta: "¿Qué es el XP?", respuesta: "Son puntos que ganas al reseñar, vincular cuentas e inscribirte en torneos. Con 300 XP entras gratis a un sorteo." },
    { id: "datos", pregunta: "¿Dónde se guardan mis datos?", respuesta: "En este prototipo, solo en tu navegador. Si borras los datos del navegador, se borra tu actividad." },
    { id: "dificultad", pregunta: "¿Cómo se calcula la dificultad de un juego?", respuesta: "Es el promedio de lo que votan los jugadores al reseñarlo, de 1 (relajado) a 10 (brutal)." },
    { id: "torneo", pregunta: "¿Cómo propongo un torneo?", respuesta: "Escríbenos con el tema “Quiero organizar un torneo” y te contamos los requisitos." }
  ],
  // Atajos de Inicio, bajo el buscador (enlace desde la raíz del sitio)
  atajos_inicio: [
    { id: "random", texto: "Juego random por género", enlace: "pages/juego-random.html" },
    { id: "corto", texto: "Recomiéndame algo corto", enlace: "pages/matchplay.html?q=Recomi%C3%A9ndame%20algo%20corto%20para%20el%20finde" },
    { id: "torneos", texto: "Torneos de esta semana", enlace: "pages/eventos.html" }
  ],
  // Ideas para empezar a escribirle a MatchPlay: el chip muestra "texto" y escribe "idea" en el campo
  ideas_matchplay: [
    { id: "parecido", texto: "Parecido a…", idea: "Recomiéndame un juego parecido a " },
    { id: "duracion", texto: "¿Cuánto dura…?", idea: "¿Cuánto dura " },
    { id: "corto", texto: "Algo corto", idea: "Tengo poco tiempo, ¿qué juego corto de terror me recomiendas?" },
    { id: "logro", texto: "Ayuda con un logro", idea: "¿Cómo consigo el logro " }
  ],
  // Reglas de Eventos ("enlace" y "texto_enlace" son opcionales; el enlace va desde la raíz del sitio)
  reglas_eventos: [
    { id: "organiza", texto: "Cada evento muestra quién lo organiza y quién lo patrocina." },
    { id: "costo", texto: "El costo total se muestra antes de pagar. No hay suscripciones ni cargos recurrentes." },
    { id: "sorteos", texto: "Los sorteos tienen siempre una forma gratuita de participar con XP." },
    { id: "proponer", texto: "¿Organizas torneos? ", enlace: "pages/contacto.html?tema=torneo", texto_enlace: "Propón un evento" }
  ],
  // Quién organiza un evento (filtro de Eventos; cada evento lo tiene en tipo_organizador)
  organizadores: [
    { id: "marcas", nombre: "Marcas y organizadores" },
    { id: "desarrolladoras", nombre: "Desarrolladoras oficiales" },
    { id: "saveslot", nombre: "SaveSlot" }
  ],
  variantes_error: [
    {
      id: "no-encontrado",
      codigo: "404",
      titulo: "No encontramos esta página",
      texto: "La dirección que abriste no existe o cambió de lugar.",
      consejos: [
        "Revisa que la dirección esté bien escrita.",
        "Vuelve al inicio o busca el juego que querías ver."
      ],
      reintentar: false,
      accion: {
        texto: "Buscar juegos",
        pagina: "buscar-juegos.html"
      }
    },
    {
      id: "juego",
      codigo: "404",
      titulo: "No encontramos ese juego",
      texto: "El juego que buscas no está en el catálogo o la dirección está incompleta.",
      consejos: [
        "Búscalo por su nombre en Buscar juegos.",
        "Si llegaste desde un enlace, puede que esté roto: avísanos."
      ],
      reintentar: false,
      accion: {
        texto: "Buscar juegos",
        pagina: "buscar-juegos.html"
      }
    },
    {
      id: "evento",
      codigo: "404",
      titulo: "No encontramos ese evento",
      texto: "El evento ya terminó, se canceló o la dirección está incompleta.",
      consejos: [
        "Mira los eventos que siguen abiertos."
      ],
      reintentar: false,
      accion: {
        texto: "Ver eventos",
        pagina: "eventos.html"
      }
    },
    {
      id: "resena",
      codigo: "404",
      titulo: "No encontramos esa reseña",
      texto: "La reseña fue eliminada por su autor o la dirección está incompleta.",
      consejos: [
        "Lee otras reseñas en la Comunidad."
      ],
      reintentar: false,
      accion: {
        texto: "Ir a la Comunidad",
        pagina: "comunidad.html"
      }
    },
    {
      id: "usuario",
      codigo: "404",
      titulo: "No encontramos a esa persona",
      texto: "El usuario no existe o cambió su nombre de usuario.",
      consejos: [
        "Búscalo en Amigos por su @usuario."
      ],
      reintentar: false,
      accion: {
        texto: "Ir a Amigos",
        pagina: "amigos.html"
      }
    },
    {
      id: "api",
      codigo: "API-500",
      titulo: "{servicio} no está respondiendo",
      texto: "Intentamos traer la información pero el servicio externo no respondió como esperábamos. Suele ser algo temporal.",
      consejos: [
        "Vuelve a intentarlo en unos segundos.",
        "Si sigue fallando, revisa el estado de los servicios abajo.",
        "Mientras tanto puedes usar la búsqueda con los datos guardados."
      ],
      reintentar: true
    },
    {
      id: "limite",
      codigo: "API-429",
      titulo: "Llegamos al límite de consultas",
      texto: "Las APIs gratuitas que usa SaveSlot tienen un cupo de consultas por minuto, hora o día. {servicio} nos pidió esperar antes de seguir.",
      consejos: [
        "Espera un momento: el botón “Reintentar” se activa solo.",
        "Las páginas que ya visitaste se cargan más rápido.",
        "Si pasa seguido, avísanos desde Contáctanos."
      ],
      reintentar: true,
      espera: 60
    },
    {
      id: "tiempo",
      codigo: "API-408",
      titulo: "La respuesta tardó demasiado",
      texto: "{servicio} tardó más de 15 segundos en responder, así que dejamos de esperar.",
      consejos: [
        "Revisa tu conexión.",
        "Vuelve a intentarlo."
      ],
      reintentar: true
    },
    {
      id: "credenciales",
      codigo: "API-401",
      titulo: "No pudimos conectarnos con {servicio}",
      texto: "La clave de acceso de SaveSlot para este servicio no es válida o venció.",
      consejos: [
        "No es un problema de tu cuenta.",
        "El equipo debe renovar la clave del servicio."
      ],
      reintentar: false
    },
    {
      id: "mantenimiento",
      codigo: "API-503",
      titulo: "{servicio} está en mantenimiento",
      texto: "El servicio avisó que está en mantenimiento. Volverá a funcionar cuando termine.",
      consejos: [
        "Intenta de nuevo más tarde."
      ],
      reintentar: true
    },
    {
      id: "sin-conexion",
      codigo: "NET-0",
      titulo: "No hay conexión a internet",
      texto: "Tu dispositivo está sin conexión, así que no podemos cargar información nueva.",
      consejos: [
        "Revisa el wifi o los datos móviles.",
        "Cuando vuelva la conexión, pulsa “Reintentar”."
      ],
      reintentar: true
    },
    {
      id: "acceso",
      codigo: "AUTH-ERR",
      titulo: "No pudimos entrar con {servicio}",
      texto: "{servicio} no respondió o el inicio de sesión se canceló. Tu cuenta está bien: no se cambió nada.",
      consejos: [
        "Vuelve a intentarlo: a veces el servicio tarda o la ventana se cerró antes de tiempo.",
        "Revisa que tu navegador no esté bloqueando las cookies de {servicio}.",
        "Mientras tanto, entra con tu correo, otro servicio o entra como invitado."
      ],
      reintentar: true,
      servicio_por_defecto: "ese servicio",
      accion: {
        texto: "Entrar de otra forma",
        pagina: "iniciar-sesion.html"
      }
    },
    {
      id: "demo",
      codigo: "DEMO",
      titulo: "Estás viendo el prototipo de SaveSlot",
      texto: "Ya son reales: el catálogo de juegos (IGDB), las cuentas (correo, Google, Discord, Twitch y Steam) y todo lo de Steam: biblioteca, logros, lista de deseos con aviso de ofertas, juegos recientes, reseñas y precios. Perfiles, reseñas, eventos y misiones se leen de la base de datos, pero muchos son de ejemplo. MatchPlay (IA) responde con ejemplos, y lo que haces (reseñar, tu diario, inscripciones y chats) todavía se guarda solo en este navegador.",
      consejos: [
        "Entra con tu correo, Google, Discord, Twitch o Steam; en Editar perfil puedes unirlos en una sola cuenta.",
        "Vincula Steam para ver tu biblioteca, tus logros y tu lista de deseos reales.",
        "Borrar los datos del navegador borra tu actividad que todavía no está en la base."
      ],
      reintentar: false,
      accion: {
        texto: "Explorar juegos",
        pagina: "buscar-juegos.html"
      }
    },
    {
      id: "estado",
      codigo: "STATUS",
      titulo: "Estado de los servicios",
      texto: "Qué partes de SaveSlot están conectadas a servicios reales y cuáles funcionan en modo demo. Los servicios conectados se revisan al abrir esta página.",
      consejos: [],
      reintentar: false
    }
  ],
  // prueba: qué revisa 404.html al abrirse (ver revisarServicio en app.js); sin prueba, el estado es fijo
  estado_servicios: [
    { id: "s1", servicio: "Catálogo de juegos", proveedor: "IGDB (Twitch), desde Vercel", estado: "conectado", texto: "Conectado", prueba: "igdb" },
    { id: "s12", servicio: "Lo más jugado, precios, notas y reseñas de Steam (se actualiza cada día)", proveedor: "Steam (tienda y comunidad) + Supabase", estado: "conectado", texto: "Conectado", prueba: "steam" },
    { id: "s2", servicio: "Base de datos (perfiles, reseñas, eventos, misiones)", proveedor: "Supabase", estado: "conectado", texto: "Conectado", prueba: "base" },
    { id: "s8", servicio: "Cuentas: correo, Google, Discord, Twitch y Steam", proveedor: "Supabase Auth + Steam OpenID", estado: "conectado", texto: "Conectado", prueba: "cuentas" },
    { id: "s4", servicio: "Tu Steam: perfil, biblioteca, logros, deseos y reseñas", proveedor: "Steam Web API (Vercel)", estado: "conectado", texto: "Conectado" },
    { id: "s13", servicio: "Tu actividad: reseñar, diario, inscripciones, chats y avisos", proveedor: "Este navegador", estado: "demo", texto: "Modo demo" },
    { id: "s3", servicio: "MatchPlay (IA)", proveedor: "Por definir", estado: "demo", texto: "Modo demo" },
    { id: "s5", servicio: "Cuentas: Xbox", proveedor: "OpenXBL (tercero)", estado: "pendiente", texto: "Sin clave" },
    { id: "s6", servicio: "Cuentas: PlayStation", proveedor: "—", estado: "no-disponible", texto: "Sin API" },
    { id: "s7", servicio: "Cuentas: Nintendo", proveedor: "—", estado: "no-disponible", texto: "Sin API" },
    { id: "s9", servicio: "Clips y transmisiones", proveedor: "Twitch API", estado: "pendiente", texto: "Pendiente" },
    { id: "s10", servicio: "Pagos de eventos", proveedor: "Pasarela de pagos", estado: "no-disponible", texto: "No disponible" }
  ]
};

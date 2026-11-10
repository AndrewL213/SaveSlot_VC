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
      idIgdb: 119388,
      nombre: "The Legend of Zelda: Tears of the Kingdom",
      nombreCorto: "Zelda: TOTK",
      generos: [
        "Aventura"
      ],
      plataformas: [
        "Nintendo"
      ],
      anio: 2023,
      desarrolladora: "Nintendo EPD",
      tipo: "AAA",
      horasHistoria: 60,
      horas100: 220,
      dificultad: 6,
      calificacion: 9.6,
      votos: 12430,
      logrosTotales: 139,
      descripcion: "Mundo abierto enorme donde cada puzzle tiene varias soluciones gracias a Ultramano.",
      portada: "assets/portada-zelda-totk.jpg",
      color: "#2F6B4F"
    },
    {
      id: "nier-automata",
      idIgdb: 11208,
      nombre: "NieR: Automata",
      nombreCorto: "NieR: Automata",
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
      horasHistoria: 20,
      horas100: 70,
      dificultad: 6,
      calificacion: 9.4,
      votos: 8120,
      logrosTotales: 50,
      descripcion: "Combate ágil y una historia que cambia por completo con cada final.",
      portada: "assets/portada-nier-automata.jpg",
      color: "#7C7566"
    },
    {
      id: "rocket-league",
      idIgdb: 11198,
      soloOnline: true,
      nombre: "Rocket League",
      nombreCorto: "Rocket League",
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
      horasHistoria: null,
      horas100: null,
      dificultad: 7,
      calificacion: 8.6,
      votos: 9840,
      logrosTotales: 88,
      descripcion: "Fútbol con autos. Partidas de 5 minutos y torneos oficiales varias veces al día.",
      portada: "assets/portada-rocket-league.jpg",
      color: "#2456C4"
    },
    {
      id: "valorant",
      idIgdb: 126459,
      soloOnline: true,
      nombre: "Valorant",
      nombreCorto: "Valorant",
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
      horasHistoria: null,
      horas100: null,
      dificultad: 8,
      calificacion: 8.4,
      votos: 7650,
      logrosTotales: 0,
      descripcion: "Shooter táctico 5v5 con agentes de habilidades únicas.",
      portada: "assets/portada-valorant.jpg",
      color: "#5B3F96"
    },
    {
      id: "pokemon-legends-z-a",
      idIgdb: 288327,
      nombre: "Pokémon Legends Z-A",
      nombreCorto: "Pokémon Legends Z-A",
      generos: [
        "RPG"
      ],
      plataformas: [
        "Nintendo"
      ],
      anio: 2025,
      desarrolladora: "Game Freak",
      tipo: "AAA",
      horasHistoria: 30,
      horas100: 80,
      dificultad: 3,
      calificacion: 8.8,
      votos: 5310,
      logrosTotales: 0,
      descripcion: "Captura y combate en tiempo real dentro de Ciudad Luminalia.",
      portada: "assets/portada-pokemon-legends-za.png",
      color: "#B8343E"
    },
    {
      id: "five-nights-at-freddys-into-the-pit",
      idIgdb: 283679,
      nombre: "Five Nights at Freddy's: Into the Pit",
      nombreCorto: "FNAF: Into the Pit",
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
      horasHistoria: 6,
      horas100: 10,
      dificultad: 5,
      calificacion: 8.2,
      votos: 2140,
      logrosTotales: 24,
      descripcion: "Aventura de terror corta con tensión constante y pocos sustos baratos.",
      portada: "assets/portada-fnaf-into-the-pit.jpg",
      color: "#6B3A1E"
    },
    {
      id: "hollow-knight",
      idIgdb: 14593,
      nombre: "Hollow Knight",
      nombreCorto: "Hollow Knight",
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
      horasHistoria: 27,
      horas100: 60,
      dificultad: 7,
      calificacion: 9.4,
      votos: 9010,
      logrosTotales: 63,
      descripcion: "Metroidvania exigente con un mundo para explorar sin prisa.",
      portada: "assets/portada-hollow-knight.jpg",
      color: "#2B3A55"
    },
    {
      id: "hades--1",
      idIgdb: 113112,
      nombre: "Hades",
      nombreCorto: "Hades",
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
      horasHistoria: 22,
      horas100: 95,
      dificultad: 6,
      calificacion: 9.6,
      votos: 7720,
      logrosTotales: 49,
      descripcion: "Escapa del inframundo partida a partida mientras la historia avanza.",
      portada: "assets/portada-hades.jpg",
      color: "#8A2B2B"
    },
    {
      id: "elden-ring",
      idIgdb: 119133,
      nombre: "Elden Ring",
      nombreCorto: "Elden Ring",
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
      horasHistoria: 55,
      horas100: 130,
      dificultad: 8,
      calificacion: 9.6,
      votos: 11200,
      logrosTotales: 42,
      descripcion: "Mundo abierto oscuro y desafiante con libertad total para explorar.",
      portada: "assets/portada-elden-ring.jpg",
      color: "#3E5A2A"
    },
    {
      id: "ghost-of-tsushima",
      idIgdb: 75235,
      nombre: "Ghost of Tsushima",
      nombreCorto: "Ghost of Tsushima",
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
      horasHistoria: 25,
      horas100: 60,
      dificultad: 5,
      calificacion: 9.4,
      votos: 6400,
      logrosTotales: 52,
      descripcion: "Samurái en mundo abierto con combate preciso y un viento que te guía.",
      portada: "assets/portada-ghost-of-tsushima.jpg",
      color: "#7A2E2E"
    },
    {
      id: "inside",
      idIgdb: 7342,
      nombre: "Inside",
      nombreCorto: "Inside",
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
      horasHistoria: 3,
      horas100: 5,
      dificultad: 4,
      calificacion: 9.2,
      votos: 4300,
      logrosTotales: 14,
      descripcion: "Plataformas oscuro y sin diálogos. Se termina en una tarde.",
      portada: "assets/portada-inside.jpg",
      color: "#3A3F45"
    },
    {
      id: "hades-ii",
      idIgdb: 228525,
      nombre: "Hades II",
      nombreCorto: "Hades II",
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
      horasHistoria: 30,
      horas100: 100,
      dificultad: 6,
      calificacion: 9.4,
      votos: 3100,
      logrosTotales: 50,
      descripcion: "Secuela de Hades con nueva protagonista, Melínoe, y nuevas armas.",
      portada: "assets/portada-hades-ii.jpg",
      color: "#5A2D6B"
    }
  ],
  resenas: [
    {
      id: "r1",
      juego: "nier-automata",
      autor: "kenvel",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "La segunda vuelta no es relleno: cambia todo lo que creías saber. Juégalo completo antes de opinar.",
      calificacion: 9,
      dificultad: 6,
      horas: 42,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 128,
      meGusta: 64,
      fecha: "2026-10-05"
    },
    {
      id: "r2",
      juego: "rocket-league",
      autor: "juanvi",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Fácil de empezar, difícil de dominar. Si llegas a Diamante, revisa la guía de aéreos de la comunidad.",
      calificacion: 8,
      dificultad: 7,
      horas: 300,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 74,
      meGusta: 31,
      fecha: "2026-10-03"
    },
    {
      id: "r3",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      autor: "andresh",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Ultramano cambia cómo resuelves todo. Haz las islas del cielo antes de bajar al subsuelo.",
      calificacion: 10,
      dificultad: 6,
      horas: 48,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 203,
      meGusta: 112,
      fecha: "2026-09-28"
    },
    {
      id: "r4",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      autor: "mlopez",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Enorme y generoso. El rendimiento baja en zonas con muchos efectos, pero nunca me sacó del juego.",
      calificacion: 8,
      dificultad: 5,
      horas: 31,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 88,
      meGusta: 40,
      fecha: "2026-09-21"
    },
    {
      id: "r5",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      autor: "valer1a",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "El final conecta con todo lo que pasó en el cielo. Que la batalla contra Ganondorf sea en caída libre es lo mejor del juego.",
      calificacion: 9,
      dificultad: 7,
      horas: 190,
      minutosLectura: null,
      spoiler: true,
      votosUtil: 61,
      meGusta: 27,
      fecha: "2026-09-15"
    },
    {
      id: "r6",
      juego: "hollow-knight",
      autor: "d4ni",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Cada zona tiene identidad propia. Los jefes opcionales son los mejores del género.",
      calificacion: 10,
      dificultad: 8,
      horas: 60,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 140,
      meGusta: 77,
      fecha: "2026-09-10"
    },
    {
      id: "r7",
      juego: "hades--1",
      autor: "kenvel",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Cada muerte te deja algo: una conversación, una mejora, una pista de la historia. Nunca se siente como perder el tiempo.",
      calificacion: 10,
      dificultad: 6,
      horas: 70,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 96,
      meGusta: 52,
      fecha: "2026-08-30"
    },
    {
      id: "r8",
      juego: "valorant",
      autor: "juanvi",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Muy bueno con amigos, frustrante en solitario. Aprende dos agentes bien antes de probar todos.",
      calificacion: 7,
      dificultad: 8,
      horas: 410,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 58,
      meGusta: 19,
      fecha: "2026-08-22"
    },
    {
      id: "r9",
      juego: "elden-ring",
      autor: "d4ni",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Si un jefe te bloquea, ve a explorar y vuelve más fuerte. El mundo abierto es la mejor ayuda de dificultad.",
      calificacion: 10,
      dificultad: 9,
      horas: 120,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 117,
      meGusta: 66,
      fecha: "2026-08-14"
    },
    {
      id: "r10",
      juego: "inside",
      autor: "lau_plays",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Tres horas que se quedan contigo. Juégalo de noche, con audífonos y sin leer nada antes.",
      calificacion: 9,
      dificultad: 4,
      horas: 4,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 45,
      meGusta: 22,
      fecha: "2026-08-02"
    },
    {
      id: "m1",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Ultramano convierte cada problema en un juguete. Me pasé horas construyendo puentes absurdos y nunca sentí que perdía el tiempo.",
      calificacion: 10,
      dificultad: 6,
      horas: 48,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 34,
      meGusta: 21,
      fecha: "2026-10-07"
    },
    {
      id: "m2",
      juego: "five-nights-at-freddys-into-the-pit",
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Corto y con buena tensión. Los saltos de tiempo están bien pensados, aunque el final se siente apurado.",
      calificacion: 7,
      dificultad: 5,
      horas: 6,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 12,
      meGusta: 6,
      fecha: "2026-10-04"
    },
    {
      id: "m3",
      juego: "nier-automata",
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "En la segunda partida con 9S entiendes por qué la primera era solo la mitad. El final E me hizo llorar con los créditos.",
      calificacion: 9,
      dificultad: 6,
      horas: 21,
      minutosLectura: null,
      spoiler: true,
      votosUtil: 27,
      meGusta: 15,
      fecha: "2026-10-02"
    },
    {
      id: "m4",
      juego: "valorant",
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Técnicamente impecable, pero no es para mí. Demasiado castigo para alguien que juega un rato los fines de semana.",
      calificacion: 5,
      dificultad: 8,
      horas: 9,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 4,
      meGusta: 2,
      fecha: "2026-09-19"
    },
    {
      id: "m5",
      juego: "hollow-knight",
      autor: "samluq",
      tipo: "resena",
      estado: "publicada",
      titulo: null,
      texto: "Volví para sacar los finales que me faltaban. El Panteón es duro, pero cada intento enseña algo.",
      calificacion: 9,
      dificultad: 7,
      horas: 27,
      minutosLectura: null,
      spoiler: false,
      votosUtil: 41,
      meGusta: 25,
      fecha: "2026-08-12"
    },
    {
      id: "g1",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      autor: "cami.rpg",
      tipo: "guia",
      estado: "publicada",
      titulo: "Las 4 regiones en el orden recomendado",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutosLectura: 12,
      spoiler: false,
      votosUtil: null,
      porcentajeUtil: 94,
      meGusta: 0,
      fecha: null
    },
    {
      id: "g2",
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      autor: "kenvel",
      tipo: "guia",
      estado: "publicada",
      titulo: "Cómo conseguir la armadura Zonai",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutosLectura: 6,
      spoiler: false,
      votosUtil: null,
      porcentajeUtil: 88,
      meGusta: 0,
      fecha: null
    },
    {
      id: "g3",
      juego: "valorant",
      autor: "feli_fps",
      tipo: "guia",
      estado: "publicada",
      titulo: "Agentes para empezar si vienes de CS",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutosLectura: 8,
      spoiler: false,
      votosUtil: null,
      porcentajeUtil: 89,
      meGusta: 0,
      fecha: null
    },
    {
      id: "g4",
      juego: "nier-automata",
      autor: "kenvel",
      tipo: "guia",
      estado: "publicada",
      titulo: "Todos los finales sin perderte ninguno",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutosLectura: 15,
      spoiler: false,
      votosUtil: null,
      porcentajeUtil: 91,
      meGusta: 0,
      fecha: null
    },
    {
      id: "g5",
      juego: "rocket-league",
      autor: "juanvi",
      tipo: "guia",
      estado: "publicada",
      titulo: "Aéreos básicos en 10 minutos",
      texto: null,
      calificacion: null,
      dificultad: null,
      horas: null,
      minutosLectura: 10,
      spoiler: false,
      votosUtil: null,
      porcentajeUtil: 86,
      meGusta: 0,
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
      miembroDesde: "2024-03-14",
      sobreMi: "Gamer casual. Aventura, RPG y algo de terror los fines de semana.",
      jugandoAhora: "the-legend-of-zelda-tears-of-the-kingdom",
      estado: "en-linea",
      favoritos: [
        "nier-automata",
        "the-legend-of-zelda-tears-of-the-kingdom",
        "hollow-knight",
        "five-nights-at-freddys-into-the-pit"
      ],
      xp: 1240,
      generosFavoritos: ["Aventura", "RPG", "Terror"],
      listaDeseos: ["hades-ii", "ghost-of-tsushima", "elden-ring"],
      cuentasVinculadas: [{ plataforma: "Steam", nombre: "samluq_steam", estado: "verificada" }],
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
      miembroDesde: "2024-02-02",
      sobreMi: "RPGs japoneses y bandas sonoras que se quedan en la cabeza.",
      jugandoAhora: "nier-automata",
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
      ultimaConexion: null,
      amigosEnComun: 0
    },
    {
      usuario: "juanvi",
      nombre: "Juan Vigoya",
      iniciales: "JV",
      nivel: 21,
      miembroDesde: "2023-11-20",
      sobreMi: "Competitivo. Diamante en Rocket League, Oro en Valorant.",
      jugandoAhora: "rocket-league",
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
      ultimaConexion: null,
      amigosEnComun: 0
    },
    {
      usuario: "d4ni",
      nombre: "Daniela Arango",
      iniciales: "DA",
      nivel: 15,
      miembroDesde: "2024-05-09",
      sobreMi: "Metroidvanias y soulslikes. Si tiene jefes difíciles, me interesa.",
      jugandoAhora: "hollow-knight",
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
      ultimaConexion: null,
      amigosEnComun: 0
    },
    {
      usuario: "mlopez",
      nombre: "María López",
      iniciales: "ML",
      nivel: 9,
      miembroDesde: "2025-01-15",
      sobreMi: "Aventuras tranquilas después del trabajo.",
      jugandoAhora: null,
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
      ultimaConexion: null,
      amigosEnComun: 0
    },
    {
      usuario: "lau_plays",
      nombre: "Laura Peña",
      iniciales: "LP",
      nivel: 11,
      miembroDesde: "2024-09-01",
      sobreMi: "Indies cortos y juegos de terror con buena historia.",
      jugandoAhora: null,
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
      ultimaConexion: null,
      amigosEnComun: 0
    },
    {
      usuario: "valer1a",
      nombre: "Valeria Ríos",
      iniciales: "VR",
      nivel: 14,
      miembroDesde: "2024-04-22",
      sobreMi: "Completista. Si tiene 100 %, lo saco.",
      jugandoAhora: null,
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
      ultimaConexion: "hace 2 h",
      amigosEnComun: 0
    },
    {
      usuario: "nico.gg",
      nombre: "Nicolás Gómez",
      iniciales: "NG",
      nivel: 7,
      miembroDesde: "2025-06-30",
      sobreMi: "Shooters con amigos los viernes.",
      jugandoAhora: null,
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
      ultimaConexion: "hace 1 día",
      amigosEnComun: 0
    },
    {
      usuario: "tatan",
      nombre: "Sebastián Cruz",
      iniciales: "SC",
      nivel: 6,
      miembroDesde: "2025-08-12",
      sobreMi: "Nuevo en SaveSlot. Busco gente para Rocket League.",
      jugandoAhora: null,
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
      ultimaConexion: null,
      amigosEnComun: 2
    },
    {
      usuario: "cami.rpg",
      nombre: "Camila Torres",
      iniciales: "CT",
      nivel: 13,
      miembroDesde: "2024-12-03",
      sobreMi: "RPGs largos y diarios de juego muy detallados.",
      jugandoAhora: null,
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
      ultimaConexion: "hace 3 h",
      amigosEnComun: 3
    },
    {
      usuario: "feli_fps",
      nombre: "Felipe Ruiz",
      iniciales: "FR",
      nivel: 10,
      miembroDesde: "2025-03-18",
      sobreMi: "Torneos de la universidad.",
      jugandoAhora: null,
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
      ultimaConexion: null,
      amigosEnComun: 4
    },
    {
      usuario: "ana.indie",
      nombre: "Ana Moreno",
      iniciales: "AM",
      nivel: 8,
      miembroDesde: "2025-02-10",
      sobreMi: "Indies, pixel art y bandas sonoras.",
      jugandoAhora: null,
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
      ultimaConexion: "hace 5 h",
      amigosEnComun: 2
    },
    {
      usuario: "andresh",
      nombre: "andresh",
      iniciales: "AH",
      nivel: null,
      miembroDesde: null,
      sobreMi: null,
      jugandoAhora: null,
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
      juego: "rocket-league",
      titulo: "Copa SaveSlot de Rocket League 2v2",
      fechaHora: "Sáb 17 oct · 3:00 p. m.",
      organizador: "[MARCA] + [ORGANIZADOR]",
      tipoOrganizador: "Marcas y organizadores",
      cuposOcupados: 41,
      cuposMaximos: 64,
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
      juego: "rocket-league",
      titulo: "Torneo oficial 3v3 cada [X] horas",
      fechaHora: "Hoy · próximo a las [HORA]",
      organizador: "Oficial · Psyonix (desarrolladora)",
      tipoOrganizador: "Desarrolladoras oficiales",
      cuposOcupados: null,
      cuposMaximos: null,
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
      juego: "valorant",
      titulo: "Liga universitaria Bogotá",
      fechaHora: "Sáb 24 oct · 10:00 a. m.",
      organizador: "[MARCA] + [ORGANIZADOR]",
      tipoOrganizador: "Marcas y organizadores",
      cuposOcupados: 12,
      cuposMaximos: 32,
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
      juego: null,
      titulo: "Gift card de 50 USD para tu tienda favorita",
      fechaHora: "Cierra el domingo · 8:00 p. m.",
      organizador: "SaveSlot",
      tipoOrganizador: "SaveSlot",
      cuposOcupados: 1284,
      cuposMaximos: null,
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
      juego: "five-nights-at-freddys-into-the-pit",
      titulo: "Speedrun de Halloween",
      fechaHora: "Vie 30 oct · 6:00 p. m.",
      organizador: "[ORGANIZADOR] (independiente)",
      tipoOrganizador: "Marcas y organizadores",
      cuposOcupados: 58,
      cuposMaximos: 100,
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
      juego: "pokemon-legends-z-a",
      titulo: "Código de descarga de Pokémon Legends Z-A",
      fechaHora: "Cierra el 31 oct",
      organizador: "[MARCA]",
      tipoOrganizador: "Marcas y organizadores",
      cuposOcupados: 3020,
      cuposMaximos: null,
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
      juego: "the-legend-of-zelda-tears-of-the-kingdom"
    },
    {
      id: "d2",
      juego: "hades--1"
    },
    {
      id: "d3",
      juego: "hollow-knight"
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
      preguntasHoy: 2100
    },
    {
      id: "t2",
      etiqueta: "Lanzamientos",
      pregunta: "¿Qué juegos nuevos salen esta semana?",
      preguntasHoy: 1600
    },
    {
      id: "t3",
      etiqueta: "En tendencia · Pokémon Legends Z-A",
      pregunta: "¿Qué hago primero en Pokémon Legends Z-A?",
      preguntasHoy: 1200
    },
    {
      id: "t4",
      etiqueta: "Guía",
      pregunta: "¿Cuánto dura Hollow Knight al 100%?",
      preguntasHoy: 860
    }
  ],
  chats_matchplay: [
    {
      id: "c1",
      usuario: "samluq",
      titulo: "Juegos parecidos a NieR",
      horasAtras: 2,
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
      horasAtras: 72,
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
      horasAtras: 288,
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
      juego: "the-legend-of-zelda-tears-of-the-kingdom",
      fecha: "2026-10-07",
      estado: "Terminado",
      horas: 48,
      calificacion: 10,
      meGusta: true,
      tieneResena: true
    },
    {
      id: "dia2",
      usuario: "samluq",
      juego: "five-nights-at-freddys-into-the-pit",
      fecha: "2026-10-04",
      estado: "Terminado",
      horas: 6,
      calificacion: 7,
      meGusta: false,
      tieneResena: true
    },
    {
      id: "dia3",
      usuario: "samluq",
      juego: "nier-automata",
      fecha: "2026-10-02",
      estado: "Rejugado",
      horas: 21,
      calificacion: 9,
      meGusta: true,
      tieneResena: true
    },
    {
      id: "dia4",
      usuario: "samluq",
      juego: "hades--1",
      fecha: "2026-09-27",
      estado: "Terminado",
      horas: 24,
      calificacion: 8,
      meGusta: false,
      tieneResena: false
    },
    {
      id: "dia5",
      usuario: "samluq",
      juego: "valorant",
      fecha: "2026-09-19",
      estado: "Abandonado",
      horas: 9,
      calificacion: 5,
      meGusta: false,
      tieneResena: true
    },
    {
      id: "dia6",
      usuario: "samluq",
      juego: "pokemon-legends-z-a",
      fecha: "2026-09-08",
      estado: "Terminado",
      horas: 31,
      calificacion: 8,
      meGusta: true,
      tieneResena: false
    },
    {
      id: "dia7",
      usuario: "samluq",
      juego: "inside",
      fecha: "2026-08-30",
      estado: "Terminado",
      horas: 3,
      calificacion: 9,
      meGusta: true,
      tieneResena: false
    },
    {
      id: "dia8",
      usuario: "samluq",
      juego: "hollow-knight",
      fecha: "2026-08-12",
      estado: "Rejugado",
      horas: 27,
      calificacion: 9,
      meGusta: true,
      tieneResena: true
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
      juegosCompletos: 7,
      raros: 24
    }
  ],
  /* ---------- Fijos de la app: listas que antes estaban escritas en el HTML ---------- */
  // Géneros que entiende IGDB (api/igdb.js). enBuscar: aparecen en los filtros de Buscar, en este orden;
  // Juego random usa todos, en orden alfabético.
  generos: [
    { id: "aventura", nombre: "Aventura", enBuscar: true },
    { id: "rpg", nombre: "RPG", enBuscar: true },
    { id: "accion", nombre: "Acción", enBuscar: true },
    { id: "terror", nombre: "Terror", enBuscar: true },
    { id: "shooter", nombre: "Shooter", enBuscar: true },
    { id: "deportes", nombre: "Deportes", enBuscar: true },
    { id: "roguelike", nombre: "Roguelike", enBuscar: true },
    { id: "carreras", nombre: "Carreras", enBuscar: false },
    { id: "estrategia", nombre: "Estrategia", enBuscar: false },
    { id: "metroidvania", nombre: "Metroidvania", enBuscar: false },
    { id: "pelea", nombre: "Pelea", enBuscar: false },
    { id: "plataformas", nombre: "Plataformas", enBuscar: false },
    { id: "puzzle", nombre: "Puzzle", enBuscar: false },
    { id: "simulacion", nombre: "Simulación", enBuscar: false },
    { id: "supervivencia", nombre: "Supervivencia", enBuscar: false }
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
  // Reglas de Eventos ("enlace" y "textoEnlace" son opcionales; el enlace va desde la raíz del sitio)
  reglas_eventos: [
    { id: "organiza", texto: "Cada evento muestra quién lo organiza y quién lo patrocina." },
    { id: "costo", texto: "El costo total se muestra antes de pagar. No hay suscripciones ni cargos recurrentes." },
    { id: "sorteos", texto: "Los sorteos tienen siempre una forma gratuita de participar con XP." },
    { id: "proponer", texto: "¿Organizas torneos? ", enlace: "pages/contacto.html?tema=torneo", textoEnlace: "Propón un evento" }
  ],
  // Quién organiza un evento (filtro de Eventos; cada evento lo tiene en tipoOrganizador)
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
      texto: "{servicio} tardó más de 8 segundos en responder, así que dejamos de esperar.",
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
      id: "plataforma",
      servicioPorDefecto: "Esta plataforma",
      codigo: "LIM-PLAT",
      titulo: "{servicio} todavía no se puede vincular",
      texto: "{servicio} no ofrece una API pública para que webs como SaveSlot lean tus juegos, logros o actividad. No vamos a usar métodos no oficiales que pidan tus credenciales.",
      consejos: [
        "Registra tus juegos a mano en tu diario.",
        "Vincula Steam o Xbox, que sí están disponibles.",
        "Te avisaremos si la plataforma abre su API."
      ],
      reintentar: false,
      accion: {
        texto: "Registrar en mi diario",
        pagina: "buscar-juegos.html"
      }
    },
    {
      id: "pagos",
      codigo: "LIM-PAY",
      titulo: "Los pagos aún no están disponibles",
      texto: "SaveSlot es un prototipo académico y no tiene una pasarela de pagos conectada. Ningún cobro se realizó.",
      consejos: [
        "Usa la opción gratis con XP cuando el evento la tenga.",
        "Revisa los eventos gratuitos en la pestaña “Gratis”."
      ],
      reintentar: false,
      accion: {
        texto: "Ver eventos gratis",
        pagina: "eventos.html"
      }
    },
    {
      id: "funcion",
      codigo: "LIM-FEAT",
      titulo: "{servicio} aún no está disponible",
      texto: "Esta función depende de una API que el equipo todavía está solicitando. Por ahora no la puedes usar.",
      consejos: [
        "Usa la alternativa disponible (correo y contraseña, o subir texto).",
        "Revisa el estado de los servicios abajo."
      ],
      reintentar: false
    },
    {
      id: "acceso",
      codigo: "LIM-AUTH",
      titulo: "Entrar con {servicio} aún no está disponible",
      texto: "Estamos conectando el inicio de sesión con {servicio}. Mientras tanto, entra o crea tu cuenta con tu correo, o prueba la cuenta de demostración.",
      consejos: [
        "Entra con tu correo y contraseña de SaveSlot.",
        "Usa la cuenta de demostración para ver todo sin registrarte.",
        "Cuando conectes {servicio}, tu progreso se queda en la misma cuenta."
      ],
      reintentar: false,
      servicioPorDefecto: "este servicio",
      accion: {
        texto: "Entrar con tu correo",
        pagina: "iniciar-sesion.html"
      }
    },
    {
      id: "demo",
      codigo: "DEMO",
      titulo: "Estás viendo el prototipo de SaveSlot",
      texto: "Steam ya está conectado: si entras con Steam, tu biblioteca, logros, lista de deseos, juegos recientes y reseñas son reales. El catálogo de juegos también es real (IGDB). El resto (cuentas con correo, eventos, amigos e IA) todavía usa datos de ejemplo y guarda tu actividad solo en este navegador.",
      consejos: [
        "Entra con Steam para ver tus datos reales, o usa la cuenta de demostración para probar todo lo demás.",
        "Puedes crear una cuenta, reseñar, llenar tu diario y chatear con MatchPlay en modo demo.",
        "Borrar los datos del navegador borra tu actividad."
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
      texto: "Qué partes de SaveSlot están conectadas a servicios reales y cuáles funcionan en modo demo.",
      consejos: [],
      reintentar: false
    }
  ],
  estado_servicios: [
    {
      id: "s1",
      servicio: "Catálogo de juegos",
      proveedor: "IGDB (Twitch) + lo más jugado en Steam",
      estado: "conectado",
      texto: "Conectado"
    },
    {
      id: "s2",
      servicio: "Cuentas y actividad del usuario",
      proveedor: "Supabase",
      estado: "demo",
      texto: "Modo demo (navegador)"
    },
    {
      id: "s3",
      servicio: "MatchPlay (IA)",
      proveedor: "Por definir",
      estado: "demo",
      texto: "Modo demo"
    },
    {
      id: "s4",
      servicio: "Cuentas: Steam (perfil, biblioteca, logros, deseos y reseñas)",
      proveedor: "Steam Web API + OpenID (Vercel)",
      estado: "conectado",
      texto: "Conectado"
    },
    {
      id: "s5",
      servicio: "Cuentas: Xbox",
      proveedor: "OpenXBL (tercero)",
      estado: "pendiente",
      texto: "Pendiente de clave"
    },
    {
      id: "s6",
      servicio: "Cuentas: PlayStation",
      proveedor: "—",
      estado: "no-disponible",
      texto: "Sin API pública"
    },
    {
      id: "s7",
      servicio: "Cuentas: Nintendo",
      proveedor: "—",
      estado: "no-disponible",
      texto: "Sin API pública"
    },
    {
      id: "s8",
      servicio: "Inicio de sesión con Steam",
      proveedor: "Steam OpenID + Supabase Auth",
      estado: "conectado",
      texto: "Conectado"
    },
    {
      id: "s11",
      servicio: "Inicio de sesión con Google, Discord y Twitch",
      proveedor: "Supabase Auth",
      estado: "pendiente",
      texto: "Pendiente"
    },
    {
      id: "s12",
      servicio: "Precios, notas, jugadores y reseñas de Steam en cada juego",
      proveedor: "Steam (tienda y comunidad) + Supabase",
      estado: "conectado",
      texto: "Conectado · se actualiza cada día"
    },
    {
      id: "s9",
      servicio: "Clips y transmisiones",
      proveedor: "Twitch API",
      estado: "pendiente",
      texto: "Pendiente de clave"
    },
    {
      id: "s10",
      servicio: "Pagos de eventos",
      proveedor: "Pasarela de pagos",
      estado: "no-disponible",
      texto: "No disponible"
    }
  ]
};

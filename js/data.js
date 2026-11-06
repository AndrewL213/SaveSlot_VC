/* SaveSlot · data.js
   Datos simulados de la app, separados del diseño. Una lista por tipo de dato, con los
   nombres de la sección Datos de spec.md y un id en cada elemento.
   Las pantallas los leen solo con obtenerDatos("…") de js/app.js: cuando se conecten
   Supabase y RAWG, cambia esa función y no este archivo ni las pantallas.
   Origen: disenos/js/data.js (diseño v3). Portadas desde assets/. */

const DATOS = {
  juegos: [
    {
      id: "zelda-totk",
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
      id: "pokemon-legends-za",
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
      id: "fnaf-into-the-pit",
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
      id: "hades",
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
      juego: "zelda-totk",
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
      juego: "zelda-totk",
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
      juego: "zelda-totk",
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
      juego: "hades",
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
    }
  ],
  comentarios: [
    {
      id: "c1",
      resena: "m1",
      autor: "kenvel",
      texto: "Lo de los puentes absurdos es lo mejor del juego, jaja.",
      fecha: null
    },
    {
      id: "c2",
      resena: "m1",
      autor: "d4ni",
      texto: "¿Ya probaste el subsuelo completo? Cambia mucho la experiencia.",
      fecha: null
    },
    {
      id: "c3",
      resena: "m3",
      autor: "juanvi",
      texto: "El final E es de lo mejor que he jugado.",
      fecha: null
    },
    {
      id: "c4",
      resena: "r1",
      autor: "mlopez",
      texto: "Totalmente, la ruta C es otro juego.",
      fecha: null
    },
    {
      id: "c5",
      resena: "r3",
      autor: "kenvel",
      texto: "Buen consejo lo de las islas del cielo primero.",
      fecha: null
    },
    {
      id: "c6",
      resena: "r6",
      autor: "valer1a",
      texto: "Los Hermanos Mantis son mi jefe favorito.",
      fecha: null
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
      jugandoAhora: "zelda-totk",
      estado: "en-linea",
      favoritos: [
        "nier-automata",
        "zelda-totk",
        "hollow-knight",
        "fnaf-into-the-pit"
      ],
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
        "hades",
        "elden-ring",
        "hollow-knight"
      ],
      insignias: [],
      color: "#7C7566",
      id: "kenvel"
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
        "zelda-totk"
      ],
      insignias: [],
      color: "#2456C4",
      id: "juanvi"
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
        "hades",
        "inside"
      ],
      insignias: [],
      color: "#2B3A55",
      id: "d4ni"
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
        "zelda-totk",
        "pokemon-legends-za",
        "inside",
        "ghost-of-tsushima"
      ],
      insignias: [],
      color: "#2F6B4F",
      id: "mlopez"
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
        "fnaf-into-the-pit",
        "hades-ii",
        "hollow-knight"
      ],
      insignias: [],
      color: "#3A3F45",
      id: "lau_plays"
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
        "zelda-totk",
        "ghost-of-tsushima",
        "pokemon-legends-za",
        "hades"
      ],
      insignias: [],
      color: "#7A2E2E",
      id: "valer1a"
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
        "hades"
      ],
      insignias: [],
      color: "#5B3F96",
      id: "nico.gg"
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
        "pokemon-legends-za",
        "zelda-totk",
        "hades"
      ],
      insignias: [],
      color: "#2456C4",
      id: "tatan"
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
        "pokemon-legends-za",
        "elden-ring",
        "zelda-totk"
      ],
      insignias: [],
      color: "#B8343E",
      id: "cami.rpg"
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
        "hades"
      ],
      insignias: [],
      color: "#5B3F96",
      id: "feli_fps"
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
        "hades",
        "hades-ii"
      ],
      insignias: [],
      color: "#5A2D6B",
      id: "ana.indie"
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
      premio: null,
      reglas: [],
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
      premio: null,
      reglas: [],
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
      premio: null,
      reglas: [],
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
      premio: null,
      reglas: [],
      color: "#2B5A3F",
      destacado: false
    },
    {
      id: "speedrun-fnaf",
      tipo: "torneo",
      juego: "fnaf-into-the-pit",
      titulo: "Speedrun de Halloween",
      fechaHora: "Vie 30 oct · 6:00 p. m.",
      organizador: "[ORGANIZADOR] (independiente)",
      tipoOrganizador: "Marcas y organizadores",
      cuposOcupados: 58,
      cuposMaximos: 100,
      costo: "Gratis",
      gratis: true,
      premio: null,
      reglas: [],
      color: "#6B3A1E",
      destacado: false
    },
    {
      id: "codigo-pokemon",
      tipo: "sorteo",
      juego: "pokemon-legends-za",
      titulo: "Código de descarga de Pokémon Legends Z-A",
      fechaHora: "Cierra el 31 oct",
      organizador: "[MARCA]",
      tipoOrganizador: "Marcas y organizadores",
      cuposOcupados: 3020,
      cuposMaximos: null,
      costo: "300 XP",
      gratis: true,
      premio: null,
      reglas: [],
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
      fecha: null
    },
    {
      id: "n2",
      usuario: "samluq",
      tipo: "cierre-inscripciones",
      texto: "La Copa SaveSlot 2v2 cierra inscripciones el viernes.",
      fecha: null
    }
  ],
  destacadosInicio: [
    {
      id: "d1",
      juego: "zelda-totk"
    },
    {
      id: "d2",
      juego: "hades"
    },
    {
      id: "d3",
      juego: "hollow-knight"
    }
  ]
};

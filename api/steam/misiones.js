// /api/steam/misiones — misiones diarias y semanales de juegos, comprobadas con Steam
//
//   GET  /api/steam/misiones          → las misiones de hoy y de esta semana (no necesita sesión)
//   POST /api/steam/misiones          → además, el avance de la persona y las que ya cumplió
//        (Authorization: Bearer <token de la sesión de Supabase de Steam>)
//
// Cada día salen 3 diarias y cada lunes 3 semanales del grupo de la tabla "misiones" (las mismas para
// todos). Se reinician a las 00:00 de Colombia. El avance se mide con Steam:
//   - horas y juegos distintos: Steam solo da las horas totales de cada juego, así que la primera vez del
//     día (o de la semana) se guarda una foto en "horas_steam" y el avance es lo jugado desde esa foto;
//   - logros: cada logro trae la hora en que se consiguió (se revisan los juegos jugados en 2 semanas);
//   - logro raro: un logro de este periodo que tiene menos del 10 % de jugadores en Steam.
// Cuando una misión está cumplida, se anota con cumplir_mision() y la base suma el XP (una vez por periodo).
// Si la persona de Steam todavía no tiene fila en "usuarios", se le crea (la base le suma "Crear tu cuenta").
//
// Variables de entorno: STEAM_API_KEY y SUPABASE_SERVICE_ROLE_KEY. Opcionales: SUPABASE_URL, SUPABASE_ANON_KEY

const SUPABASE_URL = process.env.SUPABASE_URL || "https://jzshrfiezzysbkzdsjzf.supabase.co";
const ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_jEY8jb8ffoEHueH1qxhwhg_W6Kl8Y20"; // clave pública
const SECRETA = process.env.SUPABASE_SERVICE_ROLE_KEY;
const KEY = process.env.STEAM_API_KEY;
const UN_DIA = 24 * 60 * 60 * 1000;
const COLOMBIA = -5 * 60 * 60 * 1000; // UTC−5, sin horario de verano
const POR_PERIODO = 3;                 // misiones diarias y semanales que salen cada vez
const RARO = 10;                       // un logro es raro si lo tiene menos del 10 % de jugadores
const MAX_JUEGOS_LOGROS = 10;          // juegos recientes que se revisan para contar logros

function json(res, datos, estado = 200) {
  res.statusCode = estado;
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(datos));
}

/* ---------- Supabase ---------- */

function cabeceras(llave, extra) {
  return Object.assign({ apikey: llave, Authorization: `Bearer ${llave}`, "Content-Type": "application/json" }, extra);
}
async function base(ruta, opciones = {}, llave = SECRETA) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${ruta}`, Object.assign({}, opciones, { headers: cabeceras(llave, opciones.headers) }));
  if (!r.ok) throw new Error(`Supabase ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const texto = await r.text();
  return texto ? JSON.parse(texto) : null;
}
// Valida el token de la sesión y devuelve la cuenta
async function cuentaDe(authorization) {
  if (!authorization) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: ANON_KEY, Authorization: authorization } });
  return r.ok ? r.json() : null;
}

/* ---------- Steam ---------- */

async function steam(ruta, params) {
  const q = new URLSearchParams({ key: KEY, format: "json" });
  for (const [k, v] of Object.entries(params)) q.set(k, String(v));
  const r = await fetch(`https://api.steampowered.com/${ruta}?${q}`, { cache: "no-store" });
  if (!r.ok) throw new Error(`Steam ${r.status}`);
  return r.json();
}

/* ---------- Periodos y misiones del día ---------- */

// Hoy y esta semana (empieza el lunes), en hora de Colombia
function periodos(ahora = Date.now()) {
  const local = new Date(ahora + COLOMBIA); // sus campos UTC son la hora de Colombia
  const dia = local.toISOString().slice(0, 10);
  const desdeLunes = (local.getUTCDay() + 6) % 7;
  const lunes = new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() - desdeLunes)).toISOString().slice(0, 10);
  const inicioDia = Date.parse(dia + "T00:00:00-05:00");
  const inicioSemana = Date.parse(lunes + "T00:00:00-05:00");
  return {
    diaria: { clave: "dia:" + dia, inicio: inicioDia, fin: inicioDia + UN_DIA },
    semanal: { clave: "semana:" + lunes, inicio: inicioSemana, fin: inicioSemana + 7 * UN_DIA },
  };
}

// Elige "cuantas" misiones del grupo, siempre las mismas para el mismo periodo (mezcla con semilla)
function elegir(grupo, semilla, cuantas) {
  let h = 2166136261;
  for (const c of semilla) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const lista = grupo.slice().sort((a, b) => a.id - b.id);
  for (let i = lista.length - 1; i > 0; i--) {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const j = h % (i + 1);
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista.slice(0, cuantas);
}

async function misionesDelPeriodo() {
  const todas = await base("misiones?select=id,clave,texto,xp,frecuencia,tipo,meta&frecuencia=in.(diaria,semanal)&order=id", {}, ANON_KEY);
  const p = periodos();
  const salida = {};
  for (const frecuencia of ["diaria", "semanal"]) {
    salida[frecuencia] = {
      periodo: p[frecuencia].clave,
      termina: new Date(p[frecuencia].fin).toISOString(),
      inicio: p[frecuencia].inicio,
      misiones: elegir(todas.filter((m) => m.frecuencia === frecuencia), p[frecuencia].clave, POR_PERIODO),
    };
  }
  return salida;
}

/* ---------- La fila de usuarios de la persona de Steam ---------- */

async function filaDeUsuario(cuenta, steamid) {
  const filas = await base(`usuarios?auth_id=eq.${cuenta.id}&select=id,usuario,nivel,xp`);
  if (filas.length) return filas[0];
  // Todavía no tiene: se crea con su @ (el que eligió) o uno libre a partir de su nombre de Steam
  const perfil = await steam("ISteamUser/GetPlayerSummaries/v2/", { steamids: steamid }).catch(() => null);
  const nombre = (perfil?.response?.players?.[0]?.personaname || cuenta.user_metadata?.usuario || "Jugador").slice(0, 60);
  const limpio = (t) => String(t || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9_.]/g, "").slice(0, 20);
  const candidatos = [limpio(cuenta.user_metadata?.usuario), limpio(nombre), "steam_" + String(steamid).slice(-8), "steam_" + String(steamid).slice(-12)]
    .filter((u) => /^[a-z0-9_.]{3,20}$/.test(u));
  for (const usuario of candidatos) {
    const ocupado = await base(`usuarios?usuario=eq.${encodeURIComponent(usuario)}&select=id`);
    if (ocupado.length) continue;
    const iniciales = nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "S";
    const creada = await base("usuarios?select=id,usuario,nivel,xp", {
      method: "POST", headers: { Prefer: "return=representation" },
      body: JSON.stringify({ auth_id: cuenta.id, usuario, nombre, iniciales, forma_de_entrar: "steam" }),
    });
    return creada[0];
  }
  throw new Error("No se encontró un @ libre para la cuenta de Steam");
}

/* ---------- Avance ---------- */

const aTexto = (mapa) => [...mapa].map(([appid, min]) => appid + ":" + min).join(",");
const aMapa = (texto) => new Map(String(texto || "").split(",").filter(Boolean).map((par) => par.split(":").map(Number)));

// Horas y juegos distintos desde la foto del periodo (si no hay foto, se toma ahora y el avance empieza en 0)
async function horasDelPeriodo(idUsuario, periodo, ahora) {
  const fotos = await base(`horas_steam?usuario_id=eq.${idUsuario}&periodo=eq.${encodeURIComponent(periodo)}&select=minutos`);
  if (!fotos.length) {
    await base("horas_steam?on_conflict=usuario_id,periodo", {
      method: "POST", headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
      body: JSON.stringify({ usuario_id: idUsuario, periodo, minutos: aTexto(ahora) }),
    });
    return { minutos: 0, juegos: 0 };
  }
  const antes = aMapa(fotos[0].minutos);
  let minutos = 0, juegos = 0;
  for (const [appid, min] of ahora) {
    const jugado = Math.max(0, min - (antes.get(appid) || 0));
    minutos += jugado;
    if (jugado > 0) juegos++;
  }
  return { minutos, juegos };
}

// Logros conseguidos en cada periodo (y los raros), en los juegos jugados las últimas 2 semanas
async function logrosDelPeriodo(steamid, periodos, contarRaros) {
  const recientes = await steam("IPlayerService/GetRecentlyPlayedGames/v1/", { steamid, count: 0 }).catch(() => ({ response: {} }));
  const juegos = (recientes.response.games || []).slice(0, MAX_JUEGOS_LOGROS);
  const cuenta = {};
  for (const p of periodos) cuenta[p.clave] = { logros: 0, raros: 0 };
  await Promise.all(juegos.map(async (g) => {
    const d = await steam("ISteamUserStats/GetPlayerAchievements/v1/", { steamid, appid: g.appid }).catch(() => null);
    const nuevos = (d?.playerstats?.achievements || []).filter((a) => a.achieved && a.unlocktime);
    if (!nuevos.length) return;
    let porcentaje = null;
    for (const p of periodos) {
      const enPeriodo = nuevos.filter((a) => a.unlocktime * 1000 >= p.inicio && a.unlocktime * 1000 < p.fin);
      cuenta[p.clave].logros += enPeriodo.length;
      if (contarRaros && enPeriodo.length) {
        if (!porcentaje) {
          const glob = await steam("ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/", { gameid: g.appid }).catch(() => null);
          porcentaje = new Map((glob?.achievementpercentages?.achievements || []).map((a) => [a.name, Number(a.percent)]));
        }
        cuenta[p.clave].raros += enPeriodo.filter((a) => porcentaje.has(a.apiname) && porcentaje.get(a.apiname) < RARO).length;
      }
    }
  }));
  return cuenta;
}

/* ---------- Handler ---------- */

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization, content-type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return json(res, "ok");

  try {
    const delPeriodo = await misionesDelPeriodo();
    const lista = (conAvance) => ["diaria", "semanal"].map((f) => ({
      frecuencia: f, periodo: delPeriodo[f].periodo, termina: delPeriodo[f].termina,
      misiones: delPeriodo[f].misiones.map((m) => Object.assign({ clave: m.clave, texto: m.texto, xp: m.xp, tipo: m.tipo, meta: m.meta }, conAvance ? conAvance(m, f) : {})),
    }));
    if (req.method !== "POST") return json(res, { periodos: lista(null) });

    // Con sesión: tiene que ser una cuenta de Steam
    const cuenta = await cuentaDe(req.headers.authorization);
    const steamid = cuenta?.app_metadata?.steam_id;
    if (!steamid) return json(res, { error: "Vincula Steam para hacer estas misiones", periodos: lista(null) }, 401);
    if (!SECRETA || !KEY) return json(res, { error: "Faltan claves en Vercel" }, 500);

    const fila = await filaDeUsuario(cuenta, steamid);
    // Horas de todos sus juegos (si el perfil es privado, Steam no las da)
    const propios = await steam("IPlayerService/GetOwnedGames/v1/", { steamid, include_played_free_games: 1 });
    if (!propios.response || !propios.response.games) {
      return json(res, { error: "Tus detalles de juego en Steam son privados", privado: true, periodos: lista(null) }, 403);
    }
    const ahora = new Map(propios.response.games.map((g) => [g.appid, g.playtime_forever || 0]));
    const p = periodos();
    const [horasDia, horasSemana, logros] = await Promise.all([
      horasDelPeriodo(fila.id, p.diaria.clave, ahora),
      horasDelPeriodo(fila.id, p.semanal.clave, ahora),
      logrosDelPeriodo(steamid, [p.diaria, p.semanal], delPeriodo.semanal.misiones.some((m) => m.tipo === "logros_raros")),
    ]);
    const horas = { diaria: horasDia, semanal: horasSemana };

    // Las que ya había ganado en estos periodos
    const ya = await base(`misiones_cumplidas?usuario_id=eq.${fila.id}&referencia=in.(${encodeURIComponent('"' + p.diaria.clave + '","' + p.semanal.clave + '"')})&select=referencia,misiones(clave)`);
    const ganadas = new Set(ya.map((c) => c.referencia + "|" + (c.misiones && c.misiones.clave)));

    const avance = {};
    const nuevas = [];
    for (const f of ["diaria", "semanal"]) {
      for (const m of delPeriodo[f].misiones) {
        const l = logros[p[f].clave];
        const progreso = m.tipo === "horas" ? horas[f].minutos : m.tipo === "juegos" ? horas[f].juegos : m.tipo === "logros_raros" ? l.raros : l.logros;
        const cumplida = progreso >= m.meta;
        const yaEstaba = ganadas.has(p[f].clave + "|" + m.clave);
        if (cumplida && !yaEstaba) {
          // La base la anota una sola vez por periodo y suma el XP
          await base("rpc/cumplir_mision", { method: "POST", body: JSON.stringify({ p_usuario: fila.id, p_clave: m.clave, p_referencia: p[f].clave }) });
          nuevas.push({ texto: m.texto, xp: m.xp });
        }
        avance[f + "|" + m.clave] = { progreso: Math.min(progreso, m.meta), cumplida: cumplida || yaEstaba };
      }
    }
    const usuario = (await base(`usuarios?id=eq.${fila.id}&select=usuario,nivel,xp`))[0];
    return json(res, { usuario, nuevas, periodos: lista((m, f) => avance[f + "|" + m.clave]) });
  } catch (e) {
    console.error(e);
    return json(res, { error: "No pudimos revisar tus misiones" }, 502);
  }
};

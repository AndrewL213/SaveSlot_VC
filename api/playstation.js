// /api/playstation — PlayStation (POST con "Authorization: Bearer <sesión>"). Una sola función para todo
// (el plan gratis de Vercel deja máximo 12 funciones):
//
// Vincular un ID de PSN a la cuenta de SaveSlot:
//   1) ?action=codigo  body { onlineId } → { onlineId, codigo } : el ID existe; el código va en el «Sobre mí» de PSN
//   2) ?action=vincular body { onlineId } → { onlineId, nivel } : si el «Sobre mí» tiene el código, se guarda:
//      · usuarios_playstation: el número de la cuenta de PSN (account_id) y el ID (solo lo ve el servidor);
//      · cuentas_vinculadas: la fila "playstation" verificada (la ven todos; la base da los +100 XP la primera vez).
//   3) ?action=desvincular → borra las dos filas.
// Errores: 404 { no_existe }, 409 { sin_codigo } (el «Sobre mí» aún no tiene el código), 409 { en_otra_cuenta },
// 503 { npsso } (hay que pegar un NPSSO nuevo en Vercel).
//
// Datos: ?action=datos → { onlineId, nivel, progreso_nivel, trofeos: { platino, oro, plata, bronce }, games: [...] }.
// Cada juego: { id, name, platform, last_played (segundos), unlocked, total, percent, minutes, cover, slug }.
// "games" sale de la lista de trofeos (todos los juegos con trofeos) y se le suman las horas de juego
// de getUserPlayedGames cuando la privacidad de la persona lo deja (solo PS4 y PS5).
// Sin PlayStation vinculada: 404 { sin_vinculo }. Trofeos no públicos: 403 { privado }.

const p = require("./_psn");
const { portadasDeIgdb } = require("./_portadas-igdb");

function json(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}

async function leerCuerpo(req) {
  if (req.body && typeof req.body === "object") return req.body;
  try { return JSON.parse(req.body || "{}"); } catch { return {}; }
}

const ID_VALIDO = /^[A-Za-z][A-Za-z0-9_-]{2,15}$/; // así son los ID de PSN (3 a 16 caracteres)

const suma = (t) => (t ? (t.bronze || 0) + (t.silver || 0) + (t.gold || 0) + (t.platinum || 0) : 0);
// "PT2H35M10S" → 155 minutos ("P1DT2H" → 1560)
function minutosDe(duracion) {
  const m = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/.exec(String(duracion || ""));
  return m ? Number(m[1] || 0) * 1440 + Number(m[2] || 0) * 60 + Number(m[3] || 0) : 0;
}
// Para comparar nombres: "Call of Duty®: Black Ops II" y "CALL OF DUTY: BLACK OPS II" → "callofdutyblackopsii"
const limpio = (nombre) => String(nombre || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "");


// Juegos jugados con sus horas (gamelist de PSN, solo PS4 y PS5). Si la cuenta vinculada es la misma con la que
// entra el servidor (el NPSSO), se piden como "me", que no depende de la privacidad.
async function jugadosDe(auth, id, onlineId) {
  const opciones = { limit: 200, categories: "ps4_game,ps5_native_game" };
  const pedir = (cuenta) => p.psn.getUserPlayedGames(auth, cuenta, opciones).catch((e) => { console.error("PSN juegos jugados (" + cuenta + "):", e.message); return null; });
  let r = await pedir(id);
  if (!r || !(r.titles || []).length) {
    const yo = await p.psn.getProfileFromAccountId(auth, "me").catch((e) => { console.error("PSN perfil me:", e.message); return null; });
    console.log("PSN cuenta del servidor:", yo ? yo.onlineId : "?", "· vinculada:", onlineId);
    if (yo && String(yo.onlineId).toLowerCase() === String(onlineId).toLowerCase()) r = (await pedir("me")) || r;
  }
  console.log("PSN juegos jugados:", r ? JSON.stringify(r).slice(0, 400) : "sin respuesta");
  return r;
}

async function datos(req, res, cuenta) {
  try {
    const vinculo = await p.leerVinculo(cuenta.id);
    if (!vinculo) return json(res, 404, { error: "PlayStation no está vinculada", sin_vinculo: true });
    const auth = await p.autorizacion();
    const id = vinculo.account_id;

    const [resumen, titulos, jugados] = await Promise.all([
      p.psn.getUserTrophyProfileSummary(auth, id).catch((e) => ({ error: e })),
      p.psn.getUserTitles(auth, id, { limit: 800 }).catch((e) => ({ error: e })),
      jugadosDe(auth, id, vinculo.online_id),
    ]);
    if (resumen.error && titulos.error) {
      console.error("PlayStation privado o sin datos:", String(resumen.error.message || resumen.error));
      return json(res, 403, { error: "Tus trofeos de PlayStation no son públicos.", privado: true });
    }

    // Horas y última vez de getUserPlayedGames (si la privacidad lo deja), por nombre del juego
    const horas = {};
    const listaJugados = (jugados && jugados.titles) || [];
    listaJugados.forEach((t) => {
      const dato = { minutes: minutosDe(t.playDuration), last: t.lastPlayedDateTime };
      [t.name, t.localizedName, t.concept && t.concept.name].forEach((n) => { if (n) horas[limpio(n)] = dato; });
    });

    const games = ((titulos && titulos.trophyTitles) || []).map((t) => {
      const extra = horas[limpio(t.trophyTitleName)] || {};
      const ultima = extra.last || t.lastUpdatedDateTime;
      const unlocked = suma(t.earnedTrophies), total = suma(t.definedTrophies);
      return {
        id: t.npCommunicationId, name: t.trophyTitleName, platform: t.trophyTitlePlatform,
        last_played: ultima ? Math.floor(new Date(ultima).getTime() / 1000) : 0,
        unlocked, total, percent: t.progress || (total ? Math.round(unlocked / total * 100) : 0),
        platinum: !!(t.earnedTrophies && t.earnedTrophies.platinum),
        minutes: extra.minutes || 0,
      };
    }).sort((a, b) => b.last_played - a.last_played);

    // Portadas de IGDB (las de PlayStation no se usan: CLAUDE.md solo deja IGDB y Steam)
    const portadas = await portadasDeIgdb(games.slice(0, 40), (g) => g.id, (g) => g.name).catch(() => ({}));
    games.forEach((g) => {
      const igdb = portadas[g.id] || {};
      g.cover = igdb.cover || null;
      g.slug = igdb.slug || null;
    });

    await p.guardarVinculo({ id: cuenta.id, account_id: id, online_id: vinculo.online_id, sincronizado_el: new Date().toISOString() }).catch(() => {});
    const ganados = (resumen && resumen.earnedTrophies) || {};
    return json(res, 200, {
      onlineId: vinculo.online_id,
      nivel: resumen && resumen.trophyLevel ? Number(resumen.trophyLevel) : null,
      progreso_nivel: (resumen && resumen.progress) || 0,
      trofeos: { platino: ganados.platinum || 0, oro: ganados.gold || 0, plata: ganados.silver || 0, bronce: ganados.bronze || 0 },
      games,
    });
  } catch (e) {
    console.error("Datos de PlayStation:", e.message);
    if (e.npsso) return json(res, 503, { error: "PlayStation no está disponible por ahora.", npsso: true });
    return json(res, 502, { error: "PlayStation no respondió. Inténtalo de nuevo." });
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Usa POST" });
  const faltan = p.falta();
  if (faltan.length) {
    console.error("Faltan variables de entorno: " + faltan.join(", "));
    return json(res, 500, { error: "PlayStation no está configurado en el servidor" });
  }
  const cuenta = await p.cuentaDeLaSesion(req);
  if (!cuenta) return json(res, 401, { error: "Inicia sesión para vincular PlayStation" });
  const accion = new URL(req.url, "https://x").searchParams.get("action");
  if (accion === "datos") return datos(req, res, cuenta);

  try {
    if (accion === "desvincular") {
      await p.rest(`usuarios_playstation?id=eq.${cuenta.id}`, { method: "DELETE" });
      const fila = await p.filaUsuario(cuenta.id);
      if (fila) await p.rest(`cuentas_vinculadas?usuario_id=eq.${fila.id}&plataforma=eq.playstation`, { method: "DELETE" });
      return json(res, 200, { listo: true });
    }

    const onlineId = String((await leerCuerpo(req)).onlineId || "").trim();
    if (!ID_VALIDO.test(onlineId)) return json(res, 400, { error: "Ese no parece un ID de PSN (3 a 16 letras, números, - o _)." });
    const perfil = await p.perfilDe(onlineId);
    if (!perfil) return json(res, 404, { error: "No encontramos ese ID de PSN.", no_existe: true });
    const codigo = p.codigoDe(cuenta.id, perfil.onlineId);

    if (accion === "codigo") return json(res, 200, { onlineId: perfil.onlineId, codigo });

    if (accion === "vincular") {
      if (!String(perfil.aboutMe || "").toUpperCase().includes(codigo)) {
        return json(res, 409, { error: `Todavía no vemos ${codigo} en el «Sobre mí» de ${perfil.onlineId}.`, sin_codigo: true, codigo });
      }
      const yaEsta = await p.vinculoDeCuentaPsn(perfil.accountId);
      if (yaEsta && yaEsta.id !== cuenta.id) return json(res, 409, { error: "Ese ID de PSN ya está vinculado a otra cuenta de SaveSlot.", en_otra_cuenta: true });
      await p.guardarVinculo({ id: cuenta.id, account_id: perfil.accountId, online_id: perfil.onlineId, sincronizado_el: new Date().toISOString() });
      const fila = await p.filaUsuario(cuenta.id);
      if (fila) {
        await p.rest("cuentas_vinculadas?on_conflict=usuario_id,plataforma", {
          method: "POST",
          body: JSON.stringify({ usuario_id: fila.id, plataforma: "playstation", nombre: perfil.onlineId, estado: "verificada" }),
          extra: { Prefer: "resolution=merge-duplicates,return=minimal" },
        });
      }
      return json(res, 200, { onlineId: perfil.onlineId, nivel: perfil.trophySummary ? perfil.trophySummary.level : null });
    }

    return json(res, 400, { error: "Acción no válida" });
  } catch (e) {
    console.error("PlayStation (" + accion + "):", e.message);
    if (e.npsso) return json(res, 503, { error: "PlayStation no está disponible por ahora.", npsso: true });
    return json(res, 502, { error: "PlayStation no respondió. Inténtalo de nuevo." });
  }
};

// /api/playstation/data — los datos de PlayStation de quien tiene la sesión (POST con "Authorization: Bearer <sesión>")
//
// Responde { onlineId, nivel, progreso_nivel, trofeos: { platino, oro, plata, bronce }, games: [...] }. Cada juego:
//   { id, name, platform, last_played (segundos), unlocked, total, percent, minutes (si PSN lo dice), cover, slug }
// "games" sale de la lista de trofeos (todos los juegos con trofeos) y se le suman las horas de juego
// de getUserPlayedGames cuando la privacidad de la persona lo deja (solo PS4 y PS5).
// Si la cuenta no tiene PlayStation vinculada responde 404 { sin_vinculo: true }.
// Si los trofeos de la persona no son públicos responde 403 { privado: true }.

const p = require("./_psn");
const { portadasDeIgdb } = require("../_portadas-igdb");

function json(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}

const suma = (t) => (t ? (t.bronze || 0) + (t.silver || 0) + (t.gold || 0) + (t.platinum || 0) : 0);
// "PT2H35M10S" → 155 minutos
function minutosDe(duracion) {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(String(duracion || ""));
  return m ? Number(m[1] || 0) * 60 + Number(m[2] || 0) : 0;
}
const limpio = (nombre) => String(nombre || "").replace(/[™®]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Usa POST" });
  const faltan = p.falta();
  if (faltan.length) return json(res, 500, { error: "PlayStation no está configurado en el servidor" });
  const cuenta = await p.cuentaDeLaSesion(req);
  if (!cuenta) return json(res, 401, { error: "Inicia sesión" });

  try {
    const vinculo = await p.leerVinculo(cuenta.id);
    if (!vinculo) return json(res, 404, { error: "PlayStation no está vinculada", sin_vinculo: true });
    const auth = await p.autorizacion();
    const id = vinculo.account_id;

    const [resumen, titulos, jugados] = await Promise.all([
      p.psn.getUserTrophyProfileSummary(auth, id).catch((e) => ({ error: e })),
      p.psn.getUserTitles(auth, id, { limit: 800 }).catch((e) => ({ error: e })),
      p.psn.getUserPlayedGames(auth, id, { limit: 200 }).catch(() => null),
    ]);
    if (resumen.error && titulos.error) {
      console.error("PlayStation privado o sin datos:", String(resumen.error.message || resumen.error));
      return json(res, 403, { error: "Tus trofeos de PlayStation no son públicos.", privado: true });
    }

    // Horas y última vez de getUserPlayedGames (si la privacidad lo deja), por nombre del juego
    const horas = {};
    ((jugados && jugados.titles) || []).forEach((t) => {
      horas[limpio(t.name)] = { minutes: minutosDe(t.playDuration), last: t.lastPlayedDateTime };
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
};

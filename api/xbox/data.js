// /api/xbox/data — los datos de Xbox de quien tiene la sesión (POST con "Authorization: Bearer <sesión>")
//
// Responde { gamertag, gamerscore, foto, games: [...] }. Cada juego:
//   { titleId, name, last_played (segundos), unlocked, total, gamerscore, total_gamerscore, percent }
// Si la cuenta no tiene Xbox vinculada responde 404 { error, sin_vinculo: true }.
// Usa el refresh_token guardado en usuarios_xbox (y guarda el nuevo que da Microsoft).
//
// Logros: titlehub no siempre trae el total de logros (los juegos de celular, de PC o de Xbox 360 a
// veces vienen en 0). Para esos se cuentan uno por uno en achievements.xboxlive.com.
// Portadas: CLAUDE.md solo permite imágenes de IGDB y Steam, así que cada juego se busca por su nombre
// en IGDB (con las claves de Twitch, como api/igdb.js) y se usa esa portada, con crédito a IGDB.

const x = require("./_xbox");

/* ---------- Portadas de IGDB ---------- */
let permisoIgdb = null, permisoIgdbVence = 0;
async function permisoDeIgdb() {
  if (permisoIgdb && Date.now() < permisoIgdbVence) return permisoIgdb;
  const id = process.env.TWITCH_CLIENT_ID, secreto = process.env.TWITCH_CLIENT_SECRET;
  if (!id || !secreto) return null;
  const r = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secreto)}&grant_type=client_credentials`, { method: "POST" });
  if (!r.ok) return null;
  const d = await r.json();
  permisoIgdb = d.access_token;
  permisoIgdbVence = Date.now() + (d.expires_in - 3600) * 1000;
  return permisoIgdb;
}
// "Minecraft para Android", "Forza Horizon 5 (PC)", "Halo™: MCC" → el nombre del juego para buscarlo
function nombreParaBuscar(nombre) {
  return String(nombre || "")
    .replace(/[™®©]/g, "")
    .replace(/\s*[-–:]?\s*(para|for)\s+(android|ios|iphone|windows(\s*10|\s*11)?|pc|xbox[\w\s|]*)$/i, "")
    .replace(/\s*\((pc|windows|xbox[^)]*|android|ios)\)$/i, "")
    .replace(/\s*[-–:]\s*(windows 10|pocket|java|bedrock) edition$/i, "")
    .replace(/"/g, "").trim();
}
// { titleId: "https://images.igdb.com/.../t_cover_big/xxx.jpg" } para los juegos que IGDB encuentre
async function portadasDeIgdb(juegos) {
  const permiso = await permisoDeIgdb().catch(() => null);
  if (!permiso) return {};
  const portadas = {};
  for (let i = 0; i < juegos.length; i += 10) {
    const grupo = juegos.slice(i, i + 10);
    const consulta = grupo.map((j, n) =>
      `query games "j${n}" { fields cover.image_id; search "${nombreParaBuscar(j.name)}"; where cover != null; limit 1; };`).join("\n");
    const r = await fetch("https://api.igdb.com/v4/multiquery", {
      method: "POST", headers: { "Client-ID": process.env.TWITCH_CLIENT_ID, Authorization: `Bearer ${permiso}` }, body: consulta,
    }).catch(() => null);
    if (!r || !r.ok) continue;
    const respuesta = await r.json().catch(() => []);
    respuesta.forEach((q) => {
      const n = Number(String(q.name).slice(1));
      const juego = q.result && q.result[0];
      if (grupo[n] && juego && juego.cover) portadas[grupo[n].titleId] = `https://images.igdb.com/igdb/image/upload/t_cover_big/${juego.cover.image_id}.jpg`;
    });
  }
  return portadas;
}

/* ---------- Logros de un juego (cuando titlehub no trae el total) ---------- */
async function contarLogros(xsts, titleId) {
  const base = `https://achievements.xboxlive.com/users/xuid(${xsts.xuid})/achievements?titleId=${titleId}&maxItems=1000`;
  // Juegos de Xbox One, Series y PC (contrato 2): cada logro dice si está "Achieved"
  const nuevos = await x.xbox(xsts, base, 2).catch(() => null);
  const lista2 = (nuevos && nuevos.achievements) || [];
  if (lista2.length) {
    return { total: lista2.length, unlocked: lista2.filter((a) => a.progressState === "Achieved").length,
      total_gamerscore: lista2.reduce((s, a) => s + Number(((a.rewards || []).find((w) => w.type === "Gamerscore") || {}).value || 0), 0) };
  }
  // Juegos de Xbox 360 y de celular (contrato 1): cada logro dice si está "unlocked"
  const viejos = await x.xbox(xsts, base, 1).catch(() => null);
  const lista1 = (viejos && viejos.achievements) || [];
  if (lista1.length) {
    return { total: lista1.length, unlocked: lista1.filter((a) => a.unlocked).length,
      total_gamerscore: lista1.reduce((s, a) => s + Number(a.gamerscore || 0), 0) };
  }
  return null;
}

function json(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Usa POST" });
  const faltan = x.falta();
  if (faltan.length) return json(res, 500, { error: "Xbox no está configurado en el servidor" });
  const cuenta = await x.cuentaDeLaSesion(req);
  if (!cuenta) return json(res, 401, { error: "Inicia sesión" });

  try {
    const vinculo = await x.leerVinculo(cuenta.id);
    if (!vinculo || !vinculo.refresh_token) return json(res, 404, { error: "Xbox no está vinculada", sin_vinculo: true });

    // Un token nuevo de Microsoft (Microsoft cambia también el refresh_token: se guarda el nuevo)
    let token;
    try {
      token = await x.pedirTokenMicrosoft({ grant_type: "refresh_token", refresh_token: vinculo.refresh_token });
    } catch (e) {
      console.error("Xbox: el permiso venció:", e.message);
      return json(res, 401, { error: "El permiso de Xbox venció: vuelve a vincular Xbox", vencido: true });
    }
    const xsts = await x.xstsDesde(token.access_token);
    await x.guardarVinculo({
      id: cuenta.id, xuid: xsts.xuid, gamertag: xsts.gamertag,
      refresh_token: token.refresh_token || vinculo.refresh_token, sincronizado_el: new Date().toISOString(),
    });

    const [perfil, historia] = await Promise.all([
      x.xbox(xsts, `https://profile.xboxlive.com/users/xuid(${xsts.xuid})/profile/settings?settings=Gamertag,Gamerscore,GameDisplayPicRaw`, 2).catch(() => null),
      x.xbox(xsts, `https://titlehub.xboxlive.com/users/xuid(${xsts.xuid})/titles/titlehistory/decoration/achievement,detail`, 2).catch(() => null),
    ]);
    const ajustes = {};
    ((perfil && perfil.profileUsers && perfil.profileUsers[0] && perfil.profileUsers[0].settings) || []).forEach((s) => { ajustes[s.id] = s.value; });

    const games = ((historia && historia.titles) || [])
      .filter((t) => !t.type || t.type === "Game")
      .map((t) => {
        const a = t.achievement || {};
        const ultima = t.titleHistory && t.titleHistory.lastTimePlayed;
        return {
          titleId: String(t.titleId), name: t.name,
          last_played: ultima ? Math.floor(new Date(ultima).getTime() / 1000) : 0,
          unlocked: a.currentAchievements || 0, total: a.totalAchievements || 0,
          gamerscore: a.currentGamerscore || 0, total_gamerscore: a.totalGamerscore || 0,
          percent: a.progressPercentage || 0,
        };
      })
      .sort((p, q) => q.last_played - p.last_played);

    // Los que vienen sin total de logros: se cuentan uno por uno (hasta 25, los más recientes)
    const sinTotal = games.filter((g) => !g.total).slice(0, 25);
    await Promise.all(sinTotal.map(async (g) => {
      const conteo = await contarLogros(xsts, g.titleId).catch(() => null);
      if (!conteo) return;
      g.total = conteo.total;
      g.unlocked = conteo.unlocked;
      if (conteo.total_gamerscore) g.total_gamerscore = conteo.total_gamerscore;
      g.percent = conteo.total ? Math.round(conteo.unlocked / conteo.total * 100) : 0;
    }));
    // Portadas de IGDB
    const portadas = await portadasDeIgdb(games.slice(0, 60)).catch(() => ({}));
    games.forEach((g) => { g.cover = portadas[g.titleId] || null; });

    return json(res, 200, {
      gamertag: ajustes.Gamertag || xsts.gamertag,
      gamerscore: Number(ajustes.Gamerscore || 0),
      foto: ajustes.GameDisplayPicRaw || null,
      games,
    });
  } catch (e) {
    console.error("Datos de Xbox:", e.message);
    return json(res, 502, { error: "Xbox no respondió. Inténtalo de nuevo." });
  }
};

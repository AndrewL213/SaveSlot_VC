// /api/xbox/data — los datos de Xbox de quien tiene la sesión (POST con "Authorization: Bearer <sesión>")
//
// Responde { gamertag, gamerscore, foto, games: [...] }. Cada juego:
//   { titleId, name, last_played (segundos), unlocked, total, gamerscore, total_gamerscore, percent }
// Si la cuenta no tiene Xbox vinculada responde 404 { error, sin_vinculo: true }.
// Usa el refresh_token guardado en usuarios_xbox (y guarda el nuevo que da Microsoft).

const x = require("./_xbox");

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
          titleId: t.titleId, name: t.name,
          last_played: ultima ? Math.floor(new Date(ultima).getTime() / 1000) : 0,
          unlocked: a.currentAchievements || 0, total: a.totalAchievements || 0,
          gamerscore: a.currentGamerscore || 0, total_gamerscore: a.totalGamerscore || 0,
          percent: a.progressPercentage || 0,
        };
      })
      .sort((p, q) => q.last_played - p.last_played);

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

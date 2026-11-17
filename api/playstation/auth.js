// /api/playstation/auth — vincular un ID de PSN a la cuenta de SaveSlot (POST con "Authorization: Bearer <sesión>")
//
//   1) ?action=codigo  body { onlineId } → { onlineId, codigo } : el ID existe; el código va en el «Sobre mí» de PSN
//   2) ?action=vincular body { onlineId } → { onlineId, nivel } : si el «Sobre mí» tiene el código, se guarda:
//      · usuarios_playstation: el número de la cuenta de PSN (account_id) y el ID (solo lo ve el servidor);
//      · cuentas_vinculadas: la fila "playstation" verificada (la ven todos; la base da los +100 XP la primera vez).
//   3) ?action=desvincular → borra las dos filas.
// Errores: 404 { no_existe }, 409 { sin_codigo } (el «Sobre mí» aún no tiene el código), 409 { en_otra_cuenta },
// 503 { npsso } (hay que pegar un NPSSO nuevo en Vercel).

const p = require("./_psn");

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

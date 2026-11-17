// /api/xbox/auth — vincular la cuenta de Xbox (cuenta de Microsoft) a una cuenta de SaveSlot
//
// Solo vincula (no sirve para entrar): como en Steam y Epic, la app pide primero un permiso firmado.
//   1) POST ?action=preparar con "Authorization: Bearer <sesión>" → { estado } (vale 10 minutos)
//   2) ?action=login&vincular=<estado>&redirect_to=<página de la app con ?xbox=1>
//      → Microsoft pide permiso ("SaveSlot quiere acceder a tu perfil de Xbox") y vuelve aquí con ?code=…
//   3) Se pide el token, se entra a Xbox Live y se lee el gamertag. Se guarda:
//      · usuarios_xbox: el número de la cuenta (xuid), el gamertag y el refresh_token (solo lo ve el servidor);
//      · cuentas_vinculadas: la fila "xbox" verificada (la ven todos; la base da los +100 XP de "vincular").
//   4) Vuelve a redirect_to con ?vinculada=1 (o ?error=…).
// Desvincular: POST ?action=desvincular con la sesión (borra las dos filas).
//
// En Azure, la dirección de regreso (Redirect URI, tipo Web) es https://saveslot-pi.vercel.app/api/xbox/auth

const x = require("./_xbox");

// Solo se vuelve a páginas de la app (localhost solo con PERMITIR_LOCALHOST=1; ver api/_vuelta.js)
const permitido = require("../_vuelta").permitido;
function json(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}
function ir(res, a) { res.statusCode = 302; res.setHeader("Location", a); res.end(); }
function volver(res, destino, params) {
  const u = new URL(destino);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  ir(res, u.toString());
}
// La fila de usuarios (el perfil de SaveSlot) de una cuenta
const filaUsuario = async (idCuenta) => ((await x.rest(`usuarios?auth_id=eq.${idCuenta}&select=id`)) || [])[0] || null;

module.exports = async function handler(req, res) {
  const proto = req.headers["x-forwarded-proto"] ?? "https";
  const host = req.headers["x-forwarded-host"] ?? req.headers.host;
  const url = new URL(req.url, `${proto}://${host}`);
  const miDireccion = `${url.origin}${url.pathname}`;
  const accion = url.searchParams.get("action");

  const faltan = x.falta();
  if (faltan.length) {
    console.error("Faltan variables de entorno: " + faltan.join(", "));
    return json(res, 500, { error: "Xbox no está configurado en el servidor" });
  }

  if (accion === "preparar") {
    const cuenta = req.method === "POST" ? await x.cuentaDeLaSesion(req) : null;
    if (!cuenta) return json(res, 401, { error: "Inicia sesión para vincular Xbox" });
    return json(res, 200, { estado: x.empacar({ u: cuenta.id }) });
  }

  if (accion === "desvincular") {
    const cuenta = req.method === "POST" ? await x.cuentaDeLaSesion(req) : null;
    if (!cuenta) return json(res, 401, { error: "Inicia sesión" });
    try {
      await x.rest(`usuarios_xbox?id=eq.${cuenta.id}`, { method: "DELETE" });
      const fila = await filaUsuario(cuenta.id);
      if (fila) await x.rest(`cuentas_vinculadas?usuario_id=eq.${fila.id}&plataforma=eq.xbox`, { method: "DELETE" });
      return json(res, 200, { listo: true });
    } catch (e) {
      console.error("Desvincular Xbox:", e.message);
      return json(res, 502, { error: "No se pudo desvincular" });
    }
  }

  if (accion === "login") {
    const destino = url.searchParams.get("redirect_to");
    if (!permitido(destino)) return json(res, 400, { error: "redirect_to no permitido" });
    const permiso = x.desempacar(url.searchParams.get("vincular"));
    if (!permiso || !permiso.u) return volver(res, destino, { error: "vinculo_vencido" });
    const p = new URLSearchParams({
      client_id: x.CLIENT_ID, response_type: "code", redirect_uri: miDireccion, scope: x.PERMISOS,
      response_mode: "query", prompt: "select_account", state: x.empacar({ r: destino, u: permiso.u }),
    });
    return ir(res, `${x.MS_AUTORIZAR}?${p}`);
  }

  // Vuelta de Microsoft
  const estado = x.desempacar(url.searchParams.get("state"));
  if (!estado || !permitido(estado.r) || !estado.u) return json(res, 400, { error: "Vuelta de Microsoft no válida o vencida. Inténtalo de nuevo." });
  if (url.searchParams.get("error")) return volver(res, estado.r, { error: url.searchParams.get("error") });
  const code = url.searchParams.get("code");
  if (!code) return volver(res, estado.r, { error: "sin_codigo" });

  try {
    const token = await x.pedirTokenMicrosoft({ grant_type: "authorization_code", code, redirect_uri: miDireccion });
    const xsts = await x.xstsDesde(token.access_token);
    const yaEsta = await x.vinculoDeXuid(xsts.xuid);
    if (yaEsta && yaEsta.id !== estado.u) return volver(res, estado.r, { error: "xbox_en_otra_cuenta" });
    await x.guardarVinculo({
      id: estado.u, xuid: xsts.xuid, gamertag: xsts.gamertag,
      refresh_token: token.refresh_token || null, sincronizado_el: new Date().toISOString(),
    });
    // La fila pública de cuentas vinculadas (la base da los +100 XP la primera vez)
    const fila = await filaUsuario(estado.u);
    if (fila) {
      await x.rest("cuentas_vinculadas?on_conflict=usuario_id,plataforma", {
        method: "POST",
        body: JSON.stringify({ usuario_id: fila.id, plataforma: "xbox", nombre: xsts.gamertag, estado: "verificada" }),
        extra: { Prefer: "resolution=merge-duplicates,return=minimal" },
      });
    }
    return volver(res, estado.r, { vinculada: "1", gamertag: xsts.gamertag });
  } catch (e) {
    console.error("Vincular Xbox falló:", e.message);
    return volver(res, estado.r, { error: e.sinPerfil ? "sin_perfil_xbox" : "xbox_fallo" });
  }
};

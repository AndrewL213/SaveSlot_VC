// /api/epic/token — puente para el inicio de sesión con Epic Games (Supabase Auth → Epic)
//
// Epic solo acepta el Client ID y el Client Secret en la cabecera "Authorization: Basic …", pero Supabase
// (proveedor propio "custom:epic") los manda dentro del cuerpo del pedido. Esta función recibe el pedido
// de Supabase, pone la cabecera que Epic pide y devuelve la respuesta de Epic tal cual.
//
// En Supabase › Authentication › Custom Providers › Epic Games (configuración manual):
//   Token URL = https://saveslot-pi.vercel.app/api/epic/token
// Las demás direcciones son las de Epic (ver spec.md).
//
// No guarda nada ni necesita claves en Vercel: el secret viaja de Supabase a Epic y no se escribe en ningún lado.
// Solo atiende al cliente de SaveSlot y solo reenvía a la dirección de tokens de Epic.

const EPIC_TOKEN = "https://api.epicgames.dev/epic/oauth/v2/token";
const CLIENTE_SAVESLOT = "xyza78918IL9n7gQlFiZU9EYjR6sLLD1"; // el Client ID es público (va en la dirección de inicio de sesión)

function responder(res, estado, datos) {
  res.statusCode = estado;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(datos));
}

async function leerCuerpo(req) {
  if (req.body && typeof req.body === "object") return new URLSearchParams(req.body);
  if (typeof req.body === "string") return new URLSearchParams(req.body);
  let crudo = "";
  for await (const trozo of req) crudo += trozo;
  return new URLSearchParams(crudo);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return responder(res, 405, { error: "invalid_request", error_description: "Usa POST" });
  const cuerpo = await leerCuerpo(req);

  // El cliente puede venir en el cuerpo o ya en la cabecera Basic
  let id = cuerpo.get("client_id");
  let secreto = cuerpo.get("client_secret");
  const basic = /^Basic\s+(.+)$/i.exec(req.headers.authorization || "");
  if (basic) {
    const [i, s] = Buffer.from(basic[1], "base64").toString("utf8").split(":");
    id = id || decodeURIComponent(i || "");
    secreto = secreto || decodeURIComponent(s || "");
  }
  if (id !== CLIENTE_SAVESLOT || !secreto) {
    return responder(res, 401, { error: "invalid_client", error_description: "Cliente no permitido" });
  }

  // Sin datos secretos: solo cómo llegó el cliente (para revisar en los registros de Vercel)
  console.log("Epic token: cliente por " + (basic ? "cabecera Basic" : "cuerpo") + ", secret de " + secreto.length + " caracteres");

  // A Epic va todo menos el cliente (que va en la cabecera)
  const paraEpic = new URLSearchParams();
  for (const [k, v] of cuerpo) if (k !== "client_id" && k !== "client_secret") paraEpic.set(k, v);

  try {
    const r = await fetch(EPIC_TOKEN, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + Buffer.from(`${id}:${secreto}`).toString("base64"),
      },
      body: paraEpic.toString(),
    });
    res.statusCode = r.status;
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(await r.text());
  } catch (e) {
    console.error("Epic no respondió:", e);
    responder(res, 502, { error: "temporarily_unavailable", error_description: "Epic no respondió" });
  }
};

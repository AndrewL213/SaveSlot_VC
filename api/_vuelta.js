// api/_vuelta.js · Comprobaciones de seguridad para volver de Steam, Epic Games y Xbox.
// Empieza con "_": Vercel no la publica como dirección. La usan api/steam/auth.js, api/epic/auth.js y api/xbox/auth.js.
//
// 1) permitido(url): solo se vuelve a páginas de la app (ALLOWED_REDIRECTS). localhost y 127.0.0.1 solo se
//    aceptan si en Vercel está la variable PERMITIR_LOCALHOST=1 (para probar en local). En producción NO se pone:
//    a esa dirección se le pasa el token que abre la sesión.
// 2) Marca del navegador (contra el "login CSRF"): al empezar a entrar con Steam o Epic se guarda un número al
//    azar en una cookie de este navegador y se manda también en el viaje. Al volver, los dos tienen que coincidir.
//    Así nadie puede mandarte un enlace de vuelta que te deje dentro de SU cuenta.

const crypto = require("crypto");

const ALLOWED_REDIRECTS = (process.env.ALLOWED_REDIRECTS || "https://saveslot-pi.vercel.app")
  .split(",").map((s) => s.trim()).filter(Boolean);

function permitido(url) {
  try {
    const u = new URL(url);
    if (["localhost", "127.0.0.1"].includes(u.hostname)) return process.env.PERMITIR_LOCALHOST === "1";
    return ALLOWED_REDIRECTS.some((a) => new URL(a).origin === u.origin);
  } catch { return false; }
}

const DIEZ_MINUTOS = 600; // segundos

// Crea la marca, la guarda en la cookie (solo la ve el servidor, en la ruta de la función) y la devuelve
function crearMarca(res, nombre, ruta) {
  const marca = crypto.randomBytes(16).toString("base64url");
  res.setHeader("Set-Cookie", `${nombre}=${marca}; Path=${ruta}; Max-Age=${DIEZ_MINUTOS}; HttpOnly; Secure; SameSite=Lax`);
  return marca;
}

// ¿La marca que volvió es la de la cookie de este navegador?
function marcaValida(req, nombre, recibida) {
  const cookie = String(req.headers.cookie || "").split(/;\s*/).map((c) => c.split("=")).find((c) => c[0] === nombre);
  const guardada = cookie ? cookie.slice(1).join("=") : "";
  if (!guardada || !recibida) return false;
  const a = Buffer.from(guardada), b = Buffer.from(String(recibida));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// La marca sirve una sola vez: se borra al volver
function borrarMarca(res, nombre, ruta) {
  res.setHeader("Set-Cookie", `${nombre}=; Path=${ruta}; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
}

module.exports = { permitido, crearMarca, marcaValida, borrarMarca };

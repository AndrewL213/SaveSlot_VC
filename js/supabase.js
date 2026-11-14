// SaveSlot · supabase.js
// Conexión con Supabase (la base de datos). Se carga en todas las páginas después de supabase-js
// y antes de js/data.js y js/app.js. Las tablas y sus reglas están en supabase/esquema.sql.
//
// Llave PUBLICABLE: puede estar en el repo público porque los datos los protegen las reglas RLS.
// Nunca pongas aquí la llave secreta.

const SUPABASE_URL = "https://jzshrfiezzysbkzdsjzf.supabase.co";
const SUPABASE_LLAVE_PUBLICABLE = "sb_publishable_jEY8jb8ffoEHueH1qxhwhg_W6Kl8Y20";

// Vuelta con error de un servicio (por ejemplo, Epic o Google rechazaron el inicio de sesión o la vinculación):
// supabase-js, al ver el error en la dirección, borra la sesión que ya estaba abierta. Para que un intento fallido
// no te saque de tu cuenta, el error se quita de la dirección antes de crear el cliente y se guarda en
// sessionStorage ("ss.errorVuelta") para que la pantalla lo explique.
(function apartarErrorDeVuelta() {
  try {
    var params = new URLSearchParams(location.search);
    var hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    var error = params.get("error") || hash.get("error");
    if (!error || hash.get("access_token") || params.get("code")) return;
    sessionStorage.setItem("ss.errorVuelta", JSON.stringify({
      error: error,
      codigo: params.get("error_code") || hash.get("error_code") || "",
      detalle: params.get("error_description") || hash.get("error_description") || ""
    }));
    ["error", "error_code", "error_description"].forEach(function (k) { params.delete(k); });
    history.replaceState(null, "", location.pathname + (params.toString() ? "?" + params : ""));
  } catch (e) { /* sin sessionStorage: sigue igual */ }
})();

// Si la librería supabase-js no cargó (por ejemplo, sin internet), el cliente queda en null
// y la app sigue funcionando con los datos de js/data.js.
const clienteSupabase = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_LLAVE_PUBLICABLE) : null;

// SaveSlot · supabase.js
// Conexión con Supabase (la base de datos). Se carga en todas las páginas después de supabase-js
// y antes de js/data.js y js/app.js. Las tablas y sus reglas están en supabase/esquema.sql.
//
// Llave PUBLICABLE: puede estar en el repo público porque los datos los protegen las reglas RLS.
// Nunca pongas aquí la llave secreta.

const SUPABASE_URL = "https://jzshrfiezzysbkzdsjzf.supabase.co";
const SUPABASE_LLAVE_PUBLICABLE = "sb_publishable_jEY8jb8ffoEHueH1qxhwhg_W6Kl8Y20";

// Si la librería supabase-js no cargó (por ejemplo, sin internet), el cliente queda en null
// y la app sigue funcionando con los datos de js/data.js.
const clienteSupabase = window.supabase ? supabase.createClient(SUPABASE_URL, SUPABASE_LLAVE_PUBLICABLE) : null;

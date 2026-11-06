/* SaveSlot — núcleo: almacenamiento, sesión, layout, utilidades. */
(function () {
  const DATA = window.SS_DATA;

  // ---------- Utilidades ----------
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const params = new URLSearchParams(location.search);
  const gameById = (id) => DATA.games.find((g) => g.id === id);
  const fmt = (n) => Number(n).toLocaleString('es-CO');

  // ---------- Almacenamiento (localStorage con respaldo en memoria) ----------
  const mem = {};
  const store = {
    get(k, def) {
      try { const v = localStorage.getItem('ss.' + k); return v == null ? (k in mem ? mem[k] : def) : JSON.parse(v); }
      catch (e) { return k in mem ? mem[k] : def; }
    },
    set(k, v) { mem[k] = v; try { localStorage.setItem('ss.' + k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
  };

  // ---------- Sesión (demo: sin backend, se guarda en el navegador) ----------
  const auth = {
    user() { return store.get('session', null); },
    login(u) { store.set('session', u); },
    logout() { store.set('session', null); },
    require(actionText) {
      if (auth.user()) return true;
      modal({
        icon: 'user', title: 'Necesitas una cuenta',
        text: 'Para ' + (actionText || 'hacer esto') + ', crea tu cuenta gratis. Lo que escribiste se guarda.',
        actions: [
          { label: 'Crear cuenta gratis', href: 'registro.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search), primary: true },
          { label: 'Ya tengo cuenta', href: 'login.html?volver=' + encodeURIComponent(location.pathname.split('/').pop() + location.search) }
        ]
      });
      return false;
    }
  };

  // ---------- Perfil del usuario (XP, favoritos, diario, etc.) ----------
  const profile = {
    get() {
      return store.get('profile', {
        xp: 1240, level: 12, bio: 'Gamer casual. Aventura, RPG y algo de terror los fines de semana.',
        since: '2024-03-14', favorites: ['nier-automata', 'zelda-totk', 'hollow-knight', 'fnaf-into-the-pit'],
        wishlist: ['hades-ii', 'ghost-of-tsushima', 'elden-ring'], genres: ['Aventura', 'RPG', 'Terror'],
        accounts: { Steam: 'samluq_steam', PlayStation: null, Xbox: null, Nintendo: null },
        playing: 'zelda-totk', missionsDone: ['calificar', 'guia']
      });
    },
    save(p) { store.set('profile', p); },
    addXP(n) { const p = profile.get(); p.xp += n; while (p.xp >= 1500) { p.xp -= 1500; p.level += 1; } profile.save(p); return p; }
  };

  const diary = {
    all() { return store.get('diary', DATA.diarySeed.slice()); },
    add(e) { const d = diary.all(); d.unshift(e); d.sort((a, b) => b.date.localeCompare(a.date)); store.set('diary', d); }
  };

  // ---------- Reseñas propias (historial) ----------
  const reviews = {
    mine() {
      let list = store.get('myReviews', null);
      if (!list) {
        // Migra reseñas publicadas antes de v3 (clave "reviews") y suma las de ejemplo
        const old = store.get('reviews', []).map((r, i) => Object.assign({ id: 'u' + i, date: new Date().toISOString().slice(0, 10), likes: 0 }, r));
        list = old.concat(DATA.myReviews.map((r) => Object.assign({}, r)));
        store.set('myReviews', list);
      }
      const u = auth.user() || { user: 'samluq', initials: 'SL' };
      return list.map((r) => Object.assign({}, r, { user: u.user, initials: u.initials, mine: true }));
    },
    raw() { reviews.mine(); return store.get('myReviews', []); },
    save(list) { store.set('myReviews', list); },
    all() { return reviews.mine().concat(DATA.reviews); },
    byId(id) { return reviews.all().find((r) => r.id === id); },
    comments(id) { return store.get('comments.' + id, null) || DATA.comments.filter((c) => c.review === id); }
  };

  // ---------- Amigos (estado de relación guardado en el navegador) ----------
  const friends = {
    rel(u) { const m = store.get('friends', {}); return m[u] || ((DATA.users.find((x) => x.user === u) || {}).rel) || 'none'; },
    set(u, r) { const m = store.get('friends', {}); m[u] = r; store.set('friends', m); },
    list(r) { return DATA.users.filter((x) => friends.rel(x.user) === r); },
    user(u) { return DATA.users.find((x) => x.user === u); }
  };
  const STATUS_TXT = (f) => f.status === 'playing' ? 'Jugando ' + ((DATA.games.find((g) => g.id === f.game) || {}).short || '') : f.status === 'online' ? 'En línea' : 'Desconectado · ' + (f.last || 'hace un rato');
  function avatar(f, size) {
    size = size || 44;
    return '<span class="av av-' + f.status + '" style="--av:' + (f.color || '#2E3A4A') + ';width:' + size + 'px;height:' + size + 'px;font-size:' + Math.round(size * .36) + 'px">' + esc(f.initials) + '<i aria-hidden="true"></i></span>';
  }
  // Enlace al perfil de una persona (el propio va a perfil.html)
  const userHref = (u) => { const me = auth.user(); return me && me.user === u ? 'perfil.html' : 'usuario.html?u=' + encodeURIComponent(u); };

  // ---------- UI: toast y modal ----------
  let toastTimer;
  function toast(msg, opts) {
    opts = opts || {};
    let el = $('.toast');
    if (!el) { el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.innerHTML = '<span>' + esc(msg) + '</span>' + (opts.action ? '<button type="button" class="toast-action">' + esc(opts.action) + '</button>' : '');
    el.hidden = false;
    if (opts.action) $('.toast-action', el).addEventListener('click', () => { el.hidden = true; if (opts.onAction) opts.onAction(); });
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, opts.action ? 6000 : 2800);
  }
  // Estado de carga en botones (H1, Doherty): feedback inmediato antes de terminar la acción
  function busy(btn, text, ms) {
    return new Promise((res) => {
      if (!btn) return res();
      const old = btn.innerHTML; btn.disabled = true; btn.setAttribute('aria-busy', 'true'); btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>' + esc(text);
      setTimeout(() => { btn.disabled = false; btn.removeAttribute('aria-busy'); btn.innerHTML = old; res(); }, ms || 500);
    });
  }
  // Escala única de calificación: todo se muestra sobre 10 (H4 consistencia)
  const score10 = (r) => r ? (Math.round(r * 2 * 10) / 10).toFixed(1).replace('.', ',') : '—';
  // Vistos recientemente (H6 reconocer en vez de recordar)
  const recent = {
    all() { return store.get('recentGames', []); },
    add(id) { const r = recent.all().filter((x) => x !== id); r.unshift(id); store.set('recentGames', r.slice(0, 6)); }
  };

  const ICONS = {
    user: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6CC0FA" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>',
    check: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#4CC870" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    alert: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F0616D" stroke-width="2" stroke-linecap="round"><path d="M12 3l10 18H2z"/><path d="M12 10v4M12 17.5v.5"/></svg>',
    trophy: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#6CC0FA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/></svg>'
  };
  const ICON_BG = { user: '#1A3157', check: '#1D3A2B', alert: '#2A1E24', trophy: '#1A3157' };

  function modal(o) {
    closeModal();
    const wrap = document.createElement('div');
    wrap.className = 'modal-backdrop';
    wrap.innerHTML =
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="m-title">' +
      '<button class="close" aria-label="Cerrar">✕</button>' +
      (o.icon ? '<span class="icon" style="background:' + ICON_BG[o.icon] + '">' + ICONS[o.icon] + '</span>' : '') +
      '<h2 id="m-title" style="font-size:24px">' + esc(o.title) + '</h2>' +
      (o.text ? '<p class="soft">' + esc(o.text) + '</p>' : '') +
      (o.html || '') +
      '<div class="actions">' + (o.actions || []).map((a, i) =>
        a.href ? '<a class="btn ' + (a.primary ? 'btn-primary' : 'btn-secondary') + '" href="' + esc(a.href) + '">' + esc(a.label) + '</a>'
               : '<button class="btn ' + (a.primary ? 'btn-primary' : 'btn-secondary') + '" data-i="' + i + '">' + esc(a.label) + '</button>').join('') + '</div></div>';
    document.body.appendChild(wrap);
    const close = () => closeModal();
    wrap.addEventListener('click', (e) => { if (e.target === wrap) close(); });
    $('.close', wrap).addEventListener('click', close);
    $$('[data-i]', wrap).forEach((b) => b.addEventListener('click', () => { const a = o.actions[b.dataset.i]; if (a.onClick) a.onClick(); if (!a.keepOpen) close(); }));
    document.addEventListener('keydown', escClose);
    const first = $('.actions .btn', wrap); if (first) first.focus();
  }
  function escClose(e) { if (e.key === 'Escape') closeModal(); }
  function closeModal() { const m = $('.modal-backdrop'); if (m) m.remove(); document.removeEventListener('keydown', escClose); }

  // ---------- Componentes ----------
  function cover(g, opts) {
    opts = opts || {};
    const bg = g.image ? 'background-image:url(' + esc(g.image) + ');background-size:cover;background-position:center;' : '';
    if (opts.small) return '<span class="cover cover-sm" style="--c:' + g.color + ';' + bg + '" aria-hidden="true"></span>';
    return '<div class="cover" style="--c:' + g.color + ';' + bg + (opts.style || '') + '">' + (opts.rank ? '<span class="rank">#' + opts.rank + '</span>' : '') + (opts.noTitle ? '' : '<b>' + esc(g.short) + '</b>') + '</div>';
  }
  function gameTile(g, rank) {
    return '<a class="game-tile" href="juego.html?id=' + encodeURIComponent(g.id) + '">' + cover(g, { rank: rank }) +
      '<div class="meta"><span>' + esc(g.genres[0] || '') + '</span><span class="score" aria-label="Nota de la comunidad ' + score10(g.rating) + ' de 10">' + (g.rating ? score10(g.rating) : '') + '</span></div></a>';
  }
  function skulls(n) { let s = '<div class="skulls" aria-label="Dificultad ' + n + ' de 10">'; for (let i = 1; i <= 10; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>'; return s + '</div>'; }

  // ---------- Layout ----------
  const NAV = [
    ['index.html', 'Inicio', 'inicio'], ['buscar.html', 'Juegos', 'juegos'], ['comunidad.html', 'Comunidad', 'comunidad'],
    ['eventos.html', 'Eventos', 'eventos'], ['matchplay.html', 'MatchPlay', 'matchplay']
  ];
  const LOGO = '<svg width="28" height="20" viewBox="0 0 28 20" aria-hidden="true"><rect x="1.5" y="1.5" width="25" height="17" rx="3" fill="none" stroke="#3DA9F5" stroke-width="3"/><rect x="6" y="12" width="16" height="3" fill="#3DA9F5"/></svg>';

  function renderLayout() {
    const section = document.body.dataset.section || '';
    const u = auth.user();
    const p = profile.get();
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML =
      '<div class="container">' +
      '<a class="logo" href="index.html">' + LOGO + 'SaveSlot</a>' +
      '<button class="icon-btn search-toggle" aria-label="Buscar" aria-expanded="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button>' +
      '<nav class="main-nav" aria-label="Principal">' + NAV.map((n) => '<a href="' + n[0] + '"' + (n[2] === section ? ' aria-current="page"' : '') + '>' + n[1] + '</a>').join('') + '</nav>' +
      '<form class="header-search" role="search" action="buscar.html"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9AA8B8" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<label class="sr-only" for="hq">Buscar juegos</label><input id="hq" name="q" type="search" list="ss-games" autocomplete="off" placeholder="Buscar juegos" value="' + esc(section === 'juegos' ? (params.get('q') || '') : '') + '"><kbd class="kbd hide-sm" title="Atajo: pulsa / para buscar">/</kbd></form>' +
      (u ? '<a class="icon-btn hide-sm" href="amigos.html" aria-label="Amigos" title="Amigos"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c2 .7 3.5 2.4 3.5 5.2"/></svg>' + (friends.list('in').length ? '<span class="dot" style="background:var(--good)"></span>' : '') + '</a><button class="icon-btn" id="notif" aria-label="Notificaciones, 2 nuevas"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E6EBF1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg><span class="dot"></span></button>' +
           '<a class="user-pill" href="perfil.html"><span class="avatar">' + esc(u.initials) + '</span><span><b>' + esc(u.name.split(' ')[0]) + '</b><span>Nivel ' + p.level + '</span></span></a>'
         : '<a class="btn btn-secondary btn-sm hide-sm" href="login.html">Iniciar sesión</a><a class="btn btn-primary btn-sm" href="registro.html">Crear cuenta</a>') +
      '</div>';
    document.body.prepend(header);
    // Sugerencias de nombres de juegos para todos los buscadores (H5, H6)
    if (!$('#ss-games')) { const dl = document.createElement('datalist'); dl.id = 'ss-games'; dl.innerHTML = DATA.games.map((g) => '<option value="' + esc(g.name) + '">').join(''); document.body.appendChild(dl); }
    $$('input[type="search"]').forEach((i) => { if (!i.getAttribute('list')) { i.setAttribute('list', 'ss-games'); i.setAttribute('autocomplete', 'off'); } });
    // Atajo de teclado "/" para buscar (H7 flexibilidad)
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) return;
      e.preventDefault(); const f = $('.header-search', header); f.classList.add('open'); $('input', f).focus();
    });
    if (window.SS_API && SS_API.usingDemo && !store.get('hideDemo', false)) {
      const bar = document.createElement('div');
      bar.className = 'demo-bar';
      bar.innerHTML = '<span>Prototipo académico: los datos de juegos son de ejemplo hasta conectar las APIs. <a href="error.html?tipo=demo">Más información</a></span><button type="button" class="demo-close" aria-label="Ocultar aviso del prototipo">✕</button>';
      header.after(bar);
      $('.demo-close', bar).addEventListener('click', () => { store.set('hideDemo', true); bar.remove(); });
    }
    const tgl = $('.search-toggle', header);
    tgl.addEventListener('click', () => { const f = $('.header-search', header); f.classList.toggle('open'); tgl.setAttribute('aria-expanded', f.classList.contains('open')); if (f.classList.contains('open')) $('input', f).focus(); });

    // Barra inferior para móviles (zona del pulgar)
    const TAB_SECTION = { comunidad: 'juegos', cuenta: 'perfil', ayuda: '' };
    const active = TAB_SECTION[section] !== undefined ? TAB_SECTION[section] : section;
    const ICON = {
      inicio: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
      juegos: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 11v3M5.5 12.5h3"/><circle cx="16" cy="11.5" r="1"/><circle cx="18" cy="13.5" r="1"/>',
      eventos: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
      matchplay: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.7A8 8 0 1 1 21 12z"/><path d="M9 11h.01M12 11h.01M15 11h.01"/>',
      perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'
    };
    const TABS = [['index.html', 'Inicio', 'inicio'], ['buscar.html', 'Juegos', 'juegos'], ['eventos.html', 'Eventos', 'eventos'], ['matchplay.html', 'MatchPlay', 'matchplay'], [u ? 'perfil.html' : 'login.html', u ? 'Perfil' : 'Entrar', 'perfil']];
    const tabbar = document.createElement('nav');
    tabbar.className = 'tabbar';
    tabbar.setAttribute('aria-label', 'Navegación principal');
    tabbar.innerHTML = TABS.map((t) => '<a href="' + t[0] + '"' + (t[2] === active ? ' aria-current="page"' : '') + '><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[t[2]] + '</svg><span>' + t[1] + '</span></a>').join('');
    document.body.appendChild(tabbar);
    const nb = $('#notif', header);
    if (nb) nb.addEventListener('click', () => { const req = friends.list('in'); modal({ icon: 'trophy', title: 'Notificaciones', html: '<div class="stack" style="width:100%;text-align:left;gap:10px">' + (req.length ? '<a class="card card-link" href="amigos.html#solicitudes"><b>' + req.length + ' solicitudes de amistad</b><span class="small muted">' + req.map((r) => esc(r.name)).join(', ') + '</span></a>' : '') + '<a class="card card-link" href="ver-resena.html?id=m1"><span>Kenneth y Daniela comentaron tu reseña de Zelda: TOTK.</span></a><a class="card card-link" href="historial.html"><span>Tu reseña de NieR: Automata recibió 12 votos de “útil”.</span></a><a class="card card-link" href="evento.html?id=copa-2v2"><span>La Copa SaveSlot 2v2 cierra inscripciones el viernes.</span></a></div>', actions: [{ label: 'Cerrar' }] }); });

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML =
      '<div class="container">' +
      '<div style="display:flex;flex-direction:column;gap:10px;max-width:320px"><b style="font-size:20px">SaveSlot</b><span class="muted small">Tu solución gamer. Todos tus juegos y sus comunidades en un solo lugar.</span></div>' +
      '<nav aria-label="Pie de página">' +
      '<div><b>Explora</b><a href="buscar.html">Juegos</a><a href="random.html">Juego random</a><a href="eventos.html">Eventos</a></div>' +
      '<div><b>Cuenta</b><a href="perfil.html">Mi perfil</a><a href="amigos.html">Amigos</a><a href="historial.html">Historial de reseñas</a><a href="diario.html">Diario</a><a href="logros.html">Logros</a>' + (u ? '<a href="#" id="logout">Cerrar sesión</a>' : '<a href="login.html">Iniciar sesión</a>') + '</div>' +
      '<div><b>Ayuda</b><a href="contacto.html">Contáctanos</a><a href="error.html?tipo=estado">Estado de servicios</a><a href="eventos.html#reglas">Reglas de eventos</a></div>' +
      '</nav>' +
      '<p class="credits">Proyecto académico sin fines comerciales · Creación Digital, Universidad El Bosque. Nombres de juegos y marcas pertenecen a sus dueños. Datos de juegos: ejemplo' + (window.SS_API && !SS_API.usingDemo ? ' y <a href="https://rawg.io" target="_blank" rel="noopener">RAWG</a>' : '') + '.</p>' +
      '</div>';
    document.body.appendChild(footer);
    const lo = $('#logout', footer);
    if (lo) lo.addEventListener('click', (e) => { e.preventDefault(); auth.logout(); location.href = 'index.html'; });
  }

  // Simulación de fallos para probar la página de error: ?simular=limite|api|tiempo|mantenimiento|sin-conexion|credenciales
  function checkSimulation() {
    const s = params.get('simular');
    if (s && document.body.dataset.page !== 'error') { SS_API.fail(s, params.get('servicio') || 'API de prueba'); return true; }
    return false;
  }
  window.addEventListener('offline', () => toast('Sin conexión. Algunas funciones no estarán disponibles.'));
  window.addEventListener('online', () => toast('Conexión recuperada'));
  if (false) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
  }

  window.SS = { $, $$, esc, params, store, auth, profile, diary, reviews, friends, avatar, STATUS_TXT, userHref, toast, busy, score10, recent, modal, closeModal, cover, gameTile, skulls, gameById, fmt, DATA };

  document.addEventListener('DOMContentLoaded', () => {
    if (checkSimulation()) return;
    renderLayout();
    const page = document.body.dataset.page;
    const init = window.SS_PAGES && window.SS_PAGES[page];
    if (init) {
      Promise.resolve().then(init).catch((e) => { console.error(e); });
    }
  });
})();

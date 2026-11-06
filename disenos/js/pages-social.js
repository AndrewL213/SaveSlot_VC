/* SaveSlot — amigos, perfil público, historial de reseñas y detalle de reseña. */
window.SS_PAGES = window.SS_PAGES || {};
(function (P) {
  const { $, $$, esc, params, store, auth, profile, diary, reviews: RV, friends, avatar, STATUS_TXT, userHref, toast, busy, modal, cover, gameById, fmt, DATA } = window.SS;
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const dateTxt = (d) => { if (!d) return ''; const [y, m, dd] = d.split('-'); return Number(dd) + ' ' + MONTHS[Number(m) - 1] + ' ' + y; };
  const me = () => auth.user() || { name: 'Invitado', user: 'invitado', initials: 'TÚ' };
  const myScores = () => { const m = {}; diary.all().forEach((x) => { if (x.score && !(x.game in m)) m[x.game] = x.score; }); return m; };
  const common = (f) => { const mine = myScores(); return Object.keys(f.played || {}).filter((id) => id in mine); };
  const bannerFor = (ids) => { const c = ids.map(gameById).filter(Boolean).map((g) => g.color); while (c.length < 3) c.push('#1F4A8A'); return 'linear-gradient(115deg,' + c[0] + ' 0%,' + c[1] + ' 45%,' + c[2] + ' 100%)'; };
  const statusLine = (f) => '<span class="status st-' + f.status + '">' + esc(STATUS_TXT(f)) + '</span>';

  // ---------- Perfil propio: amigos y banner ----------
  const basePerfil = P.perfil;
  P.perfil = function () {
    basePerfil();
    if (!auth.user()) return;
    const p = profile.get();
    $('#banner').style.background = bannerFor(p.favorites);
    const list = friends.list('friend').sort((a, b) => ['playing', 'online', 'offline'].indexOf(a.status) - ['playing', 'online', 'offline'].indexOf(b.status));
    $('#fr-count').textContent = '· ' + list.length;
    $('#friends-mini').innerHTML = list.slice(0, 8).map((f) => '<a href="' + userHref(f.user) + '" title="' + esc(f.name + ' · ' + STATUS_TXT(f)) + '">' + avatar(f, 44) + '</a>').join('') || '<span class="muted small">Aún no tienes amigos. <a class="link-strong" href="amigos.html#sugerencias">Ver sugerencias</a></span>';
    const req = friends.list('in');
    if (req.length) { const r = $('#fr-req'); r.hidden = false; r.innerHTML = avatar(req[0], 32) + '<span class="small"><b>' + req.length + ' solicitudes</b> de amistad pendientes</span><span style="margin-left:auto" aria-hidden="true">→</span>'; }
  };

  // ---------- Lista de amigos ----------
  P.amigos = function () {
    if (!auth.user()) { location.replace('login.html?volver=amigos.html'); return; }
    let tab = ({ '#solicitudes': 'in', '#sugerencias': 'none', '#en-linea': 'on' })[location.hash] || 'all';
    let q = '';
    $('#my-handle').textContent = '@' + me().user;
    $('#copy-handle').addEventListener('click', () => { const t = '@' + me().user; if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => toast('Usuario copiado'), () => toast(t)); else toast(t); });

    function stats() {
      const fr = friends.list('friend');
      $('#f-stats').innerHTML = [[fr.length, 'Amigos'], [fr.filter((f) => f.status !== 'offline').length, 'En línea'], [fr.filter((f) => f.status === 'playing').length, 'Jugando ahora']]
        .map((s) => '<div class="hs"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('');
    }
    function card(f) {
      const rel = friends.rel(f.user);
      const g = f.status === 'playing' ? gameById(f.game) : null;
      const cm = common(f);
      const commons = cm.slice(0, 4).map((id) => { const x = gameById(id); return x ? cover(x, { small: true }) : ''; }).join('');
      let actions = '';
      if (rel === 'friend') actions = '<a class="btn btn-secondary btn-sm" href="' + userHref(f.user) + '">Ver perfil</a><button class="btn btn-secondary btn-sm" data-msg="' + f.user + '">Mensaje<span class="soon">Pronto</span></button><button class="btn btn-ghost btn-sm" data-rm="' + f.user + '" aria-label="Eliminar a ' + esc(f.name) + ' de tus amigos">Eliminar</button>';
      else if (rel === 'in') actions = '<button class="btn btn-primary btn-sm" data-accept="' + f.user + '">Aceptar</button><button class="btn btn-secondary btn-sm" data-reject="' + f.user + '">Rechazar</button><a class="btn btn-ghost btn-sm" href="' + userHref(f.user) + '">Ver perfil</a>';
      else if (rel === 'out') actions = '<span class="badge badge-outline">SOLICITUD ENVIADA</span><button class="btn btn-ghost btn-sm" data-cancel="' + f.user + '">Cancelar</button>';
      else actions = '<button class="btn btn-primary btn-sm" data-add="' + f.user + '">+ Agregar</button><a class="btn btn-ghost btn-sm" href="' + userHref(f.user) + '">Ver perfil</a>';
      return '<article class="friend-card' + (g ? ' is-playing" style="--c:' + g.color : '') + '">' +
        '<div class="row" style="flex-wrap:nowrap;gap:14px">' + avatar(f, 56) + '<div class="grow" style="line-height:1.35"><a class="user-link" href="' + userHref(f.user) + '"><b style="font-size:17px">' + esc(f.name) + '</b></a><br><span class="xs muted">@' + esc(f.user) + ' · Nivel ' + f.level + '</span><br>' + statusLine(f) + '</div></div>' +
        (g ? '<a class="now-playing" href="juego.html?id=' + g.id + '">' + cover(g, { small: true }) + '<span><span class="xs" style="color:var(--good);font-weight:800;letter-spacing:.06em">EN JUEGO</span><br><b>' + esc(g.short) + '</b></span></a>' : '') +
        (rel === 'none' || rel === 'in' ? '<span class="xs muted">' + (f.mutual || 0) + ' amigos en común · ' + cm.length + ' juegos en común</span>' : cm.length ? '<div class="row" style="gap:8px"><span class="commons">' + commons + '</span><span class="xs muted">' + cm.length + ' juegos en común</span></div>' : '<span class="xs muted">Sin juegos en común todavía</span>') +
        '<div class="row" style="gap:6px;margin-top:auto">' + actions + '</div></article>';
    }
    function render() {
      stats();
      const counts = { all: friends.list('friend').length, on: friends.list('friend').filter((f) => f.status !== 'offline').length, in: friends.list('in').length, none: friends.list('none').length + friends.list('out').length };
      $('#f-tabs').innerHTML = [['all', 'Todos'], ['on', 'En línea'], ['in', 'Solicitudes'], ['none', 'Sugerencias']].map((t) =>
        '<button role="tab" aria-selected="' + (t[0] === tab) + '" data-tab="' + t[0] + '">' + t[1] + '<span class="count' + (t[0] === 'in' && counts.in ? ' count-hot' : '') + '">' + counts[t[0]] + '</span></button>').join('');
      let list = tab === 'all' ? friends.list('friend') : tab === 'on' ? friends.list('friend').filter((f) => f.status !== 'offline') : tab === 'in' ? friends.list('in') : friends.list('none').concat(friends.list('out'));
      const order = ['playing', 'online', 'offline'];
      list = list.sort((a, b) => order.indexOf(a.status) - order.indexOf(b.status));
      if (q) list = list.filter((f) => (f.name + ' ' + f.user).toLowerCase().includes(q));
      const empty = { all: 'Aún no tienes amigos. Revisa las sugerencias.', on: 'Ninguno de tus amigos está en línea ahora.', in: 'No tienes solicitudes pendientes.', none: 'No hay más sugerencias por ahora.' }[tab];
      $('#f-list').innerHTML = list.map(card).join('') || '<div class="empty" style="grid-column:1/-1">' + (q ? 'Nadie coincide con “' + esc(q) + '”. <button class="btn btn-secondary btn-sm" id="clear-q">Limpiar búsqueda</button>' : esc(empty)) + '</div>';
      const cq = $('#clear-q'); if (cq) cq.addEventListener('click', () => { q = ''; $('#f-q').value = ''; render(); });
    }
    $('#f-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-tab]'); if (b) { tab = b.dataset.tab; render(); } });
    $('#f-q').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase().replace(/^@/, ''); render(); });
    $('#f-list').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      const u = b.dataset.rm || b.dataset.accept || b.dataset.reject || b.dataset.add || b.dataset.cancel || b.dataset.msg; if (!u) return;
      const f = friends.user(u), prev = friends.rel(u);
      const undo = () => { friends.set(u, prev); render(); };
      if (b.dataset.msg) { toast('Los mensajes directos llegarán en una próxima versión'); return; }
      if (b.dataset.rm) { friends.set(u, 'none'); toast(f.name + ' ya no está en tus amigos', { action: 'Deshacer', onAction: undo }); }
      if (b.dataset.accept) { friends.set(u, 'friend'); profile.addXP(10); toast('Ahora eres amigo de ' + f.name + ' · +10 XP'); }
      if (b.dataset.reject) { friends.set(u, 'none'); toast('Solicitud rechazada', { action: 'Deshacer', onAction: undo }); }
      if (b.dataset.add) { friends.set(u, 'out'); toast('Solicitud enviada a ' + f.name, { action: 'Deshacer', onAction: undo }); }
      if (b.dataset.cancel) { friends.set(u, 'none'); toast('Solicitud cancelada'); }
      render();
    });
    $('#add-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const inp = $('#add-u'), err = $('#add-err'); const v = inp.value.trim().replace(/^@/, '').toLowerCase();
      const show = (m) => { err.textContent = m; err.hidden = !m; inp.setAttribute('aria-invalid', !!m); };
      if (!v) { show('Escribe el usuario de tu amigo, por ejemplo @feli_fps.'); inp.focus(); return; }
      if (v === me().user) { show('Ese es tu propio usuario.'); return; }
      const f = friends.user(v);
      if (!f) { show('No encontramos a @' + v + '. Revisa que esté bien escrito; también puedes ver la pestaña Sugerencias.'); return; }
      const rel = friends.rel(v);
      if (rel === 'friend') { show('@' + v + ' ya está en tus amigos.'); return; }
      show('');
      await busy($('#add-form button[type="submit"]'), 'Enviando…', 400);
      if (rel === 'in') { friends.set(v, 'friend'); toast('Tenía una solicitud tuya pendiente: ahora son amigos'); }
      else { friends.set(v, 'out'); toast('Solicitud enviada a ' + f.name); }
      inp.value = ''; tab = rel === 'in' ? 'all' : 'none'; render();
    });

    // Actividad reciente de amigos
    const feed = DATA.reviews.filter((r) => friends.rel(r.user) === 'friend').slice(0, 5).map((r) => { const f = friends.user(r.user), g = gameById(r.game); return '<a class="feed-item" href="ver-resena.html?id=' + r.id + '">' + avatar(f, 32) + '<span class="small"><b>' + esc(f.name.split(' ')[0]) + '</b> reseñó <b>' + esc(g.short) + '</b> <span class="score">' + r.score + '/10</span><br><span class="xs muted">' + dateTxt(r.date) + '</span></span></a>'; });
    const playing = friends.list('friend').filter((f) => f.status === 'playing').map((f) => { const g = gameById(f.game); return '<a class="feed-item" href="juego.html?id=' + g.id + '">' + avatar(f, 32) + '<span class="small"><b>' + esc(f.name.split(' ')[0]) + '</b> está jugando <b>' + esc(g.short) + '</b><br><span class="xs" style="color:var(--good)">Ahora</span></span></a>'; });
    $('#feed').innerHTML = playing.concat(feed).join('') || '<span class="muted small">Sin actividad reciente.</span>';
    render();
  };

  // ---------- Perfil público de otra persona ----------
  P.usuario = function () {
    const f = friends.user(params.get('u'));
    if (!f) { location.replace('404.html'); return; }
    if (auth.user() && auth.user().user === f.user) { location.replace('perfil.html'); return; }
    document.title = f.name + ' · SaveSlot';
    $('#banner').style.background = bannerFor(f.favorites);
    $('#u-avatar').innerHTML = avatar(f, 124);
    $('#u-name').textContent = f.name;
    $('#u-handle').textContent = '@' + f.user;
    $('#u-badges').innerHTML = '<span class="badge badge-accent">NIVEL ' + f.level + '</span>' + statusLine(f);
    $('#u-bio').textContent = f.bio;
    $('#u-since').textContent = 'Miembro desde ' + new Date(f.since + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });

    function actions() {
      const rel = friends.rel(f.user);
      $('#u-actions').innerHTML = rel === 'friend' ? '<span class="badge badge-friend" style="padding:8px 12px">✓ AMIGOS</span><button class="btn btn-secondary" data-act="msg">Mensaje<span class="soon">Pronto</span></button><button class="btn btn-ghost" data-act="rm">Eliminar amigo</button>'
        : rel === 'in' ? '<button class="btn btn-primary" data-act="accept">Aceptar solicitud</button><button class="btn btn-secondary" data-act="reject">Rechazar</button>'
          : rel === 'out' ? '<span class="badge badge-outline" style="padding:8px 12px">SOLICITUD ENVIADA</span><button class="btn btn-ghost" data-act="cancel">Cancelar</button>'
            : '<button class="btn btn-primary" data-act="add">+ Agregar amigo</button>';
    }
    actions();
    $('#u-actions').addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      if (!auth.require('agregar amigos')) return;
      const prev = friends.rel(f.user), a = b.dataset.act;
      if (a === 'msg') { toast('Los mensajes directos llegarán en una próxima versión'); return; }
      const next = { rm: 'none', accept: 'friend', reject: 'none', cancel: 'none', add: 'out' }[a];
      friends.set(f.user, next); actions();
      toast({ rm: 'Eliminado de tus amigos', accept: 'Ahora son amigos', reject: 'Solicitud rechazada', cancel: 'Solicitud cancelada', add: 'Solicitud enviada' }[a], a === 'rm' || a === 'add' ? { action: 'Deshacer', onAction: () => { friends.set(f.user, prev); actions(); } } : {});
    });

    const g = f.status === 'playing' ? gameById(f.game) : null;
    $('#u-activity').innerHTML = g ? '<a class="now-playing" style="--c:' + g.color + '" href="juego.html?id=' + g.id + '">' + cover(g, { small: true }) + '<span><span class="xs" style="color:var(--good);font-weight:800">● JUGANDO AHORA</span><br><b>' + esc(g.short) + '</b></span></a>' : '<span class="muted small">' + esc(STATUS_TXT(f)) + '</span>';

    const mutual = friends.list('friend').filter((x) => x.user !== f.user).slice(0, f.mutual || 3);
    $('#u-mutual-n').textContent = mutual.length;
    $('#u-mutual').innerHTML = mutual.map((x) => '<a href="' + userHref(x.user) + '" title="' + esc(x.name) + '">' + avatar(x, 40) + '</a>').join('') || '<span class="muted small">Ninguno</span>';

    const revs = DATA.reviews.filter((r) => r.user === f.user);
    const cm = common(f);
    $('#u-stats').innerHTML = [[Object.keys(f.played).length + 18, 'Juegos'], [revs.length, 'Reseñas'], [cm.length, 'En común'], [f.mutual || mutual.length, 'Amigos en común']].map((s) => '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('');
    $('#u-favs').innerHTML = f.favorites.map((id) => { const x = gameById(id); return x ? '<a class="game-tile" href="juego.html?id=' + x.id + '">' + cover(x) + '</a>' : ''; }).join('');
    const mine = myScores();
    $('#u-common').innerHTML = cm.length ? cm.map((id) => { const x = gameById(id), a = f.played[id], b = mine[id];
      return '<a class="compare-row" href="juego.html?id=' + x.id + '">' + cover(x, { small: true }) + '<b class="grow">' + esc(x.short) + '</b>' +
        '<span class="cmp"><span class="xs muted">' + esc(f.name.split(' ')[0]) + '</span><span class="meter" style="width:90px"><i style="width:' + a * 10 + '%"></i></span><b>' + a + '</b></span>' +
        '<span class="cmp"><span class="xs muted">Tú</span><span class="meter good" style="width:90px"><i style="width:' + b * 10 + '%"></i></span><b>' + b + '</b></span></a>'; }).join('')
      : '<div class="empty">Todavía no tienen juegos en común en el diario.</div>';
    $('#u-reviews').innerHTML = revs.map((r) => { const x = gameById(r.game); return '<a class="card card-link" href="ver-resena.html?id=' + r.id + '" style="--c:' + x.color + '"><div class="row" style="flex-wrap:nowrap">' + cover(x, { small: true }) + '<span class="grow"><b>' + esc(x.short) + '</b><br><span class="xs muted">' + dateTxt(r.date) + '</span></span><span class="score-pill">' + r.score + '<small>/10</small></span></div><p class="soft small clamp-3">' + esc(r.spoiler ? 'Contiene spoilers. Ábrela para leerla.' : r.text) + '</p><span class="xs muted">♥ ' + r.likes + ' · Útil ' + r.useful + '</span></a>'; }).join('') || '<div class="empty">Aún no publica reseñas.</div>';
  };

  // ---------- Historial de reseñas ----------
  P.historial = function () {
    if (!auth.user()) { location.replace('login.html?volver=historial.html'); return; }
    let q = '', band = 'all', sort = 'recientes';
    function summary() {
      const all = RV.mine();
      const avg = all.length ? all.reduce((a, r) => a + r.score, 0) / all.length : 0;
      $('#h-stats').innerHTML = [[all.length, 'Reseñas'], [fmt(all.reduce((a, r) => a + (r.likes || 0), 0)), 'Me gusta recibidos'], [fmt(all.reduce((a, r) => a + (r.useful || 0), 0)), 'Votos de “útil”'], [avg.toFixed(1).replace('.', ','), 'Nota promedio']]
        .map((s) => '<div class="stat"><b>' + s[0] + '</b><span>' + s[1] + '</span></div>').join('');
    }
    function row(r) {
      const g = gameById(r.game); if (!g) return '';
      const nC = RV.comments(r.id).length;
      return '<article class="history-row" style="--c:' + g.color + '" data-id="' + r.id + '">' +
        '<a href="juego.html?id=' + g.id + '" class="hr-cover" tabindex="-1" aria-hidden="true">' + cover(g, { noTitle: true }) + '</a>' +
        '<div class="hr-body"><div class="row between" style="gap:8px"><div><a class="user-link" href="ver-resena.html?id=' + r.id + '"><b style="font-size:18px">' + esc(g.short) + '</b></a><br><span class="xs muted">' + dateTxt(r.date) + ' · ' + esc(r.state || 'Terminado') + ' · ' + (r.hours || 0) + ' h' + (r.edited ? ' · Editada' : '') + '</span></div><span class="score-pill">' + r.score + '<small>/10</small></span></div>' +
        '<p class="soft clamp-2">' + (r.spoiler ? '<span class="badge badge-outline" style="margin-right:6px">SPOILER</span>' : '') + esc(r.text) + '</p>' +
        '<div class="row between" style="gap:8px"><span class="xs muted">♥ ' + (r.likes || 0) + ' · Útil ' + (r.useful || 0) + ' · ' + nC + (nC === 1 ? ' comentario' : ' comentarios') + '</span>' +
        '<span class="row" style="gap:4px"><a class="btn btn-secondary btn-sm" href="ver-resena.html?id=' + r.id + '">Ver</a><a class="btn btn-secondary btn-sm" href="resena.html?id=' + g.id + '&editar=' + r.id + '">Editar</a><button class="btn btn-ghost btn-sm" data-del="' + r.id + '" aria-label="Eliminar reseña de ' + esc(g.short) + '">Eliminar</button></span></div></div></article>';
    }
    function render() {
      summary();
      const all = RV.mine();
      let list = all.filter((r) => { const g = gameById(r.game); return (!q || (g.name + ' ' + r.text).toLowerCase().includes(q)) && (band === 'all' || (band === '9' ? r.score >= 9 : band === '7' ? r.score >= 7 && r.score <= 8 : r.score <= 6)); });
      const by = { recientes: (a, b) => b.date.localeCompare(a.date), antiguas: (a, b) => a.date.localeCompare(b.date), nota: (a, b) => b.score - a.score, utiles: (a, b) => (b.useful || 0) - (a.useful || 0) }[sort];
      list.sort(by);
      $('#h-count').textContent = 'Mostrando ' + list.length + ' de ' + all.length + ' reseñas';
      $('#h-list').innerHTML = list.map(row).join('') || (all.length
        ? '<div class="empty">Ninguna reseña coincide con los filtros. <button class="btn btn-secondary btn-sm" id="h-clear">Limpiar filtros</button></div>'
        : '<div class="empty"><b style="color:var(--fg)">Aún no escribes reseñas.</b><span>Cuenta qué te pareció el último juego que terminaste.</span><a class="btn btn-primary btn-sm" href="buscar.html">Escribir mi primera reseña</a></div>');
      const c = $('#h-clear'); if (c) c.addEventListener('click', () => { q = ''; band = 'all'; $('#h-q').value = ''; $$('#h-score [data-s]').forEach((x) => x.setAttribute('aria-pressed', x.dataset.s === 'all')); render(); });
    }
    $('#h-q').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); render(); });
    $('#h-score').addEventListener('click', (e) => { const b = e.target.closest('[data-s]'); if (!b) return; band = b.dataset.s; $$('#h-score [data-s]').forEach((x) => x.setAttribute('aria-pressed', x === b)); render(); });
    $('#h-sort').addEventListener('change', (e) => { sort = e.target.value; render(); });
    $('#h-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-del]'); if (!b) return;
      const list = RV.raw(), i = list.findIndex((r) => r.id === b.dataset.del); if (i < 0) return;
      const [gone] = list.splice(i, 1); RV.save(list); render();
      toast('Reseña eliminada', { action: 'Deshacer', onAction: () => { const l = RV.raw(); l.splice(i, 0, gone); RV.save(l); render(); } });
    });
    render();
  };

  // ---------- Detalle de una reseña ----------
  P.verresena = function () {
    const r = RV.byId(params.get('id'));
    if (!r) { location.replace('404.html'); return; }
    const g = gameById(r.game);
    const f = r.mine ? null : friends.user(r.user);
    const author = r.mine ? Object.assign({ status: 'online', color: '#1F4A8A', name: me().name, level: profile.get().level }, { user: r.user, initials: r.initials }) : (f || { user: r.user, initials: r.initials, name: r.user, status: 'offline', color: '#2E3A4A', level: '—' });
    document.title = 'Reseña de ' + g.short + ' · SaveSlot';
    $('#band').style.setProperty('--band', 'color-mix(in srgb,' + g.color + ' 60%, #12161D)');
    $('#crumb-game').textContent = g.short; $('#crumb-game').href = 'juego.html?id=' + g.id;
    $('#v-cover').outerHTML = '<a href="juego.html?id=' + g.id + '" class="game-tile" style="width:160px;flex:none">' + cover(g) + '</a>';
    $('#v-eyebrow').textContent = 'Reseña · ' + g.genres.join(' · ');
    $('#v-title').textContent = g.name;
    $('#v-author').innerHTML = avatar(author, 40) + '<span style="line-height:1.3"><a class="user-link" href="' + userHref(r.user) + '"><b>' + esc(author.name) + '</b></a> <span class="muted small">@' + esc(r.user) + '</span><br><span class="xs soft">' + dateTxt(r.date) + (r.edited ? ' · editada' : '') + '</span></span>';
    $('#v-score').innerHTML = '<b>' + r.score + '</b><span>/10</span>';
    $('#v-score').style.setProperty('--p', r.score * 10);
    $('#v-body').innerHTML = r.spoiler ? '<div class="spoiler"><span class="muted">Esta reseña tiene spoilers.</span><button class="btn btn-secondary btn-sm" id="reveal">Mostrar de todas formas</button></div><p hidden id="v-txt"></p>' : '<p id="v-txt"></p>';
    $('#v-txt').textContent = r.text;
    const rv = $('#reveal'); if (rv) rv.addEventListener('click', () => { rv.closest('.spoiler').remove(); $('#v-txt').hidden = false; });

    let liked = false, useful = false;
    function acts() {
      $('#v-actions').innerHTML = '<button class="btn btn-secondary like-btn" aria-pressed="' + liked + '" id="a-like">♥ Me gusta · ' + fmt((r.likes || 0) + (liked ? 1 : 0)) + '</button>' +
        '<button class="btn btn-secondary" aria-pressed="' + useful + '" id="a-useful">Útil · ' + fmt((r.useful || 0) + (useful ? 1 : 0)) + '</button><button class="btn btn-secondary" id="a-share">Compartir</button>' +
        (r.mine ? '<a class="btn btn-secondary" href="resena.html?id=' + g.id + '&editar=' + r.id + '" style="margin-left:auto">Editar</a><a class="btn btn-ghost" href="historial.html">Ir a mi historial</a>' : '');
    }
    acts();
    $('#v-actions').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.id === 'a-share') { const u = location.href; if (navigator.clipboard) navigator.clipboard.writeText(u).then(() => toast('Enlace copiado'), () => toast(u)); else toast(u); return; }
      if (!auth.require(b.id === 'a-like' ? 'dar me gusta' : 'votar reseñas')) return;
      if (r.mine) { toast('No puedes votar tu propia reseña'); return; }
      if (b.id === 'a-like') liked = !liked; else useful = !useful;
      acts();
    });

    $('#v-facts').innerHTML = [['Estado', r.state || 'Terminado'], ['Horas jugadas', (r.hours || 0) + ' h'], ['Dificultad votada', (r.diff || '—') + '/10'], ['Nota de la comunidad', SS.score10(g.rating) + '/10']].map((x) => '<dt class="muted">' + x[0] + '</dt><dd style="margin:0">' + esc(x[1]) + '</dd>').join('');
    const rel = r.mine ? 'me' : friends.rel(r.user);
    $('#v-about').innerHTML = '<h2 class="panel-title">Sobre quien escribe</h2><a class="row" style="flex-wrap:nowrap;color:var(--fg)" href="' + userHref(r.user) + '">' + avatar(author, 52) + '<span style="line-height:1.35"><b>' + esc(author.name) + '</b><br><span class="xs muted">Nivel ' + author.level + '</span><br>' + (f ? statusLine(f) : '') + '</span></a>' +
      (f && f.bio ? '<p class="small soft">' + esc(f.bio) + '</p>' : '') +
      (rel === 'none' && f ? '<button class="btn btn-secondary btn-sm" id="v-add">+ Agregar amigo</button>' : rel === 'friend' ? '<span class="badge badge-friend" style="align-self:flex-start">✓ AMIGOS</span>' : '');
    const va = $('#v-add'); if (va) va.addEventListener('click', () => { if (!auth.require('agregar amigos')) return; friends.set(f.user, 'out'); va.outerHTML = '<span class="badge badge-outline" style="align-self:flex-start">SOLICITUD ENVIADA</span>'; toast('Solicitud enviada a ' + f.name); });
    const more = RV.all().filter((x) => x.game === g.id && x.id !== r.id).slice(0, 3);
    $('#v-more').innerHTML = more.map((x) => '<a class="feed-item" href="ver-resena.html?id=' + x.id + '"><span class="avatar" style="width:32px;height:32px;font-size:12px">' + esc(x.initials) + '</span><span class="small"><b>@' + esc(x.user) + '</b> <span class="score">' + x.score + '/10</span><br><span class="xs muted clamp-2">' + esc(x.spoiler ? 'Contiene spoilers' : x.text) + '</span></span></a>').join('') || '<span class="muted small">Es la única reseña de este juego.</span><a class="link-strong small" href="resena.html?id=' + g.id + '">Escribe la tuya</a>';

    // Comentarios
    const key = 'comments.' + r.id;
    const u = auth.user();
    $('#c-av').textContent = u ? u.initials : '?';
    function renderC() {
      const list = RV.comments(r.id);
      $('#c-count').textContent = '· ' + list.length;
      $('#c-list').innerHTML = list.map((c, i) => { const cf = friends.user(c.user); return '<div class="comment">' + (cf ? avatar(cf, 36) : '<span class="avatar">' + esc(c.initials) + '</span>') + '<div class="grow"><div class="row" style="gap:8px"><a class="user-link" href="' + userHref(c.user) + '"><b class="small">@' + esc(c.user) + '</b></a><span class="xs muted">' + esc(c.when) + '</span>' + (u && c.user === u.user ? '<button class="help-link" style="margin-left:auto" data-cdel="' + i + '">Eliminar</button>' : '') + '</div><p class="small" style="margin-top:2px"></p></div></div>'; }).join('') || '<div class="empty">Sé la primera persona en comentar.</div>';
      $$('#c-list .comment p').forEach((p, i) => { p.textContent = list[i].text; });
    }
    renderC();
    $('#c-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const t = $('#c-txt').value.trim();
      if (!t) { $('#c-txt').focus(); toast('Escribe algo antes de comentar'); return; }
      if (!auth.require('comentar')) return;
      await busy($('#c-form button[type="submit"]'), 'Enviando…', 350);
      const list = RV.comments(r.id).slice(); list.push({ review: r.id, user: auth.user().user, initials: auth.user().initials, when: 'ahora', text: t });
      store.set(key, list); $('#c-txt').value = ''; renderC();
    });
    $('#c-list').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cdel]'); if (!b) return;
      const list = RV.comments(r.id).slice(), i = Number(b.dataset.cdel); const [gone] = list.splice(i, 1); store.set(key, list); renderC();
      toast('Comentario eliminado', { action: 'Deshacer', onAction: () => { const l = RV.comments(r.id).slice(); l.splice(i, 0, gone); store.set(key, l); renderC(); } });
    });
  };
})(window.SS_PAGES);

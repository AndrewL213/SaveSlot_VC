// Animación de arranque del Inicio (componente .arranque).
// Este archivo va en el <head> de index.html, antes que todo lo demás: así se ve desde el primer momento.
// Sale cada vez que se abre el Inicio. Si la persona pidió "menos movimiento" en su sistema,
// se muestra el logo quieto (.arranque--quieto), sin dibujarse ni brillar.
// app.js la quita cuando la página cargó (ver quitarArranque).
(function () {
  var raiz = document.documentElement;
  raiz.classList.add('con-arranque');
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) raiz.classList.add('arranque-quieto');
  // Desde cuándo se ve (app.js cuenta desde aquí el tiempo mínimo y el máximo)
  window.ARRANQUE_DESDE = window.performance ? performance.now() : 0;
})();

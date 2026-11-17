// Animación de arranque del Inicio (componente .arranque).
// Este archivo va en el <head> de index.html, antes que todo lo demás: así decide antes de que
// se pinte la página, y quien ya la vio no ve un destello del logo.
// Se muestra una sola vez por visita (sessionStorage dura mientras la pestaña esté abierta)
// y nunca si la persona pidió "menos movimiento" en su sistema.
// app.js la quita cuando la página cargó (ver quitarArranque).
(function () {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (sessionStorage.getItem('ss.arranque')) return;
    sessionStorage.setItem('ss.arranque', '1');
  } catch (e) {
    return; // sin sessionStorage (modo privado estricto): sin animación
  }
  document.documentElement.classList.add('con-arranque');
})();

/* Beast layer behaviour: hero slider, carousel arrows, stat counters.
   Everything degrades to a plain scrollable / static layout without JS. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- hero slider ------------------------------------------------ */
  function initHero(root) {
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-slide]'));
    if (slides.length < 2) return;

    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-dot]'));
    var index = 0;
    var timer = null;
    var interval = parseInt(root.dataset.interval, 10) || 6000;
    var autoplay = root.dataset.autoplay === 'true' && !reduceMotion;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.classList.toggle('is-active', i === index); });
      dots.forEach(function (d, i) {
        d.classList.toggle('is-active', i === index);
        d.setAttribute('aria-selected', i === index ? 'true' : 'false');
      });
    }
    function start() { if (autoplay) { stop(); timer = setInterval(function () { show(index + 1); }, interval); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');
    if (prev) prev.addEventListener('click', function () { show(index - 1); start(); });
    if (next) next.addEventListener('click', function () { show(index + 1); start(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i); start(); }); });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    root.addEventListener('focusin', stop);
    document.addEventListener('visibilitychange', function () {
      document.hidden ? stop() : start();
    });

    // swipe
    var x0 = null;
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 45) show(index + (dx < 0 ? 1 : -1));
      x0 = null;
      start();
    }, { passive: true });

    show(0);
    start();
  }

  /* ---------- carousel --------------------------------------------------- */
  function initCarousel(root) {
    var track = root.querySelector('[data-track]');
    if (!track) return;
    var prev = root.querySelector('[data-prev]');
    var next = root.querySelector('[data-next]');

    function page() {
      var first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 18 : track.clientWidth * 0.8;
    }
    function sync() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    function go(dir) {
      track.scrollBy({ left: dir * page() * 2, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------- stat counters ---------------------------------------------- */
  function initStats(root) {
    var nums = Array.prototype.slice.call(root.querySelectorAll('[data-count-to]'));
    if (!nums.length) return;

    function render(el, value) {
      el.textContent = (el.dataset.prefix || '') +
        Math.round(value).toLocaleString() +
        (el.dataset.suffix || '');
    }
    function run(el) {
      var target = parseFloat(String(el.dataset.countTo).replace(/[^0-9.]/g, '')) || 0;
      if (reduceMotion) { render(el, target); return; }
      var dur = 1400, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        render(el, target * (1 - Math.pow(1 - p, 3)));   // ease-out cubic
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function boot(scope) {
    (scope || document).querySelectorAll('[data-beast-hero]').forEach(initHero);
    (scope || document).querySelectorAll('[data-beast-carousel]').forEach(initCarousel);
    (scope || document).querySelectorAll('[data-beast-stats]').forEach(initStats);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); });
  } else {
    boot();
  }

  // re-init a section after it is edited in the theme customiser
  document.addEventListener('shopify:section:load', function (e) { boot(e.target); });
})();

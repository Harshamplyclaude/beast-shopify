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


  // Keep headings on one line: if a heading would wrap, scale its font down
  // until it fits its box, but never below 45% of its size or 14px. Refits
  // whenever the box changes size (resize, carousel slide becoming visible).
  var FIT_SELECTOR = [
    'main h1', 'main h2', 'main h3', 'main .h0', 'main .h1', 'main .h2'
  ].join(',');
  var FIT_SKIP = '.card-wrapper, .card, .product-card-wrapper, .visually-hidden, .cart-item, .totals';

  function fitLine(h) {
    h.style.fontSize = '';
    h.style.whiteSpace = '';
    if (!h.offsetWidth) return;
    var base = parseFloat(getComputedStyle(h).fontSize);
    h.style.whiteSpace = 'nowrap';
    // Measure against the parent's content box: in a flex column a nowrap
    // heading grows to its text, so its own width can't be trusted.
    var box = h.parentElement;
    var bs = getComputedStyle(box);
    var avail = box.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight);
    var mw = getComputedStyle(h).maxWidth;
    if (/px$/.test(mw)) avail = Math.min(avail, parseFloat(mw));
    var need = h.scrollWidth;
    if (need <= avail + 1) { h.style.whiteSpace = ''; return; }
    var size = Math.floor(base * avail / need * 10) / 10;
    var floor = Math.max(14, base * 0.45);
    if (size < floor) { h.style.whiteSpace = ''; h.style.fontSize = floor + 'px'; return; }
    h.style.fontSize = size + 'px';
  }

  var fitObserver = 'ResizeObserver' in window ? new ResizeObserver(function (entries) {
    entries.forEach(function (e) {
      (e.target.__beastFit || []).forEach(fitLine);
    });
  }) : null;

  function initFit(scope) {
    (scope || document).querySelectorAll(FIT_SELECTOR).forEach(function (h) {
      if (h.hasAttribute('data-fit-line') || h.closest(FIT_SKIP)) return;
      h.setAttribute('data-fit-line', '');
      fitLine(h);
      var box = h.parentElement;
      if (fitObserver && box) {
        if (!box.__beastFit) { box.__beastFit = []; fitObserver.observe(box); }
        box.__beastFit.push(h);
      }
    });
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      document.querySelectorAll('[data-fit-line]').forEach(fitLine);
    });
  }

  function boot(scope) {
    (scope || document).querySelectorAll('[data-beast-hero]').forEach(initHero);
    (scope || document).querySelectorAll('[data-beast-carousel]').forEach(initCarousel);
    (scope || document).querySelectorAll('[data-beast-stats]').forEach(initStats);
    initFit(scope);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { boot(); });
  } else {
    boot();
  }

  // re-init a section after it is edited in the theme customiser
  document.addEventListener('shopify:section:load', function (e) { boot(e.target); });
})();

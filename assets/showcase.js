/* FreeRide — іміджева головна. Рушій скрол-режисури. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var tracks = Array.prototype.slice.call(document.querySelectorAll('[data-track]'));
  var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count-to]'));

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ── Поява блоків у полі зору ─────────────────────────────── */
  function revealAll() { reveals.forEach(function (el) { el.classList.add('in'); }); }

  if (!('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ── Лічильники ───────────────────────────────────────────── */
  function runCounter(el) {
    var to = parseFloat(el.dataset.countTo);
    var dur = parseInt(el.dataset.countDur || '1100', 10);
    if (reduced.matches) { el.textContent = el.dataset.countPrefix ? el.dataset.countPrefix + to : String(to); return; }
    var t0 = null;
    function step(ts) {
      if (t0 === null) t0 = ts;
      var k = clamp((ts - t0) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      var val = Math.round(to * eased);
      el.textContent = (el.dataset.countPrefix || '') + val.toLocaleString('uk-UA');
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        runCounter(e.target);
        io2.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io2.observe(el); });
  } else {
    counters.forEach(runCounter);
  }

  /* ── Прогрес секцій → змінна --p ──────────────────────────── */
  if (reduced.matches) {
    document.documentElement.classList.add('reduced');
    tracks.forEach(function (t) { t.style.setProperty('--p', '1'); });
    revealAll();
    return;
  }

  var ticking = false;

  function update() {
    ticking = false;
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i];
      var r = t.getBoundingClientRect();
      var mode = t.getAttribute('data-track');
      var p;
      if (mode === 'top') {
        p = (-r.top) / vh;
      } else if (mode === 'pin') {
        var span = r.height - vh;
        p = span > 0 ? (-r.top) / span : (r.top <= 0 ? 1 : 0);
      } else {
        p = (vh - r.top) / (vh + r.height);
      }
      p = clamp(p);
      t.style.setProperty('--p', p.toFixed(4));

      /* У блоці вправ грає лише той ролик, який зараз видно */
      if (t.__vids === undefined) t.__vids = t.querySelectorAll('.pin-video video');
      if (t.__vids.length) {
        var idx = p < 0.25 ? 0 : p < 0.51 ? 1 : p < 0.77 ? 2 : 3;
        if (t.__idx !== idx) {
          t.__idx = idx;
          for (var k = 0; k < t.__vids.length; k++) {
            var v = t.__vids[k];
            if (k === idx) {
              var play = v.play();
              if (play && play.catch) play.catch(function () {});
            } else if (!v.paused) {
              v.pause();
            }
          }
        }
      }
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ── Підказка «гортайте» зникає після першого скролу ──────── */
  var hint = document.querySelector('.scroll-hint');
  if (hint) {
    window.addEventListener('scroll', function once() {
      hint.classList.add('gone');
      window.removeEventListener('scroll', once);
    }, { passive: true, once: true });
  }
})();

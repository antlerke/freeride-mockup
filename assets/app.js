/* FreeRide — макет редизайну. Інтерактив сторінок. */
(function () {
  'use strict';

  /* Підбір курсу: кнопки стану перемикають панель. */
  var tabs = document.querySelectorAll('[data-goal]');
  if (tabs.length) {
    var show = function (goal) {
      tabs.forEach(function (b) {
        b.setAttribute('aria-selected', String(b.dataset.goal === goal));
      });
      document.querySelectorAll('[data-panel]').forEach(function (p) {
        var on = p.dataset.panel === goal;
        p.hidden = !on;
        if (on) {
          p.classList.remove('rise');
          void p.offsetWidth;
          p.classList.add('rise');
        }
      });
    };
    tabs.forEach(function (b) {
      b.addEventListener('click', function () { show(b.dataset.goal); });
    });
  }

  /* Скільки інструкторів показати: 1, 2 або 3. */
  var roster = document.querySelector('.roster');
  var picker = document.querySelectorAll('[data-count]');
  if (roster && picker.length) {
    var caption = document.getElementById('team-line');
    var word = function (n) {
      return n === 1 ? 'Один інструктор і Костянтин' : n + ' інструктори і Костянтин';
    };
    var setCount = function (n) {
      roster.dataset.count = String(n);
      picker.forEach(function (b) {
        b.setAttribute('aria-pressed', String(Number(b.dataset.count) === n));
      });
      if (caption) {
        caption.textContent = word(n) + '. Натисніть на картку — побачите досвід, спеціалізацію й техніку.';
      }
      roster.querySelectorAll('details').forEach(function (d, i) {
        if (i >= n) { d.open = false; }
      });
    };
    picker.forEach(function (b) {
      b.addEventListener('click', function () { setCount(Number(b.dataset.count)); });
    });
    setCount(Number(roster.dataset.count || 3));
  }
})();

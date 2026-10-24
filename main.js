/**
 * Portfolio JavaScript
 * One file, one init. Features: theme toggle, mobile menu, hero typewriter,
 * card sheen, reveal-on-scroll, scroll-spy, contact form (AJAX), footer year.
 *
 * Every feature checks that its elements exist, so a missing ID can never
 * break the rest of the page.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage blocked: ignore */ }
  }

  /* ---------- Footer year ---------- */
  function initYear() {
    var el = document.getElementById('current-year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ---------- Theme toggle ---------- */
  function initThemeToggle() {
    var toggle = document.getElementById('theme-toggle');
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!toggle) return;
    var thumb = toggle.querySelector('.theme-toggle__thumb');

    function apply(theme) {
      var isLight = theme === 'light';
      root.setAttribute('data-theme', theme);
      toggle.setAttribute('aria-pressed', String(isLight));
      toggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      if (thumb) thumb.textContent = isLight ? '☀️' : '🌙';
      if (meta) meta.setAttribute('content', isLight ? '#f7f4ee' : '#0b0c0f');
    }

    apply(root.getAttribute('data-theme') || 'dark');

    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      safeSet('theme', next);
    });

    // Follow the OS setting only if the visitor hasn't picked a theme themselves
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onSystemChange = function (e) {
      if (!safeGet('theme')) apply(e.matches ? 'light' : 'dark');
    };
    if (mq.addEventListener) mq.addEventListener('change', onSystemChange);
  }

  /* ---------- Mobile nav ---------- */
  function initMobileMenu() {
    var toggle = document.getElementById('navbar-toggle');
    var menu = document.getElementById('navbar-menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
      menu.classList.toggle('navbar__menu--open', open);
      toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', function () {
      setOpen(!menu.classList.contains('navbar__menu--open'));
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    // Escape closes the menu and returns focus to the button
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('navbar__menu--open')) {
        setOpen(false);
        toggle.focus();
      }
    });
    // Click outside closes it
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('navbar__menu--open')) return;
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });
  }

  /* ---------- Hero typewriter ---------- */
  function initTypewriter() {
    var el = document.getElementById('hero-role-text');
    if (!el || prefersReducedMotion) return;
    var roles = ['Front-end Developer', 'IoT Systems Builder', 'Computer Engineer', 'Problem Solver'];
    var roleIndex = 0, charIndex = roles[0].length, deleting = true;
    var typeSpeed = 65, deleteSpeed = 35, holdTime = 1400, gapTime = 400;

    function tick() {
      var current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) { deleting = true; return setTimeout(tick, holdTime); }
        return setTimeout(tick, typeSpeed);
      }
      charIndex--;
      el.textContent = current.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        return setTimeout(tick, gapTime);
      }
      return setTimeout(tick, deleteSpeed);
    }
    // Start by deleting the pre-rendered first role after a short hold
    setTimeout(tick, 2200);
  }

  /* ---------- Cursor-tracking sheen on cards (mouse only) ---------- */
  function initCardSheen() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
        card.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      });
    });
  }

  /* ---------- Reveal on scroll (also drives proficiency bars) ---------- */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window) || prefersReducedMotion) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ---------- Scroll-spy ---------- */
  function initScrollSpy() {
    var sections = document.querySelectorAll('main section[id], header.hero');
    var links = document.querySelectorAll('.navbar__link');
    if (!('IntersectionObserver' in window) || !sections.length || !links.length) return;

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        links.forEach(function (link) {
          var active = link.getAttribute('data-nav') === id;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Contact form (AJAX with visible feedback) ---------- */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    var status = document.getElementById('form-status');
    var submit = document.getElementById('contact-submit');
    if (!form || !status || !submit || !window.fetch) return; // falls back to normal POST

    function setStatus(message, type) {
      status.textContent = message;
      status.className = 'form__status' + (type ? ' form__status--' + type : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }

      var originalLabel = submit.textContent;
      submit.disabled = true;
      submit.textContent = 'Sending…';
      setStatus('', '');

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function (res) {
        if (res.ok) {
          form.reset();
          setStatus('Thanks! Your message was sent. I\'ll get back to you soon.', 'success');
        } else {
          throw new Error('Request failed');
        }
      }).catch(function () {
        setStatus('Something went wrong. Please try again, or email me directly at karyzzacathlynn@gmail.com.', 'error');
      }).then(function () {
        submit.disabled = false;
        submit.textContent = originalLabel;
      });
    });
  }

  function init() {
    initYear();
    initThemeToggle();
    initMobileMenu();
    initTypewriter();
    initCardSheen();
    initReveal();
    initScrollSpy();
    initContactForm();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ==========================================================================
   Core behaviour: theme, smooth scroll, reveals, headline splitting.
   Everything degrades: no JS → content visible; reduced motion → no
   animation; library failure → the failsafe class reveals everything.
   ========================================================================== */
(function () {
  'use strict';
  var NS = (window.EKG = window.EKG || {});
  var doc = document, root = doc.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = !!(window.gsap && window.ScrollTrigger);

  function qs(s, c) { return (c || doc).querySelector(s); }
  function qsa(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function ready(fn) { if (doc.readyState !== 'loading') fn(); else doc.addEventListener('DOMContentLoaded', fn); }

  /* ── Theme ─────────────────────────────────────────────────────────────── */
  function currentTheme() {
    return root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }
  function syncThemeUi(t) {
    var meta = qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', t === 'light' ? '#f4f0e6' : '#06090a');
    qsa('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');   // pressed = dark mode is on
      b.setAttribute('aria-label', 'Dark mode');                          // fixed name; state lives in aria-pressed
      b.setAttribute('title', t === 'dark' ? 'Dark mode is on. Switch to light.' : 'Light mode is on. Switch to dark.');
    });
  }
  function applyTheme(t, persist) {
    root.setAttribute('data-theme', t);
    if (persist) { try { localStorage.setItem('ekg-theme', t); } catch (e) { /* private mode */ } }
    syncThemeUi(t);
    window.dispatchEvent(new CustomEvent('ekg:theme', { detail: t }));
  }
  var vtToken = 0;
  function toggleTheme(ev) {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    if (!doc.startViewTransition || reduced) { applyTheme(next, true); return; }
    var btn = ev && ev.currentTarget;
    var r = btn && btn.getBoundingClientRect();
    var x = r ? r.left + r.width / 2 : window.innerWidth / 2;
    var y = r ? r.top + r.height / 2 : 0;
    var radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    var mine = ++vtToken;
    root.classList.add('theme-vt');
    var vt = doc.startViewTransition(function () { applyTheme(next, true); });
    vt.ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + radius + 'px at ' + x + 'px ' + y + 'px)'] },
        { duration: 750, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(function () { /* transition skipped */ });
    var done = function () { if (mine === vtToken) root.classList.remove('theme-vt'); };
    vt.finished.then(done, done);
  }

  /* ── Headline splitting (word masks) ───────────────────────────────────── */
  function splitWords(el) {
    var words = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (ch) {
        if (ch.nodeType === 3) {
          var frag = doc.createDocumentFragment();
          var parts = ch.textContent.split(/(\s+)/);
          var prev = ch.previousSibling;
          if (parts[0] && !/^\s/.test(parts[0]) && prev && prev.nodeType === 1 && prev.querySelectorAll) {
            var prevWords = prev.querySelectorAll('.wi');    // e.g. the "." after </em>: no line break before it
            if (prevWords.length) { prevWords[prevWords.length - 1].textContent += parts.shift(); }
          }
          parts.forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(doc.createTextNode(part)); return; }
            var w = doc.createElement('span'); w.className = 'w';
            var i = doc.createElement('span'); i.className = 'wi'; i.textContent = part;
            w.appendChild(i); frag.appendChild(w); words.push(i);
          });
          node.replaceChild(frag, ch);
        } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && !ch.classList.contains('tm')) {
          walk(ch);   // (the ™ mark stays a plain superscript, outside the word masks)
        }
      });
    })(el);
    el.classList.add('is-split');
    return words;
  }

  /* ── Motion setup ──────────────────────────────────────────────────────── */
  function setupMotion() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // Smooth scroll (Lenis) drives ScrollTrigger
    var lenis = null;
    if (window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.15,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true, touchMultiplier: 1.3
      });
      NS.lenis = lenis;
      lenis.on('scroll', ST.update);
      gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // Reveal blocks
    function done(el) { return function () { el.classList.add('is-in'); gsap.set(el, { clearProps: 'opacity,transform' }); }; }
    qsa('[data-reveal]').forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 26 }, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out', onComplete: done(el),
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
    qsa('[data-stagger]').forEach(function (parent) {
      var kids = Array.prototype.slice.call(parent.children);
      gsap.fromTo(kids, { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.09,
        onComplete: function () { kids.forEach(function (k) { k.classList.add('is-in'); }); gsap.set(kids, { clearProps: 'opacity,transform' }); },
        scrollTrigger: { trigger: parent, start: 'top 88%', once: true }
      });
    });

    // Headlines: masked word rise
    qsa('[data-split="rise"]').forEach(function (el) {
      var words = splitWords(el);
      var hero = !!el.closest('[data-hero]');
      var tween = { yPercent: 115, duration: 1.15, ease: 'power4.out', stagger: 0.07, delay: hero ? 0.35 : 0 };
      if (hero) gsap.from(words, tween);
      else { tween.scrollTrigger = { trigger: el, start: 'top 88%', once: true }; gsap.from(words, tween); }
    });

    // Statement: words brighten as you scroll through it
    qsa('[data-split="scrub"]').forEach(function (el) {
      var words = splitWords(el);
      gsap.to(words, {
        opacity: 1, ease: 'none', stagger: 0.12,
        scrollTrigger: { trigger: el, start: 'top 86%', end: 'bottom 62%', scrub: 0.6 }
      });
    });

    // Heartbeat strokes draw themselves
    qsa('[data-beat] path, [data-trace] path').forEach(function (p) {
      var len = p.getTotalLength ? Math.ceil(p.getTotalLength()) : 600;
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(p, {
        strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut',
        scrollTrigger: { trigger: p.closest('svg'), start: 'top 94%', once: true }
      });
    });

    // Hero entrance (elements start hidden via [data-hero-in] → no flash)
    var hero = qs('[data-hero]');
    if (hero) {
      var heroLogo = qs('.hero-logo', hero), heroEyebrow = qs('.hero-copy .eyebrow', hero);
      var heroRest = qsa('.hero-copy .lede, .hero-actions, .hero-foot', hero);
      var heroAll = [heroLogo, heroEyebrow].concat(heroRest).filter(Boolean);
      var tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        onComplete: function () { heroAll.forEach(function (e) { e.classList.add('is-in'); }); gsap.set(heroAll, { clearProps: 'opacity,transform' }); }
      });
      tl.fromTo(heroLogo, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 1.4 }, 0.05)
        .fromTo(heroEyebrow, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.3)
        .fromTo(heroRest, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.95);
    }

    // Anchors: smooth through Lenis
    qsa('a[href^="#"]:not(.skip)').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (id.length < 2) return;
        var target = qs(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -90, duration: 1.3 });
        else target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Fonts change layout → recompute triggers
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { ST.refresh(); });
    window.addEventListener('load', function () { ST.refresh(); });
  }

  /* ── Cards: cursor spotlight ───────────────────────────────────────────── */
  function setupSpotlight() {
    if (!window.matchMedia('(hover: hover)').matches) return;
    qsa('.card').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    });
  }

  /* ── Home: hover a project row → preview its motif ─────────────────────── */
  function setupIndexPreview() {
    var frame = qs('[data-preview]');
    if (!frame || !NS.mountMotif) return;
    var rows = qsa('.row[data-slug]');
    var nameEl = qs('[data-preview-name]'), catEl = qs('[data-preview-cat]');
    var stEl = qs('[data-preview-status]'), licEl = qs('[data-preview-lic]'), stackEl = qs('[data-preview-stack]'), linkEl = qs('[data-preview-link]');
    var current = '';
    function show(row) {
      var slug = row.getAttribute('data-slug');
      if (slug === current) return;
      current = slug;
      rows.forEach(function (r) { r.classList.toggle('is-on', r === row); });
      var swap = function () {
        NS.mountMotif(frame, row.getAttribute('data-motif') || slug);
        if (nameEl) nameEl.textContent = row.getAttribute('data-name') || '';
        if (catEl) catEl.textContent = row.getAttribute('data-cat') || '';
        if (stEl) stEl.textContent = row.getAttribute('data-status') || '';
        if (licEl) licEl.textContent = row.getAttribute('data-license') || '';
        if (stackEl) stackEl.textContent = row.getAttribute('data-stack') || '';
        if (linkEl) linkEl.setAttribute('href', row.getAttribute('href') || 'work.html');
        if (window.gsap && !reduced) window.gsap.fromTo(frame, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' });
      };
      if (window.gsap && !reduced) window.gsap.to(frame, { opacity: 0, duration: 0.14, onComplete: swap }); else swap();
    }
    rows.forEach(function (r) {
      r.addEventListener('pointerenter', function () { show(r); });
      r.addEventListener('focus', function () { show(r); });
    });
    if (rows[0]) show(rows[0]);
  }

  /* ── Boot ──────────────────────────────────────────────────────────────── */
  ready(function () {
    syncThemeUi(currentTheme());
    qsa('[data-theme-toggle]').forEach(function (b) { b.addEventListener('click', toggleTheme); });
    // follow the OS only while the visitor hasn't chosen
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var follow = function () { var saved = null; try { saved = localStorage.getItem('ekg-theme'); } catch (e) { /* ignore */ } if (!saved) applyTheme(mq.matches ? 'light' : 'dark', false); };
    if (mq.addEventListener) mq.addEventListener('change', follow);

    qsa('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
    setupSpotlight();
    setupIndexPreview();
    try { if (NS.pulse) NS.pulse.init(); } catch (err) { if (window.console) console.warn('Hero pulse disabled:', err); }
    try { if (NS.explorer) NS.explorer.init(); } catch (err2) { if (window.console) console.warn('Explorer disabled:', err2); }

    if (hasGsap && !reduced) {
      try { setupMotion(); } catch (err) { root.classList.add('no-anim'); if (window.console) console.warn('Motion disabled:', err); }
    } else {
      root.classList.add('no-anim');
    }
    window.__ekgReady = true;
  });
})();

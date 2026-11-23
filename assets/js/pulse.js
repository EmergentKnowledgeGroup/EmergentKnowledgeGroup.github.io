/* ==========================================================================
   Hero heartbeat
   A full-bleed ECG trace passes through the logo at chest height. The bright
   "scan head" lights the logo as it travels; when the head reaches the R-spike
   over the figure, the logo gives a lub-dub and a ripple leaves the heart.
   ========================================================================== */
(function () {
  'use strict';
  var NS = (window.EKG = window.EKG || {});

  var LOGO_CHEST_Y = 320 / 704;   // chest line, as a fraction of the logo height
  var LOGO_FIGURE_X = 395 / 768;  // the figure's centre, as a fraction of the logo width

  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function hash(n) { var x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  /* one cardiac cycle, in normalised units (u = dx / spacing); returns 0..1-ish */
  function cycle(u) {
    var y = 0.1 * Math.exp(-Math.pow((u + 0.21) / 0.035, 2) / 2)      // P wave
          + 0.2 * Math.exp(-Math.pow((u - 0.26) / 0.055, 2) / 2);     // T wave
    if (u > -0.045 && u < 0.055) {                                     // QRS complex
      if (u < -0.03) y += lerp(0, -0.1, (u + 0.045) / 0.015);
      else if (u < 0) y += lerp(-0.1, 1, (u + 0.03) / 0.03);
      else if (u < 0.032) y += lerp(1, -0.28, u / 0.032);
      else y += lerp(-0.28, 0, (u - 0.032) / 0.023);
    }
    return y;
  }

  function offsetWithin(el, ancestor) {
    var x = 0, y = 0, n = el;
    while (n && n !== ancestor) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x: x, y: y };
  }

  NS.pulse = {
    init: function () {
      var hero = document.querySelector('[data-hero]');
      if (!hero) return;
      var canvas = hero.querySelector('.hero-trace');
      var logo = hero.querySelector('[data-logo]');
      var lit = hero.querySelector('.logo-lit');
      var glow = hero.querySelector('.hero-glow');
      var ripple = hero.querySelector('.ripple');
      if (!canvas || !logo || !canvas.getContext) return;

      var ctx = canvas.getContext('2d');
      if (!ctx) return;   // canvas unavailable (privacy extension, GPU loss): the static logo still shows
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      var W = 0, H = 0, dpr = 1, baseY = 0, beatX = 0, logoLeft = 0, spacing = 300, amp = 90;
      var color = '67,240,176';
      var visible = true, raf = 0, t0 = 0, prevHead = null;
      var SWEEP = 6400, HOLD = 1100;

      function readColor() {
        var v = getComputedStyle(document.documentElement).getPropertyValue('--pulse-rgb').trim();
        if (v) color = v;
      }

      function layout() {
        var hr = hero.getBoundingClientRect();
        W = Math.round(hr.width); H = Math.round(hr.height);
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var off = offsetWithin(logo, hero);
        var lw = logo.offsetWidth, lh = logo.offsetHeight;
        logoLeft = off.x;
        baseY = off.y + lh * LOGO_CHEST_Y;
        beatX = off.x + lw * LOGO_FIGURE_X;
        spacing = clamp(W / 4.1, 190, 340);
        amp = clamp(lh * 0.46, 56, 138);
      }

      function yAt(x) {
        var k0 = Math.round((x - beatX) / spacing), y = 0;
        for (var k = k0 - 1; k <= k0 + 1; k++) {
          var scale = k === 0 ? 1 : 0.74 + 0.26 * hash(k);
          y += cycle((x - (beatX + k * spacing)) / spacing) * scale;
        }
        // a whisper of baseline drift so the line never looks ruled
        var drift = Math.sin(x * 0.021) * 0.9 + Math.sin(x * 0.0067 + 1.3) * 1.4;
        return baseY - y * amp + drift;
      }

      function path(x0, x1) {
        ctx.beginPath();
        for (var x = x0; x <= x1; x += 1) {
          var y = yAt(x);
          if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
      }

      function restart(el, cls) {
        if (!el) return;
        el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
      }
      function beat() {
        restart(logo, 'is-beat'); restart(glow, 'is-flash'); restart(ripple, 'is-go');
      }

      function draw(head) {
        ctx.clearRect(0, 0, W, H);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        // ghost trace: the whole waveform, always faintly present
        path(0, W);
        ctx.strokeStyle = 'rgba(' + color + ',0.30)'; ctx.lineWidth = 1.4; ctx.stroke();
        if (head === null) return;
        // lit trail behind the scan head
        var trail = Math.max(260, W * 0.34);
        var g = ctx.createLinearGradient(head - trail, 0, head + 1, 0);
        g.addColorStop(0, 'rgba(' + color + ',0)');
        g.addColorStop(0.9, 'rgba(' + color + ',1)');
        g.addColorStop(1, 'rgba(' + color + ',0)');
        var x0 = Math.max(0, head - trail), x1 = Math.min(W, head + 1);
        if (x1 > x0) {
          path(x0, x1);
          ctx.strokeStyle = g; ctx.lineWidth = 7; ctx.globalAlpha = 0.16; ctx.stroke();
          ctx.lineWidth = 2.4; ctx.globalAlpha = 1; ctx.stroke();
        }
        // the head itself
        if (head >= 0 && head <= W) {
          var hy = yAt(head);
          var rg = ctx.createRadialGradient(head, hy, 0, head, hy, 16);
          rg.addColorStop(0, 'rgba(' + color + ',0.95)'); rg.addColorStop(1, 'rgba(' + color + ',0)');
          ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(head, hy, 16, 0, 6.2832); ctx.fill();
          ctx.fillStyle = 'rgba(255,255,255,0.95)'; ctx.beginPath(); ctx.arc(head, hy, 2.2, 0, 6.2832); ctx.fill();
        }
      }

      function frame(ts) {
        if (!visible) { raf = 0; return; }
        if (!t0) t0 = ts;
        var t = (ts - t0) % (SWEEP + HOLD);
        var head = t < SWEEP ? lerp(-40, W + 40, t / SWEEP) : null;
        draw(head);
        if (lit) lit.style.setProperty('--sx', (head === null ? -999 : head - logoLeft) + 'px');
        // fire only on a genuine, continuous crossing (never after a pause/resume jump)
        if (head !== null && prevHead !== null && prevHead < beatX && head >= beatX && head - prevHead < 90) beat();
        prevHead = head;
        raf = requestAnimationFrame(frame);
      }

      function start() { if (!raf && !reduced) raf = requestAnimationFrame(frame); }
      function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; prevHead = null; }

      function staticFrame() {
        ctx.clearRect(0, 0, W, H);
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        path(0, W); ctx.strokeStyle = 'rgba(' + color + ',0.85)'; ctx.lineWidth = 2; ctx.stroke();
        if (lit) lit.style.setProperty('--sx', '-999px');
      }

      readColor(); layout();
      if (reduced) staticFrame(); else start();

      var rt = 0;
      function relayout() { layout(); if (reduced) staticFrame(); }
      window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(relayout, 90); });
      if (window.ResizeObserver) new ResizeObserver(function () { clearTimeout(rt); rt = setTimeout(relayout, 90); }).observe(hero);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
      window.addEventListener('load', relayout);
      window.addEventListener('ekg:theme', function () { readColor(); if (reduced) staticFrame(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          visible = es[es.length - 1].isIntersecting;   // the newest entry wins
          if (visible) start(); else stop();
        }, { threshold: 0 }).observe(hero);
      }
    }
  };
})();

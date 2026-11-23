/* ==========================================================================
   Work explorer — an accessible tab pattern.
   - Vertical list on desktop, horizontal chip strip on small screens.
   - Arrow / Home / End keys move between projects; the URL hash is the
     project slug, so any project can be linked to directly.
   - Without JS every dossier is simply shown, stacked.
   ========================================================================== */
(function () {
  'use strict';
  var NS = (window.EKG = window.EKG || {});

  NS.explorer = {
    init: function () {
      var root = document.querySelector('[data-explorer]');
      if (!root) return;
      var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
      var panels = Array.prototype.slice.call(root.querySelectorAll('[role="tabpanel"]'));
      if (!tabs.length || tabs.length !== panels.length) return;

      var tablist = root.querySelector('[role="tablist"]');
      var mq = window.matchMedia('(max-width: 960px)');
      var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var current = -1;

      root.classList.add('is-enhanced');
      function setOrientation() { tablist.setAttribute('aria-orientation', mq.matches ? 'horizontal' : 'vertical'); }
      setOrientation();
      if (mq.addEventListener) mq.addEventListener('change', setOrientation);

      function slugOf(tab) { return tab.getAttribute('data-slug'); }
      function indexFromHash() {
        var h = (location.hash || '').replace('#', '').toLowerCase();
        for (var i = 0; i < tabs.length; i++) if (slugOf(tabs[i]) === h) return i;
        return -1;
      }

      function select(i, opts) {
        opts = opts || {};
        if (i < 0 || i >= tabs.length) return;
        if (i === current) {   // already open: still make the URL shareable
          if (opts.updateHash !== false) { try { history.replaceState(null, '', '#' + slugOf(tabs[i])); } catch (e) { /* file:// quirks */ } }
          return;
        }
        current = i;
        tabs.forEach(function (t, k) {
          var on = k === i;
          t.setAttribute('aria-selected', on ? 'true' : 'false');
          t.tabIndex = on ? 0 : -1;
        });
        panels.forEach(function (p, k) { p.hidden = k !== i; });

        var panel = panels[i];
        var frame = panel.querySelector('[data-motif]');
        if (frame && NS.mountMotif && frame.getAttribute('data-mounted') !== frame.getAttribute('data-motif')) {
          NS.mountMotif(frame, frame.getAttribute('data-motif'));
        }
        if (window.gsap && !reduced) {
          var parts = panel.querySelectorAll('[data-in]');
          window.gsap.fromTo(parts, { opacity: 0, y: 18 }, {
            opacity: 1, y: 0, duration: 0.65, ease: 'power3.out', stagger: 0.07, clearProps: 'opacity,transform'
          });
        }
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
        if (opts.focus) tabs[i].focus();
        if (opts.updateHash !== false) {
          try { history.replaceState(null, '', '#' + slugOf(tabs[i])); } catch (e) { /* file:// quirks */ }
        }
        if (opts.scrollTab && mq.matches && tabs[i].scrollIntoView) {
          tabs[i].scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduced ? 'auto' : 'smooth' });
        }
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(i, { scrollTab: true }); });
        tab.addEventListener('keydown', function (e) {
          if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;   // leave browser shortcuts alone
          var horizontal = mq.matches, next = -1;
          var prevKey = horizontal ? 'ArrowLeft' : 'ArrowUp', nextKey = horizontal ? 'ArrowRight' : 'ArrowDown';
          if (e.key === nextKey || e.key === (horizontal ? 'ArrowDown' : 'ArrowRight')) next = (i + 1) % tabs.length;
          else if (e.key === prevKey || e.key === (horizontal ? 'ArrowUp' : 'ArrowLeft')) next = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') next = 0;
          else if (e.key === 'End') next = tabs.length - 1;
          if (next >= 0) { e.preventDefault(); select(next, { focus: true, scrollTab: true }); }
        });
      });

      window.addEventListener('hashchange', function () {
        var i = indexFromHash();
        if (i >= 0) select(i, { updateHash: false, scrollTab: true });
      });

      var start = indexFromHash();
      select(start >= 0 ? start : 0, { updateHash: start >= 0, scrollTab: start > 0 });

      if (start >= 0) {   // deep link: land on the project, not the page header
        var moved = false;
        ['wheel', 'touchstart', 'keydown', 'mousedown'].forEach(function (ev) {
          window.addEventListener(ev, function () { moved = true; }, { once: true, passive: true });
        });
        var place = function () {
          if (moved) return;
          var y = root.getBoundingClientRect().top + (window.pageYOffset || 0) - 92;
          window.scrollTo(0, Math.max(0, y));
        };
        place();
        window.addEventListener('load', place);
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
      }
    }
  };
})();

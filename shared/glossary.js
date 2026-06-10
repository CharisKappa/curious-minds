// ============================================
// Bilingual glossary drawer — shared across tutorials.
// Wraps any element with class="gloss" data-term="<key>" into a
// clickable term that opens a slide-in drawer with the definition.
// Self-contained, no dependencies. Data lives in glossary.json.
// ============================================
(function () {
  'use strict';

  var GLOSSARY = null;
  var lang = 'en';
  var drawer = null;
  var backdrop = null;
  var els = {};
  var lastTrigger = null;   // element to return focus to on close
  var pending = null;       // a term clicked before the JSON finished loading

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  // Resolve glossary.json relative to THIS script, so it works from any
  // tutorial depth (the browser already resolved the script's src to an
  // absolute URL against the current page).
  function glossaryUrl() {
    var sc = document.querySelector('script[src$="glossary.js"]');
    if (sc && sc.src) return sc.src.replace(/glossary\.js(\?.*)?$/, 'glossary.json');
    return '../../shared/glossary.json';
  }

  function detectLang() {
    var l = (document.documentElement.lang || 'en').toLowerCase();
    return l === 'el' ? 'el' : 'en';
  }

  function entryFor(term) {
    var rec = GLOSSARY && GLOSSARY[term];
    if (!rec) return null;
    return rec[lang] || rec.en || null;
  }

  ready(function () {
    var spans = document.querySelectorAll('.gloss');
    if (!spans.length) return; // nothing to wire on this page
    lang = detectLang();

    Array.prototype.forEach.call(spans, function (el) {
      if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      el.addEventListener('click', function () {
        openTerm(el.getAttribute('data-term'), el);
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          openTerm(el.getAttribute('data-term'), el);
        }
      });
    });

    fetch(glossaryUrl())
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        GLOSSARY = data;
        // Fill aria-labels now that titles are known (unless author set one).
        Array.prototype.forEach.call(spans, function (el) {
          var entry = entryFor(el.getAttribute('data-term'));
          if (entry && !el.hasAttribute('aria-label')) {
            el.setAttribute('aria-label', 'Glossary: ' + entry.title);
          }
        });
        if (pending) {
          var p = pending; pending = null;
          openTerm(p.term, p.trigger);
        }
      })
      .catch(function (err) {
        console.warn('[glossary] could not load glossary.json:', err);
      });
  });

  function ensureDrawer() {
    if (drawer) return;

    backdrop = document.createElement('div');
    backdrop.className = 'glossary-backdrop';
    backdrop.addEventListener('click', close);

    drawer = document.createElement('aside');
    drawer.className = 'glossary-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'glossary-title');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.innerHTML =
      '<button class="glossary-close" type="button" aria-label="Close glossary">×</button>' +
      '<div class="glossary-drawer-inner">' +
        '<div class="glossary-handle" aria-hidden="true"></div>' +
        '<div class="glossary-category" id="glossary-cat"></div>' +
        '<h2 class="glossary-title" id="glossary-title" tabindex="-1"></h2>' +
        '<div class="glossary-meta" id="glossary-meta"></div>' +
        '<div class="glossary-body" id="glossary-body"></div>' +
        '<div class="glossary-related" id="glossary-related"></div>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    els.cat = drawer.querySelector('#glossary-cat');
    els.title = drawer.querySelector('#glossary-title');
    els.meta = drawer.querySelector('#glossary-meta');
    els.body = drawer.querySelector('#glossary-body');
    els.related = drawer.querySelector('#glossary-related');
    els.close = drawer.querySelector('.glossary-close');

    els.close.addEventListener('click', close);
    drawer.addEventListener('keydown', trapTab);
  }

  function openTerm(term, trigger) {
    if (!GLOSSARY) { pending = { term: term, trigger: trigger }; return; }
    var entry = entryFor(term);
    if (!entry) { console.warn('[glossary] no entry for term:', term); return; }

    ensureDrawer();
    if (trigger) lastTrigger = trigger; // related-tag navigation passes null, preserving the original

    els.cat.textContent = entry.category || '';
    els.cat.style.display = entry.category ? '' : 'none';
    els.title.textContent = entry.title || term;
    els.meta.textContent = entry.meta || '';
    els.meta.style.display = entry.meta ? '' : 'none';
    els.body.textContent = entry.body || '';

    els.related.innerHTML = '';
    var related = entry.related || [];
    var rendered = 0;
    if (related.length) {
      var label = document.createElement('div');
      label.className = 'glossary-related-label';
      label.textContent = lang === 'el' ? 'Σχετικά' : 'Related';
      els.related.appendChild(label);
      related.forEach(function (rk) {
        var rentry = entryFor(rk);
        if (!rentry) return;
        var tag = document.createElement('button');
        tag.type = 'button';
        tag.className = 'glossary-related-tag';
        tag.textContent = rentry.title;
        tag.addEventListener('click', function () { openTerm(rk, null); });
        els.related.appendChild(tag);
        rendered++;
      });
    }
    els.related.style.display = rendered ? '' : 'none';

    open();
  }

  function open() {
    document.body.classList.add('glossary-open');
    backdrop.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    document.addEventListener('keydown', onEsc, true);
    // Move focus into the drawer (title is programmatically focusable).
    window.setTimeout(function () { if (els.title) els.title.focus(); }, 60);
  }

  function close() {
    if (!drawer) return;
    backdrop.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('glossary-open');
    document.removeEventListener('keydown', onEsc, true);
    if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
    lastTrigger = null;
  }

  function onEsc(e) {
    if (e.key === 'Escape' || e.key === 'Esc') { e.preventDefault(); close(); }
  }

  function trapTab(e) {
    if (e.key !== 'Tab') return;
    var nodes = drawer.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    var list = Array.prototype.filter.call(nodes, function (n) {
      return !n.disabled && n.offsetParent !== null;
    });
    if (!list.length) return;
    var first = list[0], last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
})();

// Reservation form: paste the form's address between the quotes to show it on the site.
// Leave it empty to show the WhatsApp and phone buttons instead.
const RESERVATION_FORM_URL = "";

(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Cairo time, for the open or closed line */
  function cairo() {
    try {
      var p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      var g = function (t) { return +p.filter(function (x) { return x.type === t; })[0].value; };
      return (g('hour') % 24) * 60 + g('minute');
    } catch (e) { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  }
  var body = document.body;
  var opens = +body.getAttribute('data-open'), closes = +body.getAttribute('data-close');
  $$('.js-status').forEach(function (el) {
    var t = cairo();
    var open = opens < closes ? (t >= opens && t < closes) : (t >= opens || t < closes);
    el.textContent = open ? el.getAttribute('data-open-text') : el.getAttribute('data-closed-text');
    el.classList.toggle('is-open', open);
  });

  /* header: transparent over the opening photo, solid once the page moves */
  var hdr = $('.hdr');
  var sentinel = $('.js-sentinel');
  if (hdr && sentinel && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { hdr.classList.toggle('is-solid', !es[0].isIntersecting); }).observe(sentinel);
  } else if (hdr && !hdr.classList.contains('hdr--static')) {
    hdr.classList.add('is-solid');
  }

  /* drawer */
  var burger = $('.hdr__burger'), drawer = $('#drawer');
  function setDrawer(open) {
    if (!drawer) return;
    drawer.classList.toggle('is-open', open);
    if (open) drawer.removeAttribute('inert'); else drawer.setAttribute('inert', '');
    burger.setAttribute('aria-expanded', String(open));
    document.documentElement.style.overflow = open ? 'hidden' : '';
    if (open) { var x = $('.drawer__x'); if (x) x.focus(); } else if (document.activeElement && drawer.contains(document.activeElement)) { burger.focus(); }
  }
  if (burger && drawer) {
    burger.addEventListener('click', function () { setDrawer(true); });
    $$('.drawer__x, .drawer a').forEach(function (el) { el.addEventListener('click', function () { setDrawer(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setDrawer(false); });
    var wide = window.matchMedia('(min-width: 1024px)');
    var onWide = function (m) { if (m.matches) setDrawer(false); };
    if (wide.addEventListener) wide.addEventListener('change', onWide); else if (wide.addListener) wide.addListener(onWide);
  }

  /* Arabic note */
  var toast = $('.toast'), tt;
  $$('.js-ar').forEach(function (b) {
    b.addEventListener('click', function () {
      if (!toast) return;
      toast.classList.add('is-on'); clearTimeout(tt);
      tt = setTimeout(function () { toast.classList.remove('is-on'); }, 2600);
      if (drawer && drawer.classList.contains('is-open')) setDrawer(false);
    });
  });

  /* soft reveal of text blocks */
  var rv = $$('.rv');
  if (rv.length) {
    if (!('IntersectionObserver' in window) || still) { rv.forEach(function (n) { n.classList.add('in'); }); }
    else {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
      }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
      rv.forEach(function (n) { io.observe(n); });
    }
  }

  /* menus section: slow crossfade between photos */
  var show = $('.js-slides');
  if (show) {
    var slides = $$('.slide', show), dots = $$('.dots button'), cur = 0, timer = null, visible = true;
    var go = function (i) {
      cur = (i + slides.length) % slides.length;
      slides.forEach(function (s, k) { s.classList.toggle('is-on', k === cur); });
      dots.forEach(function (d, k) { d.setAttribute('aria-current', k === cur ? 'true' : 'false'); });
    };
    var stop = function () { clearInterval(timer); timer = null; };
    var play = function () { if (still || timer || !visible || document.hidden) return; timer = setInterval(function () { go(cur + 1); }, 6500); };
    dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); stop(); play(); }); });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); else stop(); }, { threshold: 0.2 }).observe(show);
    } else { play(); }
    go(0);
  }

  /* menu page: categories switch the list */
  var tabs = $$('.mtab');
  if (tabs.length) {
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var pick = function (i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
    };
    var fromHash = function () {
      var id = decodeURIComponent((location.hash || '').slice(1));
      var i = panels.findIndex(function (p) { return p && p.id === id; });
      return i < 0 ? 0 : i;
    };
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () {
        pick(k);
        try { history.replaceState(null, '', '#' + panels[k].id); } catch (e) { /* address bar not writable here */ }
      });
      t.addEventListener('keydown', function (e) {
        var n = e.key === 'ArrowRight' ? k + 1 : e.key === 'ArrowLeft' ? k - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null;
        if (n === null) return;
        e.preventDefault(); pick((n + tabs.length) % tabs.length, true);
      });
    });
    window.addEventListener('hashchange', function () { pick(fromHash()); });
    pick(fromHash());
  }

  /* reservation slot: the form address, a pasted embed, or WhatsApp and phone */
  $$('[data-resv]').forEach(function (slot) {
    var embed = $('[data-resv-embed]', slot);
    var url = String(RESERVATION_FORM_URL || '').trim();
    if (url && embed) {
      var f = document.createElement('iframe');
      f.className = 'resv__frame';
      f.src = url;
      f.title = 'Reserve a table at Tokyo';
      f.loading = 'lazy';
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      embed.appendChild(f);
      slot.classList.add('has-form');
    } else if (embed && embed.children.length) {
      slot.classList.add('has-form');
    }
  });
})();

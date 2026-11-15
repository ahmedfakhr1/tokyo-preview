// Reservation form: paste the form's address between the quotes to show it on the site.
// Leave it empty to keep the booking space with the phone link.
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

  /* the plates: arrows move the strip one card at a time (touch swipes it) */
  var track = $('.js-track');
  if (track) {
    var arrows = $('.arrows'), prev = $('.arrow--prev'), next = $('.arrow--next');
    var edge = function () {
      var max = track.scrollWidth - track.clientWidth, x = track.scrollLeft;
      if (arrows) arrows.classList.toggle('is-off', max <= 4);
      if (prev) prev.setAttribute('aria-disabled', String(x <= 4));
      if (next) next.setAttribute('aria-disabled', String(x >= max - 4));
    };
    var step = function (dir) {
      var c = track.firstElementChild;
      if (!c) return;
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      track.scrollBy({ left: dir * (c.getBoundingClientRect().width + gap), behavior: still ? 'auto' : 'smooth' });
    };
    if (prev) prev.addEventListener('click', function () { step(-1); });
    if (next) next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', edge, { passive: true });
    window.addEventListener('resize', edge);
    edge();
  }

  /* menu index on the home page: the photo follows the section being hovered or focused */
  var index = $('.js-index');
  if (index) {
    var ilinks = $$('a', index), iimgs = $$('.mindex__photo img');
    var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)');
    var pickPhoto = function (i) {
      iimgs.forEach(function (im, k) { im.classList.toggle('is-on', k === i); });
      ilinks.forEach(function (a, k) { a.classList.toggle('is-on', k === i); });
    };
    ilinks.forEach(function (a, i) {
      a.addEventListener('mouseenter', function () { if (canHover && canHover.matches) pickPhoto(i); });
      a.addEventListener('focus', function () { pickPhoto(i); });
    });
    pickPhoto(0);
  }


  /* motion: plates glide in once, progress line, drag to scroll, photos out of black, room drift */
  var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var once = function (el, cls, opts) {
    if (!el) return;
    if (still || !('IntersectionObserver' in window)) { el.classList.add(cls); return; }
    var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { el.classList.add(cls); o.disconnect(); } }, opts || { threshold: 0.18 });
    o.observe(el);
  };
  once($('.plates'), 'is-in');
  once($('.mindex__photo'), 'in');
  once($('.room'), 'in', { threshold: 0.08 });

  if (track) {
    var bar = $('.plates__progress i');
    var prog = function () {
      if (!bar) return;
      var max = track.scrollWidth - track.clientWidth;
      var vis = track.clientWidth / track.scrollWidth;
      bar.style.setProperty('--p', max <= 4 ? 1 : (vis + (1 - vis) * (track.scrollLeft / max)).toFixed(4));
    };
    track.addEventListener('scroll', prog, { passive: true });
    window.addEventListener('resize', prog);
    prog();
    if (fine) {
      var down = false, moved = 0, sx = 0, sl = 0, v = 0, lx = 0, raf = 0;
      track.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        down = true; moved = 0; sx = lx = e.clientX; sl = track.scrollLeft; v = 0; cancelAnimationFrame(raf);
      });
      window.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - sx; moved = Math.max(moved, Math.abs(dx));
        if (moved > 5) { track.classList.add('is-drag'); track.scrollLeft = sl - dx; v = e.clientX - lx; lx = e.clientX; }
      });
      window.addEventListener('pointerup', function () {
        if (!down) return; down = false;
        if (!track.classList.contains('is-drag')) return;
        var glide = function () {
          v *= 0.93; track.scrollLeft -= v;
          if (Math.abs(v) > 0.6 && !still) raf = requestAnimationFrame(glide); else track.classList.remove('is-drag');
        };
        glide();
      });
      track.addEventListener('click', function (e) { if (moved > 5) { e.preventDefault(); e.stopPropagation(); } }, true);
      track.addEventListener('dragstart', function (e) { e.preventDefault(); });
    }
  }

  var room = $('.room'), rimg = room && $('img', room);
  if (rimg && fine && !still) {
    var tick = false;
    var drift = function () {
      tick = false;
      var r = room.getBoundingClientRect(), vh = window.innerHeight;
      if (r.bottom < 0 || r.top > vh) return;
      var t = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
      rimg.style.transform = 'translate3d(0,' + (-t * r.height * 0.05).toFixed(1) + 'px,0)';
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(drift); } }, { passive: true });
    drift();
  }

  /* on touch screens the menu photo follows the section name nearest the middle of the screen */
  if (index && !(canHover && canHover.matches) && 'IntersectionObserver' in window) {
    var mid = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) pickPhoto(ilinks.indexOf(en.target)); });
    }, { rootMargin: '-49.5% 0px -49.5% 0px' });
    ilinks.forEach(function (a) { mid.observe(a); });
  }

  /* menu page: the index follows the section in view */
  var mnav = $('.mnav');
  if (mnav) {
    var mlinks = $$('a', mnav);
    var msecs = mlinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var mark = function (i) {
      if (i < 0) return;
      mlinks.forEach(function (a, k) { if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      if (mnav.scrollWidth > mnav.clientWidth + 2) mnav.scrollLeft = Math.max(0, mlinks[i].offsetLeft - 20);
      var mk = $('.mnav__mark', mnav), a = mlinks[i];
      if (mk) {
        mk.style.setProperty('--y', (a.offsetTop + (a.offsetHeight - 22) / 2) + 'px');
        mk.style.setProperty('--x', a.offsetLeft + 'px');
        mk.style.setProperty('--w', Math.max(24, a.offsetWidth - 14) + 'px');
      }
    };
    window.addEventListener('resize', function () { var c = mlinks.filter(function (a) { return a.hasAttribute('aria-current'); })[0]; mark(mlinks.indexOf(c)); });
    mark(0);
    if ('IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.isIntersecting) mark(msecs.indexOf(en.target)); });
      }, { rootMargin: '-28% 0px -62% 0px' });
      msecs.forEach(function (s) { if (s) spy.observe(s); });
    }
    mlinks.forEach(function (a, i) { a.addEventListener('click', function () { mark(i); }); });
  }

  /* reservation slot: the form address or a pasted embed */
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

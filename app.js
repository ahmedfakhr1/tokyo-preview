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
    var cur = 0, basePick = pickPhoto;
    pickPhoto = function (i) { cur = (i + iimgs.length) % iimgs.length; basePick(cur); };
    var prevB = $('.js-idx-prev'), nextB = $('.js-idx-next');
    if (prevB) prevB.addEventListener('click', function () { pickPhoto(cur - 1); });
    if (nextB) nextB.addEventListener('click', function () { pickPhoto(cur + 1); });
    var box = $('.mindex__photo'), sx = null, sy = 0;
    if (box) {
      box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
      box.addEventListener('touchend', function (e) {
        if (sx === null) return;
        var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
        if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) pickPhoto(cur + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }
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
  /* the entrance never competes with a swipe: the first touch or scroll of the strip ends it at once */
  var plates = $('.plates');
  if (plates && track) {
    var calm = function () { plates.classList.add('is-in', 'is-calm'); };
    ['touchstart', 'pointerdown', 'wheel', 'scroll'].forEach(function (ev) { track.addEventListener(ev, calm, { passive: true, once: true }); });
  }
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
        v = Math.max(-28, Math.min(28, v));
        var settle = function () {
          var cards = $$('.plate', track), best = 0, bd = Infinity, base = cards[0].offsetLeft;
          cards.forEach(function (c) { var d = Math.abs((c.offsetLeft - base) - track.scrollLeft); if (d < bd) { bd = d; best = c.offsetLeft - base; } });
          best = Math.min(best, track.scrollWidth - track.clientWidth);
          var from = track.scrollLeft, t0 = performance.now(), dur = still ? 1 : 420;
          var ease = function (now) {
            var k = Math.min(1, (now - t0) / dur); k = 1 - Math.pow(1 - k, 3);
            track.scrollLeft = from + (best - from) * k;
            if (k < 1) raf = requestAnimationFrame(ease); else track.classList.remove('is-drag');
          };
          raf = requestAnimationFrame(ease);
        };
        var glide = function () {
          v *= 0.92; track.scrollLeft -= v;
          if (Math.abs(v) > 0.8 && !still) raf = requestAnimationFrame(glide); else settle();
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

/* top bar: clear at the top of the page, slips away on the way down, returns as dark glass on the way up */
(function () {
  var h = document.querySelector('.hdr'); if (!h) return;
  var last = window.scrollY, busy = false;
  var run = function () {
    busy = false;
    var y = window.scrollY, open = h.classList.contains('menu-open') || document.querySelector('#drawer.is-open');
    h.classList.toggle('is-glass', y > 40);
    if (open || y < 120) h.classList.remove('is-away');
    else if (y > last + 6) h.classList.add('is-away');
    else if (y < last - 6) h.classList.remove('is-away');
    last = y;
  };
  window.addEventListener('scroll', function () { if (!busy) { busy = true; requestAnimationFrame(run); } }, { passive: true });
  h.addEventListener('focusin', function () { h.classList.remove('is-away'); });
  run();
})();

/* plates: press a photo, it sinks a little, then opens full screen; arrows, swipe and keys step through */
(function () {
  var pv = document.getElementById('pv'), track = document.getElementById('plates-track'); if (!pv || !track) return;
  var cards = [].slice.call(track.querySelectorAll('.plate')), img = document.createElement('img'), cap = pv.querySelector('.pv__cap'), cur = 0, back = null;
  img.className = 'pv__img'; img.alt = '';
  var show = function (i) {
    cur = (i + cards.length) % cards.length;
    if (!img.parentNode) { var s0 = cards[cur].querySelector('img'); img.src = s0.currentSrc || s0.src; pv.querySelector('.pv__fig').insertBefore(img, cap); }
    var src = cards[cur].querySelector('img'), n = cards[cur].querySelector('.plate__n');
    img.classList.add('is-swap');
    setTimeout(function () { img.src = src.currentSrc || src.src; img.alt = src.alt; cap.textContent = n ? n.textContent : ''; img.classList.remove('is-swap'); }, img.src ? 180 : 0);
  };
  var open = function (i) {
    back = document.activeElement; show(i); pv.hidden = false; document.documentElement.classList.add('pv-open');
    requestAnimationFrame(function () { pv.classList.add('is-on'); }); pv.querySelector('.pv__x').focus();
  };
  var close = function () {
    pv.classList.remove('is-on'); document.documentElement.classList.remove('pv-open');
    setTimeout(function () { pv.hidden = true; }, 450);
    if (back && back.focus) back.focus();
  };
  cards.forEach(function (c, i) {
    var box = c.querySelector('.plate__img'); if (!box) return;
    box.setAttribute('role', 'button'); box.setAttribute('tabindex', '0'); box.setAttribute('aria-label', 'Open photo');
    var t0 = 0, timer = 0, sx = 0, sy = 0, live = false;
    box.addEventListener('pointerdown', function (e) { live = true; sx = e.clientX; sy = e.clientY; t0 = Date.now(); timer = setTimeout(function () { if (live) box.classList.add('is-press'); }, 90); });
    box.addEventListener('pointermove', function (e) { if (live && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) { live = false; clearTimeout(timer); box.classList.remove('is-press'); } });
    var end = function () { live = false; clearTimeout(timer); box.classList.remove('is-press'); };
    box.addEventListener('pointercancel', end);
    box.addEventListener('click', function (e) {
      if (track.classList.contains('is-drag')) return;
      var wait = Math.max(0, 260 - (Date.now() - t0));
      box.classList.add('is-press'); setTimeout(function () { end(); open(i); }, wait);
    });
    box.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); } });
  });
  pv.querySelector('.pv__x').addEventListener('click', close);
  pv.querySelector('.pv__nav--p').addEventListener('click', function () { show(cur - 1); });
  pv.querySelector('.pv__nav--n').addEventListener('click', function () { show(cur + 1); });
  pv.addEventListener('click', function (e) { if (e.target === pv) close(); });
  document.addEventListener('keydown', function (e) {
    if (pv.hidden) return;
    if (e.key === 'Escape') close(); else if (e.key === 'ArrowLeft') show(cur - 1); else if (e.key === 'ArrowRight') show(cur + 1);
    else if (e.key === 'Tab') { var f = [].slice.call(pv.querySelectorAll('button')), a = f.indexOf(document.activeElement); if (e.shiftKey && a <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && a === f.length - 1) { e.preventDefault(); f[0].focus(); } }
  });
  var tx = null, ty = 0;
  pv.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
  pv.addEventListener('touchend', function (e) {
    if (tx === null) return; var dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; tx = null;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1)); else if (dy > 90) close();
  }, { passive: true });
})();

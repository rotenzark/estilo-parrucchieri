/* ============================================================
   ESTILÒ PARRUCCHIERI — main.js
   ============================================================ */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) root.classList.add('reduce-motion');

  /* ---------- INTRO ---------- */
  (function intro () {
    var el = document.getElementById('intro');
    if (!el || reduce) { root.classList.add('intro-done'); return; }
    var done = false;
    function finish () {
      if (done) return; done = true;
      root.classList.add('intro-done');
      window.removeEventListener('scroll', finish);
      window.removeEventListener('keydown', finish);
      el.removeEventListener('click', finish);
    }
    setTimeout(finish, 2500);
    window.addEventListener('scroll', finish, { passive: true });
    window.addEventListener('keydown', finish);
    el.addEventListener('click', finish);
  })();

  /* ---------- HEADER ---------- */
  var head = document.querySelector('.site-head');
  function onScroll () { head.classList.toggle('scrolled', window.scrollY > 12); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- MOBILE NAV ---------- */
  var burger = document.getElementById('burger');
  var mnav = document.getElementById('mobile-nav');
  function openNav () {
    mnav.hidden = false;
    requestAnimationFrame(function () { mnav.classList.add('open'); });
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Chiudi menu');
    document.body.classList.add('nav-open');
  }
  function closeNav () {
    mnav.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Apri menu');
    document.body.classList.remove('nav-open');
    setTimeout(function () { if (!mnav.classList.contains('open')) mnav.hidden = true; }, 420);
    burger.focus();
  }
  if (burger) {
    burger.addEventListener('click', function () {
      if (burger.getAttribute('aria-expanded') === 'true') closeNav(); else openNav();
    });
    mnav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 960 && burger.getAttribute('aria-expanded') === 'true') closeNav();
    });
  }

  /* ---------- REVEALS + watchdog ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  function showAll () { reveals.forEach(function (r) { r.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) {
    showAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (r) { io.observe(r); });
    var fired = false;
    var probe = new IntersectionObserver(function () { fired = true; probe.disconnect(); });
    probe.observe(document.body);
    setTimeout(function () { if (!fired) showAll(); }, 1500);
  }

  /* ---------- DYNAMIC HOURS (Europe/Rome) ---------- */
  // minutes from midnight; Tue/Fri 10-19, Wed 10-20:30, Thu 10-21, Sat 10-18:30
  var HOURS = { 0: null, 1: null, 2: [600, 1140], 3: [600, 1230], 4: [600, 1260], 5: [600, 1140], 6: [600, 1110] };

  function romeNow () {
    try { return new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Rome' })); }
    catch (e) { return new Date(); }
  }
  function fmt (mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h < 10 ? '0' + h : h) + ':' + (m < 10 ? '0' + m : m);
  }
  function updateHours (lang) {
    var now = romeNow(), day = now.getDay(), cur = now.getHours() * 60 + now.getMinutes();
    var box = document.getElementById('hours-now'), label = document.getElementById('hours-status');
    if (!box || !label) return;
    var t = I18N_HOURS[lang] || I18N_HOURS.it, open = false, msg = '', today = HOURS[day];
    if (today && cur >= today[0] && cur < today[1]) {
      open = true; msg = t.openUntil.replace('{t}', fmt(today[1]));
    } else {
      var found = null, offset = 0;
      for (var i = 0; i <= 7; i++) {
        var d = (day + i) % 7, h = HOURS[d];
        if (h) {
          if (i === 0 && cur < h[0]) { found = { d: d, t: h[0], same: true }; offset = 0; break; }
          if (i > 0) { found = { d: d, t: h[0], same: false }; offset = i; break; }
        }
      }
      if (found) {
        var dayName = found.same ? t.today : (offset === 1 ? t.tomorrow : t.days[found.d]);
        msg = t.closedOpens.replace('{day}', dayName).replace('{t}', fmt(found.t));
      } else { msg = t.closed; }
    }
    box.classList.toggle('is-open', open);
    box.classList.toggle('is-closed', !open);
    label.textContent = msg;
    document.querySelectorAll('.hours__table tr').forEach(function (tr) {
      tr.classList.toggle('today', parseInt(tr.getAttribute('data-day'), 10) === day);
    });
  }
  var I18N_HOURS = {
    it: { openUntil: 'Aperto ora · chiude alle {t}', closedOpens: 'Chiuso · apre {day} alle {t}', closed: 'Chiuso',
      today: 'oggi', tomorrow: 'domani', days: ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'] },
    en: { openUntil: 'Open now · closes at {t}', closedOpens: 'Closed · opens {day} at {t}', closed: 'Closed',
      today: 'today', tomorrow: 'tomorrow', days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }
  };

  /* ---------- I18N (EN overlay; IT is the DOM default) ---------- */
  var EN = {
    'nav.story': 'Story', 'nav.place': 'The space', 'nav.services': 'Services', 'nav.culture': 'Culture',
    'nav.where': 'Find us', 'nav.reviews': 'Reviews', 'nav.faq': 'FAQ',
    'cta.book': 'Book', 'cta.bookOnline': 'Book online', 'cta.whatsapp': 'Message us on WhatsApp', 'cta.call': '349 237 3928',

    'hero.eyebrow': 'Hairdressers since 1998 · Navigli, Milan',
    'hero.t1': 'An urban jungle,', 'hero.t2': 'that lights up at night.',
    'hero.lead': 'Since 1998 Estilò is the salon that brought the after-work blow-dry to the Navigli. Davines colour, expert hands and an indoor garden to come back to — even just for a gig.',
    'hero.m1': 'on the Navigli from day one', 'hero.m2': '165 reviews · Treatwell', 'hero.m3': 'colour &amp; care',
    'hero.cap': 'Via Vigevano 14, at night', 'hero.scroll': 'Scroll',

    'story.kicker': 'The story',
    'story.t1': 'The first to blow-dry', 'story.t2': 'in the evening.',
    'story.p1': 'Estilò opened in 1998 on Via Vigevano and was the first salon on the Navigli to commit to evening hours: the simple, radical idea that you could visit your hairdresser after work, in peace.',
    'story.p2': 'A women-owned salon, open to everyone and LGBTQ+ friendly, where different sounds and cultures meet. The owners follow the trends and treat every head as a project — starting from listening.',
    'story.b1': 'Since 1998', 'story.b2': 'Women-owned', 'story.b3': 'LGBTQ+ friendly', 'story.b4': 'Open in the evening',

    'place.kicker': 'The space',
    'place.t1': 'A jungle', 'place.t2': 'with chandeliers.',
    'place.lead': 'Green, brass, plants and botanical wallpaper: Estilò’s space is half garden, half vintage lounge. A place where your appointment becomes a proper break.',
    'place.note': 'Real photos of the salon (sources: Treatwell and Google). Photos © Estilò Parrucchieri.',

    'svc.kicker': 'Services &amp; price list',
    'svc.t1': 'Colour &amp; blow-dry,', 'svc.t2': 'by Davines.',
    'svc.lead': 'Real prices from the Estilò list. Specialised in colour and blow-dry, with Davines products: sustainable, Italian, good for your hair.',
    'svc.cat1': 'Cut &amp; blow-dry', 'svc.cat2': 'Davines colour', 'svc.cat3': 'Hair treatments',
    'svc.i1': 'Cut &amp; blow-dry', 'svc.i2': 'Cut &amp; blow-dry, short hair', 'svc.i3': 'Cut &amp; blow-dry, long hair',
    'svc.i4': 'Blow-dry (medium length)', 'svc.i5': 'Blow-dry, long hair', 'svc.i6': 'Fringe trim',
    'svc.i7': "Men's cut", 'svc.i8': 'Updo', 'svc.i9': 'Perm / wave',
    'svc.c1': 'Davines colour', 'svc.c2': 'View Color Davines', 'svc.c3': 'Henna', 'svc.c4': 'Toner',
    'svc.c5': 'Finest Pigment', 'svc.c6': 'Lightening', 'svc.c7': 'Bleach',
    'svc.from1': 'from € 25',
    'svc.t1a': 'Davines treatment', 'svc.t1b': 'Nourishing', 'svc.t1c': 'Repumpling',
    'svc.t1d': 'Keratin treatment', 'svc.t1e': 'Hair mask', 'svc.t1f': 'Mask &amp; shampoo',
    'svc.note': '<strong>Davines</strong> is the line we use for colour and care: sustainable cosmetics, made in Italy.',
    'svc.book': 'Book your service',
    'svc.fine': 'Prices from the Treatwell list; “from €” = starting rate depending on length and technique.',

    'cult.kicker': 'More than hair',
    'cult.t1': 'Concerts, dj sets,', 'cult.t2': 'art shows.',
    'cult.p1': 'Estilò has never been just a salon. Over the years its evenings have hosted concerts, dj sets and exhibitions: a Navigli spot where different sounds and cultures meet, between a blow-dry and a glass of wine.',
    'cult.g1': 'Live music', 'cult.g2': 'DJ sets', 'cult.g3': 'Art shows', 'cult.g4': 'Community',

    'team.kicker': 'The hands',
    'team.t1': 'The owners', 'team.t2': 'and their team.',
    'team.n1sub': '“Lucy”', 'team.r1': 'Cut, blow-dry &amp; colour',
    'team.q1': '“Professional, kind and detail-focused: she understands what you want right away.” — from the reviews',
    'team.r2': 'Stylist', 'team.q2': 'Tailored advice, a quick and perfect cut exactly as requested.',
    'team.note': 'An all-women team of professionals, always on top of the trends and expert with Davines colour.',

    'rev.kicker': 'Reviews', 'rev.t1': 'The neighbourhood', 'rev.t2': 'loves them.',
    'rev.tw': '165 reviews on Treatwell', 'rev.gg': '155 reviews on Google',
    'rev.1': '“My daughter and I both had our hair styled and our experience was absolutely wonderful! We took so many pictures with our beautiful waves and curls that evening :)”',
    'rev.2': '“Comfortable atmosphere, Luciana is precise and professional down to the last detail. Highly recommended!!”',
    'rev.3': '“I had my hair cut by Lucy and loved it. Professional, kind and detail-focused: she understood exactly what I wanted.”',
    'rev.4': '“Quick and perfect cut, exactly as requested, with tailored advice.”',
    'rev.5': '“Everything perfect, thank you.”',
    'rev.note': 'Real, verified reviews, quoted verbatim from Treatwell.',

    'src.tw': 'Treatwell',

    'book.kicker': 'Book', 'book.t1': 'Drop by after work.', 'book.t2': 'We’ll be here.',
    'book.lead': 'Book online on Treatwell, or message us: Wednesday until 20:30, Thursday until 21:00.',

    'where.kicker': 'Find us', 'where.t1': 'Via Vigevano 14,', 'where.t2': 'on tram 10.',
    'where.zone': 'Navigli', 'where.metro': 'Right by the tram 10 stop (Via Vigevano - Via Corsico). Porta Genova metro (M2) close by.',
    'where.checking': 'Checking hours…', 'where.closed': 'Closed',

    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday',
    'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday',

    'faq.kicker': 'FAQ', 'faq.t1': 'The answers,', 'faq.t2': 'before you ask.',
    'faq.q1': 'How do I book at Estilò?',
    'faq.a1': 'Book online on Treatwell, message us on WhatsApp at +39 349 237 3928 or call during opening hours. We’re open in the evening too: Wednesday until 20:30 and Thursday until 21:00.',
    'faq.q2': 'Where are you and how do I get there?',
    'faq.a2': 'Via Vigevano 14, on the Navigli, right by the tram 10 stop (Via Vigevano - Via Corsico). Porta Genova metro (M2) is a few minutes away.',
    'faq.q3': 'What products do you use for colour?',
    'faq.a3': 'We work with Davines: colour, toners and treatments from the line. We are specialised in colour and blow-dry.',
    'faq.q4': 'Do you cut men’s hair too?',
    'faq.a4': 'Yes, a men’s cut is €30. Estilò is a salon for everyone: women-owned and LGBTQ+ friendly.',
    'faq.q5': 'Is it true you host events?',
    'faq.a5': 'Yes: over the years Estilò has hosted concerts, dj sets and art shows. It’s a salon where different sounds and cultures meet.',
    'faq.q6': 'How long has Estilò been around?',
    'faq.a6': 'Since 1998: we were the first salon on the Navigli to commit to evening hours.',

    'foot.tag': 'Hairdressers since 1998 — Navigli, Milan',
    'foot.visit': 'Come and see us', 'foot.contact': 'Contact', 'foot.book': 'Book',
    'foot.demo': 'Demo website by Bespoke Studio · public data (Treatwell, Google). Photos © Estilò Parrucchieri.',
    'foot.up': 'Back to top ↑',

    'bar.call': 'Call', 'bar.wa': 'WhatsApp', 'bar.book': 'Book'
  };

  var i18nEls = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  i18nEls.forEach(function (el) { el.dataset.it = el.innerHTML; });
  var lang = 'it';
  function setLang (l) {
    lang = l;
    i18nEls.forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (l === 'en' && EN[key] != null) el.innerHTML = EN[key];
      else el.innerHTML = el.dataset.it;
    });
    root.setAttribute('lang', l);
    var btn = document.getElementById('lang');
    if (btn) {
      btn.querySelector('.lang__it').classList.toggle('is-on', l === 'it');
      btn.querySelector('.lang__en').classList.toggle('is-on', l === 'en');
    }
    updateHours(l);
  }
  var langBtn = document.getElementById('lang');
  if (langBtn) langBtn.addEventListener('click', function () { setLang(lang === 'it' ? 'en' : 'it'); });

  updateHours('it');
  setInterval(function () { updateHours(lang); }, 60000);

  /* ---------- LIGHTBOX ---------- */
  var lb = document.getElementById('lightbox'), lbImg = document.getElementById('lb-img');
  var triggers = Array.prototype.slice.call(document.querySelectorAll('.ph'));
  var idx = 0, lastFocus = null;
  function openLb (i) {
    idx = (i + triggers.length) % triggers.length;
    lbImg.setAttribute('src', triggers[idx].getAttribute('data-full'));
    lbImg.setAttribute('alt', triggers[idx].querySelector('img').getAttribute('alt'));
    lb.hidden = false; document.body.classList.add('lb-open');
    lastFocus = document.activeElement; document.getElementById('lb-close').focus();
  }
  function closeLb () { lb.hidden = true; document.body.classList.remove('lb-open'); if (lastFocus) lastFocus.focus(); }
  triggers.forEach(function (t, i) { t.addEventListener('click', function () { openLb(i); }); });
  if (lb) {
    document.getElementById('lb-close').addEventListener('click', closeLb);
    document.getElementById('lb-next').addEventListener('click', function () { openLb(idx + 1); });
    document.getElementById('lb-prev').addEventListener('click', function () { openLb(idx - 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowRight') openLb(idx + 1);
      else if (e.key === 'ArrowLeft') openLb(idx - 1);
    });
  }
})();

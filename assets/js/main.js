/* Shreedhi, Jogeshwari East — behaviours. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var PHONE   = '918828161678';
  var PROJECT = 'Shreedhi, Jogeshwari East';
  var WA_BASE = 'https://wa.me/' + PHONE + '?text=';
  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function wa(text) { return WA_BASE + encodeURIComponent(text); }
  function lockScroll(on) {
    document.documentElement.classList.toggle('sj-lock-scroll', on);
    document.body.classList.toggle('sj-lock-scroll', on);
  }
  function store(k, v) {
    try { if (v === undefined) return window.localStorage.getItem(k); window.localStorage.setItem(k, v); }
    catch (e) { return null; }
  }

  /* ---- sticky header, burger, scrollspy --------------------------------- */
  var header = $('#sj-header');
  var nav    = $('#sj-nav');
  var burger = $('#sj-burger');

  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      nav.classList.toggle('is-open', !open);
    });
    $$('a', nav).forEach(function (a) {
      a.addEventListener('click', function () {
        burger.setAttribute('aria-expanded', 'false');
        nav.classList.remove('is-open');
      });
    });
  }

  var navLinks = $$('.sj-nav a');
  var spied = navLinks.map(function (a) {
    var id = (a.getAttribute('href') || '').split('#')[1];
    return id ? { link: a, el: document.getElementById(id) } : null;
  }).filter(function (x) { return x && x.el; });

  if (spied.length && 'IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        spied.forEach(function (s) { s.link.classList.toggle('is-on', s.el === en.target); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    spied.forEach(function (s) { spy.observe(s.el); });
  }

  /* ---- reveal on scroll -------------------------------------------------- */
  var revealables = $$('.sj-rv');
  if (revealables.length && 'IntersectionObserver' in window && !reduce) {
    var rv = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        obs.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    revealables.forEach(function (el) { rv.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- number counters --------------------------------------------------- */
  function runCount(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) return;
    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';
    var pad    = parseInt(el.getAttribute('data-pad') || '0', 10);
    var fmt = function (n) {
      var s = String(Math.round(n));
      while (s.length < pad) { s = '0' + s; }
      return prefix + s + suffix;
    };
    if (reduce) { el.textContent = fmt(target); return; }
    var dur = 1100, t0 = null;
    var step = function (ts) {
      if (t0 === null) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        runCount(en.target); obs.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  }

  /* ---- tabs -------------------------------------------------------------- */
  $$('.sj-tabs__list').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    if (!tabs.length) return;
    var select = function (tab) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
    };
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) {
          e.preventDefault();
          var next = tabs[(i + d + tabs.length) % tabs.length];
          select(next); next.focus();
        } else if (e.key === 'Home' || e.key === 'End') {
          e.preventDefault();
          var t2 = e.key === 'Home' ? tabs[0] : tabs[tabs.length - 1];
          select(t2); t2.focus();
        }
      });
    });
  });

  /* ---- enquiry forms ----------------------------------------------------- */
  var seq = 0;

  function buildForm(host) {
    var n = ++seq;
    var id = function (k) { return 'f' + n + '-' + k; };
    var f = document.createElement('form');
    f.className = 'sj-form';
    f.noValidate = true;
    f.innerHTML =
      '<div class="sj-form__brand"><img class="sj-form__logo" src="assets/img/logo-lockup-h.png"' +
        ' srcset="assets/img/logo-lockup-h.png 1x, assets/img/logo-lockup-h@2x.png 2x"' +
        ' width="252" height="96" alt="Shreedhi, Jogeshwari East"></div>' +
      '<h3 class="sj-form__h">Register Your Interest <em>Early Access</em></h3>' +
      '<div class="sj-form__sum" id="' + id('sum') + '" role="alert" tabindex="-1"><strong>Please check the highlighted fields.</strong><ul></ul></div>' +
      '<div class="sj-f" data-f="name"><label class="sj-vh" for="' + id('name') + '">Name</label>' +
        '<input class="sj-f__in" id="' + id('name') + '" name="name" type="text" placeholder="Name" autocomplete="name" required maxlength="60" aria-describedby="' + id('name-e') + '">' +
        '<p class="sj-f__err" id="' + id('name-e') + '"></p></div>' +
      '<div class="sj-f" data-f="mobile"><label class="sj-vh" for="' + id('mob') + '">Mobile number, 10 digits, India (+91)</label>' +
        '<span class="sj-f__tel"><span class="sj-f__cc">' +
          '<svg class="sj-f__flag" viewBox="0 0 30 20" aria-hidden="true" focusable="false">' +
          '<rect width="30" height="20" fill="#fff"></rect><rect width="30" height="6.67" fill="#FF9933"></rect>' +
          '<rect y="13.33" width="30" height="6.67" fill="#138808"></rect>' +
          '<circle cx="15" cy="10" r="2.7" fill="none" stroke="#000080" stroke-width=".8"></circle>' +
          '<circle cx="15" cy="10" r="1.35" fill="none" stroke="#000080" stroke-width="2.7" stroke-dasharray="0.42 0.29"></circle>' +
          '<circle cx="15" cy="10" r=".55" fill="#000080"></circle></svg><span aria-hidden="true">+91</span></span>' +
        '<input class="sj-f__in" id="' + id('mob') + '" name="mobile" type="tel" placeholder="Mobile No" inputmode="numeric" autocomplete="tel-national" required maxlength="14" aria-describedby="' + id('mob-e') + '"></span>' +
        '<p class="sj-f__err" id="' + id('mob-e') + '"></p></div>' +
      '<div class="sj-f" data-f="email"><label class="sj-vh" for="' + id('em') + '">E-Mail Address (optional)</label>' +
        '<input class="sj-f__in" id="' + id('em') + '" name="email" type="email" placeholder="E-Mail Address" autocomplete="email" aria-describedby="' + id('em-e') + '">' +
        '<p class="sj-f__err" id="' + id('em-e') + '"></p></div>' +
      '<div class="sj-f sj-f--hp" aria-hidden="true"><label for="' + id('co') + '">Company</label>' +
        '<input id="' + id('co') + '" name="company" type="text" tabindex="-1" autocomplete="off"></div>' +
      '<button class="sj-btn sj-btn--primary" type="submit">Register Interest</button>' +
      '<p class="sj-form__fine">By submitting, you authorise Hitendra B. Solanki and his representatives to contact you ' +
        'by call, SMS, email and WhatsApp regarding this project. This overrides DNC/NDNC registration.</p>';

    f.addEventListener('submit', function (e) { e.preventDefault(); submitForm(f, host); });
    host.innerHTML = '';
    host.appendChild(f);
    return f;
  }

  function fieldError(f, key, msg) {
    var wrap = $('[data-f="' + key + '"]', f);
    if (!wrap) return;
    wrap.classList.toggle('is-bad', !!msg);
    var err = $('.sj-f__err', wrap);
    if (err) err.textContent = msg || '';
  }

  function submitForm(f, host) {
    var name   = (f.elements.name.value || '').trim();
    var mobile = (f.elements.mobile.value || '').replace(/\D/g, '');
    var email  = (f.elements.email.value || '').trim();
    var hp     = (f.elements.company.value || '').trim();
    var errs   = [];

    if (name.length < 2) { fieldError(f, 'name', 'Please enter your name.'); errs.push('Name'); }
    else fieldError(f, 'name', '');

    if (mobile.length === 12 && mobile.indexOf('91') === 0) mobile = mobile.slice(2);
    if (!/^[6-9]\d{9}$/.test(mobile)) { fieldError(f, 'mobile', 'Enter a 10-digit Indian mobile number.'); errs.push('Mobile number'); }
    else fieldError(f, 'mobile', '');

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { fieldError(f, 'email', 'That email address does not look right.'); errs.push('Email'); }
    else fieldError(f, 'email', '');

    var sum = $('.sj-form__sum', f);
    if (errs.length) {
      if (sum) {
        $('ul', sum).innerHTML = errs.map(function (e) { return '<li>' + e + '</li>'; }).join('');
        sum.classList.add('is-on');
        sum.focus();
      }
      return;
    }
    if (sum) sum.classList.remove('is-on');

    var source  = host.getAttribute('data-source') || 'Website';
    var looking = host.getAttribute('data-looking') || '';
    var msg = 'Hi, I am interested in ' + PROJECT + '.\n' +
              'Name: ' + name + '\nMobile: +91 ' + mobile +
              (email ? '\nEmail: ' + email : '') +
              (looking ? '\nLooking at: ' + looking : '') +
              '\nEnquiry from: ' + source + '\nPlease share more details.';

    unlockPlans();

    if (!hp) window.open(wa(msg), '_blank', 'noopener');

    host.innerHTML =
      '<div class="sj-form__ok"><h3>Thank you, ' + name.replace(/[<>&]/g, '') + '.</h3>' +
      '<p>Your details are with Hitendra. He will call you back shortly. WhatsApp should have opened in a new tab &mdash; ' +
      'if it did not, tap below.</p>' +
      '<a class="sj-btn sj-btn--wa" href="' + wa(msg) + '" target="_blank" rel="noopener">Open WhatsApp</a></div>';
  }

  $$('.sj-formhost').forEach(buildForm);

  /* ---- floor-plan gate --------------------------------------------------- */
  function unlockPlans() {
    store('sj_plans_registered', '1');
    $$('.sj-plan.is-locked').forEach(function (plan) {
      var lock = $('.sj-lock', plan);
      if (!lock) return;
      lock.innerHTML =
        '<p class="sj-lock__h">You are on the list</p>' +
        '<p class="sj-lock__p">Floor plans for ' + PROJECT + ' have not been released by the developer yet. ' +
        'The day they are out, Hitendra sends them to you first.</p>';
    });
    var waRow = $('#sj-plans-wa');
    if (waRow) waRow.hidden = false;
  }
  if (store('sj_plans_registered') === '1') unlockPlans();

  /* ---- modal, popup ------------------------------------------------------ */
  var modal   = $('#sj-modal');
  var modalT  = $('#sj-modal-t');
  var modalH  = $('#sj-modal-form');
  var lastFocus = null;

  function openLayer(el) {
    if (!el || !el.hidden) return;
    lastFocus = document.activeElement;
    el.hidden = false;
    lockScroll(true);
    var focusable = el.querySelector('input, button, a[href]');
    if (focusable) focusable.focus();
  }
  function closeLayer(el) {
    if (!el || el.hidden) return;
    el.hidden = true;
    if (!$$('.sj-modal, .sj-pop, .sj-lb').some(function (l) { return !l.hidden; })) lockScroll(false);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $$('[data-sj-open="modal"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!modal) return;
      var source  = btn.getAttribute('data-source')  || 'Website';
      var looking = btn.getAttribute('data-looking') || '';
      var action  = btn.getAttribute('data-action')  || '';
      if (modalT) {
        modalT.textContent =
          action === 'unlock' ? 'Get the floor plans first' :
          action === 'maps'   ? 'Get the exact location' :
          looking             ? 'Get early details on the ' + looking :
                                'Register your interest';
      }
      if (modalH) {
        modalH.setAttribute('data-source', source);
        if (looking) modalH.setAttribute('data-looking', looking);
        else modalH.removeAttribute('data-looking');
        buildForm(modalH);
      }
      openLayer(modal);
    });
  });

  $$('[data-sj-close]').forEach(function (el) {
    el.addEventListener('click', function () {
      var layer = el.closest('.sj-modal, .sj-pop, .sj-lb');
      closeLayer(layer);
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    ['.sj-lb', '.sj-pop', '.sj-modal'].some(function (sel) {
      var l = $(sel);
      if (l && !l.hidden) { closeLayer(l); return true; }
      return false;
    });
  });

  var pop = $('#sj-pop');
  if (pop && store('sj_pop_seen') !== '1') {
    window.setTimeout(function () {
      // never interrupt an open modal, lightbox or chat conversation
      if ($$('.sj-modal, .sj-lb').some(function (l) { return !l.hidden; })) return;
      if (bot && !bot.hidden) return;
      store('sj_pop_seen', '1');
      openLayer(pop);
    }, 10000);
  }

  /* ---- lightbox ---------------------------------------------------------- */
  var lb     = $('#sj-lb');
  var lbImg  = $('#sj-lb-img');
  var lbCap  = $('#sj-lb-cap');
  var zoomers = $$('[data-zoom]');
  var lbIndex = 0;

  function showSlide(i) {
    var list = zoomers.filter(function (z) { return !z.disabled; });
    if (!list.length || !lbImg) return;
    lbIndex = (i + list.length) % list.length;
    var z = list[lbIndex];
    lbImg.src = z.getAttribute('data-zoom');
    lbImg.alt = z.getAttribute('data-cap') || '';
    if (lbCap) lbCap.textContent = z.getAttribute('data-cap') || '';
  }
  zoomers.forEach(function (z) {
    z.addEventListener('click', function () {
      if (z.disabled) return;
      var list = zoomers.filter(function (x) { return !x.disabled; });
      showSlide(list.indexOf(z));
      openLayer(lb);
    });
  });
  var prev = $('#sj-lb-prev'), next = $('#sj-lb-next');
  if (prev) prev.addEventListener('click', function () { showSlide(lbIndex - 1); });
  if (next) next.addEventListener('click', function () { showSlide(lbIndex + 1); });
  document.addEventListener('keydown', function (e) {
    if (!lb || lb.hidden) return;
    if (e.key === 'ArrowLeft')  showSlide(lbIndex - 1);
    if (e.key === 'ArrowRight') showSlide(lbIndex + 1);
  });

  /* ---- chatbot: scripted decision tree, no free text --------------------- */
  var bot      = $('#sj-bot');
  var botBody  = $('#sj-bot-body');
  var botQr    = $('#sj-bot-qr');
  var fabChat  = $('#sj-fab-chat');
  var botClose = $('#sj-bot-x');
  var teaser   = $('#sj-teaser');

  var TREE = {
    start: {
      say: ['Hi, I’m Hitendra — authorised channel partner for ' + PROJECT + '.',
            'It’s a new launch by Shree Nidhish Group. What would you like to know?'],
      opts: [
        ['Price & configurations', 'price'],
        ['Floor plans', 'plans'],
        ['Location', 'location'],
        ['Possession & RERA', 'status'],
        ['Amenities', 'amenities'],
        ['Talk to Hitendra', 'contact']
      ]
    },
    price: {
      say: ['Carpet areas run 600–1400 approx. sq.ft. across the project.',
            '<strong>2 BHK</strong> — 600–700 approx. sq.ft. — ₹1.70 Cr onwards*<br>' +
            '<strong>3 BHK</strong> — 800–900 approx. sq.ft. — On Request*<br>' +
            '<strong>Jodi</strong> — On Request — On Request*',
            'Prices are subjective, please contact the sales team.'],
      opts: [['Register interest', 'register'], ['Possession & RERA', 'status'], ['Back', 'start']]
    },
    plans: {
      say: ['Floor plans have not been released by the developer yet — the project is at new-launch stage.',
            'Share your number and I’ll send them the day they’re out.'],
      opts: [['Send me the plans', 'register'], ['Price & configurations', 'price'], ['Back', 'start']]
    },
    location: {
      say: ['Society Road, Natwar Nagar, Jogeshwari East, Mumbai.', 'Nearest landmark is Mogra Metro.'],
      opts: [['Open in Maps', 'maps'], ['Register interest', 'register'], ['Back', 'start']]
    },
    maps: {
      say: ['Here it is on Google Maps — <a href="https://www.google.com/maps/search/?api=1&amp;query=Natwar+Nagar+Jogeshwari+East+Mumbai" target="_blank" rel="noopener">Society Road, Natwar Nagar</a>.'],
      opts: [['Register interest', 'register'], ['Back', 'start']]
    },
    status: {
      say: ['The project is a new launch, 19 floors, with possession scheduled for <strong>December 2030</strong>.',
            'MahaRERA registration is awaited. Details will be updated on registration — I won’t quote a number until there is one.'],
      opts: [['Price & configurations', 'price'], ['Register interest', 'register'], ['Back', 'start']]
    },
    amenities: {
      say: ['Twelve are listed: Gym, Kids Area, CCTV, Indoor Games, Rain Water Harvesting, Gated Community, ' +
            'Security Systems, Lift, Roof Top Garden, Fire Safety System, Banquet Hall and Vastu Compliant planning.'],
      opts: [['Price & configurations', 'price'], ['Register interest', 'register'], ['Back', 'start']]
    },
    register: {
      say: ['Good — I’ll open the short form. Name and number is all I need.'],
      opts: [['Open the form', 'openform'], ['WhatsApp instead', 'wa'], ['Back', 'start']]
    },
    contact: {
      say: ['Call or WhatsApp me directly on <strong>+91 88281 61678</strong>.',
            'Availability and pricing at a new launch move week to week — ask and you get today’s position.'],
      opts: [['Call now', 'tel'], ['WhatsApp', 'wa'], ['Back', 'start']]
    }
  };

  function bubble(html, mine) {
    var d = document.createElement('div');
    d.className = 'sj-msg sj-msg--' + (mine ? 'me' : 'bot');
    d.innerHTML = '<p>' + html + '</p>';
    botBody.appendChild(d);
    botBody.scrollTop = botBody.scrollHeight;
  }

  function goNode(key) {
    var node = TREE[key];
    if (!node) return;
    botQr.innerHTML = '';
    node.say.forEach(function (line, i) {
      window.setTimeout(function () { bubble(line, false); }, reduce ? 0 : i * 260);
    });
    window.setTimeout(function () {
      botQr.innerHTML = '';
      node.opts.forEach(function (pair) {
        var label = pair[0], target = pair[1];
        var el;
        if (target === 'wa') {
          el = document.createElement('a');
          el.className = 'sj-qr sj-qr--wa';
          el.href = wa('Hi, I am interested in ' + PROJECT + '. Please share more details.');
          el.target = '_blank'; el.rel = 'noopener';
        } else if (target === 'tel') {
          el = document.createElement('a');
          el.className = 'sj-qr sj-qr--wa';
          el.href = 'tel:+' + PHONE;
        } else {
          el = document.createElement('button');
          el.type = 'button';
          el.className = 'sj-qr';
          el.addEventListener('click', function () {
            bubble(label, true);
            if (target === 'openform') {
              closeBot();
              var trigger = $('[data-sj-open="modal"][data-source="Chatbot"]');
              if (trigger) trigger.click();
              return;
            }
            goNode(target);
          });
        }
        el.textContent = label;
        botQr.appendChild(el);
      });
    }, reduce ? 0 : node.say.length * 260);
  }

  function openBot() {
    if (!bot) return;
    bot.hidden = false;
    if (fabChat) { fabChat.setAttribute('aria-expanded', 'true'); fabChat.hidden = true; }
    if (teaser) teaser.hidden = true;
    if (!botBody.childElementCount) goNode('start');
    if (botClose) botClose.focus();
  }
  function closeBot() {
    if (!bot) return;
    bot.hidden = true;
    if (fabChat) { fabChat.setAttribute('aria-expanded', 'false'); fabChat.hidden = false; fabChat.focus(); }
  }
  if (fabChat)  fabChat.addEventListener('click', openBot);
  if (botClose) botClose.addEventListener('click', closeBot);

  if (teaser && store('sj_teaser_seen') !== '1') {
    window.setTimeout(function () {
      if (bot && !bot.hidden) return;
      teaser.hidden = false;
      store('sj_teaser_seen', '1');
      window.setTimeout(function () { teaser.hidden = true; }, 7000);
    }, 4500);
  }
})();

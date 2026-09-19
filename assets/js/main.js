/* ══════════════════════════════════════════════════════════════════
   Sankirt Jasmine — Andheri East
   Static site, no backend. Every form ends in a pre-filled WhatsApp
   deep link to the channel partner.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var WA   = '918828161678';
  var $    = function (s, r) { return (r || document).querySelector(s); };
  var $$   = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ── config data — mirrors the published price table exactly ──── */
  var CFG = {
    '1 BHK': { area: '464–486 sq.ft',   price: '₹1.18–1.23 Cr', lo: 11800000, hi: 12300000 },
    '2 BHK': { area: '626–642 sq.ft',   price: '₹1.60–1.64 Cr', lo: 16000000, hi: 16400000 },
    'Jodi':  { area: '1098–1105 sq.ft', price: 'On request',    lo: null,     hi: null }
  };

  /* ── helpers ──────────────────────────────────────────────────── */
  function digits(v) { return String(v || '').replace(/\D+/g, ''); }

  function groupIN(n) {
    var s = String(n), last3 = s.slice(-3), rest = s.slice(0, -3);
    if (!rest) return last3;
    return rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
  }

  function money(n) {
    if (n >= 10000000) return '₹' + (n / 10000000).toFixed(2).replace(/\.00$/, '') + ' Cr';
    if (n >= 100000)   return '₹' + (n / 100000).toFixed(2).replace(/\.00$/, '') + ' L';
    return '₹' + groupIN(n);
  }

  function openWA(text) {
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
  }

  function checkedVal(name, root) {
    var el = $('input[name="' + name + '"]:checked', root || document);
    return el ? el.value : '';
  }

  /* ── footer year ──────────────────────────────────────────────── */
  var yr = $('#yr'); if (yr) yr.textContent = String(new Date().getFullYear());

  /* ── route rail: mark the stop you are standing at ───────────── */
  var links = $$('.rail__line a[data-stop]');
  if (links.length && 'IntersectionObserver' in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var a = byId[e.target.id];
        if (!a) return;
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-on'); l.removeAttribute('aria-current'); });
          a.classList.add('is-on');
          a.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    Object.keys(byId).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) io.observe(sec);
    });
  }

  /* ── hero: a slow parallax drift, no zoom loop ───────────────── */
  var heroImg = $('.hero__img img');
  if (heroImg && !calm.matches) {
    var ticking = false;
    var drift = function () {
      var box = heroImg.parentNode.getBoundingClientRect();
      if (box.bottom > 0 && box.top < window.innerHeight) {
        var seen = (window.innerHeight - box.top) / (window.innerHeight + box.height);
        heroImg.style.transform = 'translate3d(0,' + ((seen - 0.5) * -26).toFixed(2) + 'px,0) scale(1.06)';
      }
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(drift); }
    };
    heroImg.style.willChange = 'transform';
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    drift();
  }

  /* ── cost estimator ───────────────────────────────────────────── */
  var down  = $('#est-down');
  var oArea = $('#est-area'), oPrice = $('#est-price'), oBal = $('#est-bal');

  function estCfg() { return checkedVal('est-cfg') || '1 BHK'; }

  function paintEst() {
    if (!oArea) return;
    var c = CFG[estCfg()];
    oArea.textContent  = c.area;
    oPrice.textContent = c.price;

    var paid = Number(digits(down && down.value));

    if (c.lo === null) {
      oBal.textContent = 'Jodi pricing on request';
      return;
    }
    if (!paid) { oBal.textContent = 'Enter an amount'; return; }
    if (paid >= c.hi) { oBal.textContent = 'Covers the indicative price'; return; }

    var lo = Math.max(c.lo - paid, 0), hi = c.hi - paid;
    oBal.textContent = lo === hi ? money(hi) : money(lo) + ' – ' + money(hi);
  }

  if (down) {
    down.addEventListener('input', function () {
      var d = digits(down.value);
      down.value = d ? groupIN(d) : '';
      paintEst();
    });
  }
  $$('input[name="est-cfg"]').forEach(function (r) { r.addEventListener('change', paintEst); });
  paintEst();

  var estSend = $('#est-send');
  if (estSend) {
    estSend.addEventListener('click', function () {
      var k = estCfg(), c = CFG[k];
      var paid = Number(digits(down && down.value));
      var msg = 'Hi, I am interested in Sankirt Jasmine, Andheri East.\n'
              + 'Configuration: ' + k + ' (' + c.area + ').\n'
              + 'Indicative price: ' + c.price + '.';
      if (paid) msg += '\nI am planning to put down ' + money(paid) + '.';
      msg += '\nPlease share the details.';
      openWA(msg);
    });
  }

  /* ── lead dialog ──────────────────────────────────────────────── */
  var dlg = $('#lead'), leadGo = $('#lead-go'), pErr = $('#lead-phone-err');

  function openLead(cfg) {
    if (!dlg) return;
    if (cfg && CFG[cfg]) {
      var r = $('input[name="cfg"][value="' + cfg + '"]', dlg);
      if (r) r.checked = true;
    }
    if (pErr) pErr.hidden = true;
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    var n = $('#lead-name', dlg); if (n) n.focus();
  }

  $$('[data-lead]').forEach(function (b) {
    b.addEventListener('click', function () { openLead(b.getAttribute('data-lead')); });
  });

  // Enter inside the dialog would otherwise trip the form's method="dialog"
  // and close it silently — route it to the same submit path as the button.
  var leadForm = $('#lead-form');
  if (leadForm) {
    leadForm.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.type !== 'radio') {
        e.preventDefault();
        if (leadGo) leadGo.click();
      }
    });
  }

  if (leadGo) {
    leadGo.addEventListener('click', function () {
      if (digits($('#lead-site', dlg).value)  || $('#lead-site', dlg).value) return;  // honeypot
      var name  = ($('#lead-name', dlg).value || '').trim();
      var phone = digits($('#lead-phone', dlg).value);
      if (phone.length < 10) {
        if (pErr) pErr.hidden = false;
        $('#lead-phone', dlg).focus();
        return;
      }
      if (pErr) pErr.hidden = true;
      var cfg = checkedVal('cfg', dlg) || '1 BHK';
      openWA('Hi, I am ' + (name || 'an interested buyer') + '.\n'
           + 'I would like details on Sankirt Jasmine, Andheri East — ' + cfg + ' (' + CFG[cfg].area + ').\n'
           + 'My number is ' + phone + '.\n'
           + 'Please share the price sheet and floor plans.');
      if (typeof dlg.close === 'function') dlg.close();
    });
  }

  /* ── floor-plan gate — inline on each plan, never a modal ─────── */
  var grid = $('#plans-grid');
  var KEY  = 'sj_plans_unlocked';

  function unlocked() {
    try { return sessionStorage.getItem(KEY) === '1' || localStorage.getItem(KEY) === '1'; }
    catch (e) { return false; }
  }
  function remember() {
    try { localStorage.setItem(KEY, '1'); } catch (e) { /* private mode — fine, stays open for this page */ }
  }
  function openPlans() {
    if (grid) grid.classList.add('is-open');
    $$('.gate', grid).forEach(function (g) { g.remove(); });
  }

  if (grid) {
    if (unlocked()) {
      openPlans();
    } else {
      $$('.plan figure', grid).forEach(function (fig, i) {
        var gate = document.createElement('div');
        gate.className = 'gate';
        // the explainer sits on the first plate only — repeating it ten
        // times down the grid turned the section into noise
        gate.innerHTML =
          (i === 0 ? '<p>Add your number to open all 10 plans</p>' : '') +
          '<span class="hp"><label for="gate-hp-' + i + '">Leave empty</label>' +
          '<input type="text" id="gate-hp-' + i + '" tabindex="-1" autocomplete="off"></span>' +
          '<span class="gate__row">' +
            '<input type="tel" inputmode="tel" maxlength="20" aria-label="Your phone number" placeholder="Phone number">' +
            '<button type="button">Unlock</button>' +
          '</span>' +
          '<span class="err" hidden>Enter at least 10 digits.</span>';

        var tel = $('input[type=tel]', gate);
        var hp  = $('input[type=text]', gate);
        var err = $('.err', gate);

        var go = function () {
          if (hp.value) return;                      // honeypot
          var phone = digits(tel.value);
          if (phone.length < 10) { err.hidden = false; tel.focus(); return; }
          err.hidden = true;
          remember();
          openPlans();
          openWA('Hi, I am interested in Sankirt Jasmine, Andheri East.\n'
               + 'Please send the full floor plan set — master layout, floor plates and apartment plans.\n'
               + 'My number is ' + phone + '.');
        };

        $('button', gate).addEventListener('click', go);
        tel.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') { e.preventDefault(); go(); }
        });

        fig.appendChild(gate);
      });
    }
  }
})();

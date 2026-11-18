/* ثبت لید، ره‌گیری رویدادها (GTM/GA4) و اعمال تنظیمات تماس — مشترک بین همه صفحات */
(function () {
  var cfg = window.SITE_CONFIG || {};
  // ریشهٔ سایت از مسیر همین اسکریپت (assets/js/lead.js) به دست می‌آید تا در صفحات تو در تو هم درست کار کند
  var siteRoot = location.href;
  try {
    if (document.currentScript && document.currentScript.src) {
      siteRoot = new URL('../../', document.currentScript.src).href;
    }
  } catch (e) {}
  window.dataLayer = window.dataLayer || [];

  function track(name, params) {
    var ev = { event: name };
    for (var k in params || {}) ev[k] = params[k];
    window.dataLayer.push(ev);
  }

  function normalizeDigits(s) {
    return String(s || '').replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
  }
  function normalizeMobile(raw) {
    var n = normalizeDigits(raw).replace(/\D/g, '');
    if (/^0098\d{10}$/.test(n)) n = n.slice(4);
    else if (/^98\d{10}$/.test(n)) n = n.slice(2);
    if (/^9\d{9}$/.test(n)) n = '0' + n;
    return n;
  }
  function isValidMobile(raw) { return /^09\d{9}$/.test(normalizeMobile(raw)); }

  function waNumber() {
    var n = normalizeDigits(cfg.whatsapp || '').replace(/\D/g, '');
    if (!n) return '';
    if (n.indexOf('0') === 0) n = '98' + n.slice(1);
    return n;
  }
  function waLink(text) {
    var n = waNumber();
    return n ? 'https://wa.me/' + n + '?text=' + encodeURIComponent(text || '') : '';
  }

  // GTM (فقط در صورت تنظیم شناسه)
  if (/^GTM-[A-Z0-9]+$/.test(cfg.gtmId || '')) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' + cfg.gtmId;
    document.head.appendChild(s);
  }

  // اعمال تنظیمات تماس / واتساپ روی المنت‌ها
  function applyConfig() {
    document.querySelectorAll('[data-phone-link]').forEach(function (a) { a.href = 'tel:' + cfg.phoneDial; });
    document.querySelectorAll('[data-phone-text]').forEach(function (el) { el.textContent = cfg.phoneDisplay; });
    document.querySelectorAll('[data-city]').forEach(function (el) { el.textContent = cfg.city; });
    var hasWa = !!waNumber();
    document.querySelectorAll('[data-wa-text]').forEach(function (el) { el.textContent = cfg.whatsapp; });
    document.querySelectorAll('[data-wa]').forEach(function (el) {
      var isDesktopOnly = el.hasAttribute('data-wa-desktop');
      if (!hasWa) {
        el.hidden = true;
        if (!isDesktopOnly) el.classList.add('hidden');
        return;
      }
      el.hidden = false;
      if (!isDesktopOnly) el.classList.remove('hidden');
      if (el.tagName === 'A') el.href = waLink(el.getAttribute('data-wa') || 'سلام، جهت درخواست بازدید فنی رایگان و تامین نیروی نگهبان پیام می‌دهم.');
    });
    var maps = cfg.maps || {};
    document.querySelectorAll('[data-map-link]').forEach(function (el) {
      var k = el.getAttribute('data-map-link');
      var url = maps[k] || '';
      if (!url) { el.classList.add('hidden'); return; }
      el.classList.remove('hidden');
      if (el.tagName === 'A') el.href = url;
    });
    var social = cfg.social || {};
    document.querySelectorAll('[data-social-link]').forEach(function (el) {
      var k = el.getAttribute('data-social-link');
      var url = social[k] || '';
      if (!url) { el.classList.add('hidden'); return; }
      el.classList.remove('hidden');
      if (el.tagName === 'A') el.href = url;
    });
  }

  // ره‌گیری کلیک روی تلفن، واتساپ و رویدادهای سفارشی (مانند چاپ چک‌لیست حقوقی)
  document.addEventListener('click', function (e) {
    var tracked = e.target.closest ? e.target.closest('[data-track-click]') : null;
    if (tracked) {
      track(tracked.getAttribute('data-track-click'), { page: location.pathname });
    }
    var a = e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) track('click_call', { link_location: a.id || 'link' });
    else if (href.indexOf('wa.me') !== -1) track('click_whatsapp', { link_location: a.id || 'link' });
  });

  function utm() {
    var out = {}, p = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
      if (p.get(k)) out[k] = p.get(k);
    });
    try {
      if (Object.keys(out).length) sessionStorage.setItem('dideban_utm', JSON.stringify(out));
      else out = JSON.parse(sessionStorage.getItem('dideban_utm') || '{}') || {};
    } catch (e) {}
    return out;
  }
  utm();

  var inFlight = {};
  function leadAccepted(r) {
    if (!r.ok) return false;
    return r.text().then(function (t) {
      if (/<\?php|(Fatal|Parse) error/i.test(t)) return false;
      var m = t.match(/\{[^{}]*\}\s*$/);
      if (m) { try { if (JSON.parse(m[0]).ok === false) return false; } catch (e) {} }
      return true;
    });
  }

  // ارسال لید؛ در صورت موفقیت true برمی‌گرداند
  function submitLead(payload) {
    var body = { page: location.pathname, referrer: document.referrer || '', utm: utm() };
    for (var k in payload) body[k] = payload[k];
    if (isValidMobile(body.mobile)) body.mobile = normalizeMobile(body.mobile);
    if (!cfg.leadEndpoint) return Promise.resolve(false);
    var endpoint;
    try { endpoint = new URL(cfg.leadEndpoint, siteRoot).href; } catch (e) { return Promise.resolve(false); }
    var key = (body.source || '') + '|' + (body.mobile || '');
    if (inFlight[key]) return inFlight[key];
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 9000) : null;
    inFlight[key] = fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(leadAccepted)
      .catch(function () { return false; })
      .then(function (ok) {
        if (timer) clearTimeout(timer);
        delete inFlight[key];
        if (!ok) track('lead_submit_failed', { lead_source: body.source || '' });
        return ok;
      });
    return inFlight[key];
  }

  var subpageConverted = false;

  // فرم‌های درون‌صفحه‌ای (صفحات خدمات): <form data-lead-form data-source="...">
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('[data-lead-form]')) return;
    e.preventDefault();
    var status = form.querySelector('[data-lead-status]');
    var btn = form.querySelector('button[type="submit"]');
    function say(msg, ok) {
      if (!status) return;
      var isDark = status.getAttribute('data-theme') === 'dark';
      status.textContent = msg;
      status.className = 'text-xs font-bold mt-2 ' + (ok ? (isDark ? 'text-emerald-300' : 'text-emerald-700') : (isDark ? 'text-amber-300' : 'text-red-600'));
    }
    var f = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
    if (!f('name') || !isValidMobile(f('mobile'))) { say('لطفاً نام و یک شماره موبایل معتبر ۱۱ رقمی وارد کنید.', false); return; }
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'در حال ارسال...'; }
    var src = form.getAttribute('data-source') || 'service_page';
    var fac = f('facility') || form.getAttribute('data-facility') || '';
    submitLead({
      source: src,
      name: f('name'), mobile: normalizeDigits(f('mobile')),
      facility: fac, details: f('details'), website: f('website')
    }).then(function (ok) {
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (ok) {
        subpageConverted = true;
        var evName = form.getAttribute('data-event') || (src === 'partner_program' ? 'partner_inquiry' : 'request_free_inspection');
        track(evName, { facility: fac, source: src });
        var successMsg = form.getAttribute('data-success-msg') || 'درخواست شما ثبت شد. کارشناسان ما تا ۱۵ دقیقه دیگر تماس می‌گیرند.';
        say(successMsg, true);
        form.reset();
      } else {
        say('ثبت درخواست انجام نشد. لطفاً با ' + cfg.phoneDisplay + ' تماس بگیرید.', false);
      }
    });
  });

  // مدال خروج مشترک زیرصفحات (Exit-Intent)
  function initSubpageExitIntent() {
    if (document.querySelector('#exit-intent-modal[data-exit-owner="app"]')) return;
    var modal = document.getElementById('subpage-exit-modal');
    if (!modal) return;
    var form = document.getElementById('subpage-exit-form');
    var closeBtn = modal.querySelector('[data-close-subpage-exit]');
    var statusEl = modal.querySelector('[data-subpage-exit-status]');
    var successBox = modal.querySelector('[data-subpage-exit-success]');
    var shown = false;
    try { if (sessionStorage.getItem('dideban_exit_shown') === '1') shown = true; } catch (e) {}

    function openModal() {
      if (shown || subpageConverted) return;
      shown = true;
      try { sessionStorage.setItem('dideban_exit_shown', '1'); } catch (e) {}
      modal.classList.remove('hidden');
      track('exit_intent_shown', { page: location.pathname });
    }
    function closeModal() { modal.classList.add('hidden'); }

    document.addEventListener('mouseout', function (e) {
      if (e.clientY <= 5 && e.relatedTarget === null) openModal();
    });
    setTimeout(function () {
      if (!shown && !subpageConverted && window.innerWidth < 640) openModal();
    }, 45000);
    var maxDepth = 0, lastY = window.scrollY || 0;
    window.addEventListener('scroll', function () {
      if (shown || subpageConverted || window.innerWidth >= 640) return;
      var y = window.scrollY || 0;
      var docH = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      var depth = y / docH;
      if (depth > maxDepth) maxDepth = depth;
      if (maxDepth >= 0.35 && lastY - y > 140 && y < 300) openModal();
      lastY = y;
    }, { passive: true });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var nameVal = form.elements.name ? form.elements.name.value.trim() : '';
        var rawMobile = form.elements.mobile ? form.elements.mobile.value.trim() : '';
        var hp = form.elements.website ? form.elements.website.value : '';
        if (!isValidMobile(rawMobile)) {
          if (statusEl) {
            statusEl.textContent = 'لطفاً شماره موبایل معتبر ۱۱ رقمی وارد کنید.';
            statusEl.className = 'text-xs font-bold text-red-600';
          }
          return;
        }
        if (statusEl) statusEl.className = 'hidden text-xs font-bold';
        var btn = form.querySelector('button[type="submit"]');
        var origLabel = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'در حال ارسال...'; }
        submitLead({
          source: 'exit_intent_checklist',
          name: nameVal,
          mobile: normalizeMobile(rawMobile),
          website: hp
        }).then(function (ok) {
          if (btn) { btn.disabled = false; btn.textContent = origLabel; }
          if (ok) {
            subpageConverted = true;
            track('exit_intent_lead', { page: location.pathname });
            form.classList.add('hidden');
            if (successBox) successBox.classList.remove('hidden');
          } else if (statusEl) {
            statusEl.textContent = 'ثبت شماره انجام نشد؛ لطفاً با ' + cfg.phoneDisplay + ' تماس بگیرید.';
            statusEl.className = 'text-xs font-bold text-red-600';
          }
        });
      });
    }
  }

  window.Dideban = {
    cfg: cfg,
    track: track,
    submitLead: submitLead,
    isValidMobile: isValidMobile,
    normalizeMobile: normalizeMobile,
    normalizeDigits: normalizeDigits,
    waLink: waLink,
    hasWhatsapp: function () { return !!waNumber(); },
    applyConfig: applyConfig
  };

  // منوی کشویی موبایل برای زیرصفحات (خدمات، مناطق، پایگاه دانش، همکاری و رزومه)
  function initSubpageMobileMenu() {
    var btn = document.getElementById('btn-subpage-menu');
    var drawer = document.getElementById('subpage-mobile-drawer');
    var backdrop = document.getElementById('subpage-mobile-backdrop');
    if (!btn || !drawer) return;
    function closeMenu() {
      drawer.classList.add('hidden');
      if (backdrop) backdrop.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
    }
    function openMenu() {
      drawer.classList.remove('hidden');
      if (backdrop) backdrop.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
    }
    btn.addEventListener('click', function () {
      if (drawer.classList.contains('hidden')) openMenu();
      else closeMenu();
    });
    if (backdrop) backdrop.addEventListener('click', closeMenu);
    drawer.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.classList.contains('hidden')) closeMenu();
    });
  }

  function boot() {
    applyConfig();
    initSubpageMobileMenu();
    initSubpageExitIntent();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();

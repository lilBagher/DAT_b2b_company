/* ثبت لید، ره‌گیری رویدادها (GTM/GA4) و اعمال تنظیمات تماس — مشترک بین همه صفحات */
(function () {
  var cfg = window.SITE_CONFIG || {};
  // ریشهٔ سایت از مسیر همین اسکریپت (assets/js/lead.js) به دست می‌آید تا در صفحات تو در تو هم درست کار کند
  var siteRoot = location.href;
  try { siteRoot = new URL('../../', document.currentScript.src).href; } catch (e) {}
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
  function isValidMobile(raw) { return /^09\d{9}$/.test(normalizeDigits(raw).replace(/\s|-/g, '')); }

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
      if (!hasWa) { el.classList.add('hidden'); return; }
      el.classList.remove('hidden');
      if (el.tagName === 'A') el.href = waLink(el.getAttribute('data-wa') || 'سلام، جهت درخواست بازدید فنی رایگان و تامین نیروی نگهبان پیام می‌دهم.');
    });
  }

  // ره‌گیری کلیک روی تلفن و واتساپ
  document.addEventListener('click', function (e) {
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
    return out;
  }

  // ارسال لید؛ در صورت موفقیت true برمی‌گرداند
  function submitLead(payload) {
    var body = { page: location.pathname, referrer: document.referrer || '', utm: utm() };
    for (var k in payload) body[k] = payload[k];
    if (!cfg.leadEndpoint) return Promise.resolve(false);
    var endpoint;
    try { endpoint = new URL(cfg.leadEndpoint, siteRoot).href; } catch (e) { return Promise.resolve(false); }
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 9000) : null;
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) { return r.ok; })
      .catch(function () { return false; })
      .then(function (ok) { if (timer) clearTimeout(timer); return ok; });
  }

  // فرم‌های درون‌صفحه‌ای (صفحات خدمات): <form data-lead-form data-source="...">
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form.matches || !form.matches('[data-lead-form]')) return;
    e.preventDefault();
    var status = form.querySelector('[data-lead-status]');
    var btn = form.querySelector('button[type="submit"]');
    function say(msg, ok) {
      if (!status) return;
      status.textContent = msg;
      status.className = 'text-xs font-bold mt-2 ' + (ok ? 'text-emerald-700' : 'text-red-600');
    }
    var f = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
    if (!f('name') || !isValidMobile(f('mobile'))) { say('لطفاً نام و یک شماره موبایل معتبر ۱۱ رقمی وارد کنید.', false); return; }
    var label = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'در حال ارسال...'; }
    submitLead({
      source: form.getAttribute('data-source') || 'service_page',
      name: f('name'), mobile: normalizeDigits(f('mobile')),
      facility: form.getAttribute('data-facility') || '', details: f('details'), website: f('website')
    }).then(function (ok) {
      if (btn) { btn.disabled = false; btn.textContent = label; }
      if (ok) {
        track('request_free_inspection', { facility: form.getAttribute('data-facility') || '' });
        say('درخواست شما ثبت شد. کارشناسان ما تا ۱۵ دقیقه دیگر تماس می‌گیرند.', true);
        form.reset();
      } else {
        say('ثبت درخواست انجام نشد. لطفاً با ' + cfg.phoneDisplay + ' تماس بگیرید.', false);
      }
    });
  });

  window.Dideban = {
    cfg: cfg,
    track: track,
    submitLead: submitLead,
    isValidMobile: isValidMobile,
    normalizeDigits: normalizeDigits,
    waLink: waLink,
    hasWhatsapp: function () { return !!waNumber(); },
    applyConfig: applyConfig
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyConfig);
  else applyConfig();
})();

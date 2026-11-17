/* منطق تعاملی، برآوردگر شیفت ۱۴۰۵ و مدیریت وضعیت وب‌سایت دیدبان امین توانا */
(function () {
      // ۱. وضعیت پایه برنامه (State)
      var state = {
        city: 'تهران',
        address: 'پونک شمالی، بزرگراه شهید آیت‌الله اشرفی اصفهانی، خیابان شهید میرزا بابایی، مجتمع تجاری غدیر، طبقه ۳',
        phoneDisplay: '۰۲۱-۴۴۲۸۹۰۰۰',
        phoneDial: '02144289000',
        estimator: {
          place: 'tower', // tower | factory | site
          shifts: 1,
          hours: 24, // 8 | 12 | 24
          patrol: true,
          formal: true
        },
        estimatorGated: false,
        hasConverted: false,
        reviews: (window.SITE_CONFIG && window.SITE_CONFIG.reviews) || []
      };

      function escapeHtml(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
      }
      var D = window.Dideban;

      // تبدیل اعداد انگلیسی به فارسی جهت نمایش زیبا
      function toPersianDigits(val) {
        var id = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return String(val).replace(/[0-9]/g, function (w) {
          return id[+w];
        });
      }

      function formatToman(num) {
        var rounded = Math.round(num / 10000) * 10000;
        return toPersianDigits(rounded.toLocaleString('en-US')) + ' تومان';
      }

      function showToast(msg) {
        var toast = document.getElementById('app-toast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.remove('hidden');
        if (window._toastTimer) clearTimeout(window._toastTimer);
        window._toastTimer = setTimeout(function () {
          toast.classList.add('hidden');
        }, 4200);
      }

      // ۲. منوی موبایل با بستن هوشمند و پس‌زمینه محو
      var btnMobileMenu = document.getElementById('btn-mobile-menu');
      var mobileDrawer = document.getElementById('mobile-menu-drawer');
      var mobileBackdrop = document.getElementById('mobile-menu-backdrop');
      var iconOpen = document.getElementById('icon-menu-open');
      var iconClose = document.getElementById('icon-menu-close');

      function closeMobileMenu() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.add('hidden');
        if (mobileBackdrop) mobileBackdrop.classList.add('hidden');
        if (iconOpen) iconOpen.classList.remove('hidden');
        if (iconClose) iconClose.classList.add('hidden');
        if (btnMobileMenu) btnMobileMenu.setAttribute('aria-expanded', 'false');
      }

      function openMobileMenu() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.remove('hidden');
        if (mobileBackdrop) mobileBackdrop.classList.remove('hidden');
        if (iconOpen) iconOpen.classList.add('hidden');
        if (iconClose) iconClose.classList.remove('hidden');
        if (btnMobileMenu) btnMobileMenu.setAttribute('aria-expanded', 'true');
      }

      if (btnMobileMenu && mobileDrawer) {
        btnMobileMenu.addEventListener('click', function () {
          var isHidden = mobileDrawer.classList.contains('hidden');
          if (isHidden) openMobileMenu();
          else closeMobileMenu();
        });

        if (mobileBackdrop) {
          mobileBackdrop.addEventListener('click', closeMobileMenu);
        }

        var mobileLinks = document.querySelectorAll('.mobile-nav-link');
        mobileLinks.forEach(function (link) {
          link.addEventListener('click', closeMobileMenu);
        });
      }

      // ۳. انتخابگر نقش کارفرما در بخش Hero
      var personaTips = {
        tower: 'ویژه مدیران برج‌ها: تأمین لابی‌من ۲۴ ساعته با لباس فرم تشریفاتی، بدون ایجاد حق سکونت در مشاعات و حذف کامل شکایات سنوات از هیئت‌مدیره.',
        factory: 'ویژه مدیران کارخانه‌ها: کنترل دقیق بارنامه و باسکول، گشت‌زنی پیرامونی با ثبت تگ RFID و صدور فاکتور رسمی معتبر با شناسه ملی ۱۴۰۱۲۱۰۷۸۱۷.',
        hr: 'ویژه مدیران منابع انسانی و حراست: برون‌سپاری کامل تعهدات قانون کار ۱۴۰۵، بیمه تأمین اجتماعی، حوادث ماده ۶۶ و گزینش ۵ مرحله‌ای مرکز انتظام.',
        construction: 'ویژه سازندگان پروژه‌های عمرانی: حفاظت شبانه‌روزی از کابل، میلگرد و ابزارآلات کارگاهی با پوشش کامل بیمه حوادث و تحویل فوری پست در پایان ساخت.'
      };

      var personaChips = document.querySelectorAll('.persona-chip');
      var personaTipEl = document.getElementById('persona-dynamic-tip');
      var personaToService = { tower: 'residential', factory: 'industrial', hr: 'industrial', construction: 'construction' };
      var personaToPlace = { tower: 'tower', factory: 'factory', hr: 'factory', construction: 'site' };

      personaChips.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var p = btn.getAttribute('data-persona');
          personaChips.forEach(function (b) {
            b.className = 'persona-chip bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-3 py-1.5 rounded-lg transition';
          });
          btn.className = 'persona-chip bg-cta-gold text-navy-dark font-bold text-xs px-3 py-1.5 rounded-lg transition';
          if (personaTipEl && personaTips[p]) {
            personaTipEl.textContent = personaTips[p];
          }

          // Persona Sync با تب خدمات و برآوردگر
          var svcTab = personaToService[p];
          if (svcTab) {
            var targetTabBtn = document.querySelector('[data-service-tab="' + svcTab + '"]');
            if (targetTabBtn) targetTabBtn.click();
          }
          var targetPlace = personaToPlace[p];
          if (targetPlace && typeof selectEstimatorPlace === 'function') {
            selectEstimatorPlace(targetPlace);
          }
        });
      });

      // ۴. فیلتر جدول و کارت‌های مقایسه نگهبان شخصی در برابر دیدبان امین توانا
      var compFilterBtns = document.querySelectorAll('.comp-filter-btn');
      var compRows = document.querySelectorAll('#comparison-table-body tr');
      var compCards = document.querySelectorAll('#comparison-mobile-cards [data-comp-cat]');
      compFilterBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var filter = btn.getAttribute('data-comp-filter');
          compFilterBtns.forEach(function (b) {
            b.className = 'comp-filter-btn bg-slatebg hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium px-4 py-2 rounded-xl transition';
          });
          btn.className = 'comp-filter-btn bg-navy text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl transition';

          var filterItem = function (el) {
            var cat = el.getAttribute('data-comp-cat');
            if (filter === 'all' || cat === filter) {
              el.classList.remove('hidden');
            } else {
              el.classList.add('hidden');
            }
          };

          compRows.forEach(filterItem);
          compCards.forEach(filterItem);
        });
      });

      // ۵. تب‌های ۳ گانه خدمات تخصصی
      var serviceTabBtns = document.querySelectorAll('.service-tab-btn');
      var servicePanels = {
        residential: document.getElementById('service-panel-residential'),
        industrial: document.getElementById('service-panel-industrial'),
        construction: document.getElementById('service-panel-construction')
      };

      serviceTabBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var target = btn.getAttribute('data-service-tab');
          serviceTabBtns.forEach(function (b) {
            b.className = 'service-tab-btn flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-800 hover:border-slate-300 text-right shadow-sm transition';
          });
          btn.className = 'service-tab-btn flex items-center gap-3 p-4 rounded-2xl border-2 border-cta-blue bg-navy text-white text-right shadow-md transition';

          Object.keys(servicePanels).forEach(function (k) {
            if (servicePanels[k]) {
              if (k === target) {
                servicePanels[k].classList.remove('hidden');
              } else {
                servicePanels[k].classList.add('hidden');
              }
            }
          });
        });
      });

      // ۶. منطق برآوردگر سریع نیاز حفاظتی (بر پایه ارقام قانون کار ۱۴۰۵)
      var placeNames = {
        tower: 'برج مسکونی / اداری',
        factory: 'کارخانه / انبار صنعتی',
        site: 'کارگاه / پروژه ساختمانی'
      };

      // ارقام مستند قانون کار ۱۴۰۵:
      // ۸ ساعته روزکار: ۲۱,۸۳۰,۰۰۰ تومان ناخالص پایه نگهبان + بیمه سهم کارفرما، ذخیره سنوات/عیدی و پشتیبانی جایگزینی => حدود ۲۶,۹۰۰,۰۰۰ تومان هزینه تمام‌شده پیمانکاری هر پست ۸ ساعته
      // ۱۲ ساعته (روز یا شب با اضافه‌کاری/شب‌کاری): میانگین حدود ۳۶,۴۰۰,۰۰۰ تومان هزینه تمام‌شده هر پست ۱۲ ساعته
      // ۲۴ ساعته شبانه‌روزی کامل (پوشش ۲۴/۷ با ۲ شیفت ۱۲ ساعته چرخشی یا ۳ شیفت ۲۴-۴۸ + ذخیره مرخصی، بیمه و پشتیبانی): حدود ۵۳,۵۰۰,۰۰۰ تومان به ازای هر پست ۲۴ ساعته
      function updateEstimatorUI() {
        var est = state.estimator;
        var placeLabel = placeNames[est.place] || 'برج مسکونی / اداری';
        var shiftBadge = document.getElementById('est-shift-badge');
        var shiftRange = document.getElementById('est-shift-range');
        if (shiftBadge) shiftBadge.textContent = toPersianDigits(est.shifts) + ' پست';
        if (shiftRange && +shiftRange.value !== est.shifts) shiftRange.value = est.shifts;

        var summaryTitle = document.getElementById('est-summary-title');
        if (summaryTitle) {
          summaryTitle.textContent = placeLabel + ' — ' + toPersianDigits(est.shifts) + ' پست ' + toPersianDigits(est.hours) + ' ساعته';
        }

        var patternText = document.getElementById('est-pattern-text');
        var headcountText = document.getElementById('est-headcount-text');
        var perGuardWage = document.getElementById('est-per-guard-wage');
        var totalPriceEl = document.getElementById('est-total-price');

        var basePerPost = 53500000;
        var minPersonnel = est.shifts * 2;
        var maxPersonnel = est.shifts * 3;

        if (est.hours === 8) {
          basePerPost = 26900000;
          minPersonnel = est.shifts * 1;
          maxPersonnel = est.shifts * 1 + 1;
          if (patternText) patternText.textContent = 'تک‌شیفت ۸ ساعته روزانه (۱۹۱ ساعت/ماه) + نیروی ذخیره مرخصی';
          if (perGuardWage) perGuardWage.textContent = '۲۱٬۸۳۰٬۰۰۰ تومان ناخالص قانونی + بیمه و سنوات';
        } else if (est.hours === 12) {
          basePerPost = 36800000;
          minPersonnel = est.shifts * 1;
          maxPersonnel = est.shifts * 2;
          if (patternText) patternText.textContent = 'شیفت ۱۲ ساعته (روز یا شب ثابت با ۳۵٪ شب‌کاری / اضافه‌کاری)';
          if (perGuardWage) perGuardWage.textContent = '۲۵٬۰۰۰٬۰۰۰ تا ۳۴٬۶۳۰٬۰۰۰ تومان ناخالص قانونی';
        } else {
          basePerPost = 53500000;
          minPersonnel = est.shifts * 2;
          maxPersonnel = est.shifts * 3;
          if (patternText) patternText.textContent = 'پوشش ۲۴ ساعته بدون خلأ (مدل ۲۴-۴۸ یا ۱۲-۱۲ چرخشی)';
          if (perGuardWage) perGuardWage.textContent = '۲۵٬۵۷۰٬۰۰۰ تا ۲۹٬۱۳۰٬۰۰۰ تومان به ازای هر نفر شیفت';
        }

        // ضریب تخصصی نوع مکان و تجهیزات
        var placeAddon = est.place === 'factory' ? 1400000 : (est.place === 'site' ? 900000 : 800000);
        var optAddon = (est.patrol ? 500000 : 0) + (est.formal ? 500000 : 0);

        var totalMonthly = (basePerPost + placeAddon + optAddon) * est.shifts;

        if (headcountText) {
          headcountText.textContent = toPersianDigits(minPersonnel) + ' الی ' + toPersianDigits(maxPersonnel) + ' نفر نیروی گزینش‌شده (با پشتیبان)';
        }
        if (totalPriceEl) {
          totalPriceEl.textContent = formatToman(totalMonthly);
        }

        var priceRange = document.getElementById('est-price-range');
        if (priceRange && !state.estimatorGated) {
          var low = Math.round((totalMonthly * 0.85) / 1000000);
          var high = Math.round((totalMonthly * 1.15) / 1000000);
          priceRange.textContent = 'از ' + toPersianDigits(low) + ' تا ' + toPersianDigits(high) + ' میلیون تومان';
        }

        return {
          placeLabel: placeLabel,
          shifts: est.shifts,
          hours: est.hours,
          totalFormatted: formatToman(totalMonthly),
          headcount: toPersianDigits(minPersonnel) + ' الی ' + toPersianDigits(maxPersonnel) + ' نفر'
        };
      }

      // دکمه‌های انتخاب مکان در برآوردگر
      var estPlaceBtns = document.querySelectorAll('.est-place-btn');
      function selectEstimatorPlace(placeKey) {
        state.estimator.place = placeKey;
        estPlaceBtns.forEach(function (b) {
          if (b.getAttribute('data-est-place') === placeKey) {
            b.className = 'est-place-btn p-3.5 rounded-2xl border-2 border-cta-blue bg-white text-navy font-bold text-sm text-right shadow-sm transition';
          } else {
            b.className = 'est-place-btn p-3.5 rounded-2xl border-2 border-slate-200 bg-white/70 hover:bg-white text-slate-700 font-bold text-sm text-right transition';
          }
        });
        updateEstimatorUI();
      }

      estPlaceBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          selectEstimatorPlace(btn.getAttribute('data-est-place'));
        });
      });

      // پرش از تب‌های خدمات به برآوردگر
      var jumpBtns = document.querySelectorAll('[data-jump-estimator]');
      jumpBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetPlace = btn.getAttribute('data-jump-estimator');
          selectEstimatorPlace(targetPlace);
          var el = document.getElementById('shift-estimator');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        });
      });

      // اسلایدر و دکمه‌های تعداد پست
      var shiftRangeInput = document.getElementById('est-shift-range');
      var btnDec = document.getElementById('btn-shift-dec');
      var btnInc = document.getElementById('btn-shift-inc');

      if (shiftRangeInput) {
        shiftRangeInput.addEventListener('input', function () {
          state.estimator.shifts = parseInt(shiftRangeInput.value, 10) || 1;
          updateEstimatorUI();
        });
      }
      if (btnDec) {
        btnDec.addEventListener('click', function () {
          if (state.estimator.shifts > 1) {
            state.estimator.shifts -= 1;
            updateEstimatorUI();
          }
        });
      }
      if (btnInc) {
        btnInc.addEventListener('click', function () {
          if (state.estimator.shifts < 10) {
            state.estimator.shifts += 1;
            updateEstimatorUI();
          }
        });
      }

      // دکمه‌های ساعت پوشش
      var estHoursBtns = document.querySelectorAll('.est-hours-btn');
      estHoursBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var h = parseInt(btn.getAttribute('data-est-hours'), 10) || 24;
          state.estimator.hours = h;
          estHoursBtns.forEach(function (b) {
            if (parseInt(b.getAttribute('data-est-hours'), 10) === h) {
              b.className = 'est-hours-btn p-3.5 rounded-2xl border-2 border-cta-blue bg-white text-navy text-right shadow-sm transition';
            } else {
              b.className = 'est-hours-btn p-3.5 rounded-2xl border-2 border-slate-200 bg-white/70 hover:bg-white text-slate-700 text-right transition';
            }
          });
          updateEstimatorUI();
        });
      });

      var chkPatrol = document.getElementById('est-opt-patrol');
      var chkFormal = document.getElementById('est-opt-formal');
      if (chkPatrol) {
        chkPatrol.addEventListener('change', function () {
          state.estimator.patrol = chkPatrol.checked;
          updateEstimatorUI();
        });
      }
      if (chkFormal) {
        chkFormal.addEventListener('change', function () {
          state.estimator.formal = chkFormal.checked;
          updateEstimatorUI();
        });
      }

      // ارسال فرم Lead Magnet و نمایش پیش‌فاکتور + چک‌لیست ۱۰ نکته حقوقی
      var leadForm = document.getElementById('lead-magnet-form');
      var checklistModal = document.getElementById('checklist-modal');
      var btnCloseChecklist = document.getElementById('btn-close-checklist-modal');
      var btnPreviewChecklist = document.getElementById('btn-preview-checklist');
      var btnPrintChecklist = document.getElementById('btn-print-checklist');

      function openChecklistWithQuote(userName, userPhone) {
        var calc = updateEstimatorUI();
        var recLabel = document.getElementById('quote-recipient-label');
        var detailsBox = document.getElementById('quote-details-summary');
        if (recLabel) {
          recLabel.textContent = 'متقاضی: ' + (userName ? userName : 'کارفرمای محترم') + (userPhone ? ' (' + toPersianDigits(userPhone) + ')' : '');
        }
        var priceDisplay = calc.totalFormatted;
        if (!userPhone && !state.estimatorGated) {
          var rangeEl = document.getElementById('est-price-range');
          var rangeText = rangeEl ? rangeEl.textContent.trim() : 'بازه اولیه';
          priceDisplay = rangeText + ' (جهت مشاهده رقم قطعی، شماره تماس خود را در برآوردگر ثبت فرمایید)';
        }
        if (detailsBox) {
          detailsBox.innerHTML =
            '<div class="bg-white p-3 rounded-xl border border-slate-200"><span class="text-slate-500 block text-xs">نوع مکان و پوشش:</span><strong class="text-navy">' +
            calc.placeLabel + ' (' + toPersianDigits(calc.hours) + ' ساعته)</strong></div>' +
            '<div class="bg-white p-3 rounded-xl border border-slate-200"><span class="text-slate-500 block text-xs">تعداد پست و نفرات:</span><strong class="text-navy">' +
            toPersianDigits(calc.shifts) + ' پست همزمان (' + calc.headcount + ')</strong></div>' +
            '<div class="bg-white p-3 rounded-xl border border-slate-200"><span class="text-slate-500 block text-xs">برآورد پایه ماهانه (۱۴۰۵):</span><strong class="text-emerald-700">' +
            priceDisplay + '</strong></div>';
        }
        if (checklistModal) checklistModal.classList.remove('hidden');
        return calc;
      }

      if (leadForm) {
        leadForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var nameInput = document.getElementById('lead-name');
          var phoneInput = document.getElementById('lead-phone');
          var errEl = document.getElementById('lead-phone-error');
          var submitBtn = leadForm.querySelector('button[type="submit"]');
          var hp = leadForm.querySelector('[name="website"]');
          var rawPhone = phoneInput ? phoneInput.value.trim() : '';
          if (!D.isValidMobile(rawPhone)) {
            if (errEl) errEl.classList.remove('hidden');
            return;
          }
          if (errEl) errEl.classList.add('hidden');
          var name = nameInput ? nameInput.value.trim() : '';
          var origBtnHtml = submitBtn ? submitBtn.innerHTML : '';
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>در حال صدور پیش‌فاکتور...</span>';
          }
          var normPhone = D.normalizeMobile ? D.normalizeMobile(rawPhone) : D.normalizeDigits(rawPhone);
          var calc = updateEstimatorUI();
          D.submitLead({
            source: 'estimator',
            name: name,
            mobile: normPhone,
            facility: calc.placeLabel,
            estimate: calc.shifts + ' پست ' + calc.hours + ' ساعته - ' + calc.totalFormatted,
            website: hp ? hp.value : ''
          }).then(function (ok) {
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = origBtnHtml;
            }
            if (ok) {
              state.estimatorGated = true;
              state.hasConverted = true;
              var teaser = document.getElementById('est-price-teaser');
              var exact = document.getElementById('est-price-exact');
              if (teaser) teaser.classList.add('hidden');
              if (exact) exact.classList.remove('hidden');
              openChecklistWithQuote(name, normPhone);
              D.track('generate_lead_estimator', { place: state.estimator.place, posts: calc.shifts, hours: calc.hours });
              showToast('پیش‌فاکتور و چک‌لیست آماده است و درخواست شما برای کارشناسان ما ثبت شد.');
            } else {
              if (errEl) {
                errEl.textContent = 'ثبت درخواست با خطا مواجه شد؛ لطفاً با شماره ' + D.cfg.phoneDisplay + ' تماس حاصل فرمایید.';
                errEl.classList.remove('hidden');
              }
              showToast('ثبت شماره انجام نشد؛ لطفاً با شماره ' + D.cfg.phoneDisplay + ' تماس بگیرید.');
            }
          });
        });
      }

      if (btnPreviewChecklist) {
        btnPreviewChecklist.addEventListener('click', function () {
          openChecklistWithQuote('', '');
        });
      }
      if (btnCloseChecklist && checklistModal) {
        btnCloseChecklist.addEventListener('click', function () {
          checklistModal.classList.add('hidden');
        });
      }
      if (btnPrintChecklist) {
        btnPrintChecklist.addEventListener('click', function () {
          window.print();
        });
      }

      // ۷. سوئیچر لباس فرم در بخش اعتبارسنجی
      var uniformBtns = document.querySelectorAll('.uniform-tab-btn');
      var panelLobby = document.getElementById('uniform-panel-lobby');
      var panelInd = document.getElementById('uniform-panel-industrial');
      uniformBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var t = btn.getAttribute('data-uniform-tab');
          uniformBtns.forEach(function (b) {
            b.className = 'uniform-tab-btn text-slate-600 hover:text-navy text-xs font-bold px-3 py-1.5 rounded-lg transition';
          });
          btn.className = 'uniform-tab-btn bg-navy text-white text-xs font-bold px-3 py-1.5 rounded-lg transition';
          if (t === 'lobby') {
            if (panelLobby) panelLobby.classList.remove('hidden');
            if (panelInd) panelInd.classList.add('hidden');
          } else {
            if (panelLobby) panelLobby.classList.add('hidden');
            if (panelInd) panelInd.classList.remove('hidden');
          }
        });
      });

      // ۸. رندر نظرات مشتریان (از config.js؛ آرایه خالی = حذف بخش)
      var reviewsGrid = document.getElementById('reviews-grid');
      var reviewsWrap = document.getElementById('reviews-wrap');

      function renderReviews() {
        if (!reviewsGrid) return;
        if (!state.reviews.length) {
          if (reviewsWrap) reviewsWrap.classList.add('hidden');
          return;
        }
        reviewsGrid.innerHTML = state.reviews.map(function (item) {
          return '<article class="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">' +
            '<div class="space-y-3"><span class="text-[11px] font-bold text-cta-blue bg-blue-50 px-2.5 py-1 rounded-lg">' + escapeHtml(item.badge) + '</span>' +
            '<blockquote class="text-xs sm:text-sm text-slate-700 leading-relaxed">«' + escapeHtml(item.quote) + '»</blockquote></div>' +
            '<div class="pt-3 border-t border-slate-100"><div class="font-extrabold text-navy text-xs sm:text-sm">' + escapeHtml(item.author) + '</div>' +
            '<div class="text-xs text-slate-500 mt-0.5">' + escapeHtml(item.role) + '</div></div></article>';
        }).join('');
      }

      // ۹. سوالات متداول آکاردئونی + جستجوی زنده
      var faqTriggers = document.querySelectorAll('.faq-trigger');
      faqTriggers.forEach(function (trigger) {
        trigger.addEventListener('click', function () {
          var item = trigger.closest('.faq-item');
          var content = item ? item.querySelector('.faq-content') : null;
          var icon = trigger.querySelector('.faq-icon');
          var isExpanded = trigger.getAttribute('aria-expanded') === 'true';

          if (content) {
            if (isExpanded) {
              content.classList.add('hidden');
              trigger.setAttribute('aria-expanded', 'false');
              if (icon) icon.classList.remove('rotate-180');
            } else {
              content.classList.remove('hidden');
              trigger.setAttribute('aria-expanded', 'true');
              if (icon) icon.classList.add('rotate-180');
            }
          }
        });
      });

      var faqSearch = document.getElementById('faq-search');
      if (faqSearch) {
        faqSearch.addEventListener('input', function () {
          var q = faqSearch.value.trim().toLowerCase();
          var items = document.querySelectorAll('.faq-item');
          items.forEach(function (item) {
            var text = item.textContent.toLowerCase();
            if (!q || text.indexOf(q) !== -1) {
              item.classList.remove('hidden');
            } else {
              item.classList.add('hidden');
            }
          });
        });
      }

      // ۱۰. مودال درخواست بازدید رایگان
      var visitModal = document.getElementById('visit-modal');
      var btnCloseVisit = document.getElementById('btn-close-visit-modal');
      var openVisitBtns = document.querySelectorAll('[data-open-visit-modal]');
      var visitFacilitySelect = document.getElementById('visit-facility');

      openVisitBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var preset = btn.getAttribute('data-open-visit-modal');
          if (visitFacilitySelect && preset && preset !== 'true') {
            visitFacilitySelect.value = preset;
          }
          if (visitModal) visitModal.classList.remove('hidden');
        });
      });

      if (btnCloseVisit && visitModal) {
        btnCloseVisit.addEventListener('click', function () {
          visitModal.classList.add('hidden');
        });
      }

      var visitForm = document.getElementById('visit-request-form');
      if (visitForm) {
        visitForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var fullName = document.getElementById('visit-fullname').value.trim();
          var mobile = document.getElementById('visit-mobile').value.trim();
          var err = document.getElementById('visit-form-error');
          var submitBtn = visitForm.querySelector('button[type="submit"]');
          var hp = visitForm.querySelector('[name="website"]');
          if (!fullName || !D.isValidMobile(mobile)) {
            if (err) err.classList.remove('hidden');
            return;
          }
          if (err) err.classList.add('hidden');
          var facility = document.getElementById('visit-facility').value;
          var details = document.getElementById('visit-address').value.trim();
          var origLabel = submitBtn ? submitBtn.textContent : '';
          if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'در حال ارسال...'; }
          D.submitLead({
            source: 'visit_request',
            name: fullName,
            mobile: D.normalizeDigits(mobile),
            facility: facility,
            details: details,
            website: hp ? hp.value : ''
          }).then(function (ok) {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
            if (ok) {
              state.hasConverted = true;
              D.track('request_free_inspection', { facility: facility });
              if (visitModal) visitModal.classList.add('hidden');
              showToast('درخواست بازدید فنی رایگان برای «' + fullName + '» ثبت شد. کارشناسان ما تا ۱۵ دقیقه دیگر تماس می‌گیرند.');
              visitForm.reset();
            } else {
              if (err) {
                err.textContent = 'ثبت درخواست با خطا مواجه شد. لطفاً دوباره تلاش کنید یا با ' + D.cfg.phoneDisplay + ' تماس بگیرید.';
                err.classList.remove('hidden');
              }
            }
          });
        });
      }

      var btnVisitWhatsapp = document.getElementById('btn-visit-send-whatsapp');
      if (btnVisitWhatsapp) {
        btnVisitWhatsapp.addEventListener('click', function () {
          var fullName = document.getElementById('visit-fullname').value.trim() || 'کارفرما';
          var fac = document.getElementById('visit-facility').value;
          var addr = document.getElementById('visit-address').value.trim();
          var msg = 'سلام، جهت هماهنگی بازدید فنی رایگان از ' + fac + ' (' + fullName + (addr ? ' - ' + addr : '') + ') پیام می‌دهم.';
          var url = D.waLink(msg);
          if (url) { D.track('click_whatsapp', { link_location: 'visit_modal' }); window.open(url, '_blank', 'noopener'); }
        });
      }

      // ۱۱. مودال بزرگ‌نمایی مجوز
      var licenseModal = document.getElementById('license-modal');
      var btnZoomLicense = document.getElementById('btn-zoom-license');
      var btnFooterLicense = document.getElementById('btn-footer-license');
      var btnCloseLicense = document.getElementById('btn-close-license-modal');

      if (btnZoomLicense && licenseModal) {
        btnZoomLicense.addEventListener('click', function () {
          licenseModal.classList.remove('hidden');
        });
      }
      if (btnFooterLicense && licenseModal) {
        btnFooterLicense.addEventListener('click', function () {
          licenseModal.classList.remove('hidden');
        });
      }
      if (btnCloseLicense && licenseModal) {
        btnCloseLicense.addEventListener('click', function () {
          licenseModal.classList.add('hidden');
        });
      }

      // ۱۲. مدال خروج با انگیزه دانلود چک‌لیست (Exit-Intent Modal)
      var exitModal = document.getElementById('exit-intent-modal');
      var btnCloseExit = document.getElementById('btn-close-exit-modal');
      var exitForm = document.getElementById('exit-intent-form');
      var exitShown = false;

      function showExitModal() {
        if (exitShown || state.hasConverted || !exitModal) return;
        exitShown = true;
        exitModal.classList.remove('hidden');
        if (D && D.track) D.track('exit_intent_shown', {});
      }

      document.addEventListener('mouseout', function (e) {
        if (e.clientY <= 5 && e.relatedTarget === null) {
          showExitModal();
        }
      });

      setTimeout(function () {
        if (!exitShown && !state.hasConverted && window.innerWidth < 640) {
          showExitModal();
        }
      }, 45000);

      if (btnCloseExit && exitModal) {
        btnCloseExit.addEventListener('click', function () {
          exitModal.classList.add('hidden');
        });
      }

      if (exitForm) {
        exitForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var nameInput = document.getElementById('exit-name');
          var phoneInput = document.getElementById('exit-phone');
          var errEl = document.getElementById('exit-phone-error');
          var hp = exitForm.querySelector('[name="website"]');
          var rawPhone = phoneInput ? phoneInput.value.trim() : '';
          if (!D.isValidMobile(rawPhone)) {
            if (errEl) errEl.classList.remove('hidden');
            return;
          }
          if (errEl) errEl.classList.add('hidden');
          var submitBtn = exitForm.querySelector('button[type="submit"]');
          var origLabel = submitBtn ? submitBtn.textContent : '';
          if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'در حال ارسال...'; }
          var normPhone = D.normalizeMobile ? D.normalizeMobile(rawPhone) : D.normalizeDigits(rawPhone);
          D.submitLead({
            source: 'exit_intent_checklist',
            name: nameInput ? nameInput.value.trim() : '',
            mobile: normPhone,
            website: hp ? hp.value : ''
          }).then(function (ok) {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
            if (ok) {
              state.hasConverted = true;
              if (D && D.track) D.track('exit_intent_lead', {});
              if (exitModal) exitModal.classList.add('hidden');
              showToast('چک‌لیست حقوقی برای شما ارسال شد. کارشناسان ما تا ۱۵ دقیقه دیگر تماس می‌گیرند.');
              exitForm.reset();
            } else {
              if (errEl) {
                errEl.textContent = 'ثبت شماره با خطا مواجه شد؛ لطفاً با شماره ' + D.cfg.phoneDisplay + ' تماس بگیرید.';
                errEl.classList.remove('hidden');
              }
              showToast('ثبت شماره با خطا مواجه شد؛ لطفاً با ' + D.cfg.phoneDisplay + ' تماس بگیرید.');
            }
          });
        });
      }

      // ۱۳. تجربه لمسی موبایل: بستن مودال‌ها با تپ روی پس‌زمینه (Backdrop Click) یا کلید Escape
      var allModals = [checklistModal, visitModal, licenseModal, exitModal];
      allModals.forEach(function (m) {
        if (!m) return;
        m.addEventListener('click', function (e) {
          if (e.target === m) {
            m.classList.add('hidden');
          }
        });
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          allModals.forEach(function (m) {
            if (m && !m.classList.contains('hidden')) {
              m.classList.add('hidden');
            }
          });
          if (typeof closeMobileMenu === 'function') {
            closeMobileMenu();
          }
        }
      });

      // مقداردهی اولیه
      try {
        var qp = new URLSearchParams(location.search).get('place');
        if (qp && placeNames[qp]) selectEstimatorPlace(qp);
      } catch (e) {}
      updateEstimatorUI();
      renderReviews();
    })();

# Code Conventions & Standards

## JavaScript Conventions

### 1. Scope & Module Structure
- **Browser Scripts (`assets/js/app.js`, `assets/js/lead.js`)**:
  - Enclose in Immediate Invoked Function Expressions (IIFEs): `(function () { 'use strict'; ... })();` to avoid global namespace pollution.
  - Expose only designated public APIs via `window.Dideban` and `window.SITE_CONFIG`.
- **Node.js Scripts (`scripts/*.mjs`)**:
  - Use ES Modules (`import`/`export`) with explicit `node:` prefixes (e.g., `import fs from 'node:fs';`).

### 2. Localization, Persian Digits & Formatting
- **Digit Normalization**:
  - Persian/Arabic numbers (`[۰-۹]`, `[٠-٩]`) must be normalized to ASCII digits before validation or calculation:
    ```javascript
    function normalizeDigits(s) {
      return String(s || '')
        .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧۸۹'.indexOf(d));
    }
    ```
- **Display Digits**:
  - User-facing numbers, counters, and currencies must be rendered using Persian digits (`toPersianDigits(val)`).
- **Currency & Pricing**:
  - Format amounts in Toman rounded to ten-thousands:
    ```javascript
    function formatToman(num) {
      var rounded = Math.round(num / 10000) * 10000;
      return toPersianDigits(rounded.toLocaleString('en-US')) + ' تومان';
    }
    ```
- **Mobile Number Validation**:
  - Iran standard mobile format: `/^09\d{9}$/` after removing spaces, hyphens, and converting digits.

### 3. DOM & State Conventions
- **DOM Hooks**:
  - Never hook logic onto styling or layout classes. Use `data-*` attributes:
    - `data-lead-form`: Lead submission forms
    - `data-source`: Attribution identifier (e.g., `service_lobby-man-residential-towers`, `calculator_1405`)
    - `data-facility`: Target facility type
    - `data-lead-status`: Feedback alert container
    - `data-phone-link`, `data-phone-text`: Dynamic phone binding targets
    - `data-wa`, `data-wa-text`: WhatsApp button and prefilled message targets
    - `data-city`: City name display target
- **HTML Element IDs**:
  - Format using `kebab-case` (e.g., `btn-mobile-menu`, `exit-intent-modal`, `app-toast`).
- **State Model**:
  - Maintain centralized mutable UI state inside the top-level `state` object in `app.js`.

---

## Styling & RTL Design System

### 1. Design Tokens & Color Palette
Tailwind configured in `tailwind.config.js`:
- `navy`: `#1B365D` (Primary corporate blue)
- `navy-dark`: `#0F1F38` (Deep footer/hero background)
- `slatebg`: `#F4F7FA` (Neutral light background)
- `cta.blue`: `#2563EB` (Primary action button)
- `cta.gold`: `#C59B27` (Accent badge & high-priority CTA)
- `accent.green`: `#10B981` (Verification checks & trust badges)

### 2. RTL & Typography
- Document-level `dir="rtl"` with Persian base font: `font-sans` (`Vazirmatn`, system fallback fonts).
- Numbers in RTL context: Use `dir="ltr"` on numeric inputs (such as phone fields) to ensure proper cursor orientation.

### 3. Scoped CSS (`assets/css/styles.css`)
- Only declare custom rules for components that cannot be achieved cleanly with Tailwind utility classes:
  - Custom range sliders (`input[type=range]`)
  - Background grid patterns (`.hero-grid-bg`)
  - Repeating watermark patterns (`.watermark-pattern`)

---

## PHP Conventions (`api/lead.php`)
- **Compatibility**: Procedural PHP 7.4+; avoid PHP 8-only constructs.
- **Headers**:
  ```php
  header('Content-Type: application/json; charset=utf-8');
  header('X-Content-Type-Options: nosniff');
  ```
- **Security & Sanitization**:
  - Truncate and strip ASCII control characters (`[\x00-\x1F\x7F]+`).
  - Prepend single quote `'` to strings starting with `=+-@` to prevent Excel formula injection.
  - Return early with appropriate status codes (`400`, `405`, `422`, `429`, `500`).

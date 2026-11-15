# API & Lead Ingestion Patterns

## Endpoint Specification: `POST api/lead.php`

Handles lead captures submitted via calculator forms, consultation requests, and service landing pages.

### Request Contract
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Body Size Limit**: 8,192 bytes (`file_get_contents('php://input', false, null, 0, 8192)`)

#### JSON Schema
```json
{
  "source": "service_lobby-man-residential-towers",
  "name": "مهندس کامران فرهادی",
  "mobile": "09121234567",
  "facility": "برج مسکونی / اداری",
  "details": "۳ شیفت ۲۴ ساعته - منطقه الهیه",
  "estimate": "۵۴,۸۰۰,۰۰۰ تومان",
  "page": "/services/lobby-man-residential-towers/",
  "utm": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "utm_campaign": "b2b_towers"
  },
  "website": ""
}
```

### Field Definitions & Validation
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `source` | string | Max 300 chars | Source identifier (`data-source` from HTML form) |
| `name` | string | Max 120 chars | Name and professional title of requester |
| `mobile` | string | Required, Regex `/^09\d{9}$/` | Normalized Iranian mobile phone number |
| `facility` | string | Max 80 chars | Target property or project type |
| `details` | string | Max 500 chars | User-provided notes or shift specifications |
| `estimate` | string | Max 200 chars | Computed price estimate from calculator |
| `page` | string | Max 200 chars | Current window pathname |
| `utm` | object | Max 300 chars (JSON serialized) | Captured UTM parameters |
| `website` | string | Must be empty | **Anti-bot honeypot field** |

---

## Response Status Codes
| HTTP Status | Body | Scenario |
| :--- | :--- | :--- |
| `200 OK` | `{"ok":true}` | Lead successfully validated and saved to `leads.csv` |
| `200 OK` | `{"ok":true}` | **Synthetic success**: Honeypot (`website`) was filled by bot. Lead is discarded silently. |
| `400 Bad Request` | `{"ok":false}` | Malformed JSON or non-array JSON payload |
| `405 Method Not Allowed` | `{"ok":false}` | HTTP method other than `POST` |
| `422 Unprocessable Entity` | `{"ok":false,"error":"mobile"}` | Invalid mobile phone format (not matching `09XXXXXXXXX`) |
| `429 Too Many Requests` | `{"ok":false}` | IP exceeded 5 lead submissions in a rolling 1-hour window |
| `500 Internal Server Error`| `{"ok":false}` | File lock or filesystem write failure on `api/leads.csv` |

---

## Security & Protection Mechanisms

### 1. Anti-Bot Honeypot
Forms contain a hidden input field named `website` which is visually concealed from real users:
```html
<div class="hidden" style="display:none" aria-hidden="true">
  <input type="text" name="website" tabindex="-1" autocomplete="off">
</div>
```
If `!empty($d['website'])`, the script immediately returns `{"ok":true}` without writing to storage or dispatching notifications.

### 2. IP Rate Limiting
- Evaluated against `$_SERVER['REMOTE_ADDR']`.
- History stored in temporary cache files: `sys_get_temp_dir() . '/dideban_rl_' . md5($ip)`.
- Limit: **Maximum 5 submissions per 3,600 seconds (1 hour)**. Requests exceeding this return HTTP 429.

### 3. CSV Injection Prevention (Formula Injection)
To protect spreadsheet applications when exporting leads:
```php
function clean($v, $max = 300) {
    $v = is_scalar($v) ? (string)$v : '';
    $v = trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v));
    $v = mb_substr($v, 0, $max, 'UTF-8');
    if ($v !== '' && strpos('=+-@', $v[0]) !== false) $v = "'" . $v;
    return $v;
}
```

### 4. Storage & Access Restriction
- Leads are written to `api/leads.csv` with `LOCK_EX` atomic file locks and UTF-8 BOM (`\xEF\xBB\xBF`).
- `api/.htaccess` enforces Apache access control:
  ```apache
  <FilesMatch "\.(csv|log)$">
      Require all denied
  </FilesMatch>
  ```

---

## External Integrations

### Kavenegar SMS Gateway
- Triggered when `SMS_API_KEY` and `SMS_MANAGER` are populated in `api/lead.php`.
- Dispatches HTTP GET to:
  `https://api.kavenegar.com/v1/{API_KEY}/sms/send.json`
- Timeout capped at 4 seconds to prevent request hanging.

### Email Alerts
- Dispatches notification to `NOTIFY_EMAIL` using standard PHP `mail()` with UTF-8 base64-encoded headers.

---

## Client Integration Pattern (`assets/js/lead.js`)
Forms interact with the API through `Dideban.submitLead`:
```javascript
window.Dideban.submitLead({
  source: 'calculator_1405',
  name: 'علی حسینی',
  mobile: '09123456789',
  facility: 'کارخانه',
  details: '۲ شیفت نگهبانی',
  estimate: '۳۸,۰۰۰,۰۰۰ تومان'
}).then(function (ok) {
  if (ok) {
    // Show success feedback & track conversion
    window.Dideban.track('generate_lead_estimator', { facility: 'کارخانه' });
  } else {
    // Fallback: invite user to call direct phone line
  }
});
```
- Includes automatic 9-second timeout handling via `AbortController`.
- Gracefully handles offline or network-failure modes by directing user to `window.SITE_CONFIG.phoneDisplay`.

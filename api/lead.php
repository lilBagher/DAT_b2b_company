<?php
/*
  دریافت لید از فرم‌های سایت.
  - لید را در فایل leads.csv (همین پوشه؛ دسترسی وب با .htaccess بسته است) ذخیره می‌کند.
  - در صورت تنظیم، ایمیل و پیامک اطلاع‌رسانی می‌فرستد.
  نیازمند PHP 7.4+ روی هاست (کنترل‌پنل‌های معمول ایرانی پشتیبانی می‌کنند).
*/
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ---------- تنظیمات ----------
const NOTIFY_EMAIL   = '';            // مثلاً sales@your-domain.ir ؛ خالی = بدون ایمیل
const SMS_API_KEY    = '';            // کلید کاوه‌نگار؛ خالی = بدون پیامک
const SMS_SENDER     = '';            // شماره خط ارسال‌کننده
const SMS_MANAGER    = '';            // موبایل مدیر فروش برای پیامک آنی، مثلاً 09121234567
// -----------------------------

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo '{"ok":false}'; exit; }

$raw = file_get_contents('php://input', false, null, 0, 8192);
$d = json_decode($raw, true);
if (!is_array($d)) { http_response_code(400); echo '{"ok":false}'; exit; }

// تله ربات: فیلد مخفی باید خالی باشد (به ربات موفقیت جعلی می‌دهیم)
if (!empty($d['website'])) { echo '{"ok":true}'; exit; }

function clean($v, $max = 300) {
    $v = is_scalar($v) ? (string)$v : '';
    $v = trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v));
    $v = mb_substr($v, 0, $max, 'UTF-8');
    // جلوگیری از تزریق فرمول در اکسل
    if ($v !== '' && strpos("=+-@\t\r", $v[0]) !== false) $v = "'" . $v;
    return $v;
}
function digits($s) {
    return strtr($s, [
        '۰'=>'0','۱'=>'1','۲'=>'2','۳'=>'3','۴'=>'4','۵'=>'5','۶'=>'6','۷'=>'7','۸'=>'8','۹'=>'9',
        '٠'=>'0','١'=>'1','٢'=>'2','٣'=>'3','٤'=>'4','٥'=>'5','٦'=>'6','٧'=>'7','٨'=>'8','٩'=>'9'
    ]);
}

$mobile = preg_replace('/\D/', '', digits((string)($d['mobile'] ?? '')));
if (preg_match('/^0098(9\d{9})$/', $mobile, $m)) $mobile = '0' . $m[1];
elseif (preg_match('/^98(9\d{9})$/', $mobile, $m)) $mobile = '0' . $m[1];
elseif (preg_match('/^9\d{9}$/', $mobile)) $mobile = '0' . $mobile;

if (!preg_match('/^09\d{9}$/', $mobile)) { http_response_code(422); echo '{"ok":false,"error":"mobile"}'; exit; }

// محدودیت ساده: حداکثر ۱۵ ثبت در ساعت از هر IP
$ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_REAL_IP'] ?? $_SERVER['REMOTE_ADDR'] ?? '';
$rl = sys_get_temp_dir() . '/dideban_rl_' . md5($ip);
$hits = array_filter(is_file($rl) ? (array)json_decode(@file_get_contents($rl), true) : [], fn($t) => $t > time() - 3600);
if (count($hits) >= 15) { http_response_code(429); echo '{"ok":false}'; exit; }
$hits[] = time();
@file_put_contents($rl, json_encode(array_values($hits)));

$row = [
    date('Y-m-d H:i:s'),
    clean($d['source'] ?? ''),
    clean($d['name'] ?? '', 120),
    $mobile,
    clean($d['facility'] ?? '', 80),
    clean($d['details'] ?? '', 500),
    clean($d['estimate'] ?? '', 200),
    clean($d['page'] ?? '', 200),
    clean(json_encode($d['utm'] ?? [], JSON_UNESCAPED_UNICODE), 300),
];

$file = __DIR__ . '/leads.csv';
$new = !is_file($file) || filesize($file) === 0;
$fh = @fopen($file, 'a');
if (!$fh) { http_response_code(500); echo '{"ok":false}'; exit; }
flock($fh, LOCK_EX);
if ($new) { fwrite($fh, "\xEF\xBB\xBF"); fputcsv($fh, ['time','source','name','mobile','facility','details','estimate','page','utm']); }
fputcsv($fh, $row);
flock($fh, LOCK_UN);
fclose($fh);

$summary = "لید جدید ({$row[1]})\n{$row[2]} - {$mobile}\n{$row[4]}\n{$row[5]}\n{$row[6]}";

if (NOTIFY_EMAIL !== '') {
    @mail(NOTIFY_EMAIL, '=?UTF-8?B?' . base64_encode('لید جدید از سایت دیدبان امین توانا') . '?=', $summary,
          "Content-Type: text/plain; charset=UTF-8\r\n");
}
if (SMS_API_KEY !== '' && SMS_MANAGER !== '') {
    $url = 'https://api.kavenegar.com/v1/' . rawurlencode(SMS_API_KEY) . '/sms/send.json?' .
           http_build_query(['receptor' => SMS_MANAGER, 'sender' => SMS_SENDER, 'message' => mb_substr($summary, 0, 300, 'UTF-8')]);
    @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 4]]));
}

echo '{"ok":true}';

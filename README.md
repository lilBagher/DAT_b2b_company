# سایت دیدبان امین توانا

## راه‌اندازی
1. `config.js` را ویرایش کنید: شماره واتساپ واقعی، شناسه GTM، نظرات واقعی مشتریان.
2. در `api/lead.php` (بالای فایل) ایمیل و/یا پیامک اطلاع‌رسانی را تنظیم کنید.
3. بیلد: `npm install && SITE_URL=https://دامنه-شما.ir npm run build`
4. محتوای پوشه `dist/` را روی هاست PHP آپلود کنید. لیدها در `api/leads.csv` ذخیره می‌شوند.

## رویدادهای GA4/GTM (dataLayer)
click_call، click_whatsapp، generate_lead_estimator، request_free_inspection

نسخه `single-file` قدیمی حذف شده (CDN تیل‌ویند داشت)؛ فقط از `dist/` استفاده کنید.

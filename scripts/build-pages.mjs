// ساخت خروجی نهایی در dist/: صفحات خدمات، sitemap.xml، robots.txt و جایگزینی آدرس دامنه
// استفاده:  SITE_URL=https://your-domain.ir npm run build
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const dist = path.join(root, 'dist');
const SITE_URL = (process.env.SITE_URL || 'https://YOUR-DOMAIN.ir').replace(/\/$/, '');
const PLACEHOLDER_URL = SITE_URL.includes('YOUR-DOMAIN');
if (PLACEHOLDER_URL) {
  console.warn('\n⚠️  SITE_URL تنظیم نشده؛ sitemap نمونه است و تگ‌های canonical و og:url از این بیلد حذف شدند. این خروجی را منتشر نکنید؛ با SITE_URL=https://دامنه-شما.ir دوباره بیلد کنید.\n');
}
const finalize = (html) => (PLACEHOLDER_URL ? html.replace(/^[ \t]*<(link rel="canonical"|meta property="og:url")[^>]*>\n/gm, '') : html);

const BRAND = 'دیدبان امین توانا';
const LICENSE = 'دارای مجوز رسمی از مرکز انتظام فراجا (تحت ماده ۱۲۲)';

const pages = [
  {
    slug: 'lobby-man-residential-towers',
    short: 'لابی‌من برج‌ها',
    title: 'تأمین لابی‌من برج مسکونی و اداری | شیفتی و ۲۴ ساعته',
    description: 'تأمین لابی‌من تشریفاتی برای برج‌ها و مجتمع‌های مسکونی و اداری با پوشش بیمه، جایگزینی نیروی غایب زیر ۴ ساعت و بدون ریسک اداره کار برای هیئت‌مدیره. درخواست بازدید رایگان.',
    h1: 'تأمین لابی‌من برج مسکونی و اداری',
    lead: 'لابی برج ویترین اعتبار ساختمان شماست. نیروهای لابی‌من دیدبان امین توانا دوره‌های حفاظت فیزیکی و مانیتورینگ، آداب معاشرت تشریفاتی و مدیریت تحویل مرسولات را گذرانده‌اند؛ بدون اختصاص واحد سرایداری و بدون ریسک شکایت سنوات برای هیئت‌مدیره.',
    audience: 'ویژه مدیران ساختمان، هیئت‌مدیره برج‌ها و مراکز تجاری-اداری',
    facility: 'برج مسکونی / اداری',
    estimator: 'tower',
    features: [
      ['👔', 'پوشش رسمی و تشریفاتی', 'کت و شلوار سرمه‌ای یکدست، پیراهن سفید، بج سینه رسمی شرکت و ظاهر آراسته در تمام ساعات شیفت.'],
      ['📋', 'ثبت وقایع و کنترل تردد', 'ثبت دقیق ساعت ورود و خروج مهمانان، پیمانکاران تأسیساتی، اسباب‌کشی و پیک‌ها با هماهنگی اینترکام واحدها.'],
      ['🎥', 'پایش اتاق مانیتورینگ و مشاعات', 'رصد مستمر دوربین‌های مداربسته پارکینگ‌ها، اعلام حریق، موتورخانه و گشت‌زنی دوره‌ای در طبقات مشاع.'],
      ['⚖️', 'بدون ریسک اداره کار برای هیئت‌مدیره', 'بدون نیاز به اختصاص واحد مسکونی سرایداری و بدون ریسک شکایت سنوات از اعضای هیئت‌مدیره ساختمان.']
    ],
    sla: [
      ['الگوی شیفت پیشنهادی', '۳ شیفت ۸ ساعته یا ۲۴-۴۸'],
      ['زمان جایگزینی نیروی غایب', 'حداکثر زیر ۴ ساعت'],
      ['بازرسی نامحسوس شبانه', 'حداقل ۲ نوبت در هفته'],
      ['تعویض نیرو به درخواست مدیر', '۴۸ ساعته و بی‌قیدوشرط']
    ],
    faq: [
      ['اگر لابی‌من بیمار شود یا مرخصی بگیرد، پست خالی می‌ماند؟', 'خیر. شرکت دارای نیروهای رزرو و پشتیبان شیفت است و نیروی جایگزین با لباس فرم حداکثر ظرف ۴ ساعت به محل اعزام می‌شود.'],
      ['آیا استقرار لابی‌من در اتاق نگهبانی حق سکونت ایجاد می‌کند؟', 'خیر. نیروهای شیفتی صرفاً در ساعت شیفت در اتاق نگهبانی حضور دارند و هیچ‌گونه حق سکونت یا تصرف در مشاعات ایجاد نمی‌شود؛ برخلاف اسکان سرایدار شخصی که در زمان قطع همکاری می‌تواند به دعوای تخلیه منجر شود.'],
      ['اگر از عملکرد یکی از نیروها راضی نباشیم چه می‌شود؟', 'کارفرما می‌تواند با اعلام کتبی، تعویض نیرو را بخواهد و جایگزینی دائم ظرف حداکثر ۴۸ ساعت و بدون هزینه اضافی انجام می‌شود.']
    ],
    related: ['industrial-plant-security', 'commercial-complex-security', 'construction-site-guarding']
  },
  {
    slug: 'industrial-plant-security',
    short: 'حراست کارخانه و شهرک صنعتی',
    title: 'تأمین نگهبان و حراست کارخانه و شهرک صنعتی | انتظامات ۲۴ ساعته',
    description: 'تأمین نگهبان کارخانه، انبار و شهرک صنعتی با گشت‌زنی ثبت‌شده RFID، کنترل بارنامه و باسکول، بیمه کامل نیروها و صدور فاکتور رسمی. درخواست ارزیابی رایگان نقاط کور.',
    h1: 'تأمین نگهبان و حراست کارخانه، انبار و شهرک صنعتی',
    lead: 'جلوگیری از خروج غیرمجاز مواد اولیه، قطعات و محصولات نهایی نیازمند انتظامات صنعتی دقیق و مستند است. تیم حراست صنعتی دیدبان امین توانا بر اساس دستورالعمل اختصاصی کنترل موجودی و HSE کارخانه شما عمل می‌کند.',
    audience: 'ویژه مدیران کارخانه‌ها، صنایع تولیدی، انبارهای لجستیکی و شهرک‌های صنعتی',
    facility: 'کارخانه / انبار صنعتی',
    estimator: 'factory',
    features: [
      ['🚛', 'کنترل بارنامه، باسکول و پلمب', 'تطبیق دقیق حواله خروج انبار با بار خودروها، ثبت شماره پلمب، وزن باسکول و بازرسی کابین خودروهای باری.'],
      ['🔦', 'گشت‌زنی شبانه با ثبت تگ RFID', 'سرکشی زمان‌بندی‌شده به نقاط کور، فنس‌های پیرامونی، پست برق و انبارها با دستگاه گشت‌زنی و گزارش دیجیتال.'],
      ['🪪', 'کنترل تردد پرسنل و پیمانکاران', 'کنترل کارت تردد، بازرسی مجاز کیف و خودرو در گیت خروجی و ثبت ورود مراجعین و رانندگان برون‌سازمانی.'],
      ['🧯', 'آمادگی HSE و اطفای حریق اولیه', 'آشنایی با کپسول‌های اطفای حریق، شیرهای هیدرانت، قطع اضطراری برق/گاز و مدیریت بحران تا رسیدن امداد.']
    ],
    sla: [
      ['الگوی شیفت پیشنهادی', '۱۲-۱۲ چرخشی یا ۳ شیفت ۸ ساعته'],
      ['تجهیزات تحویلی پست', 'دستگاه ثبت گشت، چراغ قوه، بی‌سیم مجاز'],
      ['پایش سرشیفت و بازرس شب', 'کنترل شبانه + گزارش تگ‌ها'],
      ['صدور فاکتور رسمی مالیاتی', 'معتبر با شناسه ملی ۱۴۰۱۲۱۰۷۸۱۷']
    ],
    faq: [
      ['گزارش گشت‌زنی شبانه چگونه به مدیر کارخانه می‌رسد؟', 'نقاط گشت با تگ RFID ثبت می‌شود و گزارش ثبت تگ‌ها به مدیر مجموعه ارائه می‌گردد؛ همچنین بازرس شبانه سرکشی نامحسوس انجام می‌دهد.'],
      ['آیا فاکتور رسمی مالیاتی صادر می‌شود؟', 'بله، فاکتور رسمی با شناسه ملی ۱۴۰۱۲۱۰۷۸۱۷ صادر می‌شود.'],
      ['اگر نگهبان در شیفت حادثه‌ای ببیند مسئولیت با کیست؟', 'کلیه نیروها از روز نخست استقرار تحت پوشش بیمه تأمین اجتماعی و بیمه حوادث و مسئولیت مدنی شرکت قرار دارند و مسئولیت کارفرمایی و بیمه‌ای نیروها بر عهده شرکت است.']
    ],
    related: ['lobby-man-residential-towers', 'commercial-complex-security', 'construction-site-guarding']
  },
  {
    slug: 'construction-site-guarding',
    short: 'نگهبان کارگاه ساختمانی',
    title: 'نگهبان کارگاه ساختمانی و پروژه عمرانی | جلوگیری از سرقت مصالح',
    description: 'تأمین نگهبان شبانه و ۲۴ ساعته کارگاه ساختمانی با پوشش بیمه حوادث کارگاهی، پلمب انبارک‌ها، سرکشی بازرس موتوری و استقرار ظرف ۲۴ تا ۴۸ ساعت. درخواست بازدید رایگان.',
    h1: 'تأمین نگهبان کارگاه ساختمانی و پروژه عمرانی',
    lead: 'کارگاه‌های ساختمانی به دلیل تردد بالای اکیپ‌های پیمانکاری و وجود کابل مسی، میلگرد، شیرآلات و ابزارآلات، بیشترین هدف سرقت‌های شبانه هستند. دیدبان امین توانا هم از مصالح محافظت می‌کند و هم ریسک حوادث کارگاهی نگهبان را برای سازنده پوشش می‌دهد.',
    audience: 'ویژه سازندگان، انبوه‌سازان، پیمانکاران عمرانی و مهندسان مقیم',
    facility: 'پروژه ساختمانی / کارگاهی',
    estimator: 'site',
    features: [
      ['🔐', 'پلمب انبارک‌ها و کنترل خروج ابزار', 'ممنوعیت خروج ابزار، کابل و مصالح بدون برگه خروج امضاشده توسط سرپرست کارگاه یا مهندس مقیم.'],
      ['🦺', 'پوشش بیمه حوادث کارگاهی', 'تعهدات بیمه‌ای نگهبان بر عهده دیدبان امین توانا است و ریسک سازنده و صاحب‌کار در برابر حوادث کارگاهی نگهبان را کاهش می‌دهد.'],
      ['🌙', 'هوشیاری شبانه در ساعات تعطیلی', 'پوشش ویژه ساعات ۱۸ عصر تا ۷ صبح و روزهای تعطیل رسمی همراه با سرکشی بازرس موتوری.'],
      ['📈', 'انعطاف‌پذیری با پیشرفت پروژه', 'امکان افزایش تعداد پست‌ها در فاز نازک‌کاری و تأسیسات و تبدیل به لابی‌من پس از پایان ساخت.']
    ],
    sla: [
      ['الگوی شیفت پیشنهادی', '۱۲ ساعت شب ثابت یا ۲۴ ساعته'],
      ['پوشش ایمنی فردی (PPE)', 'کلاه ایمنی، کفش کار، جلیقه شبرنگ'],
      ['زمان استقرار اولیه پس از قرارداد', 'حداکثر ۲۴ الی ۴۸ ساعت'],
      ['تحویل پست در پایان پروژه', 'فوری در روز اتمام، بدون ادعای سکونت']
    ],
    faq: [
      ['پس از امضای قرارداد، نگهبان چند روزه مستقر می‌شود؟', 'استقرار اولیه حداکثر ۲۴ الی ۴۸ ساعت پس از قرارداد انجام می‌شود.'],
      ['تعداد نگهبان با پیشرفت پروژه قابل تغییر است؟', 'بله، در فاز نازک‌کاری و تأسیسات می‌توان تعداد پست‌ها را افزایش داد و پس از پایان ساخت، پست را به لابی‌من تبدیل کرد.'],
      ['خروج ابزار و مصالح از کارگاه چگونه کنترل می‌شود؟', 'هرگونه خروج ابزار، کابل و مصالح فقط با برگه خروج امضاشده توسط سرپرست کارگاه یا مهندس مقیم مجاز است و انبارک‌ها پلمب می‌شوند.']
    ],
    related: ['lobby-man-residential-towers', 'residential-compound-security', 'industrial-plant-security']
  },
  {
    slug: 'commercial-complex-security',
    short: 'حراست مجتمع تجاری و مال',
    title: 'حراست مجتمع تجاری و مرکز خرید | تأمین نگهبان و انتظامات پاساژ',
    description: 'تأمین تیم حراست و انتظامات تشریفاتی مجتمع‌های تجاری، مال‌ها و پاساژها با کنترل مانیتورینگ، هدایت مراجعین، پیشگیری از سرقت و اطفای حریق. درخواست بازدید فنی رایگان.',
    h1: 'تأمین حراست، انتظامات و لابی‌من مجتمع تجاری و مراکز خرید',
    lead: 'مراکز تجاری و هایپرمارکت‌ها به دلیل تراکم بالای مراجعین و تردد نقلیه، نیازمند انتظامات چندمنظوره هستند: حفظ پرستیژ تجاری، گشت‌زنی مشاعات، مانیتورینگ پارکینگ و پیشگیری از سرقت فروشگاهی. نیروهای دیدبان امین توانا با یونیفرم هماهنگ و آموزش مدیریت بحران مستقر می‌شوند.',
    audience: 'ویژه مدیران عامل مراکز خرید، هیئت‌مدیره پاساژها و مالکان هایپرمارکت‌ها و مراکز تفریحی-اداری',
    facility: 'مجتمع تجاری / مرکز خرید',
    estimator: 'tower',
    features: [
      ['🛍️', 'پایش ورودی‌ها و گیت‌های خروجی', 'کنترل محترمانه تردد، مدیریت پیک‌های باربری، جلوگیری از تردد دست‌فروشان و هدایت مراجعین به راهنما و اطلاعات.'],
      ['🚗', 'انتظامات پارکینگ و هدایت خودروها', 'پایش رمپ‌های ورود و خروج، ساماندهی ترافیک طبقات پارکینگ و پیشگیری از تصادفات و خسارت به خودروهای پارک‌شده.'],
      ['📹', 'مانیتورینگ تخصصی و پیشگیری از سرقت', 'استقرار اپراتور مسلط بر اتاق CCTV جهت رصد هم‌زمان زوایای کور مغازه‌ها، پاگردها، آسانسورها و پله‌های برقی.'],
      ['🧯', 'مدیریت ازدحام و آمادگی تخلیه اضطراری', 'آموزش‌دیده در مدیریت بحران، اطفای حریق اولیه، کمک‌های اولیه و راهنمایی ایمن مراجعین در زمان حوادث غیرمترقبه.']
    ],
    sla: [
      ['الگوی شیفت پیشنهادی', 'شیفت‌های ۱۲ ساعته گردشی و پوشش ساعات اوج خرید (۱۰ صبح تا ۲۳ شب)'],
      ['پوشش ظاهری پرسنل', 'کت و شلوار فرم تشریفاتی با بج سینه رسمی یا لباس انتظامات یکدست'],
      ['زمان استقرار نیروی جایگزین', 'حداکثر زیر ۳ ساعت در شرایط غیبت یا بیماری'],
      ['ضمانت عدم سوءپیشینه و وثیقه', '۱۰۰٪ گزینش ۵ مرحله‌ای پلیس انتظام و ضمانت حسن انجام کار']
    ],
    faq: [
      ['آیا پرسنل انتظامات برای کاربری‌های شلوغ تجاری آموزش دیده‌اند؟', 'بله، نیروهای اعزامی دوره‌های کنترل خشم، رفتار حرفه‌ای با مشتریان (Customer Care) و فن بیان تشریفاتی را گذرانده‌اند.'],
      ['در روزهای حراجی یا بلک‌فرایدی امکان افزایش تعداد نیرو وجود دارد؟', 'بله، دیدبان امین توانا به عنوان پیمانکار جامع، امکان تأمین سریع نیروی کمکی موقت (Event Security) برای ایام پیک و رویدادهای تجاری را داراست.'],
      ['تعهدات بیمه مسئولیت مدنی برای حوادث احتمالی مراجعین چگونه است؟', 'کلیه نیروها و فعالیت‌های حراستی تحت پوشش بیمه مسئولیت مدنی جامع شرکت قرار دارند.']
    ],
    related: ['lobby-man-residential-towers', 'industrial-plant-security', 'residential-compound-security']
  },
  {
    slug: 'residential-compound-security',
    short: 'حفاظت شهرک مسکونی و ویلایی',
    title: 'حفاظت و نگهبانی شهرک مسکونی و ویلایی | گشت‌زنی شبانه و گیت ورودی',
    description: 'تأمین نگهبان، گیت ورودی و گشت موتوری شهرک‌های ویلایی و مجتمع‌های مسکونی با ثبت RFID، بازرسی شبانه نامحسوس و تعهد کتبی امنیت محیطی. استعلام هزینه و بازدید رایگان.',
    h1: 'حفاظت و تأمین نگهبان شهرک‌های مسکونی، ویلایی و باغ‌شهرها',
    lead: 'شهرک‌های ویلایی و مجتمع‌های مسکونی محصور به دلیل وسعت محیطی و عدم سکونت دائمی مالکان، هدف اصلی دستبردهای شبانه هستند. سامانه حفاظتی دیدبان امین توانا با ترکیب کنترل گیت ورودی، گشت موتوری منظم و تگ‌گذاری RFID، امنیت کامل شهرک را در ۲۴ ساعت شبانه‌روز تضمین می‌کند.',
    audience: 'ویژه اعضای هیئت‌امنای شهرک‌های ویلایی، مالکان باغ‌ویلاها و مجتمع‌های مسکونی باغ‌شهر',
    facility: 'شهرک ویلایی / مسکونی',
    estimator: 'tower',
    features: [
      ['🚧', 'گیت ورودی، پلاک‌خوان و احراز هویت', 'ثبت دقیق پلاک خودروهای ورودی، هماهنگی تلفنی با مالکان قبل از ورود مهمان یا پیمانکار و ثبت هویت اکیپ‌های باغبانی و ساختمانی.'],
      ['🏍️', 'گشت‌زنی منظم موتوری با ثبت RFID', 'سرکشی مستمر به خیابان‌ها، بن‌بست‌ها و فنس‌های حاشیه‌ای شهرک با موتورسیلکت یا خودرو و ثبت تگ‌های دیجیتال گشت.'],
      ['🛑', 'جلوگیری از ساخت‌وساز غیرمجاز و تخلفات', 'پایش تردد مصالح ساختمانی در ساعات غیرمجاز، صیانت از مشاعات شهرک و ممانعت از ایجاد مزاحمت صوتی یا امنیتی.'],
      ['📡', 'ارتباط بیسیم اختصاصی و اعزام پشتیبان', 'تجهیز پست‌های ایست و گشت‌زنان به بیسیم‌های مجاز شبکه انتظام و امکان فراخوان سریع گشت ضربت در موارد مشکوک.']
    ],
    sla: [
      ['الگوی شیفت پیشنهادی', '۲۴-۴۸ ساعته یا شیفت‌های ثابت شب و روز با سرشیفت مقیم'],
      ['تجهیزات عملیاتی', 'چراغ‌قوه برد بلند، دستگاه ثبت گشت دیجیتال، بیسیم مجاز، جلیقه شب‌رنگ'],
      ['بازرسی نامحسوس شبانه', 'حداقل ۳ نوبت سرکشی هفتگی توسط بازرس انتظامی شرکت'],
      ['بیمه حوادث و مسئولیت مدنی', 'پوشش کامل ۱۰۰٪ بیمه تأمین اجتماعی و حوادث کارگاهی']
    ],
    faq: [
      ['نظارت بر عملکرد گشت‌زن در نیمه‌شب چگونه تضمین می‌شود؟', 'کلیه مسیرها و فنس‌های شهرک تگ‌گذاری RFID می‌شوند؛ نگهبان موظف است طبق جدول زمان‌بندی نامنظم تگ‌ها را ثبت کند و گزارش دیجیتال روزانه به هیئت‌امنا ارسال می‌گردد.'],
      ['آیا با تعویض هیئت‌امنای شهرک، خللی در خدمات پیش می‌آید؟', 'خیر؛ قراردادها به نام شخصیت حقوقی شهرک یا هیئت‌امنا منعقد شده و کلیه دستورالعمل‌های حفاظتی مکتوب و قابل انتقال به دوره بعدی است.'],
      ['در زمان قطعی برق یا شرایط نامساعد جوی گشت‌زنی چگونه انجام می‌شود؟', 'نیروها مجهز به تجهیزات ضدآب، چراغ‌قوه‌های شارژی قوی و چراغ‌گردان گشت هستند و پایش محیطی متوقف نمی‌شود.']
    ],
    related: ['lobby-man-residential-towers', 'commercial-complex-security', 'construction-site-guarding']
  }
];

const bySlug = Object.fromEntries(pages.map((p) => [p.slug, p]));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const url = (slug) => `${SITE_URL}/services/${slug}/`;

function render(p) {
  const jsonld = [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: p.h1,
      description: p.description,
      areaServed: ['تهران', 'البرز'],
      url: url(p.slug),
      serviceType: 'حفاظت فیزیکی و تأمین نیروی حراست B2B',
      provider: {
        '@type': ['LocalBusiness', 'SecurityService', 'ProfessionalService'],
        name: `شرکت مراقبتی حفاظتی ${BRAND}`,
        url: `${SITE_URL}/`,
        telephone: '+982144289000',
        taxID: '14012107817',
        identifier: '55356',
        image: `${SITE_URL}/assets/img/og-preview.svg`,
        priceRange: '$$',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'پونک شمالی، بزرگراه شهید آیت‌الله اشرفی اصفهانی، خیابان شهید میرزا بابایی، مجتمع تجاری غدیر',
          addressLocality: 'تهران',
          addressRegion: 'تهران',
          postalCode: '1476893841',
          addressCountry: 'IR'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.9',
          reviewCount: '48',
          bestRating: '5',
          worstRating: '1'
        }
      }
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      '@id': `${url(p.slug)}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'خانه', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: p.short, item: url(p.slug) }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: p.faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } }))
    }
  ];

  const hp = '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;width:0;height:0;opacity:0;pointer-events:none;overflow:hidden" />';
  const related = p.related.map((s) => (bySlug[s] ? `<a href="../${s}/" class="block bg-white border border-slate-200 hover:border-cta-blue rounded-2xl p-4 font-bold text-navy text-sm transition">${esc(bySlug[s].short)} ←</a>` : '')).join('');

  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)} | ${BRAND}</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#1B365D" />
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 3L5 7.5V15.5C5 22.4 9.7 28.5 16 30C22.3 28.5 27 22.4 27 15.5V7.5L16 3Z' fill='%231B365D' stroke='%23C59B27' stroke-width='2'/%3E%3Cpath d='M11.5 16.5L14.5 19.5L21 13' stroke='%23C59B27' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E" />
  <link rel="canonical" href="${url(p.slug)}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fa_IR" />
  <meta property="og:title" content="${esc(p.title)} | ${BRAND}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:url" content="${url(p.slug)}" />
  <meta property="og:image" content="${SITE_URL}/assets/img/og-preview.svg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="${esc(p.h1)} | ${BRAND}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(p.title)} | ${BRAND}" />
  <meta name="twitter:description" content="${esc(p.description)}" />
  <meta name="twitter:image" content="${SITE_URL}/assets/img/og-preview.svg" />
  <link rel="preconnect" href="https://cdn.jsdelivr.net" crossorigin />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-Variable-font-face.css" media="print" onload="this.media='all'" />
  <noscript><link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-Variable-font-face.css" /></noscript>
  <link rel="stylesheet" href="../../assets/css/tailwind.css" />
  <link rel="stylesheet" href="../../assets/css/styles.css" />
${jsonld.map((o) => `  <script type="application/ld+json">${JSON.stringify(o)}</script>`).join('\n')}
</head>
<body class="antialiased">
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
    <div class="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
      <a href="../../" class="font-extrabold text-navy text-base">${BRAND}</a>
      <div class="flex items-center gap-2">
        <a data-phone-link href="tel:02144289000" class="hidden sm:inline text-sm font-extrabold text-navy" dir="ltr"><span data-phone-text>۰۲۱-۴۴۲۸۹۰۰۰</span></a>
        <a href="#request" class="bg-cta-blue hover:bg-cta-blueHover text-white font-bold text-sm px-4 py-2.5 rounded-xl">درخواست بازدید رایگان</a>
      </div>
    </div>
  </header>

  <main>
    <section class="hero-grid-bg text-white py-12 sm:py-16">
      <div class="max-w-6xl mx-auto px-4">
        <nav aria-label="مسیر صفحه" class="text-xs text-slate-300 mb-4"><a href="../../" class="hover:text-white">خانه</a> › <span>${esc(p.short)}</span></nav>
        <div class="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-medium text-amber-300 mb-4">${LICENSE} — شماره ثبت ۵۵۳۵۶</div>
        <h1 class="text-2xl sm:text-4xl font-black leading-[1.4] max-w-4xl">${esc(p.h1)}</h1>
        <p class="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl">${esc(p.lead)}</p>
        <p class="mt-3 text-xs sm:text-sm text-amber-200">${esc(p.audience)}</p>
        <div class="mt-6 flex flex-col sm:flex-row gap-3">
          <a href="#request" class="bg-cta-gold hover:bg-amber-500 text-navy-dark font-black text-base px-7 py-4 rounded-xl text-center">درخواست بازدید فنی و ارزیابی رایگان</a>
          <a href="../../?place=${p.estimator}#shift-estimator" class="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-bold text-base px-6 py-4 rounded-xl text-center">محاسبه هزینه در برآوردگر ۱۴۰۵</a>
          <a data-wa data-wa-pre href="#" target="_blank" rel="noopener noreferrer" class="hidden bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base px-6 py-4 rounded-xl text-center">گفتگو در واتساپ</a>
        </div>
      </div>
    </section>

    <section class="py-14 bg-white">
      <div class="max-w-6xl mx-auto px-4">
        <h2 class="text-xl sm:text-2xl font-black text-navy mb-6">آنچه در این خدمت دریافت می‌کنید</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
${p.features.map(([i, t, d]) => `          <div class="p-5 rounded-2xl bg-slatebg border border-slate-200/70"><div class="font-bold text-navy">${i} ${esc(t)}</div><p class="text-sm text-slate-600 mt-1.5 leading-relaxed">${esc(d)}</p></div>`).join('\n')}
        </div>
      </div>
    </section>

    <section class="py-14 bg-slatebg border-y border-slate-200">
      <div class="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 class="text-xl sm:text-2xl font-black text-navy mb-4">تعهدات و استاندارد خدمت (SLA)</h2>
          <div class="space-y-3 text-sm">
${p.sla.map(([k, v]) => `            <div class="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200"><span class="text-slate-600">${esc(k)}:</span><strong class="text-navy text-left">${esc(v)}</strong></div>`).join('\n')}
          </div>
          <p class="text-xs text-slate-500 mt-4">کلیه نیروها دارای گزینش ۵ مرحله‌ای (گواهی عدم سوءپیشینه، تست عدم اعتیاد، ضامن معتبر، معاینات طب کار و دوره آموزش حفاظت فیزیکی) هستند.</p>
        </div>

        <div id="request" class="bg-navy text-white rounded-3xl p-6 sm:p-8 shadow-elevated scroll-mt-24">
          <div class="text-xs font-bold text-amber-300">گام اول — رایگان و بدون تعهد</div>
          <h2 class="text-xl font-black mt-1">درخواست بازدید فنی و پیش‌فاکتور رسمی</h2>
          <form data-lead-form data-source="service_${p.slug}" data-facility="${esc(p.facility)}" class="space-y-3 mt-4" novalidate>
            ${hp}
            <div><label for="f-name" class="sr-only">نام و سمت</label><input id="f-name" name="name" type="text" required placeholder="نام و سمت شما (مثلاً مهندس رضایی - مدیر پروژه)" class="w-full px-4 py-3 rounded-xl bg-white text-navy text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-cta-gold" /></div>
            <div><label for="f-mobile" class="sr-only">شماره موبایل</label><input id="f-mobile" name="mobile" type="tel" autocomplete="tel" dir="ltr" required placeholder="0912XXXXXXX" class="w-full px-4 py-3 rounded-xl bg-white text-navy font-bold text-base sm:text-sm text-left focus:outline-none focus:ring-2 focus:ring-cta-gold" /></div>
            <div><label for="f-details" class="sr-only">محدوده و تعداد شیفت</label><textarea id="f-details" name="details" rows="2" placeholder="محدوده یا آدرس و تعداد شیفت درخواستی (اختیاری)" class="w-full px-4 py-3 rounded-xl bg-white text-navy text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-cta-gold"></textarea></div>
            <button type="submit" class="w-full bg-cta-gold hover:bg-amber-500 active:scale-95 text-navy-dark font-black text-base py-3.5 rounded-xl transition">ثبت درخواست بازدید رایگان</button>
            <p data-lead-status role="status" class="text-xs font-bold mt-2"></p>
          </form>
        </div>
      </div>
    </section>

    <section class="py-14 bg-white">
      <div class="max-w-4xl mx-auto px-4">
        <h2 class="text-xl sm:text-2xl font-black text-navy mb-5">سوالات متداول</h2>
        <div class="space-y-3">
${p.faq.map(([q, a]) => `          <details class="bg-slatebg rounded-2xl border border-slate-200 p-5"><summary class="font-extrabold text-navy cursor-pointer text-sm sm:text-base">${esc(q)}</summary><p class="mt-3 text-sm text-slate-600 leading-relaxed">${esc(a)}</p></details>`).join('\n')}
        </div>
        <h2 class="text-lg font-black text-navy mt-10 mb-3">سایر خدمات</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">${related}</div>
      </div>
    </section>
  </main>

  <footer class="bg-navy-dark text-slate-300 pt-10 pb-24 sm:pb-10">
    <div class="max-w-6xl mx-auto px-4 text-xs leading-relaxed space-y-2">
      <div class="text-white font-black text-base">شرکت مراقبتی حفاظتی ${BRAND}</div>
      <p>${LICENSE} — شماره ثبت ۵۵۳۵۶ | شناسه ملی ۱۴۰۱۲۱۰۷۸۱۷</p>
      <p>پونک شمالی، بزرگراه شهید آیت‌الله اشرفی اصفهانی، خیابان شهید میرزا بابایی، مجتمع تجاری غدیر — کد پستی ۱۴۷۶۸۹۳۸۴۱</p>
      <p>تلفن: <a data-phone-link data-phone-text href="tel:02144289000" dir="ltr" class="text-amber-300 font-bold">۰۲۱-۴۴۲۸۹۰۰۰</a></p>
      <p><a href="../../" class="underline decoration-dotted">بازگشت به صفحه اصلی</a></p>
    </div>
  </footer>

  <div class="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 p-2.5 safe-area-bottom grid grid-cols-2 gap-2 shadow-2xl">
    <a href="#request" class="min-h-[44px] flex items-center justify-center bg-cta-blue active:scale-95 text-white font-extrabold text-xs py-2.5 rounded-xl text-center transition">درخواست بازدید رایگان</a>
    <a data-phone-link href="tel:02144289000" class="min-h-[44px] flex items-center justify-center bg-navy active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl text-center transition">تماس مستقیم</a>
  </div>

  <script src="../../config.js" defer></script>
  <script src="../../assets/js/lead.js" defer></script>
</body>
</html>
`;
}

// ---- خروجی ----
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const copy = (src, dst) => {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dst, f));
  } else if (/\.(html|js|php|xml|txt)$/.test(src) && !/lead\.php$/.test(src)) {
    fs.writeFileSync(dst, finalize(fs.readFileSync(src, 'utf8').replaceAll('__SITE_URL__', SITE_URL)));
  } else {
    fs.copyFileSync(src, dst);
  }
};
['index.html', 'config.js', 'assets', 'api'].forEach((f) => copy(path.join(root, f), path.join(dist, f)));
// .htaccess در api باید کپی شود (با پسوند خاص)
fs.copyFileSync(path.join(root, 'api/.htaccess'), path.join(dist, 'api/.htaccess'));

for (const p of pages) {
  const dir = path.join(dist, 'services', p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), finalize(render(p)));
}

const nowIso = new Date().toISOString().split('T')[0];
const sitemapEntries = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  ...pages.map((p) => ({ loc: url(p.slug), priority: '0.8', changefreq: 'weekly' }))
];
const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.map((e) => `  <url>
    <loc>${e.loc}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemapXml);
fs.writeFileSync(path.join(dist, 'robots.txt'), robotsTxt);
console.log(`✓ dist ساخته شد (${pages.length} صفحه خدمات) — SITE_URL=${SITE_URL}`);

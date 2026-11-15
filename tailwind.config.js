/** تنظیمات Tailwind (منتقل‌شده از کانفیگ داخل صفحه) */
module.exports = {
  content: ['./index.html', './services/**/*.html', './assets/js/*.js', './config.js', './scripts/*.mjs'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#1B365D', dark: '#11233F', light: '#26497A' },
        slatebg: '#F4F7FA',
        cta: { blue: '#2563EB', blueHover: '#1D4ED8', gold: '#C59B27', goldLight: '#FBF6E8' }
      },
      fontFamily: { sans: ['Vazirmatn', 'system-ui', '-apple-system', 'sans-serif'] },
      boxShadow: {
        corporate: '0 10px 30px -5px rgba(27, 54, 93, 0.08), 0 4px 12px -2px rgba(27, 54, 93, 0.04)',
        elevated: '0 20px 40px -10px rgba(27, 54, 93, 0.16)'
      }
    }
  }
};

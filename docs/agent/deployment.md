# Build, Deployment & Operations

## Build Pipeline (`scripts/build-pages.mjs`)

The project uses a two-stage build pipeline:
1. **CSS Compilation**: Compiles and minifies Tailwind utility classes from `src/input.css` into `assets/css/tailwind.css`.
2. **Page & Asset Generation**: Reads service templates, compiles HTML pages into `dist/services/*`, creates `dist/sitemap.xml` and `dist/robots.txt`, and syncs assets into `dist/`.

### Commands
```bash
# Standard local build
npm run build

# Production build with domain canonicalization
SITE_URL=https://dideban-amin.ir npm run build
```

## Production Domain & Canonicalization
- If `SITE_URL` is omitted, the build script defaults to `https://YOUR-DOMAIN.ir` and emits a console warning.
- Production builds **must** pass the exact production URL via environment variable:
  `SITE_URL=https://your-domain.ir npm run build`
- This ensures all canonical meta tags, sitemap entries, and robots.txt references are accurate.

## Server Deployment Requirements
- **Web Server**: Apache or Nginx serving static files from `dist/` root.
- **PHP Engine**: PHP 7.4 or higher installed on host for `api/lead.php`.
- **Permissions**:
  - The `api/` directory must be writable by the web server user (`www-data` or `nobody`) to allow creating and appending to `api/leads.csv`.
- **Apache Security (`.htaccess`)**:
  - Verify `api/.htaccess` is active and `mod_authz_core` or `mod_access_compat` is enabled so direct browser requests to `api/leads.csv` return `403 Forbidden`.
- **Nginx Security Alternative**:
  If deploying to Nginx, replicate the `.htaccess` rule in the server block:
  ```nginx
  location ~* /api/.*\.(csv|log)$ {
      deny all;
      return 403;
  }
  ```

## Verification & Health Check
1. Verify build artifacts:
   ```bash
   test -f dist/index.html && test -f dist/sitemap.xml && test -f dist/robots.txt
   ```
2. Verify PHP syntax:
   ```bash
   php -l api/lead.php
   ```
3. Verify JS syntax:
   ```bash
   node --check scripts/build-pages.mjs && node --check config.js && node --check assets/js/lead.js && node --check assets/js/app.js
   ```

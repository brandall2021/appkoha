#!/usr/bin/env bash
set -e

cd /var/www/html

# Quita caches stale (p.ej. packages.php con providers de paquetes dev) y
# garantiza que www-data pueda escribir en storage y bootstrap/cache.
rm -f bootstrap/cache/*.php
rm -f storage/logs/laravel.log

if [ ! -f .env ]; then
    cp .env.example .env
fi

# Genera APP_KEY si falta (primer arranque sin APP_KEY en .env)
if ! grep -q '^APP_KEY=.\+' .env; then
    php artisan key:generate --force
fi

chown -R www-data:www-data storage bootstrap/cache

# Regenera el autoload de paquetes y cachea la config (sin providers de dev).
php artisan package:discover --ansi
php artisan config:cache --ansi

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf

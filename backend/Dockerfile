# Fase de build: instalar dependencias de composer
FROM composer:2 AS composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer install --no-dev --no-scripts --prefer-dist && \
    composer dump-autoload --optimize

# Fase de runtime: PHP-FPM
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
        postgresql-dev \
        libzip-dev \
        nginx \
        supervisor \
    && docker-php-ext-install pdo_pgsql zip \
    && docker-php-ext-enable pdo_pgsql

WORKDIR /var/www/html

COPY --from=composer /app /var/www/html

# Permisos de storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Config de nginx y supervisord
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

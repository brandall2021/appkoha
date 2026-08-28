# Fase de build: instalar dependencias de composer (sin scripts para no depender del .env)
FROM composer:2 AS composer

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist

COPY . .
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist && \
    composer dump-autoload --optimize --no-scripts

# Fase de runtime: PHP-FPM
FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
        postgresql-dev \
        libzip-dev \
        nginx \
        supervisor \
        bash \
    && docker-php-ext-install -j"$(nproc)" pdo_pgsql bcmath zip \
    && docker-php-ext-enable pdo_pgsql bcmath zip

WORKDIR /var/www/html

COPY --from=composer /app /var/www/html

# Permisos de storage
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Config de nginx: el nginx.conf de la imagen incluye conf.d/*.conf en el ROOT,
# por lo que el servidor vhost debe ir en http.d/ (dentro de http{}), y el
# conf.d/default.conf se elimina para evitar el error "server directive not allowed here".
RUN rm -f /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Config de supervisord
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Entrypoint: cachea config/rutas y lanza supervisord
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --prefer-source

FROM php:8.3-cli

RUN docker-php-ext-install pdo pdo_mysql

COPY --from=vendor /app/vendor /var/www/html/vendor
COPY . /var/www/html/

WORKDIR /var/www/html

EXPOSE ${PORT}
CMD php -S 0.0.0.0:${PORT}

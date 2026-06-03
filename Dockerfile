FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-interaction --no-scripts --prefer-source

FROM php:8.3-apache

RUN docker-php-ext-install pdo pdo_mysql

COPY --from=vendor /app/vendor /var/www/html/vendor
COPY . /var/www/html/

RUN echo 'Listen ${PORT}' > /etc/apache2/ports.conf && \
    sed -i 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-enabled/000-default.conf

EXPOSE ${PORT}
CMD ["apache2-foreground"]

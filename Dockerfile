FROM php:8.3-apache

RUN apt-get update && apt-get install -y --no-install-recommends unzip libzip-dev \
    && docker-php-ext-install pdo pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/* \
    && rm -f /etc/apache2/mods-enabled/mpm_event.conf \
              /etc/apache2/mods-enabled/mpm_event.load \
              /etc/apache2/mods-enabled/mpm_worker.conf \
              /etc/apache2/mods-enabled/mpm_worker.load \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY . /var/www/html/

RUN composer install --no-dev --no-interaction --working-dir=/var/www/html

RUN echo 'Listen ${PORT}' > /etc/apache2/ports.conf && \
    sed -i 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-enabled/000-default.conf

EXPOSE ${PORT}

CMD ["apache2-foreground"]

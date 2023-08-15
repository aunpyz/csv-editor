FROM composer:2 as composer

LABEL org.opencontainers.image.source="https://github.com/aunpyz/csv-editor"

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --no-dev \
    --prefer-dist \
    && composer dump-autoload

FROM php:8.2-apache

WORKDIR /var/www/html

COPY --from=composer app/vendor ./vendor

COPY templates index.js index.php savefile.php ./
FROM composer:2 AS composer

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

FROM devatherock/minify-js AS minify

COPY index.js index.js

RUN minify index.js > index.min.js

FROM php:8.2-apache

WORKDIR /var/www/html

COPY --from=composer app/vendor ./vendor

COPY --from=minify index.min.js index.js

COPY templates index.php savefile.php ./

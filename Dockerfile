FROM composer:2 as composer

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --no-dev \
    --prefer-dist

RUN composer dump-autoload

FROM php:8.2-apache

WORKDIR /var/www/html/vendor

COPY --from=composer app/vendor ./

WORKDIR /var/www/html

COPY templates color.css index.css index.js index.php savefile.php ./

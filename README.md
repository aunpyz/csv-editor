# csv-editor
### Composer
```shell
# install package
composer

# run a built-in web server via composer
composer dev
# or any port of your choice
composer dev -- -p 8001

```

### Run via shell

```shell
# make sure the script is executable
chmod +x ./serve.sh

# built-in web server is listening to port 8000
./serve.sh

# or you can change the port to your liking
./serve.sh -p 8001
```

### Run in built-in web server

```php
php -S localhost:8000
```

### Run via Docker
```shell
# build docker image
docker build -t csv-editor .

# run the image
docker container run --rm -d -p 80:80 csv-editor

```

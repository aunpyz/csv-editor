#!/bin/bash
PORT=8000
while getopts p: option
do
case "${option}"
in
p) PORT=${OPTARG};;
esac
done

php -S localhost:$PORT
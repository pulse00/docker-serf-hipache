#!/bin/sh

echo "Container ID $CONTAINER_ID" > /usr/share/nginx/html/index.html

# start nginx
nginx
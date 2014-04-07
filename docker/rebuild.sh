#!/bin/sh

# build the nginx container
docker build -t hipache/nginx .

# tag it
docker tag hipache/nginx docker.hipache:5000/nginx

# push it to the registry
docker push docker.hipache:5000/nginx

# now send the deploy event to all serf nodes
serf event deploy
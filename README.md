Continuous Deployment with Docker + Serf + Hipache
==================================================

## Overview

...


## Usage


- Create an `/etc/hosts` entry pointing `vagrant.local` to 127.0.0.1 (on your hosts machine).
- Start the boxes using `vagrant up`
- After both boxes have been provisioned, ssh into the frontend box using `vagrant ssh frontend`.
- `serf members` should output 2 members in the serf cluster (frontend/backend).
- Change into `/vagrant/docker` directory and execute the rebuild script using `sh redeploy.sh`.

This will build a docker image running nginx, tag the image with `docker.hipache:5000/nginx`, push it
to the docker registry running on the frontend box, and dispatch an `deploy` event into the serf
cluster.

Now the backend should pull the nginx image, start a new container an register it with hipache.

After that, you should get a response when browsing to `http://vagrant.local:8888`, showing the
port of the currently running container.

From the frontend box you can start a redeploy at any time using `serf event deploy`. This will

- start a new container on a different port
- Register the new container as a backend in hipache
- Remove the old container as a backend from hipache
- Stop the old container


## Log files

...


Continuous Deployment with Docker, Serf and Hipache
===================================================

## Overview

This is a proof-of-concept for a continuous deployment setup using [docker](https://www.docker.io/), [serf](http://www.serfdom.io/) and [hipache](https://github.com/dotcloud/hipache).

The project consists of 2 vagrant boxes: `frontend` and `backend`. 

### Frontend

The `frontend` box runs a hipache load-balancer on port 80 which will proxy all
http requests to the docker container running nginx on the backend box.

A docker registry is running on port 5000 which we will use to push our docker images to.

It also runs a serf agent forming a 2-node cluster with the serf agent running on the backend box.


### Backend

The backend runs a docker container containing nginx exposing port 80 which is mapped to any 
port we want on the backend VM.

The serf agent on this box will listen to `deploy` events, triggering the script `/vagrant/deployment/deploy.sh`,
which in turn will deploy a new docker container and connect it to the hipache loadbalancer:

1. Pull the latest tag of the image
2. Start a new container based on the image, but map it to another port than the running one
3. Create a new entry in the hipache load-balancer for the newly created container
4. Remove the old container as backend from hipache
5. Stop the old container


## Usage

- On your host machine, create an `/etc/hosts` entry pointing `vagrant.local` to 127.0.0.1.
- Start both boxes using `vagrant up`
- After both boxes have been provisioned, ssh into the frontend box using `vagrant ssh frontend`.
- Running `serf members` should output 2 members in the serf cluster (frontend/backend).
- Change into `/vagrant/docker` and execute the deploy script using `sh redeploy.sh`.

This will build a docker image running nginx, tag the image with `docker.hipache:5000/nginx`, push it
to the docker registry running on the frontend box, and dispatch a `deploy` event into the serf
cluster.

Now the backend should pull the nginx image, start a new container an register it with hipache.

After that, you should get a response when browsing to `http://vagrant.local:8888`, showing the
port of the currently running container.

From the frontend box you can start a redeploy at any time using `/vagrant/docker/redeploy.sh`. 


## Log files

- Hipache (frontend): /var/log/upstart/hipache.log
- Serf (backend/frontend): /var/log/upstart/serf.log


## Services

### Serf

Start/Stop using `service serf start|stop`

### Hipache (frontend only)

Start/Stop using `service hipache start|stop`


## Disclaimer

This project is not intended for use in production, it's just an experimental playground for a continuous deployment strategy :)







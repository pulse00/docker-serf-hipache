Docker + Serf + Hipache Continuous Deployment
=============================================

## Usage

### Hipache

- redis-cli rpush frontend:vagrant.local hipache
- redis-cli rpush frontend:vagrant.local http://192.168.50.195:8899

### Docker

- vagrant into frontend and run hipache
- cd into /vagrant and build the docker nginx image

# build the dockerfile in /vagrant/docker
- sh rebuild.sh

# run nginx
- docker run -d -p 8899:80 docker.hipache:5000/nginx


- use docker in the backend using `docker -H :4243 ps`
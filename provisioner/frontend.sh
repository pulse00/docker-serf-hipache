#!/bin/sh

# install hipache and docker
if [ ! -d "/home/vagrant/hipache" ]; then

	# install dependencies
	sudo apt-get update
	sudo apt-get install -y python-software-properties
	sudo apt-add-repository ppa:chris-lea/node.js -y
	sudo apt-get update
	sudo apt-get install -y at nodejs git redis-server
	sudo sed -i 's/bind 127\.0\.0\.1/bind 0\.0\.0\.0/g' /etc/redis/redis.conf

	# see https://github.com/mitchellh/vagrant/issues/3166#issuecomment-37605165
	sudo echo 'dhclient -r eth0 && dhclient eth0' | at now + 1 minute

	# install hipache
	git clone https://github.com/dotcloud/hipache.git /home/vagrant/hipache
	cd /home/vagrant/hipache && sudo npm install
	sudo cp /vagrant/hipache_config.json /home/vagrant/hipache/hipache_config.json

	# hosts entry for the docker registry
	sudo echo "127.0.0.1 docker.hipache" >> /etc/hosts

	# install serf
	sudo wget https://dl.bintray.com/mitchellh/serf/0.5.0_linux_amd64.zip -P /tmp
	sudo unzip /tmp/0.5.0_linux_amd64.zip -d /usr/bin/
	sudo wget https://raw.githubusercontent.com/hashicorp/serf/master/ops-misc/debian/serf.upstart -O /etc/init/serf.conf
	sudo mkdir /etc/serf && sudo cp /vagrant/serf/config.json /etc/serf/config.json
	sudo service serf start

else
	echo "Frontend already provisioned. Change into /home/vagrant/hipache and run `sudo bin/hipache --config hipache_config.json`"
fi 


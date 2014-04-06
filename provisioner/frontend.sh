#!/bin/sh

# install hipache and docker
if [ ! -d "/home/vagrant/hipache" ]; then
	sudo apt-get update
	sudo apt-get install -y python-software-properties
	sudo apt-add-repository ppa:chris-lea/node.js -y
	sudo apt-get update
	sudo apt-get install -y at nodejs git redis-server

	# see https://github.com/mitchellh/vagrant/issues/3166#issuecomment-37605165
	sudo echo 'dhclient -r eth0 && dhclient eth0' | at now + 1 minute

	git clone https://github.com/dotcloud/hipache.git /home/vagrant/hipache
	cd /home/vagrant/hipache && sudo npm install
	sudo cp /vagrant/hipache_config.json /home/vagrant/hipache/hipache_config.json

	sudo echo "127.0.0.1 docker.hipache" >> /etc/hosts

else
	echo "Frontend already provisioned. Change into /home/vagrant/hipache and run `sudo bin/hipache --config hipache_config.json`"
fi 


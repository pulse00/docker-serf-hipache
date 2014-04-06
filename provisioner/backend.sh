#!/bin/sh

if [ ! -d "/home/vagrant/web" ]; then

	# install dependencies
	sudo apt-get update
	sudo apt-get install -y python-software-properties
	sudo apt-add-repository ppa:chris-lea/node.js -y
	sudo apt-get update
	sudo apt-get install -y nodejs unzip

	sudo echo "192.168.50.190 docker.hipache" >> /etc/hosts

	# install serf
	sudo wget https://dl.bintray.com/mitchellh/serf/0.5.0_linux_amd64.zip -P /tmp
	sudo unzip /tmp/0.5.0_linux_amd64.zip -d /usr/bin/
	sudo wget https://raw.githubusercontent.com/hashicorp/serf/master/ops-misc/debian/serf.upstart -O /etc/init/serf.conf
	sudo mkdir /etc/serf && sudo cp /vagrant/serf/config.json /etc/serf/config.json
	sudo service serf start
fi
#!/bin/sh

if [ ! -d "/home/vagrant/web" ]; then
	sudo apt-get update
	sudo apt-get install -y python-software-properties
	sudo apt-add-repository ppa:chris-lea/node.js -y
	sudo apt-get update
	sudo apt-get install -y nodejs

	sudo echo "192.168.50.190 docker.hipache" >> /etc/hosts
	mkdir /home/vagrant/web && touch /home/vagrant/web/index.html
fi
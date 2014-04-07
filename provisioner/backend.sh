#!/bin/sh

## Shell provisioner for the vagrant backend box
## Installs the required dependencies

if [ ! -d "/etc/serf" ]; then

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
	sudo wget https://gist.githubusercontent.com/pulse00/221402f6df391dd43d1a/raw/8d781ae8b4bf61287c77a3d9393eb09a91892bcd/gistfile1.txt -O /etc/init/serf.conf
	sudo mkdir /etc/serf && sudo cp /vagrant/serf/config.json /etc/serf/config.json
	sudo service serf start

	# make the deploy script executable
	sudo chmod +x /vagrant/deployment/deploy.sh

	# join the serf cluster (the frontend node)
	serf join 192.168.50.190

fi
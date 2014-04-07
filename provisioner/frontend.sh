#!/bin/sh

# install hipache and docker
if [ ! -d "/home/vagrant/hipache" ]; then

	# install dependencies
	sudo apt-get update
	sudo apt-get install -y python-software-properties
	sudo apt-add-repository ppa:chris-lea/node.js -y
	sudo apt-get update
	sudo apt-get install -y at nodejs git redis-server unzip
	sudo sed -i 's/bind 127\.0\.0\.1/bind 0\.0\.0\.0/g' /etc/redis/redis.conf

	# see https://github.com/mitchellh/vagrant/issues/3166#issuecomment-37605165
	sudo echo 'dhclient -r eth0 && dhclient eth0' | at now + 1 minute

	# hosts entry for the docker registry
	sudo echo "127.0.0.1 docker.hipache" >> /etc/hosts
	sudo mkdir /opt/registry

	# install and run hipache
	git clone https://github.com/dotcloud/hipache.git /home/vagrant/hipache
	cd /home/vagrant/hipache && sudo npm install
	sudo cp /vagrant/hipache_config.json /home/vagrant/hipache/hipache_config.json
	sudo wget https://gist.githubusercontent.com/pulse00/59bf9d19919b3045c5a5/raw/a4760a95210167feb0c57da149fbbd28a0d5107f/gistfile1.txt -O /etc/init/hipache.conf
	sudo service hipache start

	# give hipache some time to start
	sleep 3
	# create a hipache frontend for the domain vagrant.local named hipache
	redis-cli rpush frontend:vagrant.local hipache

	# install serf and start the agent
	sudo wget https://dl.bintray.com/mitchellh/serf/0.5.0_linux_amd64.zip -P /tmp
	sudo unzip /tmp/0.5.0_linux_amd64.zip -d /usr/bin/
	sudo wget https://gist.githubusercontent.com/pulse00/221402f6df391dd43d1a/raw/8d781ae8b4bf61287c77a3d9393eb09a91892bcd/gistfile1.txt -O /etc/init/serf.conf
	sudo mkdir /etc/serf && sudo cp /vagrant/serf/config.json /etc/serf/config.json
	sudo service serf start

	# join the serf cluster
	serf join 192.168.50.190

else
	echo "Frontend already provisioned."
fi 

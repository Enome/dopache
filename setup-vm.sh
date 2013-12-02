#!/usr/bin/env bash

sudo apt-get install -qqy software-properties-common

# Dependency repositories
sudo add-apt-repository -y ppa:chris-lea/redis-server
sudo add-apt-repository -y ppa:chris-lea/node.js-legacy
sh -c "wget -qO- https://get.docker.io/gpg | apt-key add -"
sudo sh -c "echo deb http://get.docker.io/ubuntu docker main > /etc/apt/sources.list.d/docker.list"
sudo apt-get -qq update

# Install Docker
sudo apt-get install -yqq linux-image-extra-`uname -r`
sudo apt-get install -yqq lxc-docker-0.6.6

# Install redis
sudo apt-get install -yqq redis-server
sudo sed -i 's/bind.*/bind 0.0.0.0/g' /etc/redis/redis.conf
sudo /etc/init.d/redis-server restart

# Install Node.js
sudo apt-get install -yqq nodejs
sudo apt-get install -yqq npm
sudo npm update npm -g

# Install git
sudo apt-get install -yqq git

# Install dopache
sudo /vagrant/install_ubuntu.sh

# Run containers
sudo docker run -d -p 3000 --name=the-container base sleep 7200
sudo docker run -d -p 3000 --name=anothercontainer base sleep 7200

# Setup dopache settings
sudo redis-cli set dopache:*.enome.be the-container:3000
sudo redis-cli set dopache:enome.be anothercontainer:6666

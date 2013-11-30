#!/usr/bin/env bash

sudo apt-get install -qqy software-properties-common

# Dependency repositories
sudo add-apt-repository -y ppa:chris-lea/redis-server
sudo apt-get -qq update

# Install redis
sudo apt-get install -yqq redis-server
sudo sed -i 's/bind.*/bind 0.0.0.0/g' /etc/redis/redis.conf
sudo /etc/init.d/redis-server restart

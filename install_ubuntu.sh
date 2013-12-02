# Colors
default=$(tput sgr0)
green=$(tput setaf 6)

# Alerts
confirm() {
  echo "${green}---> ${default}$1"
}

# Install dopache
sudo npm install dopache -g
confirm 'Installed, dopache has.'

# Install upstart script for dopache

sudo cat<<EFO > /etc/init/dopache.conf
start on runlevel [2345]
stop on runlevel [06]

respawn
respawn limit 15 5

script
  sudo dopache >> /var/log/dopache
end script
EFO

sudo start dopache
confirm 'Started, dopache upstart has.'

# Colors
default=$(tput sgr0)
green=$(tput setaf 6)
red=$(tput setaf 9)

# Alerts
confirm() {
  echo "${green}---> ${default}$1"
}

warning() {
  echo "${red}---> ${default}$1"
}

# Install dopache
npm install dopache -i

# Install upstart script for dopache

sudo cat<<EFO > /etc/init/dopache.conf
start on runlevel [2345]
stop on runlevel [06]

respawn
respawn limit 15 5

script
  sudo dopache.conf >> /var/log/dopache
  end script
EFO

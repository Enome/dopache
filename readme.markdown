# Docker + Hipache = Dopache

Link containers and their assigned ip + a port to hipache.

## Install

```sh
npm install dopache
```

## Usage

Lets say you have a domain **enome.be** which you want to proxy to a container named **enome-container** on port **3000**.

```sh
redis-cli set dopache:enome.be enome-container:3000
```

This will create the following hipache settings:

```sh
redis-cli lrange frontend:enome.be 0 -1 #[ 'enome-container', '175.44.66.20:3000']
```

The IP depends on which ip the container got from Docker. Dopache doesn't support multiple containers per frontend. If you need this send me a pull request.

## Tests

```sh
vagrant up
mocha -r should tests.js
```

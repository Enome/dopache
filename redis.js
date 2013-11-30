var redis = require('redis');
var client;

if (process.env.NODE_ENV === 'test') {
  client = redis.createClient('6379', '11.0.0.2');
} else {
  client = redis.createClient();
}

client.on('error', function (err) {
  console.log('Redis error:', err);
});

process.on('exit', function () {
  client.quit(); 
});

module.exports = client;

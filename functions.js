var async = require('async');
var docker = require('docker.io')({ socketPath: '/var/run/docker.sock' });

var functions = {

  redisConfigurationKeys: function (state, next) {

    state.client.keys('dopache*', function (error, result) {
      if (error) {
        return next(error); 
      }

      state.urls = result.reduce(function (memo, key) {
        memo[key.split(':').pop()] = {};
        return memo;
      }, {});

      /* { '*.enome.be': {}, 'enome.be': {} } */

      next(null, state);
    });

  },

  redisConfigurationValues: function (state, next) {

    async.each(Object.keys(state.urls), function (key, callback) {

      state.client.get('dopache:' + key, function (error, value) {

        if (error) {
          return callback(error);
        }

        state.urls[key].dopache = { value: value, };
        callback();
        
      });
      
    }, function (error) {

      if (error) {
        return next(error); 
      }

      /*
      {
        '*.enome.be': { dopache: { value: 'the-container:3000' } },
        'enome.be': { dopache: { value: 'anothercontainer:6666' } } 
      }
      */


      next(null, state);

    });

  },

  containerNames: function (state, next) {

    for (var prop in state.urls) {

      if (state.urls.hasOwnProperty(prop)) {
        var value = state.urls[prop];
        value.container = { name: value.dopache.value.split(':').shift() };
      }

    }

    /*
    { 
      '*.enome.be': { dopache: { value: 'the-container:3000' }, container: { name: 'the-container' } },
      'enome.be': { dopache: { value: 'anothercontainer:6666' }, container: { name: 'anothercontainer' } } 
    }
    */

    next(null, state);
    
  },

  inspectContainers: function (state, next) {

    async.each(Object.keys(state.urls), function (key, callback) {

      var current = state.urls[key];

      docker.containers.inspect(current.container.name, {}, function (error, result) {
        current.container.inspect = { error: error, result: result };
        callback();
      });
      
    }, function () {

      /*
      { 
        '*.enome.be': { dopache: { value: 'the-container:3000' },    container: { name: 'the-container',    inspect: { error, result } },
        'enome.be':   { dopache: { value: 'anothercontainer:6666' }, container: { name: 'anothercontainer', inspect: { error, result } },
      }
      */

      next(null, state);

    });

  },

  createHipacheConfiguration: function (state, next) {

    async.each(Object.keys(state.urls), function (key, callback) {

      var current = state.urls[key];

      if (!current.container.inspect.error) {

        var port = current.dopache.value.split(':').pop();
        var ip = current.container.inspect.result.NetworkSettings.IPAddress;

        current.hipache = {};

        if (!ip || !port) {
          return callback(); 
        }

        current.hipache.url = ip + ':' + port;
      
      }

      callback();
      
    }, function () {

      /*
      {
        '*.enome.be': { dopache: { value: 'the-container:3000' }, container: { name: 'the-container', inspect: [Object] } },
        'enome.be': { dopache: { value: 'anothercontainer:6666' }, container: { name: 'anothercontainer', inspect: [Object] }, hipache: { url: '172.17.0.5:6666' } } 
      }
      */

      next(null, state);

    });
    
  },

  hipacheConfigurationFromRedis: function (state, next) {

    async.each(Object.keys(state.urls), function (key, callback) {

      var current = state.urls[key];

      state.client.lrange(['frontend:' + key, 0, -1], function (error, list) {

        if (error) {
          return callback(error);
        }

        current.hipache.redis = list;
        callback();
	
      });
      
    }, function () {

      /*
      { 
        '*.enome.be': { dopache: { value: 'the-container:3000' }, container: { name: 'the-container', inspect: [Object] }, hipache: { redis: [] } },
        'enome.be': { dopache: { value: 'anothercontainer:6666' }, container: { name: 'anothercontainer', inspect: [Object] }, hipache: { url: '172.17.0.5:6666', redis: [] } } 
      }
      */

      next(null, state);

    });
    
  },

  setHipacheIdentifier: function (state, next) {

    async.each(Object.keys(state.urls), function (key, callback) {

      var current = state.urls[key];

      if (current.hipache.redis.length === 0) {

        state.client.rpush(['frontend:' + key, current.container.name], function (error) {

          if (error) {
            return callback(error);
          }

          callback();
    
        });
      
        return;
      }

      callback();

    }, function (error) {

      if (error) {
        return next(error); 
      }

      next(null, state);

    });
      
  },

  trimHipacheConfiguration: function (state, next) {

    /* We trim the hipache list to only keep the identifier.
     * because the dead backend didn't seem to be working.
     * need to investigate.
     */

    async.each(Object.keys(state.urls), function (key, callback) {

      state.client.ltrim(['frontend:' + key, 0, 0], function (error) {

        if (error) {
          return callback(error);
        }

        callback();
        
      });

    }, function (error) {

      if (error) {
        return next(error); 
      }

      next(null, state);

    });
  
  },

  setHipacheConfiguration: function (state, next) {

    async.each(Object.keys(state.urls), function (key, callback) {

      var current = state.urls[key];

      if (current.hipache.url) {

        state.client.rpush(['frontend:' + key, current.hipache.url], function (error) {

          if (error) {
            return callback(error);
          }

          callback();
          
        });

        return;
      
      }

      callback();

    }, function (error) {

      if (error) {
        return next(error); 
      }

      next(null, state);

    });

  },

};

module.exports = functions;

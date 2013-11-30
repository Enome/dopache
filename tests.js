/*global describe, before, after, it*/

process.env.NODE_ENV = 'test';

var async = require('async');
var exec = require('child_process').exec;
var dopache = require('./index');
var redis = require('./redis');

describe('Integration tests', function () {

  before(function (done) {

    async.series([

      function (next) {
        exec('docker run -d -p 3000 --name=the-container base sleep 7200', function (error) {
          next(error);
        });
      },

      function (next) {
        exec('docker run -d -p 3000 --name=anothercontainer base sleep 7200', function (error) {
          next(error);
        });
      },

      function (next) {
        redis.set('dopache:*enome.be', 'the-container:3000', next);
      },

      function (next) {
        redis.set('dopache:enome.be', 'anothercontainer:6666', next);
      },

      function (next) {
        dopache(next);
      },

      function (next) {
        dopache(next); // Calling it twice shouldn't change the result.
      },
    
    ], function (error) {
      done(error);
    });

  });  

  after(function (done) {

    async.series([

      function (next) {
        exec('docker kill the-container', function (error) {
          next(error);
        });
      },

      function (next) {
        exec('docker rm the-container', function (error) {
          next(error);
        });
      },

      function (next) {
        exec('docker kill anothercontainer', function (error) {
          next(error);
        });
      },

      function (next) {
        exec('docker rm anothercontainer', function (error) {
          next(error);
        });
      },

      function (next) {
        redis.flushdb(next);
      },
    
    ], function (error) {
      done(error);
    });

  });

  it('creates a frontend for enome.be with an identifier and ip + port of the container', function (done) {

    redis.lrange(['frontend:enome.be', 0, -1], function (error, result) {
      result[0].should.eql('anothercontainer');
      /[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}:6666/.test(result[1]).should.eql(true);
      done();
    });

  });

  it('creates a frontend for *.enome.be with an identifier and ip + port of the container', function (done) {

    redis.lrange(['frontend:*enome.be', 0, -1], function (error, result) {
      result[0].should.eql('the-container');
      /[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}:3000/.test(result[1]).should.eql(true);
      done();
    });

  });

});

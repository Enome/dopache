/*global describe, before, after, it*/

process.env.NODE_ENV = 'test';

var async = require('async');
var exec = require('child_process').exec;
var dopache = require('./index');
var redis = require('./redis');

describe('Integration tests', function () {

  it('creates a frontend for enome.be with an identifier and ip + port of the container', function (done) {

    redis.lrange(['frontend:enome.be', 0, -1], function (error, result) {
      result[0].should.eql('anothercontainer');
      /[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}:6666/.test(result[1]).should.eql(true);
      done();
    });

  });

  it('creates a frontend for *.enome.be with an identifier and ip + port of the container', function (done) {

    redis.lrange(['frontend:*.enome.be', 0, -1], function (error, result) {
      result[0].should.eql('the-container');
      /[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}\.[0-9]{0,3}:3000/.test(result[1]).should.eql(true);
      done();
    });

  });

});

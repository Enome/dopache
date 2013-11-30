var async = require('async');
var redis = require('./redis');
var functions = require('./functions');

var dopache = function (callback) {

  async.waterfall([

    function (next) { next(null, { client: redis }); },

    functions.redisConfigurationKeys,
    functions.redisConfigurationValues,
    functions.containerNames,
    functions.inspectContainers, 
    functions.createHipacheConfiguration, 
    functions.hipacheConfigurationFromRedis, 
    functions.setHipacheIdentifier,
    functions.trimHipacheConfiguration,
    functions.setHipacheConfiguration,

  ], callback);

};

module.exports = dopache;

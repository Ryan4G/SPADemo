/*
 * crud.js - module to provide CRUD db capabilities
 */

// -----BEGIN MODULE SCOPE VARIABLES-----

'use strict'
var 
  redisDriver = require('redis'),
  redisClient = redisDriver.createClient(),
  makeString, deleteKey, getValue, setValue;

// -----END MODULE SCOPE VARIABLES-----

// -----BEGIN UTILITY METHODS-----
  makeString = function(key_data){
  	return (typeof key_data === 'string') ? key_data : JSON.stringify(key_data);
  };
// -----END UTILITY METHODS-----

deleteKey = function(key){
	redisClient.del(makeString(key));
};
getValue = function(key, hit_callback, miss_callback){
	redisClient.get(
		makeString(key),
		function(err, reply){
			if (reply){
				console.log('HIT');
				hit_callback(reply);
			}
			else{
				console.log('MISS');
				miss_callback();
			}
		}
	);
};

setValue = function(key, value){
	redisClient.set(
		makeString(key),
		makeString(value)
	);
};

module.exports = {
	deleteKey: deleteKey,
	getValue: getValue,
	setValue: setValue
};
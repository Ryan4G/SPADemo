/*
 * crud.js - module to provide CRUD db capabilities
 */

// -----BEGIN MODULE SCOPE VARIABLES-----

'use strict'
var 
  checkType, constructObj, readObj,
  updateObj, destroyObj;

var 
  loadSchema, checkSchema, clearIsOnline,
  mongodb = require('mongodb'),
  fsHandle = require('fs'),
  JSV = require('JSV').JSV,
  validator = JSV.createEnvironment(),
  objTypeMap = {'user': {}},
  cache = require('./cache');

const MongoClient = mongodb.MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'spa';

var db = undefined;

// -----END MODULE SCOPE VARIABLES-----

// -----BEGIN PUBLIC METHODS-----

checkType = function(){};
constructObj = function(){};
readObj = function(){};
updateObj = function(){};
destroyObj = function(){};

module.exports = {
  makeMongoId: null,
  checkType: checkType,
  construct: constructObj,
  read: readObj,
  update: updateObj,
  destroy: destroyObj
};

// -----END PUBLIC METHODS-----

// -----BEGIN UTILITY METHODS  -----
loadSchema = function(schema_name, schema_path){
  fsHandle.readFile(schema_path, 'utf-8', function(err, data){
    objTypeMap[schema_name] = JSON.parse(data);
  });
};

checkSchema = function(obj_type, obj_map, callback){
  var 
  shcema_map = objTypeMap[obj_type],
  report_map = validator.validate(obj_map, shcema_map);
  callback(report_map.errors);
};

clearIsOnline = function(){
  updateObj(
    'user',
    {"is_online": true},
    {"is_online": false},
    function(response_map){
      console.log('All users set to offline ', response_map);
    }
    );
};
// -----END UTILITY METHODS -----

// -----BEGIN PUBLIC METHODS -----
checkType = function(obj_type){
  if (!objTypeMap[obj_type]){
    return ({
      error_msg: 'Object type "'  + obj_type + '" is not supported.'
    });
  }
};

constructObj = function(obj_type, obj_map, callback){
  var type_check_map = checkType(obj_type);

  if (type_check_map){
    callback(type_check_map);
    return;
  }

  checkSchema(
      obj_type, obj_map,
      function(error_list){
        if (error_list.length === 0){
          const collection = db.collection(obj_type);
          collection.insertOne(
            obj_map,
            null,
            function (error, result){
              //console.log(result);
              callback(result);
            }
          );
        }
        else {
          callback({
            error_msg: 'Input document not valid',
            error_list: error_list
          });
        }
      }
    );
};


readObj = function(obj_type, find_map, fields_map, callback){
    
    var type_check_map = checkType(obj_type);

    if (type_check_map){
      callback(type_check_map);
      return;
    }

    cache.getValue(find_map, callback, function(){
      const collection = db.collection(obj_type);
      collection.find(
        find_map
      )
      .toArray(
        function (error, result){
          //console.log(result);
          cache.setValue(find_map, result);
          callback(result);
        }
      );
    });
};

updateObj = function(obj_type, find_map, set_map, callback){
  var  
    type_check_map = checkType(obj_type), 
    opt_map = {
      returnOriginal: false, 
      upsert: false
    };

  if (type_check_map){
    callback(type_check_map);
    return;
  }

  checkSchema(
      obj_type, set_map,
      function(error_list){
        if (error_list.length === 0){
          const collection = db.collection(obj_type);
          collection.findOneAndUpdate(
            find_map,
            {$set: set_map},
            opt_map,
            function (error, result){
              //console.log(result);
              callback(result);
            }
          );
        }
        else {
          callback({
            error_msg: 'Input document not valid',
            error_list: error_list
          });
        }
      }
    );
};

destroyObj = function(obj_type, find_map, callback){
  var type_check_map = checkType(obj_type);

  if (type_check_map){
    callback(type_check_map);
    return;
  }

  cache.deleteKey(find_map);
  const collection = db.collection(obj_type);
  collection.deleteOne(
    find_map,
    null,
    function (error, result){
      //console.log(result);
      callback(result);
    }
  );

};

module.exports = {
  makeMongoId: mongodb.ObjectID,
  checkType: checkType,
  construct: constructObj,
  read: readObj,
  update: updateObj,
  destroy: destroyObj
};
// -----END PUBLIC METHODS -----

// -----BEGIN MOUDLE INITIALIZATION -----
console.log('** CRUD module loaded **');

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("** Connected to MongoDB **");

  db = client.db(dbName);

  clearIsOnline();
  //client.close();
});

(function(){
  var schema_name, schema_path;
  for (schema_name in objTypeMap){
    if (objTypeMap.hasOwnProperty(schema_name)){
      schema_path = __dirname + '/' + schema_name + '.json';
      loadSchema(schema_name, schema_path);
    }
  }
}());
// -----END MOUDLE INITIALIZATION -----


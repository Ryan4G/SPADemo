/*
 * routes.js - module to provide routing 
 */

// -----BEGIN MODULE SCOPE VARIABLES-----

'use strict'
var 
  configRoutes,
  loadSchema,
  checkSchema,
  fsHandle = require('fs'),
  JSV = require('JSV').JSV,
  validator = JSV.createEnvironment(),
  makeMongoId = require('mongodb').ObjectID,
  objTypeMap = {'user': {}};

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'spa';

var db = undefined;

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  assert.equal(null, err);
  console.log("** Connected to MongoDB **");

  db = client.db(dbName);

  //client.close();
});

// -----END MODULE SCOPE VARIABLES-----

// -----BEGIN MOUDLE SCOPE VARIABLES  -----
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
// -----END MOUDLE SCOPE VARIABLES  -----

// -----BEGIN PUBLIC METHOD -----
//
configRoutes = function(app, server){

  app.get('/', function( request, response){
    response.redirect('/spa.html');
  });

  app.all('/:obj_type/*?', function(request, response, next){
    response.contentType('json');

    if (objTypeMap[request.params.obj_type]){
        next();
    }
    else{
    	response.send({error_msg: request.params.obj_type + ' is not a valid object type'});
    }
  });

  app.get('/:obj_type/list', function( request, response){

  	const collection = db.collection(request.params.obj_type);
  	collection.find({}).toArray(function (err, docs){
		response.send(docs);
		//callback(docs);
	});
    //response.send({title: 'use list'});
  });

  app.post('/:obj_type/create', function(request, response){

  	var 
  	obj_map = request.body,
  	obj_type = request.params.obj_type;
  	checkSchema(
  		obj_type, obj_map,
  		function(error_list){
  			if (error_list.length === 0){
				const collection = db.collection(obj_type);
			  	collection.insertOne(
			  		obj_map
			  	)
			  	.then(function (err, result){
			  		// process result
			  		//assert.equal(null, err);
			  		//assert.equal(1, result.insertedCount);
			  		response.send(result);
			  	});
  			}
  			else {
  				response.send({
  					error_msg: 'Input document not valid',
  					error_list: error_list
  				});
  			}
  		}
  	);
  });

  app.get('/:obj_type/read/:id([0-9]+)', function(request, response){

  	var find_map = {_id: makeMongoId(request.params.id)};

  	const collection = db.collection(request.params.obj_type);
  	collection.findOne(
  		find_map
  	)
  	.then(function (err, doc){
  		// process result
  		//assert.equal(null, err);
  		response.send(doc);
  	});

  });

  app.post('/:obj_type/update/:id', function(request, response){

  	var 
  		find_map = {_id: makeMongoId(request.params.id)},
  		obj_map = request.body,
  		opt_map = {
  			returnOriginal: false, 
  			upsert: true
  		},
  		obj_type = request.params.obj_type;

	  	checkSchema(
	  		obj_type, obj_map,
	  		function(error_list){
	  			if (error_list.length === 0){
					const collection = db.collection(request.params.obj_type);
				  	collection.findOneAndReplace(
				  		find_map,
				  		obj_map,
				  		opt_map
				  	)
				  	.then(function (err, doc){
				  		// process result
				  		//assert.equal(null, err);
				  		response.send(doc);
				  	});
	  			}
	  			else {
	  				response.send({
	  					error_msg: 'Input document not valid',
	  					error_list: error_list
	  				});
	  			}
	  		}
	  	);
  });

  app.get('/:obj_type/delete/:id', function(request, response){
  	
  	var del_map = {_id: makeMongoId(request.params.id)};
  	const collection = db.collection(request.params.obj_type);
  	collection.deleteOne(
  		del_map
  	)
  	.then(function (err, result){
  		// process result
  		//assert.equal(null, err);
  		response.send(result);
  	});
  });
};

module.exports = {configRoutes: configRoutes};
// -----END PUBLIC METHOD-----

// -----BEGIN MOUDLE INITIALIZATION -----
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


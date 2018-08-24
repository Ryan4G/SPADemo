/*
 * routes.js - module to provide routing 
 */

// -----BEGIN MODULE SCOPE VARIABLES-----

'use strict'
var 
  configRoutes,
  crud = require('./crud'),
  chat = require('./chat'),
  makeMongoId = crud.makeMongoId;

// -----END MODULE SCOPE VARIABLES-----

// -----BEGIN PUBLIC METHOD -----
//
configRoutes = function(app, server){

  app.get('/', function( request, response){
    response.redirect('/spa.html');
  });

  app.all('/:obj_type/*?', function(request, response, next){
    response.contentType('json');
    next();
  });

  app.get('/:obj_type/list', function( request, response){
    crud.read(
      request.params.obj_type,
      {}, {},
      function(map_list){
        response.send(map_list);
      }
    );
  });

  app.post('/:obj_type/create', function(request, response){
    crud.construct(
      request.params.obj_type,
      request.body,
      function(result_map){
        response.send(result_map);
      }
    );
  });

  app.get('/:obj_type/read/:id', function(request, response){

  	var find_map = {_id: makeMongoId(request.params.id)};

  	crud.read(
      request.params.obj_type,
      find_map,
      {},
      function(map_list){
        response.send(map_list);
      }
    );

  });

  app.post('/:obj_type/update/:id', function(request, response){

  	var 
  		find_map = {_id: makeMongoId(request.params.id)};

	crud.update(
      request.params.obj_type,
      find_map,
      request.body,
      function(result_map){
        response.send(result_map);
      }
    );
  });

  app.get('/:obj_type/delete/:id', function(request, response){
  	
  	var del_map = {_id: makeMongoId(request.params.id)};

  	crud.destroy(
      request.params.obj_type,
      del_map,
      function(result_map){
        response.send(result_map);
      }
    );
  });

  chat.connect(server);
};

module.exports = {configRoutes: configRoutes};
// -----END PUBLIC METHOD-----

// -----BEGIN MOUDLE INITIALIZATION -----

// -----END MOUDLE INITIALIZATION -----


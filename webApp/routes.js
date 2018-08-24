/*
 * routes.js - module to provide routing 
 */

// -----BEGIN MODULE SCOPE VARIABLES-----

'use strict'
var configRoutes; 

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
    response.send({title: 'use list'});
  });

  app.post('/:obj_type/create', function(request, response){
    response.send({title: request.params.obj_type + 'created'});
  });

  app.get('/:obj_type/read/:id([0-9]+)', function(request, response){
    response.send({
      title: request.params.obj_type + ' with id ' + request.params.id + ' found'
    });
  });

  app.post('/:obj_type/update/:id([0-9]+)', function(request, response){
    response.send({
      title: request.params.obj_type + ' with id ' + request.params.id + ' updated'
    });
  });

  app.get('/:obj_type/delete/:id([0-9]+)', function(request, response){
    response.send({
      title: request.params.obj_type + ' with id ' + request.params.id + ' deleted'
    });
  });
};

module.exports = {configRoutes: configRoutes};
// -----END PUBLIC METHOD-----


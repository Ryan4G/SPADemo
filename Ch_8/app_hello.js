/*
 * app.js - Hello world
 */

var http, server;
http = require('http');
server = http.createServer( function (request, response){
	var response_text = (request.url === '/test')
	? 'you have hit the test page'
	: 'hello world';
	
	response.writeHead(200, {'Content-Type':'text/plain'});
	response.end(response_text);
}).listen(3000);

console.log( 'Listening on port %d', server.address().port);

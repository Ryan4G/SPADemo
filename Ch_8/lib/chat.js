/*
 * chat.js - module to provide chat messageing
 */

// -----BEGIN MODULE SCOPE VARIABLES-----

 'use strict';

 var
   emitUserList, signIn, signOut,
   chatObj,
   socket = require('socket.io'),
   crud = require('./crud'),
   makeMongoId = crud.makeMongoId,
   chatterMap = {};

// -----END MODULE SCOPE VARIABLES-----

// -----BEGIN UTILITY METHODS-----
// emitUserList - broadcast user list to all connected clients
//
emitUserList = function(io){
	crud.read(
		'user',
		{is_online: true},
		{},
		function(result_list){
			io
				.of('/chat')
				.emit('listchange', result_list);
		}
	);
};

// signIn - update is_online property and chatterMap
//
signIn = function(io, user_map, socket){
	crud.update(
		'user',
		{'_id': user_map._id},
		{is_online: true},
		function(result_map){
			emitUserList(io);
			user_map.is_online = true;
			socket.emit('userupdate', user_map);
		}
	);

	chatterMap[user_map._id] = socket;
	socket.user_id = user_map._id;
};

signOut = function(io, user_id){
	crud.update(
		'user',
		{'_id': user_id},
		{is_online: false},
		function(result_list) {
			emitUserList(io);
		}
	);

	delete chatterMap[user_id];
};

// -----END UTILITY METHODS-----

// -----BEGIN PUBLIC METHODS -----
chatObj = {
	connect: function(server){
		var io = socket.listen(server);

		// begin io setup
		io
			.set('blacklist', [])
			.of('/chat')
			.on('connection', function(socket){
				
				// begin adduser
				socket.on('adduser', function(user_map){
					// check login list
					
					crud.read(
						'user',
						{name: user_map.name},
						{},
						function(result_list){
							var 
								result_map,
								cid = user_map.cid;

							delete user_map.cid;

							if (result_list.length > 0){
								result_map = result_list[0];
								result_map.cid = cid;

								if (chatterMap.hasOwnProperty(result_map._id)){
									console.log(
									'** user %s has logged **', user_map.name
									);
								}
								else{
									signIn(io, result_map, socket);
								}
							}
							else{
								user_map.is_online = true;
								crud.construct(
									'user',
									user_map,
									function(result_list){
										result_map = result_list[0];
										result_map.cid = cid;
										chatterMap[result_map._id] = socket;
										socket.user_id = result_map._id;
										socket.emit('userupdate', result_map);
										emitUserList(io);
									}
								);
							}
						}
					);
				});
				// end adduser

				// end updatechat
				socket.on('updatechat', function(chat_map){
					if (chatterMap.hasOwnProperty(chat_map.dest_id)){
						chatterMap[chat_map.dest_id]
							.emit('updatechat', chat_map);
					}
					else{
						socket.emit('updatechat', {
							sender_id: chat_map.sender_id,
							msg_text: chat_map.dest_name + ' has gone offline.'
						});
					}
				});
				// end updatechat

				socket.on('leavechat', function(){
					console.log(
						'** user %s logged out **', socket.user_id
					);

					signOut(io, socket.user_id);
				});

				socket.on('disconnect', function(){
					console.log(
						'** user %s closed browser window or tab **', socket.user_id
					);

					signOut(io, socket.user_id);
				});

				socket.on('updateavatar', function(avtr_map){
					crud.update(
						'user',
						{'_id': makeMongoId(avtr_map.person_id)},
						{css_map: avtr_map.css_map},
						function(result_list){
							emitUserList(io);
						}
					);

				});
			});

		// end io setup
		return io;
	}
};

module.exports = chatObj;

// -----END PUBLIC METHODS -----
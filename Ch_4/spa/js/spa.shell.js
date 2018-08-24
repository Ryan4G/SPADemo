/*
 * spa.shell.js
 * Shell module for SPA
 */
 
/*jslint      browser:true,   continue:true,
  devel:true, indent:2,       maxerr:50,
  newcap:true,nomen:true, plusplus:true,
  regexp:true,sloppy:true,vars:false,
  white:true
*/
/*global $,spa */

spa.shell = (function(){
	//------BEGIN MODULE SCOPE VARIABLES------
	var 
	  configMap = {
			main_html : String()
			+'<div class="spa-shell-head">'
      +  '<div class="spa-shell-head-logo"></div>'
      +  '<div class="spa-shell-head-acct"></div>'
      +  '<div class="spa-shell-head-search"></div>'
      +'</div>'
      +'<div class="spa-shell-main">'
      +  '<div class="spa-shell-main-nav"></div>'
      +  '<div class="spa-shell-main-content"></div>'
      +'</div>'
      +'<div class="spa-shell-foot"></div>'
      +'<div class="spa-shell-modal"></div>',
			chat_extend_time:1000,
			chat_retract_time:600,
			chat_extend_height:450,
			chat_retract_height:15,
			chat_extended_title:'Click to retract',
			chat_retracted_title:'Click to extend',
			resize_interval: 200,
			
			anchor_schema_map:{
			  chat:{opened:true, closed:true}
			}
		},
		
		stateMap = {
			anchor_map:{},
			$container: undefined,
			resize_idto: undefined
		},
		
		jqueryMap = {},
		
		setJqueryMap, initModule, toggleChat, onClickChat,
		copyAnchorMap, changeAnchorPart, onHashchange,
		setChatAnchor, onResize;
		
	//------END MODULE SCOPE VARIABLES------
	
	//------BEGIN UTILITY METHODS------
	copyAnchorMap = function(){
	  return $.extend(true, {}, stateMap.anchor_map);
		$.ex
	};
	//------END UTILITY METHODS------
	
	//------BEGIN DOM METHODS------
	// Begin DOM Method /setJqueryMap/
	setJqueryMap = function(){
		var $container = stateMap.$container;
		jqueryMap = {
			$container : $container
		};
	};
	// End DOM Method /setJqueryMap/
	
	// Begin DOM Method /changeAnchorPart/
	changeAnchorPart = function(arg_map){
	  var
		  anchor_map_revise = copyAnchorMap(),
			bool_return = true,
			key_name, key_name_dep;
			
		KEYVAL:
		for (key_name in arg_map){
		  if (arg_map.hasOwnProperty(key_name)){
				// skip dependent keys during iteration
			  if(key_name.indexOf('_') === 0){ continue KEYVAL; }
				// update independent keys during iteration
				anchor_map_revise[key_name] = arg_map[key_name];
				// update matching dependent key
				key_name_dep = '_' + key_name;
				
				if (arg_map[key_name_dep]){
				  anchor_map_revise[key_name_dep] = arg_map[key_name_dep];  
				}
				else{
				  delete anchor_map_revise[key_name_dep];
				  delete anchor_map_revise['_s' + key_name_dep];
				}
			}
		}
		
		try{
		  $.uriAnchor.setAnchor(anchor_map_revise);
		}
		catch(error){
		  $.uriAnchor.setAnchor(stateMap.anchor_map, null, true);
			bool_return = false;
		}
		
		return bool_return;
	};
	// End DOM Method /changeAnchorPart/
	
	//------END DOM METHODS------
	
	//------BEGIN EVENT HANDLERS------
	
	// Begin Event handler /onClickChat/
	onClickChat = function(event){
		changeAnchorPart({
		  chat:(stateMap.is_chat_retracted ? 'open' : 'closed')
	  });
		
		//onHashchange();	
		return false;
	}
	// End Event handler /onClickChat/
	
	// Begin Event handler /onHashchange/
	onHashchange = function(event){
	  var 
		  anchor_map_previous = copyAnchorMap(),
			anchor_map_proposed,
			_s_chat_previous, _s_chat_proposed, s_chat_proposed,
			is_ok = true;
			
		try{
	    anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		}
		catch(error){
		  $.uriAnchor.setAnchor(anchor_map_previous, null, true);
			return false;
		}
		stateMap.anchor_map = anchor_map_proposed;
		
		_s_chat_previous = anchor_map_previous._s_chat;
		_s_chat_proposed = anchor_map_proposed._s_chat;
		
		if (!anchor_map_previous
		    || _s_chat_previous !== _s_chat_proposed
				){
		  s_chat_proposed = anchor_map_proposed.chat;
			switch(s_chat_proposed){
			  case 'opened':
				  is_ok = spa.chat.setSliderPosition('opened');
					break;
			  case 'closed':
				  is_ok = spa.chat.setSliderPosition('closed');
					break;
				default:
				  spa.chat.setSliderPosition('closed');
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
			}
		}
		
		if (!is_ok){
		  if(anchor_map_previous){
			  $.uriAnchor.setAnchor(anchor_map_previous, null, true);
				stateMap.anchor_map = anchor_map_previous;
			}
			else {
			  delete anchor_map_proposed.chat;
				$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
			}
		}
		
		return false;
	};
	// End Event handler /onHashchange/
	
	// Begin Event handler /onResize/
	onResize = function(){
		if (stateMap.resize_idto){ return true;}
		
		spa.chat.handleResize();
		
		stateMap.resize_idto = setTimeout(
		  function (){ stateMap.resize_idto = undefined; },
			configMap.resize_interval
		);
		
		return true;
	};
	
	// End Event handler /onResize/
	
	//------END EVENT HANDLERS------
	
	//------BEIGIN CALLBACKS------
	
	// Begin callback method /setChatAnchor/
	setChatAnchor = function(position_type){
	  return changeAnchorPart({chat: position_type});
	};
	// End callback method /setChatAnchor/
	
	//------END CALLBACKS------
	
	//------BEGIN PUBLIC METHODS------
	// Begin Public method /initModule/
	initModule = function($container){
		stateMap.$container = $container;
		$container.html(configMap.main_html);
		setJqueryMap();
		
		// configure uriAnchor to use our schema
		$.uriAnchor.configModule({
		  schema_map:configMap.anchor_schema_map
	  });
		
		// configure and initialize feature modules
		spa.chat.configModule({
		  set_chat_anchor: setChatAnchor,
		  chat_model: spa.model.chat,
		  people_model: spa.model.people	
		});
		
		spa.chat.initModule(jqueryMap.$container);
		
		// Handle URI anchor change events
		$(window)
		  .bind('resize', onResize)
		  .bind('hashchange', onHashchange)
			.trigger('hashchange');
			
		};
	// End Public method /initModule/
	
	return {initModule : initModule};
	//------END PUBLIC METHODS------
	}());
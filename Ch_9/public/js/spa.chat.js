/*
 * spa.chat.js
 * Chat feature module for SPA
 */
 
/*jslint      browser:true,   continue:true,
  devel:true, indent:2,       maxerr:50,
  newcap:true,nomen:true, plusplus:true,
  regexp:true,sloppy:true,vars:false,
  white:true
*/

/*global $,spa */

spa.chat = (function(){
	'use strict';
  //-----BEGIN MODULE SCOPE VARIABLES-----
	var
	  configMap = {
		  main_html: String()
			+ '<div class="spa-chat">'
			+ '  <div class="spa-chat-head">'
			+ '	   <div class="spa-chat-head-toggle">+</div>'
			+ '	   <div class="spa-chat-head-title">Chat</div>'
			+ '  </div>'
			+ '  <div class="spa-chat-closer">x</div>'
			+ '  <div class="spa-chat-sizer">'
			+ '    <div class="spa-chat-list">'
			+	'      <div class="spa-chat-list-box"></div>'
			+ '    </div>'
			+ '	   <div class="spa-chat-msg">'
			+ '      <div class="spa-chat-msg-log"></div>'
			+ ' 	   <div class="spa-chat-msg-in">'
			+ ' 	     <form class="spa-chat-msg-form">'
			+ ' 		     <input type="text"/>'
			+ ' 			   <input type="submit" style="display:none"/>'
			+ ' 			   <div class="spa-chat-msg-send">send</div>'
			+ ' 		   </form>'
			+ ' 	   </div>'
			+ ' 	 </div>'
			+ '  </div>'
			+ '</div>',
			
			settable_map: {
			  slider_open_time: true,
			  slider_close_time: true,
			  slider_opened_em: true,
			  slider_closed_em: true,
			  slider_opened_title: true,
			  slider_closed_title: true,
				
				chat_model: true,
			  people_model: true,
			  set_chat_anchor: true	
			},
			
			slider_open_time: 250,
			slider_close_time: 250,
			slider_opened_em : 18,
			slider_closed_em: 2,
			slider_opened_title: 'Tap to close',
			slider_closed_title: 'Tap to open',
			slider_opened_min_em: 10,
			window_height_min_em: 20,
			
			chat_model: null,
			people_model: null,
			set_chat_anchor: null
		},
		
		stateMap = {
			$append_target: null,
			position_type: 'closed',
			px_per_em: 0,
			slider_hidden_px: 0,
			slider_closed_px: 0,
			slider_opened_px: 0
		},
		
		jqueryMap = {},
		
		setJqueryMap, configModule, initModule,
		getEmSize, setPxSizes, setSliderPosition,
		removeSlider, handleResize, onClickCloser,
		scrollChat, writeChat, writeAlert, clearChat,
		onTapToggle, onSubmitMsg, onTapList, onSetchatee,
		onUpdatechat, onListchange, onLogin, onLogout;
		
  //-----END MODULE SCOPE VARIABLES-----
	
	//------BEGIN UTILITY METHODS------
	//------END UTILITY METHODS------
	
	//------BEGIN DOM METHODS------
	// Begin DOM Method /setJqueryMap/
	setJqueryMap = function(){
		var 
		  $append_target = stateMap.$append_target,
			$slider = $append_target.find('.spa-chat');
			
		jqueryMap = {
			$slider: $slider,
			$head: $slider.find('.spa-chat-head'),
			$toggle: $slider.find('.spa-chat-head-toggle'),
			$title: $slider.find('.spa-chat-head-title'),
			$sizer: $slider.find('.spa-chat-sizer'),
			$list_box: $slider.find('.spa-chat-list-box'),
			$msg_log: $slider.find('.spa-chat-msg-log'),
			$msg_in: $slider.find('.spa-chat-msg-in'),
			$input: $slider.find('.spa-chat-msg-in input[type=text]'),
			$send: $slider.find('.spa-chat-msg-send'),
			$form: $slider.find('.spa-chat-msg-form'),
			$window: $(window),
		};
	};
	// End DOM Method /setJqueryMap/
	
	// Begin DOM Method /setPxSizes/
	setPxSizes = function(){
	  var px_per_em, opened_height_em, window_height_em;
		px_per_em = spa.util_b.getEmSize(jqueryMap.$slider.get(0));
		window_height_em = Math.floor(
		  (jqueryMap.$window.height() / px_per_em) + 0.5
	  );
		
		opened_height_em 
		  = window_height_em > configMap.window_height_min_em
			? configMap.slider_opened_em
			: configMap.slider_opened_min_em;
		
		stateMap.px_per_em = px_per_em;
		stateMap.slider_closed_px = configMap.slider_closed_em * px_per_em;
		stateMap.slider_opened_px = opened_height_em * px_per_em;
		jqueryMap.$sizer.css({
		  height: (opened_height_em - 2) * px_per_em
		});
	};
	// End DOM Method /setPxSizes/
	
	//------END DOM METHODS------
	
	//------BEGIN EVENT HANDLERS------
	
	// Begin Event Handle /onTapToggle/
	onTapToggle = function(event){
	  var set_chat_anchor = configMap.set_chat_anchor;
		if (stateMap.position_type === 'opened'){
		  set_chat_anchor('closed');
		}
		else if (stateMap.position_type === 'closed'){
		  set_chat_anchor('opened');
		}
		
		return false;
  };
	// End Event Handle /onTapToggle/
		
	// Begin Event Handle /onClickCloser/
	onClickCloser = function(event){
	  removeSlider();
		
		return false;
  };
	// End Event Handle /onClickCloser/
	
	// Begin Event Handle /onSubmitMsg/
	onSubmitMsg = function(event){
	  var msg_text = jqueryMap.$input.val();
		if (msg_text.trim() === '') {return false;}
		configMap.chat_model.send_msg(msg_text);
		
		jqueryMap.$input.focus();
		jqueryMap.$send.addClass('spa-x-select');
		
		setTimeout(
		function(){
			jqueryMap.$send.removeClass('spa-x-select');
		},
		250);
		
		return false;
	};
	// End Event Handle /onSubmitMsg/
	
	// Begin Event Handle /onTapList/
	onTapList = function(event){
	  var $trapped = $(event.elem_target), chatee_id;
		if (!$trapped.hasClass('spa-chat-list-name')) {return false;}
		
		chatee_id = $trapped.attr('data-id');
		if (!chatee_id) {return false;}
		
		configMap.chat_model.set_chatee(chatee_id);
		return false;
	};
	// End Event Handle /onTapList/
	
	// Begin Event Handle /onSetchatee/
	onSetchatee = function(event, arg_map){
	  var 
		  new_chatee = arg_map.new_chatee,
			old_chatee = arg_map.old_chatee;
			
		jqueryMap.$input.focus();
		if (!new_chatee){
		  if (old_chatee){
			  writeAlert(old_chatee.name + 'has left the chat');
			}
			else{
			  writeAlert('Your friend has left the chat');
			}
			
			jqueryMap.$title.text('Chat');
			return false;
		}
		
		jqueryMap.$list_box
		  .find('.spa-chat-list-name')
			.removeClass('spa-x-select')
			.end()
			.find('[data-id='+ arg_map.new_chatee.id +']')
			.addClass('spa-x-select');
			
		writeAlert('Now chatting with ' + arg_map.new_chatee.name);
		jqueryMap.$title.text('Chat with ' + arg_map.new_chatee.name);
		return true;
	};
	// End Event Handle /onSetchatee/
	
	// Begin Event Handle /onListchange/
	onListchange = function(event){
	  var 
		  list_html = String(),
			people_db = configMap.people_model.get_db(),
			chatee = configMap.chat_model.get_chatee();
			
	  people_db().each(function(person, idx){
		  var select_class = '';
			
			if (person.get_is_anon() || person.get_is_user()){
			  return true;
			}
			
			if (chatee && chatee.id === person.id){
			  select_class = 'spa-x-select';
			}
			
			list_html
			  += '<div class = "spa-chat-list-name'
				+ select_class + '" data-id="' + person.id + '">'
				+ spa.util_b.encodeHtml(person.name) + '</div>';
		});
		
		if (!list_html){
		  list_html = String()
			  + '<div class = "spa-chat-list-note">'
				+ 'To chat alone is the fate of all greate souls...<br><br>'
				+ 'No one is online'
				+ '</div>';
			clearChat();
		}
		
		jqueryMap.$list_box.html(list_html);
	};
	// End Event Handle /onListchange/
	
	// Begin Event Handle /onUpdatechat/
	onUpdatechat = function(event, msg_map){
	  var 
		  is_user,
			sender_id = msg_map.sender_id,
			msg_text = msg_map.msg_text,
			chatee = configMap.chat_model.get_chatee() || {},
			sender = configMap.people_model.get_by_cid(sender_id);
			
		if (!sender){
		  writeAlert(msg_text);
			return false;
		}
		
		is_user = sender.get_is_user();
		
		if(!(is_user || sender_id === chatee.id)){
		  configMap.chat_model.set_chatee(sender_id);
		}
		
		writeChat(sender.name, msg_text, is_user);
		
		if (is_user){
		  jqueryMap.$input.val('');
			jqueryMap.$input.focus();
		}
	};
	// End Event Handle /onUpdatechat/
	
	// Begin Event Handle /onLogin/
	onLogin = function(event, login_user){
	  configMap.set_chat_anchor('opened');
	};
	// End Event Handle /onLogin/
	
	// Begin Event Handle /onLogout/
	onLogout = function(event, login_user){
	  configMap.set_chat_anchor('closed');
		jqueryMap.$title.text('Chat');
		clearChat();
	};
	// End Event Handle /onLogout/
	
	//------END EVENT HANDLERS------
	
	//------BEGIN PRIVATE METHODS------
	// Begin private DOM methods to manage chat message
	// Begin method /scrollChat/
	scrollChat = function(){
	  var $msg_log = jqueryMap.$msg_log;
		$msg_log.animate(
		  { 
		    scrollTop: $msg_log.prop("scrollHeight") - $msg_log.height()
		  },
		  150
		);
	};
	// End method /scrollChat/
	
	// Begin method /writeChat/
	writeChat = function(person_name, text, is_user){
	  var msg_class = is_user ? 'spa-chat-msg-log-me' : 'spa-chat-msg-log-msg';
	  
		jqueryMap.$msg_log.append(
		  '<div class="' + msg_class + '">'
		  + spa.util_b.encodeHtml(person_name) + ": "
			+ spa.util_b.encodeHtml(text) + '</div>'
		);
		
		scrollChat();
	};
	// End method /writeChat/
	
	// Begin method /writeAlert/
	writeAlert = function(alert_text){
	  jqueryMap.$msg_log.append(
		  '<div class="spa-chat-msg-log-alert">'
			+ spa.util_b.encodeHtml(alert_text)
			+ '</div>'
		);
		
		scrollChat();
	};
	// End method /writeAlert/
	
	// Begin method /clearChat/
	clearChat = function(){
	  jqueryMap.$msg_log.empty();
	};
	// End method /clearChat/
	
	// End private DOM methods to manage chat message
	//------END PRIVATE METHODS------
	
	//------BEGIN PUBLIC METHODS------
	// Begin public method /setSliderPosition/
	setSliderPosition = function(position_type, callback){
	  var 
		  height_px, animate_time, slider_title, toggle_text;
	  
		// if user is anon user close
		if (position_type === "opened"
		  && configMap.people_model.get_user().get_is_anon()
			){return false;}
				
		if (stateMap.position_type === position_type){
			if (position_type === "opened"){
			  jqueryMap.$input.focus();
			}
		  return true;
		}
		
		switch (position_type){
		  case 'opened':
			  height_px = stateMap.slider_opened_px;
				animate_time = configMap.slider_open_time;
				slider_title = configMap.slider_opened_title;
				toggle_text = '=';
				jqueryMap.$input.focus();
		  break;
				
			case 'hidden':
			  height_px = 0;
				animate_time = configMap.slider_open_time;
				slider_title = '';
				toggle_text = '+';
		  break;
			
			case 'closed':
			  height_px = stateMap.slider_closed_px;
				animate_time = configMap.slider_close_time;
				slider_title = configMap.slider_closed_title;
				toggle_text = '+';
			break;
			
			default: return false;
		}
		
		stateMap.position_type = '';
		jqueryMap.$slider.animate(
	    {height: height_px},
			animate_time,
			function(){
			  jqueryMap.$toggle.prop('title', slider_title);
			  jqueryMap.$toggle.text(toggle_text);
				stateMap.position_type = position_type;
				if (callback){
				  callback(jqueryMap.$slider);
				}
			}
		);
		
		return true;
	};
	// End public method /setSliderPosition/
	
	// Begin Public method /configModule/
	configModule = function(input_map){
	  spa.util.setConfigMap({
		  input_map: input_map,
			settable_map: configMap.settable_map,
			config_map: configMap
		});
		return true;
	};
	
	// End Public method /configModule/
	
	// Begin Public method /initModule/
	initModule = function($append_target){
		var $list_box;
		
		stateMap.$append_target = $append_target;
		$append_target.append(configMap.main_html);
		setJqueryMap();
		setPxSizes();
		
		jqueryMap.$toggle.prop('title', configMap.slider_opened_title);
		//jqueryMap.$head.click(onClickToggle);
		//jqueryMap.$closer.click(onClickCloser);
		stateMap.position_type = 'closed';
		
		// Have $list_box subscribe to jQuery global events
		$list_box = jqueryMap.$list_box;
		$.gevent.subscribe($list_box, 'spa-listchange', onListchange);
		$.gevent.subscribe($list_box, 'spa-setchatee', onSetchatee);
		$.gevent.subscribe($list_box, 'spa-updatechat', onUpdatechat);
		$.gevent.subscribe($list_box, 'spa-login', onLogin);
		$.gevent.subscribe($list_box, 'spa-logout', onLogout);
		
		// bind user input events
		jqueryMap.$head.bind('utap', onTapToggle);
		jqueryMap.$list_box.bind('utap', onTapList);
		jqueryMap.$send.bind('utap', onSubmitMsg);
		jqueryMap.$form.bind('submit', onSubmitMsg);
	};
	
	// End Public method /initModule/
	
	// Begin Public method /removeSlider/
	removeSlider = function(){
	  if (jqueryMap.$slider){
			
			jqueryMap.$slider.animate(
				{height: 0},
				configMap.slider_close_time,
				function(){
					this.remove();
				}
			);
			
			jqueryMap = {};
		}
		
		stateMap.$append_target = null;
		stateMap.position_type = 'closed';
		
		configMap.chat_model = null;
		configMap.people_model = null;
		configMap.set_chat_anchor = null;
		
		return true;
	};
	// End Public method /removeSlider/
	
	// Begin Public method /handleResize/
	handleResize = function(){
	  if (!jqueryMap.$slider){
			return false;
		}
		
		setPxSizes();
		
		if (stateMap.position_type === 'opened'){
		  jqueryMap.$slider.css({
			  height: stateMap.slider_opened_px
			});
		}
		
		return true;
	};
	// End Public method /handleResize/
	
	// return public methods
	return {
		setSliderPosition: setSliderPosition,
		configModule: configModule,
		initModule : initModule,
		removeSlider: removeSlider,
		handleResize: handleResize
	};
	//------END PUBLIC METHODS------
	
}());
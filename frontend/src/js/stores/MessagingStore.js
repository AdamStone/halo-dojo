"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    merge = require('react/lib/merge');

var ActionCreators = require('../actions/ActionCreators'),
    Constants = require('../constants/Constants'),
    utils = require('../../../../shared/utils');

var UserStore = require('./UserStore');

var _dispatchToken;
var _data;


/*
_data model: {
  conversations: {

    gamertag: {
      minimized: bool,
      closed: bool,
      lastTime: int seconds,
      messages: [
        {time: int seconds,
         text: 'message',
         to: 'gamertag',
         from: 'gamertag'}
      ],
      unread: bool
    },

    ...
  }
}
*/


var _getInitialState = function() {
  return {
    conversations: {}
  };
};

if (!sessionStorage._MessagingStore) {
  _data = _getInitialState();
}
else {
  _data = JSON.parse(sessionStorage._MessagingStore);
}

var MessagingStore = merge(EventEmitter.prototype, {

  get: function() {
    return utils.copy(_data);
  },

  emitChange: function() {
    this.emit('change');
  },

  addChangeListener: function(callback) {
    this.on('change', callback);
  },

  removeChangeListener: function(callback) {
    this.removeListener('change', callback);
  }

});


//entry: {
//  text: data.text,
//  from: gamertag,
//  to: data.recipient,
//  time: Math.floor(new Date().getTime()/1000)
//}

var initConversation = function(gamertag, data) {
  // add gamertag if not already known, else ignore
  if (!(gamertag in _data.conversations)) {
    _data.conversations[gamertag] = {
      minimized: true,
      closed: true,
      lastTime: data.lastTime,
      messages: data.messages,
      unread: data.unread
    };
  }
};


var updateConversation = function(gamertag, messages) {
  if (gamertag in _data.conversations) {
    if (messages) {
      // got new entry in existing conversation
      var convo = _data.conversations[gamertag];

      messages.forEach(function(message) {
        if (message.time > convo.lastTime) {
          convo.lastTime = message.time;
        }
        convo.messages.push(message);
      });

      if (convo.closed) {
        _data.conversations[gamertag].closed = false;
        _data.conversations[gamertag].minimized = false;
      }
    }
  }
  else if (messages) {
    // got first entries of new conversation

    var lastTime = 0;
    messages.forEach(function(message) {
      if (message.time > lastTime) {
        lastTime = message.time;
      }
    });
    _data.conversations[gamertag] = {
      minimized: false,
      closed: false,
      lastTime: lastTime,
      messages: messages,
      unread: false
    };
  }
};


_dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  var gamertag = action.data.gamertag,
      convo = _data.conversations[gamertag];

  switch(action.actionType) {

    case Constants.Messaging.MINIMIZED:
      convo.minimized = true;
      break;

    case Constants.Messaging.EXPANDED:
      convo.minimized = false;
      convo.closed = false;

      if (!convo.messages.length) {
        console.log(gamertag);
        ActionCreators.getMessages(gamertag,
                                   function(err) {
          if (err) {
            console.log(err);
          }
        });
      }
      break;

    case Constants.Messaging.CLOSED:
      convo.minimized = true;
      convo.closed = true;
      break;

    case Constants.Messaging.SENT_MESSAGE:
      updateConversation(action.data.to, [action.data]);
      break;

    case Constants.Messaging.RECEIVED_MESSAGE:
      updateConversation(action.data.from, [action.data]);
      break;

    case Constants.Messaging.GOT_CONVOS:
      var data = action.data;

      for (var i=0; i < data.length; i++) {
        for (gamertag in data[i]) {
          // data[i][gamertag] = {lastTime:, messages:[], unread:}
          initConversation(gamertag, data[i][gamertag]);
        }
      }
      break;

    case Constants.Messaging.GOT_MESSAGES:
      var messages = action.data.messages;
      updateConversation(gamertag, messages);
      break;

    case Constants.Messaging.MARKED_READ:
      convo.unread = false;
      break;

    case Constants.User.CONNECTED:
      AppDispatcher.waitFor([UserStore.getDispatchToken()]);
      ActionCreators.getConvos(function(err) {
        if (err) {
          console.log(err);
        }
      });
      break;

    case Constants.User.LOGGED_OUT:
      AppDispatcher.waitFor([UserStore.getDispatchToken()]);
      _data = _getInitialState();
      break;

    default:
      return true;
  }
  sessionStorage._MessagingStore = JSON.stringify(_data);
  MessagingStore.emitChange();
  return true;
});

module.exports = MessagingStore;

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


if (!sessionStorage._MessagingStore) {
  _data = {
    conversations: {}
  };
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
//  message: data.message,
//  from: gamertag,
//  to: data.recipient,
//  time: Math.floor(new Date().getTime()/1000)
//}

var initConversation = function(gamertag, entries) {
  // add gamertag if not already known, else ignore
  if (!(gamertag in _data.conversations)) {
    _data.conversations[gamertag] = {
      minimized: true,
      closed: true,
      conversation: entries
    };
  }
};


var updateConversation = function(gamertag, entries) {
  if (gamertag in _data.conversations) {
    if (entries) {
      // got new entry in existing conversation
      var convo = _data.conversations[gamertag];

      entries.forEach(function(entry) {
        convo.conversation.push(entry);
      });

      if (convo.closed) {
        _data.conversations[gamertag].closed = false;
        _data.conversations[gamertag].minimized = false;
      }
    }
  }
  else if (entries) {
    // got first entry of new conversation
    _data.conversations[gamertag] = {
      minimized: false,
      closed: false,
      conversation: entries
    };
  }
  else {
    // got informed that a conversation exists
    _data.conversations[gamertag] = {
      minimized: true,
      closed: true,
      conversation: []
    };
  }
};


_dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;

  var gamertag = action.data.gamertag;

  switch(action.actionType) {

    case Constants.Messaging.MINIMIZED:
      _data.conversations[gamertag].minimized = true;
      break;

    case Constants.Messaging.EXPANDED:
      _data.conversations[gamertag].minimized = false;
      break;

    case Constants.Messaging.CLOSED:
      _data.conversations[gamertag].minimized = true;
      _data.conversations[gamertag].closed = true;
      break;

    case Constants.Messaging.SENT_MESSAGE:
      updateConversation(action.data.to, [action.data]);
      break;

    case Constants.Messaging.RECEIVED_MESSAGE:
      updateConversation(action.data.from, [action.data]);
      break;

    case Constants.Messaging.GOT_CONVOS:
      console.log('MessagingStore got convos');
      var data = action.data;
      console.log(data);
      for (gamertag in data) {
        initConversation(gamertag, data[gamertag]);
      }
      break;

    case Constants.User.CONNECTED:
      AppDispatcher.waitFor([UserStore.getDispatchToken()]);
      console.log('getting convos');
      ActionCreators.getConvos();
      break;

    default:
      return true;
  }
  sessionStorage._MessagingStore = JSON.stringify(_data);
  MessagingStore.emitChange();
  return true;
});

module.exports = MessagingStore;

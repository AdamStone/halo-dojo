var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter;
    merge = require('react/lib/merge');

var Constants = require('../constants/Constants'),
    utils = require('../../../../shared/utils');


var _dispatchToken;
var _data;


if (!sessionStorage._MessagingStore)
  _data = {

  };
else
  _data = JSON.parse(sessionStorage._MessagingStore);


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
  

    

var updateConversation = function(gamertag, entry) {
  if (gamertag in _data) {
    var convo = _data[gamertag];
    convo.conversation.push(entry);
    if (convo.closed) {
      _data[gamertag].closed = false;
      _data[gamertag].minimized = false;
    }
  }
  else {
    _data[gamertag] = {
      minimized: false,
      closed: false,
      conversation: [entry]
    };
  }
};


AppDispatcher.register(function(payload) {
  var action = payload.action;

  var gamertag = action.data.gamertag;
  
  switch(action.actionType) {
      
    case Constants.Messaging.SENT_MESSAGE:
      console.log('message data');
      console.log(action.data);
      updateConversation(action.data.to, action.data);
      break;
      
    case Constants.Messaging.RECEIVED_MESSAGE:
      updateConversation(action.data.from, action.data);
      break;
      
    case Constants.Messaging.MINIMIZED:
      _data[gamertag].minimized = true;
      break;
      
    case Constants.Messaging.EXPANDED:
      _data[gamertag].minimized = false;
      break;
      
    case Constants.Messaging.CLOSED:
      var gamertag = action.data.gamertag;
      _data[gamertag].minimized = true;
      _data[gamertag].closed = true;
      break;
      
    default:
      return true;
  }
  sessionStorage._MessagingStore = JSON.stringify(_data);
  MessagingStore.emitChange();
  return true;
});

module.exports = MessagingStore;
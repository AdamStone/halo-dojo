var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    merge = require('react/lib/merge');

var Constants = require('../constants/Constants'),
    Server = require('../utils/ServerAPI'),
    utils = require('../../../../shared/utils');



var _dispatchToken;
var _data;
var _meta = {};

if (!sessionStorage._UserStore) {
  _data = {
    token: null,
    gamertags: null,
    main: null,
    connected: null,
    status: null
  };
  _meta.cached = false;
}
else {
  _data = JSON.parse(sessionStorage._UserStore);
  Server.auth.setToken(_data.token);
  _meta.cached = true;
}
  
var UserStore = merge(EventEmitter.prototype, {
  
  cached: function() {
    return _meta.cached;
  },
  
  get: function() {
    return utils.copy(_data);
  },
  
  getDispatchToken: function() {
    return _dispatchToken;
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


_dispatchToken = AppDispatcher.register(function(payload) {
  var action = payload.action;
  
  switch (action.actionType) {
      
    case Constants.User.AUTHENTICATED:
      _data.token = action.data.token;
      Server.auth.setToken(_data.token);
      break;
      
    case Constants.User.LOGGED_OUT:
      _data.token = null;
      _data.connected = null;
      break;
      
    case Constants.User.CONNECTED:
      _data.connected = action.data.gamertag;
      break;
      
    case Constants.User.DISCONNECTED:
      _data.connected = null;
      break;
      
    case Constants.User.UPDATE_USER_DATA:
      _data = utils.update(_data, action.data);
      break;
      
    case Constants.User.UPDATE_GAMERTAGS:
      _data.gamertags = action.data.gamertags;
      break;
      
    case Constants.User.STATUS_UPDATE:
      _data.status = action.data.status;
      break;
      
    default: 
      return true
  }
  sessionStorage._UserStore = JSON.stringify(_data);
  UserStore.emitChange();
  return true;
});

module.exports = UserStore;
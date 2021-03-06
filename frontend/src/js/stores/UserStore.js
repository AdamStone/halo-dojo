"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    merge = require('react/lib/merge');

var Constants = require('../constants/Constants'),
    utils = require('../../../../shared/utils');


var _dispatchToken,
    _data;

var _getInitialState = function() {
  return {
    token: null,
    gamertags: null,
    main: null,
    connected: false,
    status: null,
    cached: false
  };
};


if (!sessionStorage._UserStore) {
  _data = _getInitialState();
}
else {
  _data = JSON.parse(sessionStorage._UserStore);
}


var UserStore = merge(EventEmitter.prototype, {

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
      break;

    case Constants.User.LOGGED_OUT:
      _data = _getInitialState();
      break;

    case Constants.User.CONNECTED:
      _data.connected = true;
      break;

    case Constants.User.DISCONNECTED:
      _data.connected = false;
      break;

    case Constants.User.LOST_CONNECTION:
      // TODO display notification
      _data.connected = false;
      break;

    case Constants.User.UPDATE_USER_DATA:
      _data = utils.update(_data, action.data);
      _data.cached = true;
      break;

    case Constants.User.UPDATE_GAMERTAGS:
      _data.gamertags = action.data.gamertags;
      _data.main = action.data.main;
      break;

    default:
      return true;
  }

  // caching
  if (_data.token) {
    sessionStorage._UserStore = JSON.stringify(_data);
  }
  else {
    sessionStorage._UserStore = '';
    _data.cached = false;
  }

  UserStore.emitChange();
  return true;

});

module.exports = UserStore;

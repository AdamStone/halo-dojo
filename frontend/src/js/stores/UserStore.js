"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    merge = require('react/lib/merge');

var Constants = require('../constants/Constants'),
    utils = require('../../../../shared/utils');


var _dispatchToken,
    _data,
    _cached;

var _getInitialState = function() {
  return {
    token: null,
    gamertags: null,
    main: null,
    connected: null,
    status: null
  };
};


if (!sessionStorage._UserStore) {
  _data = _getInitialState();
  _cached = false;
}
else {
  _data = JSON.parse(sessionStorage._UserStore);
  _cached = true;
}


var UserStore = merge(EventEmitter.prototype, {

  cached: function() {
    return _cached;
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
      break;

    case Constants.User.LOGGED_OUT:
      _data = _getInitialState();
      break;

    case Constants.User.CONNECTED:
      _data.connected = action.data.gamertag;
      break;

    case Constants.User.DISCONNECTED:
      _data.connected = null;
      break;

    case Constants.User.UPDATE_USER_DATA:
      _data = utils.update(_data, action.data);
      _cached = true;
      break;

    case Constants.User.UPDATE_GAMERTAGS:
      _data.gamertags = action.data.gamertags;
      _data.main = action.data.main;
      break;

    case Constants.User.STATUS_UPDATE:
      _data.status = action.data.status;
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
    _cached = false;
  }

  UserStore.emitChange();
  return true;

});

module.exports = UserStore;

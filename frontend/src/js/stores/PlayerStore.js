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
    data: {},
    cached: false
  };
};

if (!sessionStorage._PlayerStore) {
  _data = _getInitialState();
}
else {
  _data = JSON.parse(sessionStorage._PlayerStore);
}


var PlayerStore = merge(EventEmitter.prototype, {

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

    case Constants.Player.GOT_PLAYER_DATA:
      _data.data = utils.update(_data.data,
                                      action.data);
      _data.cached = true;
      break;

    default:
      return true;
  }

  sessionStorage._PlayerStore = JSON.stringify(_data);
  PlayerStore.emitChange();
  return true;
});

module.exports = PlayerStore;

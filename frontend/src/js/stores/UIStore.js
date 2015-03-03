"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    merge = require('react/lib/merge');

var Constants = require('../constants/Constants'),
    utils = require('../../../../shared/utils');


var _dispatchToken;
var _data;

if (!sessionStorage._UIStore) {
  _data = {
    overlay: null
  };
}
else {
  _data = JSON.parse(sessionStorage._UIStore);
}


var UIStore = merge(EventEmitter.prototype, {
  
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
    
    case Constants.UI.SHOW_OVERLAY:
      _data.overlay = action.data.overlay;
      break;
      
    default:
      return true;
  }
  sessionStorage._UIStore = JSON.stringify(_data);
  UIStore.emitChange();
  return true;
});

module.exports = UIStore;
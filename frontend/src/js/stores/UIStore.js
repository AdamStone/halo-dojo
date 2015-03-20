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
    overlay: Constants.UI.OVERLAY_MESSAGE
  };
}
else {
  _data = JSON.parse(sessionStorage._UIStore);
}

//if (window.location.pathname.split('/')[1] === 'activate') {
//  _data.overlay = Constants.UI.OVERLAY_ACTIVATE;
//}


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

    case Constants.UI.SET_URL_PATH:
      if (window.location.pathname !== action.data.path) {
        window.location.href = window.location.origin +
                               action.data.path;
      }
      break;

    default:
      return true;
  }
  sessionStorage._UIStore = JSON.stringify(_data);
  UIStore.emitChange();
  return true;
});

module.exports = UIStore;

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    merge = require('react/lib/merge');

var Constants = require('../constants/Constants'),
    UserStore = require('../stores/UserStore'),
    ActionCreators = require('../actions/ActionCreators'),
    Server = require('../utils/ServerAPI'),
    utils = require('../../../../shared/utils'),
    ProfileActions = require('../actions/ProfileActions');



var _dispatchToken;
var _data;
var _meta = {};

var _saveTimer;
var _timer = function() {
  Server.auth.saveProfile(_data, function(err, saved) {
    if (saved) {
      ProfileActions.setSaveStatus(saved);
    }
  });
  _data.unsaved = false;
};

var _queueSave = function() {
  
  if (!_data.unsaved) {
    _data.unsaved = true;
    _saveTimer = setTimeout(_timer, 3000);
  }
  else {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(_timer, 3000);
  }
  
};




if (!sessionStorage._ProfileStore) {
  _data = {
    unsaved: null,
    bio: null,
    games: {
      h1: 0,
      h2: 0,
      h3: 0,
      h4: 0,
      h2a: 0,
      h5: 0
    }
  };
  _meta.cached = false;
}
else {
  _data = JSON.parse(sessionStorage._ProfileStore);
  _meta.cached = true;
}

var ProfileStore = merge(EventEmitter.prototype, {
  
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
      
    case Constants.Profile.SET_PROFILE:
      _data = utils.update(_data, action.data);
      break;
      
    case Constants.Profile.BIO_CHANGED:
      _data.bio = action.data.bio;
      _queueSave();
      break;
      
    case Constants.Profile.PREFERENCE_TOGGLED:
      var type = action.data.type;
      var title = action.data.title;
      var prev = _data[type][title];
      _data[type][title] = ( prev === 1 ? 0 : 1 );
      _queueSave();
      break;
      
    case Constants.Profile.AVOIDANCE_TOGGLED:
      var type = action.data.type;
      var title = action.data.title;
      var prev = _data[type][title];
      _data[type][title] = ( prev === -1 ? 0 : -1 );
      _queueSave();
      break;
      
    case Constants.Profile.SET_SAVE_STATUS:
      var status = action.data.status;
      _data.unsaved = !status;
      break;

    default:
      return true;
  }
  sessionStorage._ProfileStore = JSON.stringify(_data);
  ProfileStore.emitChange();
  return true;
});

module.exports = ProfileStore;
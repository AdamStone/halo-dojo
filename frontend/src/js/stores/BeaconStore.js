"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    EventEmitter = require('events').EventEmitter,
    merge = require('react/lib/merge');

var Constants = require('../constants/Constants'),
    utils = require('../../../../shared/utils');


function isEmpty(obj) {
  for (var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }
  return true;
}

var _dispatchToken,
    _data;


var _getInitialState = function() {
  return {
    active: false,
    status: null,
    beacons: {}
  };
};

if (!sessionStorage._BeaconStore) {
  _data = _getInitialState();
}
else {
  _data = JSON.parse(sessionStorage._BeaconStore);
}


var BeaconStore = merge(EventEmitter.prototype, {

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

    case Constants.Beacons.SET_BEACONS:
      _data.beacons = action.data.beacons;
      if (isEmpty(_data.beacons)) {
        _data.active = false;
      }
      else {
        _data.active = true;
      }
      break;

    case Constants.User.DISCONNECTED:
      _data = _getInitialState();
      break;

    case Constants.User.LOST_CONNECTION:
      _data = _getInitialState();
      break;

    case Constants.Beacons.SET_STATUS:
      _data.status = action.data.status;
      break;

    default:
      return true;
  }
  sessionStorage._BeaconStore = JSON.stringify(_data);
  BeaconStore.emitChange();
  return true;
});

module.exports = BeaconStore;










//function intersection(array1, array2) {
//  return array1.filter(function(n) {
//    return array2.indexOf(n) != -1;
//  });
//};
//
//function randomSample(arr, size) {
//    var shuffled = arr.slice(0), i = arr.length, temp, index;
//    while (i--) {
//        index = Math.floor((i + 1) * Math.random());
//        temp = shuffled[index];
//        shuffled[index] = shuffled[i];
//        shuffled[i] = temp;
//    }
//    var sliced = shuffled.slice(0, size);
//    var remainder = shuffled.slice(size, arr.length);
//    return [sliced, remainder]
//};
//
//function randomGames() {
//  var games = ['ce', 'h2', 'h2a', 'h3', 'h4'];
//  var ints = [0,1,2,3,4];
//  var splitPosition = randomSample(ints, 1)[0];
//  return randomSample(games, splitPosition);
//};
//
//function sort(objs, key) {
//
//  var compare = function(a, b) {
//    if (a[key] < b[key])
//      return -1;
//    if (a[key] > b[key])
//      return 1
//    return 0;
//  };
//
//  objs.sort(compare);
//};
//
//
//var ints = [];
//for (var i = 1; i < 30; i++) {
//  ints.push(i);
//};
//
//function randomInt() {
// return randomSample(ints, 1)[0][0];
//};
//
//var beacons = [
//  {
//    key: 0,
//    gamertag: 'Swirl',
//    status: 'LFM h2a ranked',
//    location: 'USA',
//    time: randomInt(),
//    idle: false
//  },
//  {
//    key: 1,
//    gamertag: 'Willow',
//    status: 'Need 1 for team slayer',
//    location: 'USA',
//    time: randomInt(),
//    idle: false
//  },
//  {
//    key: 2,
//    gamertag: 'Waffle',
//    status: 'Just casual/unranked',
//    location: 'UK',
//    time: randomInt(),
//    idle: false
//  },
//  {
//    key: 3,
//    gamertag: 'Soda',
//    status: 'LF2M BTB premades',
//    location: 'USA',
//    time: randomInt(),
//    idle: true
//  },
//    {
//    key: 4,
//    gamertag: 'Wheezy',
//    status: 'LFM h2a ranked',
//    location: 'USA',
//    time: randomInt(),
//    idle: false
//  },
//  {
//    key: 5,
//    gamertag: 'Horse',
//    status: 'Need 1 for team slayer',
//    location: 'USA',
//    time: randomInt(),
//    idle: false
//  },
//  {
//    key: 6,
//    gamertag: 'Stumpy',
//    status: 'Just casual/unranked',
//    location: 'UK',
//    time: randomInt(),
//    idle: false
//  },
//  {
//    key: 7,
//    gamertag: 'Shoe',
//    status: 'LF2M BTB premades',
//    location: 'USA',
//    time: randomInt(),
//    idle: true
//  }
//];

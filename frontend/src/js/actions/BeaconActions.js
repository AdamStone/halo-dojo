"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants');

var BeaconActions = {

  setBeacons: function(beacons) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Beacons.SET_BEACONS,
      data: {
        beacons: beacons
      }
    });
  },

  setStatus: function(status) {
    AppDispatcher.handleViewAction({
      actionType: Constants.Beacons.SET_STATUS,
      data: {
        status: status
      }
    });
  }

};

module.exports = BeaconActions;

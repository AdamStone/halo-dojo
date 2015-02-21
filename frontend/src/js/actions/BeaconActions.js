var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants')
    Socket = require('../utils/SocketAPI');

var BeaconActions = {
  
  setBeacons: function(beacons) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Beacons.SET_BEACONS,
      data: {
        beacons: beacons
      }
    });
  }
  
};

module.exports = BeaconActions;
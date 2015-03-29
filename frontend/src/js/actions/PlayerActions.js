"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants');

var PlayerActions = {

  gotPlayerData: function(data) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Player.GOT_PLAYER_DATA,
      data: data
    });
  }

};

module.exports = PlayerActions;

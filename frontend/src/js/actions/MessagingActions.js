"use strict";

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants');

var MessagingActions = {

  gotConvos: function(data) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Messaging.GOT_CONVOS,
      data: data
    });
  },

  sentMessage: function(data) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Messaging.SENT_MESSAGE,
      data: data
    });
  },

  receiveMessage: function(data) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Messaging.RECEIVED_MESSAGE,
      data: data
    });
  },

  minimize: function(gamertag) {
    AppDispatcher.handleViewAction({
      actionType: Constants.Messaging.MINIMIZED,
      data: {
        gamertag: gamertag
      }
    });
  },

  expand: function(gamertag) {
    AppDispatcher.handleViewAction({
      actionType: Constants.Messaging.EXPANDED,
      data: {
        gamertag: gamertag
      }
    });
  },

  close: function(gamertag) {
    AppDispatcher.handleViewAction({
      actionType: Constants.Messaging.CLOSED,
      data: {
        gamertag: gamertag
      }
    });
  }

};

module.exports = MessagingActions;

var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants');

var UserActions = {

  updateUserData: function(data) {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.UPDATE_USER_DATA,
      data: data
    });
  },

  logOut: function() {
    AppDispatcher.handleViewAction({
      actionType: Constants.User.LOGGED_OUT,
      data: {}
    });
  },

  authenticate: function(token) {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.AUTHENTICATED,
      data: {
        token: token
      }
    });
  },

  updateGamertags: function(gamertags, main) {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.UPDATE_GAMERTAGS,
      data: {
        gamertags: gamertags,
        main: main
      }
    });
  },

  disconnected: function() {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.DISCONNECTED,
      data: {}
    });
  },

  connected: function() {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.CONNECTED,
      data: {}
    });
  },

  lostConnection: function() {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.LOST_CONNECTION,
      data: {}
    });
  }

};

module.exports = UserActions;

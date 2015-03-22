var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants'),
    Socket = require('../utils/SocketAPI');

var UserActions = {

  updateUserData: function(data) {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.UPDATE_USER_DATA,
      data: data
    });
  },

  logOut: function() {
    Socket.disconnect();
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
    Socket.disconnect();
    AppDispatcher.handleViewAction({
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

  setStatus: function(status) {
    AppDispatcher.handleServerAction({
      actionType: Constants.User.STATUS_UPDATE,
      data: {
        status: status
      }
    });
  }

};

module.exports = UserActions;

"use strict";

var UserActions = require('./UserActions'),
    UIActions = require('./UIActions'),
    ProfileActions = require('./ProfileActions'),
    BeaconActions = require('./BeaconActions'),
    MessagingActions = require('./MessagingActions'),
    PlayerActions = require('./PlayerActions'),
    Server = require('../utils/ServerAPI'),
    Socket = require('../utils/SocketAPI');


var getLoginCallback = function(onMessage) {

  return function(err, response) {
    var message;
    if (err) {
      // no response
      message = err.message;
      if (message === 'Origin is not allowed by ' +
                      'Access-Control-Allow-Origin') {
        message = 'Unable to contact authentication server.';
      }
    }
    if (response) {

      // got response (but could be rejection)
      if (response.statusType === 2) {
        // login succeeded
        UserActions.authenticate(JSON.parse(response.text));
        UIActions.hideOverlay();
        UIActions.setUrlPath('/');
      }
      else {
        // rejected
        message = JSON.parse(response.text).message;
      }
    }
    message = {
      text: message,
      success: false
    };
    onMessage(message);
  };

};



var beaconListener = function(beacons) {
  console.log('Got beacons update:');
  console.log(beacons);
  BeaconActions.setBeacons(beacons);
};



module.exports = {

  // SERVER API

  register: function(email, password, onMessage) {

    Server.submitRegistration(email, password,
                              function(err, response) {
      var message;
      if (err) {
        // no response
        message = err.message;
        if (message === 'Origin is not allowed by ' +
                        'Access-Control-Allow-Origin') {
          message = 'Unable to contact authentication server.';
        }
      }
      if (response) {
        // got response (but could be rejection)

        if (response.statusType === 2) {
          // registration succeeded

          message = {
            text: response.text,
            success: true
          };
          return onMessage(message);
        }
        else {
          // registration rejected
          message = JSON.parse(response.text).message;
        }
      }
      message = {
        text: message,
        success: false
      };
      return onMessage(message);
    });
  },

  login: function(email, password, onMessage) {
    var callback = getLoginCallback(onMessage);
    Server.submitLogin(email, password, callback);
  },

  logOut: function() {
    Socket.disconnect(function(err) {
      if (err) {
        return console.error(err);
      }
      UserActions.disconnected();
    });
    UserActions.logOut();
  },

  activate: function(email, password, onMessage) {

    var code = window.location.pathname.split('/')[2];
    var callback = getLoginCallback(onMessage);
    Server.submitActivate(email, password, code, callback);
  },

  getUserData: function() {
    Server.auth.getUserData(function(err, response) {
      if (err) {
        // TODO placeholder
        return console.error(err);
      }
      if (response) {
        console.log(response);
        UserActions.updateUserData(
          JSON.parse(response.text)
        );
      }
    });
  },

  getProfileData: function() {
    Server.auth.getProfileData(function(err, response) {
      if (err) {
        return console.error(err);
      }
      if (response) {
        console.log(response);
        ProfileActions.setProfile(
          JSON.parse(response.text)
        );
      }
    });
  },

  getSuggestedPlayers: function() {
    Server.auth.getSuggestedPlayers(function(err, result) {
      console.log('getSuggestedPlayers returned');
      if (err) {
        console.error(err);
      }
      if (result) {
        var suggestions = JSON.parse(result.text);
        PlayerActions.gotPlayerData(suggestions);
      }
    });
  },




  // SOCKET API

  connect: function(gamertag, callback) {
    Socket.connect(gamertag, function(err, response) {
      if (err) {
        // TODO display indicator that connection failed
        console.error(err);
        return (callback && callback(err));
      }
      if (response) {
        // connected

        UserActions.connected();

        // listen for messages
        Socket.on('message', function(data, callback) {
          console.log('message received:');
          console.log(data);
          MessagingActions.receiveMessage(data);
          return (callback && callback());
        });

        // listen for disconnects
        Socket.on('disconnect', function(reason) {
          if (reason === 'forced close') {
            console.log('socket was disconnected by client');
            UserActions.disconnected();
          }
          else if (reason === 'transport close') {
            console.log('socket was disconnected by server');
            UserActions.lostConnection();
          }
          else {
            console.log('socket was disconnected: ' + reason);
            UserActions.disconnected();
          }
        });

        // listen for login/logout of conversations
        Socket.on('logged in', function(data) {
          console.log('log in event:');
          console.log(data);
        });

        Socket.on('logged out', function(data) {
          console.log('log out event:');
          console.log(data);
        });

        return (callback && callback(null, response));
      }
    });
  },

  disconnect: function() {
    Socket.disconnect(function(err) {
      if (err) {
        return console.error(err);
      }
      UserActions.disconnected();
    });
  },

  activateBeacon: function(callback) {

    Socket.activateBeacon(function(err, beacons) {
      if (err && callback) {
        return callback(err);
      }
      if (beacons) {
        console.log('Got initial beacons:');
        console.log(beacons);
        BeaconActions.setBeacons(beacons);

        // listen for beacon updates
        Socket.on('beacons', beaconListener);

        return (callback && callback(null));
      }
    });
  },

  deactivateBeacon: function(callback) {

    Socket.deactivateBeacon(function(err, response) {
      if (err) {
        return (callback && callback(err));
      }
      else {
        BeaconActions.setBeacons({});

        // stop beacon updates
        Socket.removeListener('beacons', beaconListener);

        return (callback && callback(null, response));
      }
    });
  },

  setStatus: function(status) {
    Socket.emit('status', status, function(err, message) {
      if (err) {
        return console.log(err);
      }
      if (message) {
        console.log(message);
      }
      BeaconActions.setStatus(status);
    });
  },

  getConvos: function(callback) {
    Socket.emit('get convos', {}, function(err, result) {
      if (err && callback) {
        return callback(err);
      }
      if (result) {
        MessagingActions.gotConvos(result);
        return (callback && callback());
      }
    });
  },

  getMessages: function(gamertag, callback) {
    var data = {
      gamertag: gamertag
    };
    Socket.emit('get messages', data,
                function(err, result) {
      if (err && callback) {
        return callback(err);
      }
      if (result) {
        MessagingActions.gotMessages(gamertag, result);
        return (callback && callback());
      }
    });
  },

  markConvoRead: function(gamertag, callback) {
    var data = {
      gamertag: gamertag
    };
    Socket.emit('mark convo read', data,
                function(err, result) {
      if (err && callback) {
        return callback(err);
      }
      if (result) {
        MessagingActions.markedConvoRead(result);
        return (callback && callback());
      }
    });
  },

  sendMessage: function(gamertag, text, callback) {
    if (text.trim() !== '') {
      var data = {
        recipient: gamertag,
        text: text
      };
      Socket.emit('message', data, function(err, data) {
        if (err) {
          console.error(err);
          return (callback && callback(err));
        }
        if (data) {
          // success returns message with metadata
          MessagingActions.sentMessage(data);
          return callback && callback(null);
        }
      });
    }
  }

};

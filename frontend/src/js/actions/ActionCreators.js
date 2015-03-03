"use strict";

var UserActions = require('./UserActions'),
    ProfileActions = require('./ProfileActions'),
    BeaconActions = require('./BeaconActions'),
    MessagingActions = require('./MessagingActions'),
    UserStore = require('../stores/UserStore'),
    Server = require('../utils/ServerAPI'),
    Socket = require('../utils/SocketAPI');

var _getToken = function() {
  return UserStore.get().token;
};

module.exports = {
  
  getUserData: function() {
    Server.auth.setToken(_getToken());
    Server.auth.getUserData(function(err, response) {
      if (err) {
        return console.error(err);
      }
      if (response) {
        UserActions.updateUserData(
          JSON.parse(response.text)
        );
      }
    });
  },
  
  getProfileData: function() {
    Server.auth.setToken(_getToken());
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
  
  connect: function(gamertag) {
    Socket.setToken(_getToken());
    Socket.connect(gamertag, function(err, beacons) {
      if (err) {
        return console.log(err);
      }
      UserActions.connect(gamertag);

      if (beacons) {
        console.log('Got initial beacons:');
        console.log(beacons);
        BeaconActions.setBeacons(beacons);
      }

      // listen for beacon updates
      Socket.on('beacons', function(beacons) {
        console.log('Got beacons update:');
        console.log(beacons);
        BeaconActions.setBeacons(beacons);
      });
      
      // listen for messages
      Socket.on('message', function(data, callback) {
        console.log('message received:');
        console.log(data);
        MessagingActions.receiveMessage(data);
        if (callback) {
          return callback();
        }
      });
    });
  },
  
  setStatus: function(status) {
    Socket.setToken(_getToken());
    Socket.emit('status', status, function(err, message) {
      if (err) {
        return console.log(err);
      }
      if (message) {
        console.log(message);
      }
      UserActions.setStatus(status);
    });
  },
  
  sendMessage: function(gamertag, message) {
    if (message.trim() !== '') {
      Socket.setToken(_getToken());
      Socket.emit('message', {
          recipient: gamertag,
          message: message
        }, function(err, data) {
          if (err) {
            return console.log(err);
          }
          if (data) {
            MessagingActions.sentMessage(data);
          }
        }
      );
    }
  }
  
};
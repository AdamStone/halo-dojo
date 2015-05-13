"use strict";

var Hawk = require('hawk');


var _getToken = function() {
  return require('../stores/UserStore').get().token;
};

var _socket = null;

module.exports = {

  connected: function() {
    return (_socket && _socket.connected);
  },

  connect: function(gamertag, callback) {
    if (this.connected()) {
      return callback('Socket is already connected');
    }

    if (!_socket) {
      console.log('connecting socket');
      _socket = io.connect(location.origin);
    }
    else {
      console.log('reconnecting socket');
      _socket.io.connect();
    }

    _socket.on('connect', function() {
      var data = {
        gamertag: gamertag
      };
      this.emit('handshake', data, function(err, response) {
        if (callback) {
          if (err) {
            return callback(err);
          }
          else {
            return callback(null, response);
          }
        }
      });
    }.bind(this));
  },

  disconnect: function(callback) {
    if (_socket) {
      console.log('disconnecting socket');
      _socket.io.disconnect();
      var status = this.connected();
      if (status) {
        return (callback && callback('Disconnect failed'));
      }
      return (callback && callback(null));
    }
  },

  activateBeacon: function(callback) {
    if (!this.connected()) {
      return callback('Unable to activate beacon, socket is disconnected');
    }
    this.emit('activate beacon', {}, function(err, response) {
      if (err) {
        console.error(err);
        return (callback && callback(err));
      }
      if (callback && response) {  // response = beacons
        return callback(null, response);
      }
    });
  },

  deactivateBeacon: function(callback) {
    if (!this.connected()) {
      return callback('Socket is already disconnected');
    }
    this.emit('deactivate beacon', {}, function(err, response) {
      if (err) {
        console.error(err);
        return (callback && callback(err));
      }
      if (callback && response) {
        return callback(null, response);
      }
    });
  },




  // BASE METHODS

  on: function(eventName, handler) {
    if (_socket) {
      _socket.on(eventName, function() {
        var args = arguments;
        if(handler) {
          handler.apply(_socket, args);
        }
      });
    }
  },

  removeListener: function(eventName, handler) {
    _socket.removeListener(eventName, handler);
  },

  emit: function(eventName, data, callback) {
    if (_socket) {
      // data can be object or message string
      if (!data || typeof data === 'string') {
        data = {
          message: data
        };
      }

      var host = (location.hostname || 'localhost'),
          port = parseInt(location.port);

      if (!port) {
        switch(location.protocol) {
          case 'http:':
            port = 80;
            break;

          case 'https:':
            port = 443;
        }
      }
      data.auth = Hawk.client.message(host, port, 'message', {
        credentials: _getToken()
      });
      _socket.emit(eventName, data, function() {
        var args = arguments;
        if (callback) {
          callback.apply(_socket, args);
        }
      });
    }
    else {
      var self = this;
      this.connect(function(err) {
        if (err) {
          return callback(err);
        }
        else {
          return self.emit(eventName, data, callback);
        }
      });
    }
  }

};

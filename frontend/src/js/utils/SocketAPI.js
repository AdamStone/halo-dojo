"use strict";

var Hawk = require('hawk');

var _socket = null;
var _token = null;

module.exports = {
  
  setToken: function(token) {
    _token = token;
  },

  connected: function() {
    return (_socket && _socket.connected);
  },

  connect: function(gamertag, callback) {
    if (this.connected()) {
      return callback('Socket is already connected');
    }

    if (!_socket) {
      console.log('connecting socket');
      _socket = io.connect('http://localhost:8000');
    }
    else {
      console.log('reconnecting socket');
      _socket.io.connect();
    }

    this.emit('handshake', {gamertag: gamertag}, function(err, clients) {
      if (callback) {
        if (err) {
          return callback(err);
        }
        else {
          return callback(null, clients);
        }
      }
    });
  },

  disconnect: function(callback) {
    if (_socket) {
      console.log('disconnecting socket');
      _socket.io.disconnect();
      var status = this.connected();
      if (status) {
        return callback('Disconnect failed');
      }
    }
  },
  
  on: function(eventName, callback) {
    if (_socket) {
      _socket.on(eventName, function() {
        var args = arguments;
        if(callback) {
          callback.apply(_socket, args);
        }
      });
    }
//    else {
//      var self = this;
//      this.connect(function(err) {
//        if (err)
//          return callback(err);
//        else
//          return self.on(eventName, callback);
//      });
//    }
  },

  emit: function(eventName, data, callback) {
    if (_socket) {
      // data can be object or message string
      if (!data || typeof data === 'string') {
        data = {
          message: data
        };
      }
      data.auth = Hawk.client.message('localhost', 8000, 'message', {
        credentials: _token
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
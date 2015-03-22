"use strict";

var Socket = require('socket.io'),
    Hawk = require('hawk'),
    schema = require('../../shared/input-validation'),

    Credentials = require('./models/credentials');


module.exports = {

  io: null,

  attach: function(server) {
    var self = this;
    server.oldStart = server.start;

    server.start = function(callback) {

      this.oldStart(function() {
        if (callback) {
          callback();
        }
        self.io = Socket.listen(server.listener);
        var _clients = {},
            _beacons = {};

        // ========== handlers ========== //

        self.io.on('connection', function(socket) {

          console.log('socket connected');

          var gamertag;

          // ============== methods ============== //

          var emitBeacons = function() {
            console.log('emitting beacon update');
            self.io.sockets.in('beacons').emit('beacons', _beacons);
          };

          var deactivateBeacon = function(gamertag) {
            console.log('beacon deactivation requested by ' + gamertag);
            socket.leave('beacons');
            delete _beacons[gamertag];
//            delete _clients[gamertag];
            emitBeacons();
          };

          var activateBeacon = function(gamertag) {
            console.log('beacon activation requested by ' + gamertag);
//            _clients[gamertag] = socket;
            socket.join('beacons');
            _beacons[gamertag] = {
              time: Math.round(new Date().getTime()/1000),
              status: null
            };
            emitBeacons();
          };

          // =============== event handlers =============== //


          socket.on('disconnect', function() {
            if (gamertag) {
              console.log(gamertag + ' disconnected');
              if (gamertag in _beacons) {
                deactivateBeacon(gamertag);
              }
              delete _clients[gamertag];
            }
            else {
              console.log('socket disconnected');
            }
          });



          socket.on('handshake', function(data, callback) {
            console.log(data);
            schema.socket.handshake.validate(data, function(err, data) {
              if (err && callback) {
                return callback(err);
              }
              Hawk.server.authenticateMessage('localhost', 8000, 'message',
                data.auth, Credentials.get, {}, function(err) {

                  if (err && callback) {
                    callback(err);
                  }

                  // Successfully connected and authenticated
                  if (Object.keys(data).length) {
                    gamertag = data.gamertag;
                    socket.gamertag = gamertag;
                    _clients[gamertag] = socket;
                    console.log('Socket.io handshake from ' + gamertag);
                    if (callback) {
                      return callback(null, 'handshake accepted');
                    }
                  }
                });
            });
          });



          socket.on('activate beacon', function(data, callback) {
            if (gamertag && !(gamertag in _beacons)) {
              activateBeacon(gamertag);
              console.log(gamertag + ' activated');
              return (callback && callback(null, _beacons));
            }
          });



          socket.on('deactivate beacon', function(data, callback) {
            if (gamertag && gamertag in _beacons) {
              deactivateBeacon(gamertag);
              console.log(gamertag + ' deactivated');
              return (callback && callback(null, 'beacon deactivated'));
            }
          });



          socket.on('status', function(data, callback) {
            console.log('received status from ' + gamertag +':');
            var status = data.message;
            console.log(status);

            _beacons[gamertag].status = status;
            emitBeacons();

            callback(null, 'Status received');
          });



          socket.on('message', function(data, callback) {
            schema.socket.message.validate(data, function(err, data) {
              if (err) {
                return callback(err);
              }
              Hawk.server.authenticateMessage('localhost', 8000, 'message',
                data.auth, Credentials.get, {}, function(err, credentials) {

                  if (err) {
                    return callback(err);
                  }

                  if (!(credentials && gamertag in _clients)) {
                    return callback(
                      'Clients must handshake before messaging');
                  }

                  var payload = {
                    message: data.message,
                    from: gamertag,
                    to: data.recipient,
                    time: Math.round(new Date().getTime()/1000)
                  };

                  if (data.recipient in _clients) {

                    _clients[data.recipient].send(payload, function(err) {
                      if (err) {
                        console.log(err);
                        return callback(err);
                      }
                      return callback(null, payload);
                    });
                  }
                  else {
                    // recipient is disconnected

                    callback(data.recipient +
                             ' is not available to chat');
                  }
                });
            });
          });
        });
      });
    };
  }

};

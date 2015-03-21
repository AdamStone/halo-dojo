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
        var clients = {},
            beacons = {};

        // ========== handlers ========== //

        self.io.on('connection', function(socket) {

          console.log('socket connected');

          var gamertag;

          // ============== methods ============== //

          var emitBeacons = function() {
            console.log('emitting beacon update');
            self.io.sockets.in('beacons').emit('beacons', beacons);
          };

          var deactivateBeacon = function(gamertag) {
            console.log('beacon deactivation requested by ' + gamertag);
            socket.leave('beacons');
            delete beacons[gamertag];
            emitBeacons();
          };

          var activateBeacon = function(gamertag) {
            console.log('beacon activation requested by ' + gamertag);
            socket.join('beacons');
            beacons[gamertag] = {
              time: Math.round(new Date().getTime()/1000),
              status: null
            };
            emitBeacons();
          };

          // =============== event handlers =============== //

          socket.on('handshake', function(data, callback) {
            console.log(data);
            schema.socket.handshake.validate(data, function(err, data) {
              if (err && callback) {
                return callback(err);
              }
              Hawk.server.authenticateMessage('localhost', 8000, 'message',
                data.auth, Credentials.get, {}, function(err) {

                  if (err) {
                    callback(err);
                  }

                  if (Object.keys(data).length) {
                    gamertag = data.gamertag;
                    console.log('Socket.io handshake from ' +
                                data.gamertag);
                    socket.gamertag = gamertag;
                    clients[gamertag] = socket;
                    activateBeacon(gamertag);
                    if (callback) {
                      return callback(null, beacons);
                    }
                  }

                });
            });
          });



          socket.on('status', function(data, callback) {
            console.log('received status from ' +
                        socket.gamertag +': ');
            var status = data.message;
            console.log(status);

            beacons[socket.gamertag].status = status;
            emitBeacons();

            callback(null, 'Status received');
          });



          socket.on('disconnect', function() {
            // TODO disconnect on user logout
            if (gamertag) {
              console.log(gamertag + ' disconnected');
              if (gamertag in beacons) {
                deactivateBeacon(gamertag);
              }
              delete clients[gamertag];
            }
          });



          socket.on('message', function(data, callback) {
            schema.socket.message.validate(data, function(err, data) {
              if (err) {
                return callback(err);
              }
              Hawk.server.authenticateMessage('localhost', 8000, 'message',
                data.auth, Credentials.get, {}, function(err, credentials) {

                  if (err) {
                    callback(err);
                  }
                  credentials.gamertag = socket.gamertag;

                  if (credentials && credentials.gamertag in clients) {
                    if (data.recipient in beacons) {

                      var payload = {
                        message: data.message,
                        from: credentials.gamertag,
                        to: data.recipient,
                        time: Math.round(new Date().getTime()/1000)
                      };

                      clients[data.recipient].send(payload, function(err) {
                        if (err) {
                          console.log(err);
                          return callback(err);
                        }
                        callback(null, payload);
                      });
                    }
                    else {
                      callback(data.recipient +
                               ' is not available to chat');
                    }
                  }
                  else {
                    return callback(
                      'Clients must handshake before messaging');
                  }
                });
            });
          });
        });
      });
    };
  }

};

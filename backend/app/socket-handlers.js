"use strict";

var Socket = require('socket.io'),
    Hawk = require('hawk'),
    schema = require('../../shared/input-validation');

var Convo = require('./models/convo'),
    User = require('./models/user'),
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
            emitBeacons();
          };

          var activateBeacon = function(gamertag) {
            console.log('beacon activation requested by ' + gamertag);
            socket.join('beacons');
            _beacons[gamertag] = {
              time: Math.round(new Date().getTime()/1000),
              status: null
            };
            emitBeacons();
          };

          // =============== event handlers =============== //

          socket.on('handshake', function(data, callback) {
            schema.socket.handshake.validate(data, function(err, data) {
              if (err && callback) {
                return callback(err);
              }
              Hawk.server.authenticateMessage('localhost', 8000, 'message',
                data.auth, Credentials.get, {}, function(err, credentials) {

                  if (err && callback) {
                    callback(err);
                  }

                  // successfully connected and authenticated
                  if (Object.keys(data).length) {
                    gamertag = data.gamertag;
                    socket.gamertag = gamertag;
                    socket.user = new User(credentials.user);
                    _clients[gamertag] = socket;

                    // alert any listening conversations of login
                    socket.join(gamertag);
                    self.io.sockets.in(gamertag)
                      .emit('logged in', gamertag);

                    // TODO get login state of prior conversants,
                    // listen for login/logouts

                    // maybe through separate event?

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

            // check avoids errors after server restart
            if (_beacons[gamertag]) {
              _beacons[gamertag].status = status;
              emitBeacons();

              return (callback &&
                      callback(null, 'Status received'));
            }
            else {
              return (callback &&
                      callback('Set status failed, ' +
                               'you may need to reconnect'));
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
                    return callback(err);
                  }

                  if (!(credentials && gamertag in _clients)) {
                    return callback(
                      'Clients must handshake before messaging');
                  }

                  var recipient;
                  if (data.recipient in _clients) {
                    recipient = _clients[data.recipient];
                  }
                  else {
                    // recipient is disconnected
                    recipient = null;
                  }

                  // save message to database
                  Convo.append(gamertag, data.recipient, data.message,
                                (!recipient), function(err, result) {
                    if (err) {
                      console.log(err);
                    }
                    if (result) {
                      // send message if recipient online
                      if (recipient) {
                        recipient.send(result, function(err) {
                          if (err) {
                            console.log(err);
                            return callback(err);
                          }
                          else {
                            // mutually listen for logout/logins
                            socket.join(recipient.gamertag);
                            recipient.join(gamertag);

                            return callback(null, result);
                          }
                        });
                      }
                      else {
                        return callback(null, result);
                      }
                    }
                  });

                });
            });
          });



          socket.on('disconnect', function() {
            if (gamertag) {
              console.log(gamertag + ' disconnected');
              if (gamertag in _beacons) {
                deactivateBeacon(gamertag);
              }

              // emit logout event to conversation partners
              socket.leave(gamertag);
              self.io.sockets.in(gamertag)
                .emit('logged out', gamertag);
              delete _clients[gamertag];
            }
            else {
              console.log('socket disconnected');
            }
          });



          socket.on('get convos', function(_, callback) {
            Convo.getUserConvos(socket.user.id, function(err, result) {
              return callback(err, result);
            });
          });

        });
      });
    };
  }

};

"use strict";

var Boom = require('boom'),
    Bcrypt = require('bcrypt'),
    Nodemailer = require('nodemailer');

var User = require('../models/user'),
    Credentials = require('../models/credentials'),
    Mailer = require('../../config/gitignore.mailer.js');
    
    
var handlers = {};

// REGISTER
handlers.register = function(request, reply) {

  if (request.method === 'options') {
    return reply();
  }
  
  var email = request.payload.email,
      password = request.payload.password;

  // check if email is in use
  User.getBy('email', email, function(err, user) {
    if (err) {
//      console.log(err);
      return reply(Boom.badImplementation(
        'Error calling User.getBy("email") in http.register.'
      ));
    }
    if (user) {
      return reply(Boom.conflict('Email ' + email + 
          ' is already associated with a Halo Dojo account.'
      ));
    }
    // encrypt password
    Bcrypt.hash(password, 10, function(err, hash) {
      if (err) {
        return reply(Boom.badImplementation(
          'Error hashing the password in http.register.'
        ));
      }
      // create new User
      User.createTemp({
        email: email,
        hash: hash
      },
      function(err, user) {
        if (err) {
          return reply(Boom.badImplementation(
            'There was an error saving user to the database.'
          ));
        }
        Credentials.authenticate(user, function(err, credentials) {
          if (err) {
            return reply(Boom.badImplementation(
              'Error calling Credentials.authenticate ' + 
              'in http.register'
            ));
          }
          else {
//              console.log(credentials);

            var transport = Nodemailer.createTransport(Mailer.smtp);
//              var code = Base64.encode(Buffer(UUID.v4()));
            var code = credentials.id;
            var options = Mailer.optionsFactory(
              user.email, code);

            transport.sendMail(options, function(err) {
              if (err) {
                console.log(err);
                return reply(Boom.badImplementation(
                  'There was an error sending a validation email'
                ));
              }
              else {
                return reply('A confirmation email has been ' + 
          'sent to ' + user.email);
              }
            });
          }
        });
      });
    });

  });
};



// LOGIN
handlers.login = function(request, reply) {
  
  if (request.method === 'options') {
    return reply();
  }

  var email = request.payload.email,
      password = request.payload.password;

  User.getBy('email', email, function(err, user) {
    if (err) {
      console.log(err);
      return reply(Boom.badImplementation(
        'Error calling User.getBy("email") ' + 
        'in https.login'
      ));
    }
    if (!user) {
      return reply(Boom.badRequest(
        'Invalid login credentials.'
      ));
    }

    Bcrypt.compare(password, user.hash, 
                   function(err, isValid) {
      if (err) {
        return reply(Boom.badImplementation(
          'Error calling Bcrypt.compare in https.login'
        ));
      }
      if (!isValid) {
        return reply(Boom.badRequest(
          'Invalid login credentials.'
        ));
      }

      Credentials.authenticate(user, 
                  function(err, credentials) {
        if (err) {
          return reply(Boom.badImplementation(
            'Error authenticating user in https.login'
          ));
        }
        else {
          return reply({
            user: user.email,
            id: credentials.id,
            key: credentials.key,
            algorithm: credentials.algorithm
          });
        }
      });
    });
  });
};



// ACTIVATE
handlers.activate = function(request, reply) {
  
  if (request.method === 'options') {
    return reply();
  }

  if (request.method === 'get') {
    reply.view('Activate', {
      code: request.params.code
    });
  }
  if (request.method === 'post') {
    var code = request.params.code,
        email = request.payload.email,
        password = request.payload.password;

    Credentials.get(code, function(err, credentials) {
      if (err || !credentials) {
        return reply(Boom.badRequest(
          'Authentication failed'
        ));
      }
      else {
        var temp = new User(credentials.user);
        Bcrypt.compare(password, temp.hash, 
                       function(err, isValid) {
          if (err || !isValid) {
            return reply(Boom.badRequest(
              'Authentication failed'
            ));
          }
          else {
            // Convert to permanent User and authenticate
            User.activate(temp.id, function(err, user) {
              if (err) {
                console.error(err);
                return reply(Boom.badImplementation(
                  'There was a problem activating your account'
                ));
              }
              if (user) {
                Credentials.authenticate(user, function(
                                         err, credentials) {
                  if (err) {
                    return reply(Boom.badImplementation(
                      'Your account was activated, but there ' + 
                      'was an error logging in'
                    ));
                  }
                  if (credentials) {

                    // credentials_id, key, algorithm

                    return reply({
                      user: user.email,
                      id: credentials.id,
                      key: credentials.key,
                      algorithm: credentials.algorithm
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
};

module.exports = handlers;
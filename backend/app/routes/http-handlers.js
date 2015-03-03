"use strict";

var Boom = require('boom'),
    User = require('../models/user'),
    Gamertag = require('../models/gamertag'),
    Profile = require('../models/profile');


module.exports = function(xbl) {
  var handlers = {};
  
  
  // TEST ROUTE
  handlers.getServiceRecord = function(request, reply) {
    var gamertag = request.params.gamertag;
    
    console.log('Getting service record for gamertag ' + gamertag);
    xbl.waypoint.getServiceRecord(gamertag, function(err, result) {
      if (err) {
        return reply(err);
      }
      if (result) {
        Gamertag.setData(gamertag, result, function(err, result) {
          if (err) {
            return reply(err);
          }
          if (result) {
            return reply(result);
          }
        });
      }
    });
    
   // has played example response
//   {"csr_max":"13",
//    "games_played":"1149",
//    "kd":"1.798",
//    "total_deaths":"11522",
//    "total_kills":"20719",
//    "wl":"4.75"}
    
    // hasn't played example response
//    {"csr_max":"1",
//     "games_played":"0",
//     "kd":"0.000",
//     "total_deaths":"0",
//     "total_kills":"0",
//     "wl":"-"}
    
  };
  
  
  
  // ADD GAMERTAG
  handlers.addGamertag = function(request, reply) {
    var gamertag = request.payload.gamertag;
    var user = new User(request.auth.credentials.user);
    
    Gamertag.create(user.id, gamertag, function(err, result) {
      if (err) {
        if (/^Node \d+ already exists/.exec(err.message)) {
          
          
          // TODO start validation cycle
          
          
          return reply(Boom.badRequest(
            'Gamertag is already in use'
          ));
        }
        else {
          return reply(Boom.badImplementation(
            'An error occurred adding Gamertag'
          ));
        }
      }
      if (result) {
        // Successfully created GT

        // Try to get service record for GT
        // Since this may be slow or fail, don't wait to reply
        xbl.waypoint.getServiceRecord(gamertag, 
                          function(err, data) {
          if (err) {
            console.error(err);
          }
          if (data) {
            Gamertag.setData(gamertag, data, function(err, gt) {
              if (err) {
                console.error(err);
              }
              if (gt) {
                console.log(gt);
                // TODO get this data to client when ready
              }
            });
          }
        });
        
        // Result is array of all GT nodes owned by user        
        return reply(result);
      }
    });
  };
  
  
  
  handlers.getUserData = function(request, reply) {
    var user = new User(request.auth.credentials.user);
    User.getData(user.id, function(err, result) {
      if (err) {
        console.error(err);
        return reply(Boom.badImplementation(
          'An error occurred getting user data'
        ));
      }
      if (result) {
        return reply(result);
      }
    });
  };
  
  
  
  handlers.profile = function(request, reply) {
    var user = new User(request.auth.credentials.user);
    
    if (request.method === 'get') {
      
      Profile.get(user.id, function(err, result) {
        if (err) {
          console.error(err);
          return reply(Boom.badRequest(
            "Unable to get user profile"
          ));
        }
        if (result) {
          return reply(result);
        }
      });
    }

    if (request.method === 'put') {
    
      var data = request.payload;

      Profile.save(user.id, data, function(err, result) {
        if (err) {
          console.error(err);
          return reply(Boom.badImplementation(
            "An error occurred saving profile"
          ));
        }
        if (result) {
          return reply(true);
        }
      });
      
    }
  };
  
  
  
  return handlers;
};
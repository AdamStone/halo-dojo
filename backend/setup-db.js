// Initilize should setup initial state of DB
// ** MUST BE IDEMPOTENT **

"use strict";

var db = require('./config/database.js'),
    sharedConstants = require('../shared/constants');


// CREATE CONSTRAINT requires separate queries

var setup = {
  initialize: function(callback) {

    // CONSTRAINTS

    var queries = [
      'CREATE CONSTRAINT ON (user:User) ' +
        'ASSERT user.id IS UNIQUE',
      'CREATE CONSTRAINT ON (user:User) ' +
        'ASSERT user.email IS UNIQUE',
      'CREATE CONSTRAINT ON (gt:Gamertag) ' +
        'ASSERT gt.gamertag IS UNIQUE',
      'CREATE CONSTRAINT ON (credentials:Credentials) ' +
        'ASSERT credentials.id IS UNIQUE',
      'CREATE CONSTRAINT ON (game:Game) ' +
        'ASSERT game.name IS UNIQUE'
    ];


    // GAME NODES

    var name, fullname;
    var cypher = [];
    for (var i=0; i < sharedConstants.GAME_NAMES.length; i++) {
      name = sharedConstants.GAME_NAMES[i];
      fullname = sharedConstants.GAME_FULLNAMES[i];

      cypher.push(
        'MERGE (:Game {name: "' + name + '", ' +
                      'fullname: "' + fullname + '"})'
      );
    }

    cypher = cypher.join('\n');
    queries.push(cypher);




    // RUN

    var finished = 0;

    var timeout = function(cypher) {
      db.queryFactory(cypher, {}, function(err, result) {
        if (err) {
          return console.error(err);
        }
        if (result) {  // expect []
          finished++;
          if (callback && finished === queries.length) {
            return callback();
          }
        }
      }).send();
    };

    for (var i=0; i < queries.length; i++) {
      setTimeout(timeout, 100*(i+1), queries[i]);
    }
  }
};

module.exports = setup;

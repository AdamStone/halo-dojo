"use strict";

var db = require('../../config/database'),
    SharedConstants = require('../../../shared/constants'),
    Game = require('./game'),
    Gamertag = require('./gamertag'),
    User = require('./user');

// constructor
function Profile(_node) {
  this._node = _node;
}

// public instance properties
var properties = [
  'userId',
  'bio'
];

properties.forEach(function(property) {
  Object.defineProperty(Profile.prototype, property, {
    get: function() {
      return this._node._data.data[property];
    },
    set: function(value) {
      this._node._data.data[property] = value;
    }
  });
});

Object.defineProperty(Profile.prototype, 'data', {
  get: function() {
    return this._node._data.data;
  },
  set: function(value) {
    this._node._data.data = value;
  }
});



var weights = {
  prefer: 1,
  avoid: 0.5,
  disagree: 1.25
};



var _resultHandler = function(result, callback) {
  var games = {};
  result.forEach(function(res) {
    if (res.prefer) {
      games[res.prefer._data.data.name] = 1;
    }
    if (res.avoid) {
      games[res.avoid._data.data.name] = -1;
    }
  });
  SharedConstants.GAME_NAMES.forEach(function(name) {
    if (games[name] === undefined) {
      games[name] = 0;
    }
  });

  // if profile exists
  if (result.length && result[0].profile) {
    var profileData = new Profile(result[0].profile).data;
    profileData.games = games;
    return callback(null, profileData);
  }

  return callback(null, []);
};




var _parseCollection = function(collection, Constructor, parameter) {
  if (!collection.length) {
    return [];
  }
  var result = new Array(collection.length);
  for (var i=0; i < collection.length; i++) {
    var n = new Constructor(collection[i]);
    if (parameter) {
      n = n[parameter];
    }
    result[i] = n;
  }
  return result;
};





// STATIC METHODS

Profile.get = function(userId, callback) {
  var cypher = [
    'MATCH (user:User)',
    'WHERE user.id = {userId}',
    'OPTIONAL MATCH (user)-[o:OWNS]->(profile:Profile)',
    'OPTIONAL MATCH (user)-[:PREFERS]->(prefer:Game)',
    'OPTIONAL MATCH (user)-[:AVOIDS]->(avoid:Game)',
    'RETURN profile, prefer, avoid'
  ].join('\n');

  var params = {
    userId: userId
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      return _resultHandler(result, callback);
    }
  }).send();
};




Profile.save = function(userId, data, callback) {

  var prefer = [],
      avoid = [],
      reset = [];

  for (var game in data.games) {
    switch (data.games[game]) {
      case 0:
        reset.push(game);
        break;
      case 1:
        prefer.push(game);
        break;
      case -1:
        avoid.push(game);
        break;
    }
  }

  var matches = ' ',
      creates = ' ';
  if (prefer.length) {
    matches += 'MATCH (prefer:Game) ' +
               'WHERE prefer.name IN {prefer} ';
    creates += 'CREATE UNIQUE (user)-[:PREFERS]->(prefer) ';
  }

  if (avoid.length) {
    matches += 'MATCH (avoid:Game) ' +
               'WHERE avoid.name IN {avoid} ';
    creates += 'CREATE UNIQUE (user)-[:AVOIDS]->(avoid) ';
  }

  var cypher = [
    'MATCH (user:User {id: {userId}})' +
      matches +
      creates,

    'MERGE (user)-[o:OWNS]->(profile:Profile)',
    'SET profile.bio = {bio}',

    'WITH user, profile' +
      (prefer.length ? ', prefer' : '') +
      (avoid.length ? ', avoid' : ''),

    'OPTIONAL MATCH (user)-[prefs:PREFERS]->(preferred:Game)',
    'WHERE NOT preferred.name IN {prefer}',

    'OPTIONAL MATCH (user)-[avoids:AVOIDS]->(avoided:Game)',
    'WHERE NOT avoided.name IN {avoid}',

    'DELETE prefs, avoids',
    'RETURN profile' +
      (prefer.length ? ', prefer' : '') +
      (avoid.length ? ', avoid' : ''),

  ].join('\n');

  var params = {
    userId: userId,
    bio: data.bio,
    prefer: prefer,
    avoid: avoid,
    reset: reset
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      return _resultHandler(result, callback);
    }
  }).send();
};



Profile.suggest = function(userId, callback) {
  var cypher = [
    'MATCH (user:User)-[:MAINS]->(userGt:Gamertag)',
    'WHERE user.id = {userId}',

    // agreed preferences
    'OPTIONAL MATCH (prefG:Game), (player:User)',
    'WHERE (user)-[:PREFERS]->(prefG)<-[:PREFERS]-(player)',

    // agreed avoidances
    'OPTIONAL MATCH (avG:Game)',
    'WHERE (user)-[:AVOIDS]->(avG)<-[:AVOIDS]-(player)',

    // disagreements
    'OPTIONAL MATCH (user)-[r1]->(disG:Game)<-[r2]-(player)',
    'WHERE NOT type(r1) = type(r2)',

    // get matched player's gamertag
    'OPTIONAL MATCH (gt:Gamertag)',
    'WHERE (player)-[:MAINS]->(gt)',

    'RETURN userGt, gt as gamertag, ',
      'collect(DISTINCT prefG) as prefG, ',
      'collect(DISTINCT avG) as avG, ',
      'collect(DISTINCT disG) as disG'
  ].join('\n');

  var params = {
    userId: userId
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result.length) {
      var comparisons = {};
      for (var i=0; i < result.length; i++) {

        var gtNode = result[i].gamertag,
            userGtNode = result[i].userGt,
            gtData = null,
            userGtData = null;

        if (userGtNode && gtNode) {
          gtData = new Gamertag(gtNode).data;
          userGtData = new Gamertag(userGtNode).data;

          var results = {
            gtData: gtData,
            prefG: _parseCollection(result[i].prefG, Game, 'name'),
            avG: _parseCollection(result[i].avG, Game, 'name'),
            disG: _parseCollection(result[i].disG, Game, 'name')
          };

          var rating = (results.prefG.length) * weights.prefer;
          rating += (results.avG.length) * weights.avoid;
          rating = rating / (rating +
            results.disG.length * weights.disagree);

          rating *= (100 - 2 * Math.abs(
            userGtData.csr_max - gtData.csr_max))/100;

          results.rating = Math.round(100*Math.pow(rating, 1));

          comparisons[gtData.gamertag] = results;
        }
//        else {
//          // user hasn't added a gamertag
//          comparisons[i] = null;
//        }
      }

      return callback(null, comparisons);
    }
    else {
      // result []
      return callback(null, []);
    }
  }).send();
};



module.exports = Profile;

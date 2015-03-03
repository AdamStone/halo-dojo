"use strict";

var db = require('../../config/database'),
    SharedConstants = require('../../../shared/constants');

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

  var profileData = new Profile(result[0].profile).data;
  profileData.games = games;

  return callback(null, profileData);
};



// Static methods



Profile.get = function(userId, callback) {
  var cypher = [
    'MATCH (user:User)-[o:OWNS]->(profile:Profile)',
    'WHERE user.id = {userId}',
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
  
  var matches = '',
      creates = '';
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

    'CREATE UNIQUE (user)-[o:OWNS]->(profile:Profile)',
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



module.exports = Profile;
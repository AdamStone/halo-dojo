"use strict";

var db = require('../../config/database');

function Gamertag(_node) {
  this._node = _node;
}

var properties = [
  'gamertag'
];

properties.forEach(function(property) {
  Object.defineProperty(Gamertag.prototype, property, {
    get: function() {
      return this._node._data.data[property];
    },
    set: function(value) {
      this._node._data.data[property] = value;
    }
  });
});

Object.defineProperty(Gamertag.prototype, 'data', {
  get: function() {
    return this._node._data.data;
  },
  set: function(value) {
    this._node._data.data = value;
  }
});


// Static methods

Gamertag.create = function(ownerId, gamertag, callback) {
  var cypher = [
    'MATCH (user:User {id: {id}})',
    'CREATE (gt:Gamertag {gamertag: {gt}})',
    'CREATE (user)-[o:OWNS]->(gt)',
    'WITH user',
    'MATCH (user)-[o:OWNS]->(gamertag:Gamertag)',
    'RETURN gamertag'
  ].join('\n');
  
  var params = { 
    id: ownerId,
    gt: gamertag
  };
  
  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      var gamertags = [];
      for (var i=0; i < result.length; i++) {
        gamertags.push(
          new Gamertag(result[i].gamertag).data
        );
      }
      // Returns all GTs owned by user
      return callback(null, gamertags);
    }
  }).send();
};



Gamertag.setData = function(gamertag, data, callback) {
  var cypher = [
    'MATCH (gamertag:Gamertag {gamertag: { gamertag }})',
    'SET gamertag = { data }',
    'RETURN gamertag'
  ].join('\n');
  
  var params = {
    data: data,
    gamertag: gamertag
  };
  
  data.gamertag = gamertag;
  console.log(data);
  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      return callback(null, new Gamertag(result[0].gamertag).data);
    }
  }).send();
};



module.exports = Gamertag;
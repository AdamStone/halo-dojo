"use strict";

var db = require('../../config/database');

function Gamertag(_node) {
  this._node = _node;
}

var properties = [
  'gamertag',
  'csr_max',
  'games_played',
  'kd',
  'total_deaths',
  'total_kills',
  'wl'
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
    'OPTIONAL MATCH (user)-[:MAINS]->(main:Gamertag)',
    'CREATE (gt:Gamertag {gamertag: {gt}})',
    'CREATE (user)-[o:OWNS]->(gt)',

    // if no main exists, set gt as main
    'WITH user, gt, main, ',
      'CASE main WHEN NULL THEN [1] ELSE [] END as nomain',

    'FOREACH (n IN nomain | ',
      'CREATE UNIQUE (user)-[:MAINS]->(gt)',
    ')',

    // return all gamertags
    'WITH user',
    'MATCH (user)-[:OWNS]->(gamertag:Gamertag)',
    'MATCH (user)-[:MAINS]->(main:Gamertag)',
    'RETURN main, collect(gamertag) as gamertags'
  ].join('\n');

  var params = {
    id: ownerId,
    gt: gamertag
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (result) {
      console.log(result);
      var main = new Gamertag(result[0].main).data;
      var gamertags = [];
      for (var i=0; i < result[0].gamertags.length; i++) {
        gamertags.push(
          new Gamertag(result[0].gamertags[i]).data
        );
      }
      // Returns all GTs owned by user
      return callback(null, {
        gamertags: gamertags,
        main: main
      });
    }
  }).send();
};



Gamertag.setData = function(gamertag, data, callback) {

  data.gamertag = gamertag;

  var cypher = [
    'MATCH (gt:Gamertag)',
    'WHERE gt.gamertag = { data }.gamertag',
    'SET gt = { data }',
    'RETURN gt as gamertag'
  ].join('\n');

  var params = {
    data: data
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (result) {
      return callback(null, new Gamertag(result[0].gamertag).data);
    }
  }).send();
};



module.exports = Gamertag;

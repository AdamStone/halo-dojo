"use strict";

var db = require('../../config/database'),
    UUID = require('node-uuid');

var Gamertag = require('./Gamertag');

// constructor
function User(_node) {
  this._node = _node;
}

// public instance properties
var properties = [
  'id',
  'email',
  'hash',
  'gamertag'
];

properties.forEach(function(property) {
  Object.defineProperty(User.prototype, property, {
    get: function() {
      return this._node._data.data[property];
    },
    set: function(value) {
      this._node._data.data[property] = value;
    }
  });
});

Object.defineProperty(User.prototype, 'data', {
  get: function() {
    return this._node._data.data;
  },
  set: function(value) {
    this._node._data.data = value;
  }
});



// Static methods

User.getBy = function(property, value, callback) {
  var cypher = [
    'MATCH (user {' + property + ': {value}})',
    'WHERE user:User',
    'RETURN user'
  ].join('\n');

  var params = {
    value: value
  };
  
  db.query(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (!result.length) {
      return callback();
    }
    else {
      return callback(null, new User(result[0].user));
    }
  });
};



User.create = function(data, callback) {
  var cypher = [
    'CREATE (user:User {data})',
    'RETURN user'
  ].join('\n');

  data.id = UUID.v4();
    
  var params = {
    data: data
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    else {
      return callback(null, new User(result[0].user));
    }
  }).send();
};



User.createTemp = function(data, callback) {
  var cypher = [
    'CREATE (user:TempUser {data})',
    'RETURN user'
  ].join('\n');
  
  data.id = UUID.v4();
  
  var params = {
    data: data
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    else {
      return callback(null, new User(result[0].user));
    }
  }).send();
};



User.activate = function(id, callback) {
  var cypher = [
    'MATCH (temp {id: {id}})',
    'WHERE temp:TempUser',
    'OPTIONAL MATCH (c:Credentials)-[r:AUTHENTICATE]->(temp)',
    'WITH c, r, temp',
    'CREATE (user:User)',
    'SET user=temp',
    'WITH c, r, user, temp',
    'DELETE c, r, temp',
    'RETURN user'
  ].join('\n');

  var params = {
    id: id
  };
  
  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    else {
      return callback(null, new User(result[0].user));
    }
  }).send();
};



User.getData = function(id, callback) {
  var cypher = [
    'MATCH (user:User {id: {id}})',
    'OPTIONAL MATCH (user)-[m:MAIN]->(main:Gamertag)',
    'OPTIONAL MATCH (user)-[o:OWNS]->(gamertag:Gamertag)',
    'RETURN main, gamertag'
  ].join('\n');
  
  var params = {
    id: id
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
      return callback(null, {
        gamertags: gamertags,
        main: new Gamertag(result[0].main).data
      });
    }
  }).send();
};


module.exports = User;
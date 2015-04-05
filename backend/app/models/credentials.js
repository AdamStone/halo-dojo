"use strict";

var db = require('../../config/database'),
    User = require('./user'),
    UUID = require('node-uuid'),

    TOKEN_LIFETIME = require('../../config/constants').TOKEN_LIFETIME;

// private constructor
var Credentials = function Credentials(_node) {
  this._node = _node;
};

// public instance properties
var properties = [
  'id',
  'key',
  'algorithm',
  'expires',
  'user',
  'code'
];

properties.forEach(function(property) {
  Object.defineProperty(Credentials.prototype, property, {
    get: function() {
      return this._node._data.data[property];
    },
    set: function(value) {
      this._node._data.data[property] = value;
    }
  });
});

Object.defineProperty(Credentials.prototype, 'data', {
  get: function() {
    return this._node._data.data;
  },
  set: function(value) {
    this._node._data.data = value;
  }
});



// static methods

Credentials.delete = function(id, callback) {
  var cypher = [
    'MATCH (credentials:Credentials {id: {id}})-[r:AUTHENTICATE]->(user)',
    'DELETE r, credentials'
  ].join('\n');

  db.queryFactory(cypher, { id: id }, function(err, result) {
    if (err) {
      return callback(err);
    }
    else {
      return callback(null, result);
    }
  }).send();
};



Credentials.get = function(id, callback) {
  var cypher = [
    'MATCH (credentials:Credentials {id: {id}})-[:AUTHENTICATE]->(user)',
    'RETURN credentials, user'
  ].join('\n');

  db.query(cypher, { id: id }, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result.length !== 1) {
      return callback('Invalid credentials');
    }

    var token = new Credentials(result[0].credentials),
        user = new User(result[0].user);

    // delete expired tokens
    if (token.expires < Math.floor(new Date().getTime()/1000)) {
      var cypher = [
        'MATCH (credentials:Credentials {id: {id}})-[r:AUTHENTICATE]->(user)',
        'DELETE credentials, r'
      ].join('\n');

      db.queryFactory(cypher, { id: token.id }, function(err, result) {
        if (err) {
          return callback(err);
        }
        if (result) {
          return callback('Your authentication has expired, please log in again');
        }
      }).send();
    }
    else {
      var credentials = {
        email: user.email,
        user: user._node,
        id: id,
        key: token.key,
        algorithm: token.algorithm
      };
      return callback(null, credentials);
    }

  });
};



Credentials.create = function(data, callback) {
  var cypher = [
    'MATCH (user)',
    'WHERE user.id = {id} AND (user:User or user:TempUser)',
    'OPTIONAL MATCH (old:Credentials)-[r:AUTHENTICATE]->(user)',
    'DELETE old, r',
    'CREATE UNIQUE (credentials:Credentials {data})-[:AUTHENTICATE]->(user)',
    'RETURN credentials'
  ].join('\n');

  var params = {
    data: data,
    id: data.user
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    else {
      return callback(null, new Credentials(result[0].credentials));
    }
  }).send();
};



Credentials.authenticate = function(user, callback, expires) {
  require('crypto').randomBytes(48, function(ex, buf) {
    var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');

    var data = {
      user: user.id,
      id: UUID.v4(),
      key: token,
      algorithm: 'sha256'
    };

    if (user.code !== undefined) {
      data.code = user.code;
    }
    if (expires) {
      data.expires = expires;
    }
    else {
      data.expires = Math.floor(new Date().getTime()/1000) + TOKEN_LIFETIME;
    }
    Credentials.create(data, function(err, credentials) {
      if (err) {
        return callback(err);
      }
      else {
        return callback(null, credentials.data);
      }
    });
  });
};

module.exports = Credentials;

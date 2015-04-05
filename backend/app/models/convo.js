"use strict";

var db = require('../../config/database'),
    Message = require('./message'),
    Gamertag = require('./gamertag');

function Convo(node) {
  this._node = node;
}

// Public instance properties
var properties = [
  'startTime',
  'lastTime'
];

properties.forEach(function(property) {
  Object.defineProperty(Convo.prototype, property, {
    get: function() {
      return this._node._data.data[property];
    },
    set: function(value) {
      this._node._data.data[property] = value;
    }
  });
});

Object.defineProperty(Convo.prototype, 'data', {
  get: function() {
    return this._node._data.data;
  },
  set: function(value) {
    this._node._data.data = value;
  }
});



// Static methods



Convo.getUserConvos = function(userId, callback, maxMsgs) {
  /*
    Get gamertags of users with whom specified
    user has conversed. Get recent messages of
    [:UNREAD] convos.
  */

  // default to 10 messages
  maxMsgs = typeof maxMsgs !== 'undefined' ? maxMsgs.toString() : '10';

  var cypher = [
    // get all (:Convo) partners associated with user
    'MATCH (user {id: {id}})',
    'OPTIONAL MATCH ' +
      '(user)-[:HAD]-(c:Convo)-[:HAD]-(other:User)' +
        '-[:MAINS]->(gt:Gamertag)',
    'WHERE NOT id(user) = id(other)',

    // get subset marked [:UNREAD]
    'WITH user, c, other, gt',
    'OPTIONAL MATCH ' +
      '(user)-[:UNREAD]->(unread:Convo)-[:HAD]-(other)',

    // get messages associated with unread
    'OPTIONAL MATCH ' +
      '(unread)-[:LAST]->()' +
        '<-[:NEXT*0..' + maxMsgs + ']-(m:Message)',

    'RETURN gt AS gamertag, collect(DISTINCT m) as messages',

  ].join('\n');

  var params = {
    id: userId
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }

    var payload = {};

    // each row contains gamertag and, if unread, maxMsgs messages
    result.forEach(function(row) {
      var gamertag = new Gamertag(row.gamertag).gamertag;

      payload[gamertag] = [];
      if (row.messages.length) {
        // newest messages are first in array
        row.messages.forEach(function(m) {
          payload[gamertag].unshift(new Message(m).data);
        });
      }
    });

    return callback(null, payload);
  }).send();
};



Convo.append = function(senderGamertag, recipientGamertag, message,
                         offline, callback) {
  /*
    If no (:Convo) exists,
      creates (:Convo) pointing to [:LAST] (:Message)
    If (:Convo) does exist,
      appends (:Message) to linked list as new [:LAST]
  */

  // if recipient offline, mark (:Convo) as [:UNREAD]
  var unread = '';
  if (offline) {
    unread = 'CREATE (other)-[:UNREAD]->(c)';
  }

  var cypher = [
    // find (:Convo) if it exists, else create a new one
    'MATCH (user:User)-[:MAINS]->(sGT:Gamertag {gamertag: {sGT}})',
    'MATCH (other:User)-[:MAINS]->(rGT:Gamertag {gamertag: {rGT}})',
    'MERGE (user)-[:HAD]->(c:Convo)<-[:HAD]-(other)',
    'ON CREATE SET c.startTime = {messageData}.time',
    'SET c.lastTime = {messageData}.time',
    'WITH user, c, other',

    // find previous [:LAST] (:Message) if it exists,
    // and delete [:LAST]
    'OPTIONAL MATCH (c)-[del:LAST]->(lst:Message)',
    'DELETE del',

    // create new (:Message) as [:LAST] and mark who [:SENT]
    'CREATE (c)-[:LAST]->(this:Message {messageData})',
    'CREATE (user)-[:SENT]->(this)',

    // if a previous [:LAST] was found, link it to new [:LAST]
    'FOREACH (x IN CASE WHEN lst IS NULL THEN [] ELSE [1] END |',
    '  CREATE (this)<-[:NEXT]-(lst)',
    ')',

    // if recipient offline, mark (:Convo) as [:UNREAD]
    unread,  // conditionally defined above

    // return the new message node
    'RETURN this'
  ].join('\n');

  var messageData = {
    text: message,
    time: Math.floor(new Date().getTime()/1000)
  };

  var params = {
    sGT: senderGamertag,
    rGT: recipientGamertag,
    messageData: messageData
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    var payload = new Message(result[0].this).data;
    payload.from = senderGamertag;
    payload.to = recipientGamertag;
    return callback(null, payload);
  }).send();
};

module.exports = Convo;

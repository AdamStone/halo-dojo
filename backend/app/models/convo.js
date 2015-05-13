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
  maxMsgs = typeof maxMsgs !== 'undefined' ?
                        maxMsgs.toString() : '10';

  var cypher = [
    // get all (:Convo) partners associated with user
    'MATCH ',
      '(user {id: {id}})',
    'OPTIONAL MATCH ',
      '(user)-[:HAD]-(c:Convo)-[:HAD]-(other:User)',
        '-[:MAINS]->(gt:Gamertag)',
    'WHERE NOT ',
      'id(user) = id(other)',

    // get subset marked [:UNREAD]
    'WITH ',
      'user, c, other, gt',
    'OPTIONAL MATCH ',
      '(user)-[:UNREAD]->(unread:Convo)-[:HAD]-(other)',

    // get messages associated with unread
    'OPTIONAL MATCH ',
      '(unread)-[:LAST]->()<-[:NEXT*0..' +
                              maxMsgs + ']-(m:Message)',

    // get sender and recipient of each message
    'WITH ',
      'gt, c, m',
    'OPTIONAL MATCH ',
      '(m)<-[:SENT]-(:User)-[:MAINS]->(sender:Gamertag),',
      '(m)-[:TO]->(:User)-[:MAINS]->(recipient:Gamertag)',

    'RETURN ',
      'gt AS gamertag, ',
      'c.lastTime AS lastTime, ',
      'collect(m) AS messages, ',
      'collect(sender.gamertag) AS senders,',
      'collect(recipient.gamertag) AS recipients',
    'ORDER BY ',
      'lastTime DESC'

  ].join('\n');

  var params = {
    id: userId
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    /*
      result format:
        [{
          gamertag: {gamertag: , csr_max: , ...},
          lastTime: (time of last message in convo),
          messages: [{text: , time: }, {...}, ...],
          senders:  [(gt strings of corr. senders)],
          recipients:  [(gt strings of corr. recipients)],
        }, {
          ...
        }]
    */

    var payload = [];

    // parse result
    result.forEach(function(row) {
      if (row.gamertag) {
        var gtData = new Gamertag(row.gamertag).data,
            lastTime = row.lastTime;

        var messages = [],
            unread = false;
        if (row.messages.length) { // convo is unread
          // newest messages are first in array
          for (var i=0; i < row.messages.length; i++) {
            var m = new Message(row.messages[i]).data;
            m.from = row.senders[i];
            m.to = row.recipients[i];
            messages.unshift(m);
          }
          unread = true;
        }
        var entry = {};
        entry[gtData.gamertag] = {
          messages: messages,
          unread: unread,
          lastTime: lastTime
        };
        payload.unshift(entry);
      }
    });
    return callback(null, payload);
  }).send();
};



Convo.getMessages = function(userId, gamertag,
                             callback, maxMsgs) {
  // default to 10 messages
  maxMsgs = typeof maxMsgs !== 'undefined' ?
                        maxMsgs.toString() : '10';
  var cypher = [
    'MATCH',
      '(user:User {id: {id}}),',
      '(gt:Gamertag {gamertag: {gt}})',

    // get last maxMsgs messages
    'OPTIONAL MATCH',
      '(user)-[:HAD]->(c:Convo)',
        '<-[:HAD]-(other:User)-[:MAINS]->(gt),',
      '(c)-[:LAST]->()<-[:NEXT*0..' +
                         maxMsgs + ']-(m:Message)',

    // get sender and recipient of each message
    'WITH ',
      'm',
    'OPTIONAL MATCH ',
      '(m)<-[:SENT]-(:User)-[:MAINS]->(sender:Gamertag),',
      '(m)-[:TO]->(:User)-[:MAINS]->(recipient:Gamertag)',

    'RETURN ',
      'collect(m) AS messages, ',
      'collect(sender.gamertag) AS senders,',
      'collect(recipient.gamertag) AS recipients'

  ].join('\n');

  var params = {
    id: userId,
    gt: gamertag
  };
  db.queryFactory(cypher, params, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (result) {
      var messages = [];
      for (var i=0; i < result[0].messages.length; i++) {
        var m = new Message(result[0].messages[i]).data;
        m.from = result[0].senders[i];
        m.to = result[0].recipients[i];
        messages.unshift(m);
      }
      return callback(null, messages);
    }
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
    unread = 'CREATE UNIQUE (other)-[:UNREAD]->(c)';
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

    // create new (:Message) as [:LAST]
    'CREATE (c)-[:LAST]->(this:Message {messageData})',

    // mark who [:SENT] and [:TO] whom
    'CREATE (user)-[:SENT]->(this)-[:TO]->(other)',

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



Convo.markRead = function(userId, gamertag, callback) {
  var cypher = [
    'MATCH',
      '(user:User {id: {id}}),',
      '(other:User)-[:MAINS]->(gt:Gamertag {gamertag: {gt}})',
    'OPTIONAL MATCH',
      '(user)-[del:UNREAD]->(:Convo)<-[:HAD]-(other)',
    'DELETE',
      'del',
    'RETURN',
      'gt AS gamertag'
  ].join('\n');

  var params = {
    id: userId,
    gt: gamertag
  };

  db.queryFactory(cypher, params, function(err, result) {
    if (err && callback) {
      return callback(err);
    }
    if (result) {
      return callback(null,
          new Gamertag(result[0].gamertag).gamertag);
    }
  }).send();

};

module.exports = Convo;

var neo4j = require('neo4j');

var db = new neo4j.GraphDatabase('http://localhost:7474');

db.queryFactory = function(cypher, params, callback) {
  var self = {
    cypher: cypher,
    params: params, 
    callback: callback
  };
  
  self.send = function() {
    db.query(self.cypher, self.params, function(err, result) {
      if (err && err.message.substring(0, 10) === 'LockClient') {
        console.log('Query deadlock detected, retrying...');
        setTimeout(function() { self.send() }, 250); 
      }
      else 
        self.callback(err, result);
    });
  };
  return self;
};

module.exports = db;
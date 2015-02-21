var db = require('./config/database.js');

module.exports = {
  initialize: function() {
    var queries = [
      'CREATE CONSTRAINT ON (user:User) ASSERT user.id IS UNIQUE',
      'CREATE CONSTRAINT ON (user:User) ASSERT user.email IS UNIQUE',
      'CREATE CONSTRAINT ON (gt:Gamertag) ASSERT gt.gamertag IS UNIQUE',
      'CREATE CONSTRAINT ON (credentials:Credentials) ASSERT credentials.id IS UNIQUE'

      'CREATE CONSTRAINT ON (game:Game) ASSERT game.name IS UNIQUE',
//      'CREATE CONSTRAINT ON (gametype:Gametype) ASSERT gametype.name IS UNIQUE'
    ];

    for (var i=0; i < queries.length; i++) {
      setTimeout(function(cypher) {
        db.queryFactory(cypher, {}, function(err, result) {
          if (err) 
            return console.error(err);
          if (result)
            console.log(result);
        }).send();

      }, 500*(i+1), queries[i]);
    };
  }
};
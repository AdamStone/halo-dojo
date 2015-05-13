// Populate database with dummy data

var db = require('../backend/config/database'),
    setupDB = require('./setupDB'),
    UUID = require('node-uuid'),
    Bcrypt = require('bcrypt'),
    Constants = require('../shared/constants'),
    Profile = require('../backend/app/models/profile');

var fileIO = require('./fileIO'),
    password = fileIO.readPassword();

function rollGames(profile) {
  var roll, hasPreferred;
  Constants.GAME_NAMES.forEach(function(name) {
    roll = Math.random()*3;
    if (roll < 1) {
      profile.games[name] = -1;
    }
    if (roll > 2) {
      profile.games[name] = 1;
      hasPreferred = true;
    }
  });
  if (hasPreferred) {
    return true;
  }
  else {
    console.log('No preferred games, rolling again');
    return rollGames(profile);
  }
}

var populate = function() {
  var gamertags = fileIO.readGamertags();
  gamertags.forEach(function(gamertag, index) {

    setTimeout(function(gamertag) {
      Bcrypt.hash(password, 10, function(err, hash) {

        var cypher, params, userData, gtData;

        userData = {
          email: gamertag.replace(/ /g, '_') + '@thehalodojo.com',
          id: UUID.v4(),
          hash: hash
        };

        // generate semi-random (reasonably consistent) stats

        var aggression = Math.random()*4 + 1,
            csr = Math.floor(Math.random()*50 + 1);

        var range = csr*0.5,
            adj_csr = csr + (Math.random()*range + 1) - range/2,
            played = Math.floor(Math.random()*2500 + 1),
            kd = Math.floor(adj_csr/50*2000 + 500)/1000,
            kills = Math.floor(played*5*aggression),
            deaths = Math.floor(kills/kd),
            fWin = (csr/60+1)/3+0.1;

        gtData = {
          gamertag: '_'+gamertag,
          csr_max: csr,
          games_played: played,
          kd: kd,
          total_deaths: deaths,
          total_kills: kills,
          wl: Math.floor(fWin/(1-fWin)*10)/10
        };


        // randomly prefer/avoid some games

        var profile = {
          bio: '',
          games: {
            h1: 0,
            h2: 0,
            h3: 0,
            h4: 0,
            h2a: 0,
            h5: 0
          }
        };

        rollGames(profile);


        // execute query

        cypher = [
          'MERGE (u:User {email: {userData}.email})',
          'MERGE (gt:Gamertag {gamertag: {gtData}.gamertag})',
          'CREATE UNIQUE (u)-[:MAINS]->(gt)',
          'SET u = {userData}',
          'SET gt = {gtData}',
          'RETURN u as user, gt as gamertag'
        ].join('\n');

        params = {
          userData: userData,
          gtData: gtData
        };

        db.queryFactory(cypher, params, function(err, result) {
          if (err) {
            console.error(err);
          }
          if (result) {
            Profile.save(userData.id, profile, function(err, result) {
              if (err) {
                console.error(err);
              }
              if (result) {
                console.log(gamertag + ' saved');
                console.log(result);
              }
            });
          }
        }).send();

      });
    }, index*1000, gamertag);
  });
};

// initialize,
setupDB.initialize(function() {
  // then populate
  setTimeout(function() {
    populate();
  }, 5000);
});


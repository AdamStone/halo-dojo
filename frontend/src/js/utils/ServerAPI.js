var Request = require('superagent'),
    Hawk = require('hawk'),
    Urls = require('../../../../shared/urls');




var handlerFactory = function(callback) {
  return function(err, res) {
    if (err)
      return callback(err);
    if (res)
      return callback(null, res);
  };
};



var authHeader = function(path, method, token) {
  return Hawk.client.header(Urls.http.domain + path, method, {
    credentials: token
  }).field;
};


var _token = null;

module.exports = {

  // PUBLIC ROUTES
  
  submitRegistration: function(email, password, callback) {
    var handler = handlerFactory(callback);
    Request
      .post(Urls.https.domain + '/register')
      .send({email: email, password: password})
      .end(handler);
  },

  submitLogin: function(email, password, callback) {
    var handler = handlerFactory(callback);
    Request
      .post(Urls.https.domain + '/login')
      .set('Content-Type', 'application/json')
      .send({email: email, password: password})
      .end(handler);
  },

  // AUTHENTICATED ROUTES
  
  auth: {
  
    setToken: function(token) {
      _token = token;
    },
  
    getUserData: function(callback) {
      var handler = handlerFactory(callback);
      var path = '/userdata';
      console.log('getUserData called in serverAPI');
      Request
        .get(path)
        .set('Authorization', authHeader(path, 'get', _token))
        .end(handler);
    },
    
    getProfileData: function(callback) {
      var handler = handlerFactory(callback);
      var path = '/profile';
      console.log('getProfile called in serverAPI');
      Request
        .get(path)
        .set('Authorization', authHeader(path, 'get', _token))
        .end(handler)
    },
     
    saveProfile: function(data, callback) {
      var handler = handlerFactory(callback);
      var path = '/profile';
      console.log('saveProfile called in serverAPI');
      Request
        .put(path)
        .send({
          bio: data.bio,
          games: data.games
        })
        .set('Authorization', authHeader(path, 'put', _token))
        .end(handler);
    },

    addGamertag: function(gamertag, callback) {
      var handler = handlerFactory(callback);
      var path = '/addgt';
      Request
        .post(path)
        .send({
          gamertag: gamertag
        })
        .set('Authorization', authHeader(path, 'post', _token))
        .end(handler);
    }
  
  }
};
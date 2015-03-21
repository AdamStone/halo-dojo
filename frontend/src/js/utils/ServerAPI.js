"use strict";

var Request = require('superagent'),
    Hawk = require('hawk'),
    Urls = require('../../../../shared/urls');

// NOTE for some reason, moving import to top returns {}
var _getToken = function() {
  return require('../stores/UserStore').get().token;
};


var handlerFactory = function(callback) {
  return function(err, res) {
    if (err) {
      return callback(err);
    }
    if (res) {
      return callback(null, res);
    }
  };
};



var authHeader = function(path, method, token) {
  return Hawk.client.header(Urls.http.domain + path, method, {
    credentials: token
  }).field;
};


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

  submitActivate: function(email, password, code, callback) {
    var handler = handlerFactory(callback);
    Request
      .post(Urls.https.domain + '/activate/' + code)
      .set('Content-Type', 'application/json')
      .send({email: email, password: password, code: code})
      .end(handler);
  },



  // AUTHENTICATED ROUTES

  auth: {

    getUserData: function(callback) {
      var handler = handlerFactory(callback);
      var path = '/userdata';
      console.log('getUserData called in serverAPI');
      Request
        .get(path)
        .set('Authorization', authHeader(path, 'get', _getToken()))
        .end(handler);
    },

    getProfileData: function(callback) {
      var handler = handlerFactory(callback);
      var path = '/profile';
      console.log('getProfile called in serverAPI');
      Request
        .get(path)
        .set('Authorization', authHeader(path, 'get', _getToken()))
        .end(handler);
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
        .set('Authorization', authHeader(path, 'put', _getToken()))
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
        .set('Authorization', authHeader(path, 'post', _getToken()))
        .end(handler);
    }

  }
};

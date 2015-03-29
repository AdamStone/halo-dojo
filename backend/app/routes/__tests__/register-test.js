"use strict";

jest.dontMock('../https-handlers');

var register, request, reply, User, Credentials;

describe('register', function() {

  beforeEach(function() {
    register = require('../https-handlers').register;
    User = require('../../models/user');
    Credentials = require('../../models/credentials');

    // simulate email available as default
    User.getBy.mockImpl(function(property, value, callback) {
      callback(null, null);
    });

    // simulate successful createTemp by default
    User.createTemp.mockImpl(function(login, callback) {
      return callback(null, {email: 'user@example.com'});
    });

    request = {
      payload: {
        email: 'email@example.com',
        password: 'password'
      }
    };

    reply = jest.genMockFn();
  });



  it('returns reply() if http method is OPTIONS', function() {

    request.method = 'options';
    reply = jest.genMockFn();

    register(request, reply);

    expect(reply.mock.calls).toEqual([[]]);
  });



  it('Booms if email already in use', function() {

    // simulate email unavailable
    User.getBy.mockImpl(function(property, value, callback) {
      callback(null, 'foundUser');
    });

    register(request, reply);

    expect(User.getBy.mock.calls[0].slice(0,2))
      .toEqual(['email', request.payload.email]);
    expect(reply.mock.calls[0][0].isBoom).toBe(true);
  });



  it('creates tempUser with email and hashed password', function() {

    register(request, reply);

    // Bcrypt mock breaks so wait for real async fn to run
    waitsFor(function() {
      return User.createTemp.mock.calls.length;
    }, 1000);

    // checks after waitFor returns truthy
    runs(function() {
      expect(User.createTemp.mock.calls[0][0].email).toBeDefined();
      expect(User.createTemp.mock.calls[0][0].hash)
        .toBeDefined();
    });
  });



  it('authenticates tempUser', function() {

    register(request, reply);

    waitsFor(function() {
      return Credentials.authenticate.mock.calls.length;
    }, 1000);

    runs(function () {
      expect(Credentials.authenticate.mock.calls[0][0])
        .toEqual({email: 'user@example.com'});
    });
  });



  it('sends confirmation email', function() {

    var transport = require('nodemailer').createTransport();

    Credentials.authenticate.mockImpl(function(user, callback) {
      return callback(null, {id: 'uuid'});
    });

    register(request, reply);

    waitsFor(function() {
      return transport.sendMail.mock.calls.length;
    }, 1000);

    runs(function () {
      expect(transport.sendMail).toBeCalled();
      expect(reply.mock.calls[0][0].isBoom)
        .toBeUndefined();
    });
  });

});

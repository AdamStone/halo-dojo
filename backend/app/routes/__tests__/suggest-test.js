"use strict";

jest.dontMock('../http-handlers');
jest.dontMock('boom');

var suggest, request, reply, Profile, User;

describe('suggest', function() {

  beforeEach(function() {
    Profile = require('../../models/profile');
    User = require('../../models/user');
    suggest = require('../http-handlers')().suggest;

    User.mockImpl(function(node) {
      this.id = node.id;
    });

    Profile.suggest.mockImpl(function(id, callback) {
      if(id) {
        callback(null, 'result');
      }
      else {
        callback(' ');
      }
    });
  });



  it('calls Profile.suggest', function() {
    request = {
      auth: {
        credentials: {
          user: {
            id: 1
          }
        }
      }
    };
    reply = jest.genMockFn();
    suggest(request, reply);
    expect(Profile.suggest).toBeCalled();
  });



  it('booms if unsuccessful', function() {
    request = {
      auth: {
        credentials: {
          user: {
            id: 0
          }
        }
      }
    };
    reply = jest.genMockFn();
    suggest(request, reply);
    expect(reply.mock.calls[0][0].isBoom).toBe(true);
  });



  it('calls reply with result if successful', function() {
    request = {
      auth: {
        credentials: {
          user: {
            id: 1
          }
        }
      }
    };
    reply = jest.genMockFn();
    suggest(request, reply);
    expect(reply.mock.calls[0][0]).toBe('result');
  });

});

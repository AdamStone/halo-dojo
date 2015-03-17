"use strict";

var transport = {
  sendMail: jest.genMockFn()
};

module.exports = {
  createTransport: function(config) {

    transport.sendMail.mockImpl(function(options, callback) {
      return callback(null);
    });

    return transport;
  }
};

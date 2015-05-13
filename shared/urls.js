"use strict";

var URL  = require('url'),
    os = require('os');

var DOMAIN = 'www.thehalodojo.com';

var hostname = os.hostname(),
    ip = hostname.split('-').slice(1,5).join('.');

if (ip) {
  hostname = DOMAIN;
}
else if (hostname !== DOMAIN) {
  hostname = 'localhost';
}

var ports = {
  http: (hostname === 'localhost' ? ':8000' : ':80'),
  https: (hostname === 'localhost' ? ':9000' : ':443')
};

module.exports = {
  http: URL.parse('http://' + hostname + ports.http),
  https: URL.parse('https://' + hostname + ports.https),
  localhost: (hostname === 'localhost')
};

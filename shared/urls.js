"use strict";

var URL  = require('url');

var parseDomain = function(href) {
  var parsed = URL.parse(href);
  parsed.domain = [parsed.protocol, 
                   href.split('//')[1]
                       .split('/')[0]]
                       .join('//');
  return parsed;
};

var HTTP  = parseDomain('http://localhost:8000');
var HTTPS = parseDomain('https://localhost:9000/test');

module.exports = {
  http: HTTP,
  https: HTTPS
};
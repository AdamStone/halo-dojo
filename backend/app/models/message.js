"use strict";

var db = require('../../config/database');

function Message(node) {
  this._node = node;
}

// Public instance properties
var properties = [
  'text',
  'time',
  'to',
  'from'
];

properties.forEach(function(property) {
  Object.defineProperty(Message.prototype, property, {
    get: function() {
      return this._node._data.data[property];
    },
    set: function(value) {
      this._node._data.data[property] = value;
    }
  });
});

Object.defineProperty(Message.prototype, 'data', {
  get: function() {
    return this._node._data.data;
  },
  set: function(value) {
    this._node._data.data = value;
  }
});



// Static methods



module.exports = Message;

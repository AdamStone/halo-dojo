var db = require('../../config/database');


// constructor
function Game(_node) {
  this._node = _node;
}



// public instance properties
var properties = [
  'name'
];

properties.forEach(function(property) {
  Object.defineProperty(Game.prototype, property, {
    get: function () {
      return this._node._data.data[property];
    },
    set: function(value) {
      this._node._data.data[property] = value;
    }
  });
});

Object.defineProperty(Game.prototype, 'data', {
  get: function () {
    return this._node._data.data;
  },
  set: function(value) {
    this._node._data.data = value;
  }
});




// STATIC methods

Game.getBy = function(property, value, callback) {
  var cypher = [
    'MATCH (game:Game {' + property + ': {value}})',
    'RETURN game'
  ].join('\n');

  db.query(cypher, { value: value }, function(err, result) {
    if (err) {
      return callback(err);
    }
    if (!result.length) {
      return callback();
    }
    else {
      return callback(null, new Game(result[0].game));
    }
  });
};




module.exports = Game;

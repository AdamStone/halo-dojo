var fs = require('fs'),
    path = require('path');

var fileIO = {};

fileIO.readGamertags = function() {
  try {
    return fs.readFileSync(path.join(__dirname,
             'gamertags.txt'))
                .toString().split('\r\n');
  }
  catch (err) {
    console.error(err);
    return null;
  }
};

fileIO.readPassword = function() {
  try {
    return fs.readFileSync(path.join(__dirname,
             'gitignore.password.txt'))
                .toString().split('\r\n')[0];
  }
  catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = fileIO;

var ReactTools = require('react-tools');
module.exports = {
  process: function(src, file) {
    if (/\.jsx$/.test(file) || /test.js$/.test(file)) {
      return ReactTools.transform(src);
    }
    return src;
  }
};
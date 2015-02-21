module.exports = {
  copy: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  update: function(obj, upd) {
    var c = this.copy(obj);
    for (var key in upd) {
      c[key] = upd[key];
    }
    return c;
  }
}
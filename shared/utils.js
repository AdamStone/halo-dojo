"use strict";

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
  },

  parseTimestamp: function(secondsUTC) {
    var ts = new Date(secondsUTC*1000);
    var now = new Date();

    var tsDate = ts.toDateString();
    if (tsDate !== now.toDateString()) {
      // ts not the same day as now; return date
      return tsDate;
    }
    else {
      // ts on same day as now; return time
      var tsTime = ts.toTimeString().split(' ')[0];
      var hour = parseInt(tsTime.split(':')[0]),
          min = tsTime.split(':')[1];

      var pm = false;
      if (hour/12 > 1) {
        pm = true;
        hour = hour - 12;
      }

      var result = [hour.toString(), min].join(':');
      result += pm ? ' PM' : ' AM';
      return result;
    }
  }
};

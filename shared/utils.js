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

    // "Mon Apr 06 2015"
    var date = ts.toDateString();
    now = now.toDateString();

    if (date !== now) {
      // ts not the same day as now
      date = date.split(' ');
      date = {
        weekday: date[0],
        month: date[1],
        day: date[2],
        year: date[3]
      };
      now = now.split(' ');
      now = {
        weekday: now[0],
        month: now[1],
        day: now[2],
        year: now[3]
      };

      var dateString;
      if (now.year !== date.year) {
        dateString = [date.month, date.year].join(' ');
      }
      else {
        dateString = [date.month, date.day].join(' ');
      }

      return dateString;
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

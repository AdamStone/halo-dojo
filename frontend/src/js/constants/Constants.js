"use strict";

var keyMirror = require('react/lib/keyMirror');

module.exports = {

  User: keyMirror({
    AUTHENTICATED: null,
    UPDATE_USER_DATA: null,
    UPDATE_GAMERTAGS: null,
    CONNECTED: null,
    DISCONNECTED: null,
    LOST_CONNECTION: null,
    LOGGED_OUT: null
  }),

  UI: keyMirror({
    SHOW_OVERLAY: null,
    OVERLAY_LOGIN: null,
    OVERLAY_REGISTER: null,
    OVERLAY_MESSAGE: null,
    SET_URL_PATH: null
  }),

  Profile: keyMirror({
    SET_PROFILE: null,
    BIO_CHANGED: null,
    PREFERENCE_TOGGLED: null,
    AVOIDANCE_TOGGLED: null,
    SET_SAVE_STATUS: null
  }),

  Messaging: keyMirror({
    GOT_CONVOS: null,
    SENT_MESSAGE: null,
    RECEIVED_MESSAGE: null,
    MINIMIZED: null,
    EXPANDED: null,
    CLOSED: null
  }),

  Beacons: keyMirror({
    SET_BEACONS: null,
    SET_STATUS: null
  }),

  Player: keyMirror({
    GOT_PLAYER_DATA: null
  })
};

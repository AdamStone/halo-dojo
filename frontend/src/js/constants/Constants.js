"use strict";

var keyMirror = require('react/lib/keyMirror');

module.exports = {
  
  User: keyMirror({
    AUTHENTICATED: null,
    UPDATE_USER_DATA: null,
    UPDATE_GAMERTAGS: null,
    CONNECTED: null,
    DISCONNECTED: null,
    STATUS_UPDATE: null,
    LOGGED_OUT: null
  }),
  
  UI: keyMirror({
    SHOW_OVERLAY: null,
    OVERLAY_LOGIN: null,
    OVERLAY_REGISTER: null,
    OVERLAY_MESSAGE: null
  }),
  
  Profile: keyMirror({
    SET_PROFILE: null,
    BIO_CHANGED: null,
    PREFERENCE_TOGGLED: null,
    AVOIDANCE_TOGGLED: null,
    SET_SAVE_STATUS: null
  }),
  
  Messaging: keyMirror({
    SENT_MESSAGE: null,
    RECEIVED_MESSAGE: null,
    MINIMIZED: null,
    EXPANDED: null,
    CLOSED: null
  }),
  
  Beacons: keyMirror({
    SET_BEACONS: null
  })
};
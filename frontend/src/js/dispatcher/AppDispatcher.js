"use strict";

var Dispatcher = require('flux').Dispatcher;
var AppDispatcher = new Dispatcher();

AppDispatcher.handleViewAction = function(action) {
  if (action.actionType === undefined) {
    console.log('WARNING: UNDEFINED ACTION TYPE');
    console.log(action);
  }
  this.dispatch({
    source: 'VIEW_ACTION',
    action: action
  });
};

AppDispatcher.handleServerAction = function(action) {
  if (action.actionType === undefined) {
    console.log('WARNING: UNDEFINED ACTION TYPE');
    console.log(action);
  }
  this.dispatch({
    source: 'SERVER_ACTION',
    action: action
  });
};

module.exports = AppDispatcher;
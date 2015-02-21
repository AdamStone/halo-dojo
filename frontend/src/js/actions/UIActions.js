var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants');

var UIActions = {
  
  showLoginOverlay: function() {
    AppDispatcher.handleViewAction({
      actionType: Constants.UI.SHOW_OVERLAY,
      data: {
        overlay: Constants.UI.OVERLAY_LOGIN
      }
    });
  },
  
  showRegisterOverlay: function() {
    AppDispatcher.handleViewAction({
      actionType: Constants.UI.SHOW_OVERLAY,
      data: {
        overlay: Constants.UI.OVERLAY_REGISTER
      }
    });
  },
  
  hideOverlay: function() {
    AppDispatcher.handleViewAction({
      actionType: Constants.UI.SHOW_OVERLAY,
      data: {
        overlay: null
      }
    });
  }
  
};

module.exports = UIActions;
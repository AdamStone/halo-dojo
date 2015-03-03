var AppDispatcher = require('../dispatcher/AppDispatcher'),
    Constants = require('../constants/Constants');

var ProfileActions = {
  
  setProfile: function(data) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Profile.SET_PROFILE,
      data: data
    });
  },

  updateBio: function(bio) {
    AppDispatcher.handleViewAction({
      actionType: Constants.Profile.BIO_CHANGED,
      data: {
        bio: bio
      }
    });
  },
  
  togglePreference: function(type, title) {
    AppDispatcher.handleViewAction({
      actionType: Constants.Profile.PREFERENCE_TOGGLED,
      data: {
        type: type,
        title: title
      }
    });
  },
  
  toggleAvoidance: function(type, title) {
    AppDispatcher.handleViewAction({
      actionType: Constants.Profile.AVOIDANCE_TOGGLED,
      data: {
        type: type,
        title: title
      }
    });
  },
  
  setSaveStatus: function(status) {
    AppDispatcher.handleServerAction({
      actionType: Constants.Profile.SET_SAVE_STATUS,
      data: {
        status: status
      }
    });
  }
  
};

module.exports = ProfileActions;
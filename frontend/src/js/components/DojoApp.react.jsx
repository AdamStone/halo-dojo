/** @jsx React.DOM */
var React = require('react');

var Route = require('./Route.react.jsx');

var UserWidget = require('./UserWidget.react.jsx'),
    NavBar = require('./NavBar.react.jsx'),
    LandingPage = require('./LandingPage.react.jsx'),
    Dashboard = require('./Dashboard.react.jsx'),
    AuthForm = require('./AuthForm.react.jsx'),
    ActivatePage = require('./ActivatePage.react.jsx'),
    BeaconList = require('./BeaconList.react.jsx'),
    MessageBar = require('./MessageBar.react.jsx'),
    SideBar = require('./SideBar.react.jsx'),
    Overlay = require('./Overlay.react.jsx'),
    WorkInProgressMessage = require(
      './WorkInProgressMessage.react.jsx');

var MessagingStore = require('../stores/MessagingStore'),
    ProfileStore = require('../stores/ProfileStore'),
    UserStore = require('../stores/UserStore'),
    BeaconStore = require('../stores/BeaconStore'),
    UIStore = require('../stores/UIStore');

var Constants = require('../constants/Constants');

var stores = [
  BeaconStore,
  MessagingStore,
  ProfileStore,
  UIStore,
  UserStore
];


var routes = {

  activate: /^\/activate\/[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$/

};

function getAppState() {
  return {
    user: UserStore.get(),
    profile: ProfileStore.get(),
    ui: UIStore.get(),
    beacons: BeaconStore.get(),
    messaging: MessagingStore.get()
  };
};

module.exports = React.createClass({

  getInitialState: function() {
    return getAppState();
  },

  componentDidMount: function() {
    var self = this;
    stores.forEach(function(Store) {
      Store.addChangeListener(self._onChange);
    });
  },

  componentWillUnmount: function() {
    var self = this;
    stores.forEach(function(Store) {
      Store.removeChangeListener(self._onChange);
    });
  },



  render: function() {
    var user = this.state.user;

    // OVERLAY

    var overlay;
    switch(this.state.ui.overlay) {

      case Constants.UI.OVERLAY_REGISTER:
        overlay = (
          <Overlay>
            <AuthForm action="register"
                      focus="true"
                      autocomplete="off"/>
          </Overlay>
        )
        break;

      case Constants.UI.OVERLAY_LOGIN:
        overlay = (
          <Overlay>
            <AuthForm action="login"
                      focus="true"/>
          </Overlay>
        )
        break;

      default:
        overlay = null;
    }



    return (
      <div className="wrapper site-wrapper unselectable">

        <NavBar user={this.state.user}
                profile={this.state.profile}/>


        <Route condition={!user.token}>
          <LandingPage/>
        </Route>


        <Route condition={user.token}>
          <Dashboard user={user}
                     profile={this.state.profile}
                     beacons={this.state.beacons}
                     messaging={this.state.messaging}/>
        </Route>


        <Route protocol="https" url={routes.activate}>
          <ActivatePage/>
        </Route>


        {overlay}

      </div>
    );
  },



  _onChange: function() {
    this.setState(getAppState());
  }
});

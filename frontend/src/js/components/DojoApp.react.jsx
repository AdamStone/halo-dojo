/** @jsx React.DOM */
var React = require('react');
var UserWidget = require('./UserWidget.react.jsx'),
    NavBar = require('./NavBar.react.jsx'),
    LandingPage = require('./LandingPage.react.jsx'),
    Dashboard = require('./Dashboard.react.jsx'),
    RegistrationForm = require('./RegistrationForm.react.jsx'),
    LoginForm = require('./LoginForm.react.jsx'),    
    BeaconList = require('./BeaconList.react.jsx'),
    MessageBar = require('./MessageBar.react.jsx'),
    SideBar = require('./SideBar.react.jsx'),
    Overlay = require('./Overlay.react.jsx');
    
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
  
    return (
      <div className="wrapper site-wrapper unselectable">

        <NavBar user={this.state.user} 
                profile={this.state.profile} />

        {!user.token 
            && <LandingPage ref="landingPage" />}
        
        {user.token && !user.connected
            && <Dashboard user={user}
                          profile={this.state.profile}
                          messaging={this.state.messaging}/>}
        
        {user.token && user.connected
            && <BeaconList user={user}
                           messaging={this.state.messaging}
                           beacons={this.state.beacons}/>}
        
        {this.state.ui.overlay === Constants.UI.OVERLAY_REGISTER ?

          <Overlay>
            <RegistrationForm focus={true}/>
          </Overlay>

          : null
        }

        {this.state.ui.overlay === Constants.UI.OVERLAY_LOGIN ?

          <Overlay>
            <LoginForm focus={true}/>
          </Overlay>

          : null
        }

      </div>
    );
  },
  
  
  
  
  _onChange: function() {
    this.setState(getAppState());
  }
});
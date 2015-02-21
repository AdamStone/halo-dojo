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
    SideBar = require('./SideBar.react.jsx');
    
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

          <div className="overlay">
            <div className="window">
              <RegistrationForm focus={true} />
            </div>
          </div>

          : null
        }

        {this.state.ui.overlay === Constants.UI.OVERLAY_LOGIN ?

          <div className="overlay">
            <div className="window">
              <LoginForm focus={true}/>
            </div>
          </div>

          : null 
        }
        
      </div>
    );
  },
  
  
  
  
  _onChange: function() {
    this.setState(getAppState());
  }
});






















/*
            <li className="user-widget-slot"><UserWidget user={this.state.user}/></li>              
*/
              
/*
        <nav className="dojo-nav" role="navigation">
          <ul>
            <li className="brand"><img className="logo" src="./images/svg/dojo.svg"/><span className="brandname">The Halo Dojo</span></li>

            <li>FAQ</li>
            <li>Blog</li>
            <li>About</li>

            <li className="spacer"></li>
            
            {this.state.user ?
              
              <li>{this.state.user}</li>
              :
              <li onClick={this.showLoginOverlay}>
                Login
              </li>
            }
            
            {this.state.user ? 
              
              null
              :
              <li onClick={this.showRegistrationOverlay}>
                Register
              </li>
            }
            
          </ul>
        </nav>
*/


/*
          <div className="dojo-content">
            <BeaconList user={this.state.user}
                        beacons={this.state.beacons} />
            <MessageBar conversations={
              this.state.conversations}/>
          </div>*/

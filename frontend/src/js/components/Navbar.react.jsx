/** @jsx React.DOM */
var React = require('react');

var UIActions = require('../actions/UIActions'),
    UserActions = require('../actions/UserActions');

module.exports = React.createClass({

  showRegistrationOverlay: function(e) {
    UIActions.showRegisterOverlay();
  },
  
  showLoginOverlay: function(e) {
    UIActions.showLoginOverlay();
  },
  
  hideOverlay: function(e) {
    UIActions.hideOverlay();
  },
  
  logOut: function(e) {
    UserActions.logOut();
  },
  
  handleKeyDown: function(e) {
    if (e.keyCode === 27) {
      this.hideOverlay(e);
    }
  },

  componentDidMount: function() {
    window.addEventListener("keydown", this.handleKeyDown);
  },  

  componentWillUnmount: function() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },

  render: function() {
  
    var saveStatus;
    var saveStatusHover;
    switch (this.props.profile.unsaved) {
      case true:
        saveStatus = <span className="fa fa-circle-o"></span>
        saveStatusHover = "There are unsaved changes pending";
        break;
        
      case false:
        saveStatus = <span className="fa fa-check-circle"></span>;
        saveStatusHover = "Profile has been saved";
        break;
        
      default:
        saveStatus = null;
    }
  
    return (
      <div>
        <nav className="dojo-nav" role="navigation">
          <ul>
            <li className="brand">
              <img className="logo" src="./images/svg/dojo.svg"/>
              <span className="brandname">
                The Halo Dojo
              </span>
            </li>

            <li>FAQ</li>
            <li>Blog</li>
            <li>About</li>

            <li className="spacer"></li>

            <li className="indicator"
                title={saveStatusHover}>
              {saveStatus}
            </li>

            {this.props.user.token ? 

              null

              :

              <li onClick={this.showRegistrationOverlay}>
                Register
              </li>
            }

            {this.props.user.token ?

              <li onClick={this.logOut}>
                Log out
              </li>

              :

              <li onClick={this.showLoginOverlay}>
                Login
              </li>
            }

          </ul>
        </nav>


      </div>
    )
  }

});



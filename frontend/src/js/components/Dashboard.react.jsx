/** @jsx React.DOM */
var React = require('react');
var Server = require('../utils/ServerAPI'),
    UserStore = require('../stores/UserStore'),
    ProfileStore = require('../stores/ProfileStore'),
    ActionCreators = require('../actions/ActionCreators');

var SideBar = require('./SideBar.react.jsx'),
    MessageBar = require('./MessageBar.react.jsx'),
    GamertagStats = require('./GamertagStats.react.jsx'),
    Profile = require('./Profile.react.jsx'),
    SetGamertag = require('./SetGamertag.react.jsx');

module.exports = React.createClass({

  connect: function(e) {
    // TODO disable if no GT set
    ActionCreators.connect(this.props.user.main.gamertag);
  },

  componentDidMount: function() {
    // if Stores not cached, call the server
    if (!UserStore.cached())
      ActionCreators.getUserData();
    if (!ProfileStore.cached())
      ActionCreators.getProfileData();
  },

  render: function() {
    var user = this.props.user;

    return (
      <div>
        <div className="dashboard">

          {user.main &&
              <GamertagStats gamertag={user.main} />}

          {(!user.gamertags || !user.gamertags.length) &&
              <SetGamertag />}

          <Profile profile={this.props.profile} />

        </div>




        <SideBar>
          <div className="sidebar-item live-search"
               onClick={this.connect}>
            <h3>Realtime Search</h3>
          </div>

          <div className="sidebar-item suggested">
            <h3>Suggested Players</h3>
          </div>
        </SideBar>

        <MessageBar messaging={this.props.messaging}/>
      </div>
    );
  }
});

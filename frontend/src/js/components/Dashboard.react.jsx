/** @jsx React.DOM */
var React = require('react');
var Server = require('../utils/ServerAPI'),
    ActionCreators = require('../actions/ActionCreators');

var SideBar = require('./SideBar.react.jsx'),
    MessageBar = require('./MessageBar.react.jsx'),
    GamertagStats = require('./GamertagStats.react.jsx'),
    Profile = require('./Profile.react.jsx'),
    SetGamertag = require('./SetGamertag.react.jsx'),
    BeaconList = require('./BeaconList.react.jsx'),
    SuggestedPlayers = require('./SuggestedPlayers.react.jsx');


module.exports = React.createClass({

  activateBeacon: function(e) {
    // TODO disable if no GT set
    ActionCreators.activateBeacon();
  },

  deactivateBeacon: function(e) {
    // TODO disable if no GT set
    ActionCreators.deactivateBeacon();
  },

  connectCallback: function(err, result) {
    if (err) {
      console.error(err);
    }
    if (result) {
      if (this.props.beacons.active) {
        ActionCreators.activateBeacon(function(err) {
          if (err) {
            return console.error(err);
          }
          if (status) {
            console.log('calling setStatus with status:');
            console.log(status);
            ActionCreators.setStatus(status);
          }
        });
      }
    }
  },

  componentDidMount: function() {
    if (!this.props.user.cached) {
      ActionCreators.getUserData();
    }
    if (!this.props.profile.cached) {
      ActionCreators.getProfileData();
    }
    // connect socket if main gamertag already known
    if (this.props.user.main) {
      ActionCreators.connect(this.props.user.main.gamertag,
                             this.connectCallback);
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    // connect socket if main gamertag becomes known
    if (!prevProps.user.main && this.props.user.main ) {
      ActionCreators.connect(this.props.user.main.gamertag,
                             this.connectCallback);
    }
  },

  render: function() {
    var user = this.props.user,
        messaging = this.props.messaging,
        beacons = this.props.beacons;

    return (
      <div>

        {beacons.active ?
          <BeaconList user={user}
                      messaging={messaging}
                      beacons={beacons}/>
        :

        <div className="dashboard">

          {user.main &&
              <GamertagStats gamertag={user.main}/>
          }

          {(!user.main) &&
              <SetGamertag />}

          <Profile profile={this.props.profile}/>

        </div>

        }


        <SideBar>
          {beacons.active ?
            <div className="sidebar-item live-search"
                 onClick={this.deactivateBeacon}>
              <h3>Disconnect</h3>
            </div>
          :
            <div className="sidebar-item live-search"
                 onClick={this.activateBeacon}>
              <h3>Realtime Lobby</h3>
            </div>
          }

          <div className="sidebar-item suggested">
            <h3>Suggested Players</h3>
            <SuggestedPlayers players={this.props.players}/>
          </div>
        </SideBar>

        <MessageBar messaging={this.props.messaging}/>
      </div>
    );
  }
});

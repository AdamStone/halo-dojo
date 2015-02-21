/** @jsx React.DOM */
var React = require('react'),
    BeaconTile = require('./BeaconTile.react.jsx'),
    UserBeaconTile = require('./UserBeaconTile.react.jsx'),
    SideBar = require('./SideBar.react.jsx'),
    MessageBar = require('./MessageBar.react.jsx'),
    
    BeaconActions = require('../actions/BeaconActions'),
    UserActions = require('../actions/UserActions');

    
function sort(objs, key) {
  var compare = function(a, b) {
    if (a[key] < b[key])
      return -1;
    if (a[key] > b[key])
      return 1
    return 0;
  };
    objs.sort(compare);
    return objs;
};


// TODO fix socket problem on page reload

module.exports = React.createClass({

  disconnect: function() {
    UserActions.disconnect(function(err) {
      if (err)
        console.log(err);
    });
  },
  
  render: function() {
  
    var beacons = this.props.beacons;
    var user = this.props.user;
    var gamertags = Object.keys(beacons);
    
    var beaconTiles = [];
    
    for (var i=0; i < gamertags.length; i++) {
      if (gamertags[i] !== user.connected) {
        beaconTiles.push(
          <li key={beaconTiles.length+1}>
            <BeaconTile gamertag={gamertags[i]} 
                        data={beacons[gamertags[i]]}/>
          </li>
        )
      }
      else {
        beaconTiles.unshift(
          <li key={0}>
            <UserBeaconTile gamertag={user.connected} 
                            data={beacons[user.connected]}/>
          </li>        
        )
      }
    }
    
    
/*
    var beaconTiles = Object.keys(beacons).map(function(key, i) {
      if (key === this.props.user)
        i = 0;
      else
        i += 1;
      return <li key={i}><BeaconTile gamertag={key} data={beacons[key]}/></li>;
        });
*/
        
    return (
      <div>
        <ul className="beacon-list">
          {beaconTiles}
        </ul>
        
        <SideBar>
          <div className="sidebar-item live-search"
               onClick={this.disconnect}>
            <h3>Disconnect</h3>
          </div>
        </SideBar>
        
        <MessageBar messaging={this.props.messaging}/>
        
      </div>
    );
  }
});
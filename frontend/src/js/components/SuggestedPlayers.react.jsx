"use strict";

var React = require('react'),
    ActionCreators = require('../actions/ActionCreators'),
    PlayerTile = require('./PlayerTile.react.jsx');

module.exports = React.createClass({

  componentDidMount: function() {
    if (!this.props.players.cached) {
      ActionCreators.getSuggestedPlayers();
    }
  },

  render: function() {
    var playerData = this.props.players.data,
        tiles = [];

    Object.keys(playerData).forEach(function(gamertag, index) {
      tiles.push(<PlayerTile key={index}
                             playerData={playerData[gamertag]}/>);
    });
    tiles.sort(function(a, b) {
      return b.props.playerData.rating - a.props.playerData.rating;
    });

    return (
      <div className="suggested-players">

        {tiles}

      </div>
    );
  }
});

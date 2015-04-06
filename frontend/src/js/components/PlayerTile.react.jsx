var React = require('react'),
    MessageToggle = require('./MessageToggle.react.jsx');


module.exports = React.createClass({

  // condensed version of stats:
  // Gamertag, csr, win/loss, k/d ?

  // online / searching status ?

  // common preferred games ?


  getInitialState: function() {
    return {
      messagingActive: false
    };
  },


  showMessaging: function(e) {
    this.setState({
      messagingActive: true
    });
  },


  hideMessaging: function(e) {
    this.setState({
      messagingActive: false
    });
  },


  render: function() {

    var player = this.props.playerData,
        gtData = player.gtData,
        gamertag = gtData.gamertag,
        sharedPrefs = player.prefG,
        rating = player.rating;

    var icons = [];
    sharedPrefs.forEach(function(game, index) {
      icons.push(
        <img title={game}
             className="icon"
             key={index}
             src={"images/icons/" + game + ".png"}/>
      );
    });

    return (
      <div className="player-tile">
        <div className="tile-row">
          <h3 className="gamertag">{gamertag}</h3>
          <pre className="rating">{rating}</pre>
        </div>
        <div className="tile-row icon-row">
          {icons}
          <span className="fa fa-envelope-o icon msg-button"
                onClick={this.showMessaging}>
          </span>
        </div>

        {this.state.messagingActive ?
        <MessageToggle unmount={this.hideMessaging}
                       gamertag={gamertag}/> : null}
      </div>
    );
  }

});

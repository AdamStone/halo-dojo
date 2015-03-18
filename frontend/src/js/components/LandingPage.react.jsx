/** @jsx React.DOM */
var React = require('react');
var AuthForm = require('./AuthForm.react.jsx');

module.exports = React.createClass({

  render: function() {
    return (
        <div className="landing-page selectable">

          <div className="landing-title unselectable">
            <h1>The Halo Dojo</h1>
          </div>

          <div className="landing-tagline dark">
            <h2>The Halo Dojo is a real-time looking-for-group and teammate recommendation system for Halo online multiplayer</h2>
          </div>

          <div className="landing-section light">
            <h3>Escape the Solo Queue</h3>
            <p>For players with mics looking for communication and teamwork, solo matchmaking can be incredibly frustrating. The Halo Dojo leverages the latest web technologies to help compatible players team up in powerful new ways.</p>
          </div>

          <div className="landing-section dark">
            <h3>Ready when you are</h3>
            <p>When you're ready to play, find teammates on-the-fly by joining the real-time lobby. Invite players to team up through the built-in instant messaging system, or just set your status message, start playing, and wait for someone to message you. The lobby dynamically updates as users connect and disconnect, so it's always up-to-date.</p>
            <p><a href="">Learn more</a></p>
          </div>

          <div className="landing-section light">
            <h3>Find your dream team</h3>
            <p>The teammate recommendation system helps connect you with the most compatible teammates in the userbase by identifying similarities in skill ranks, game history, communication preferences, playstyle and more.</p>
            <p><a href="">Learn more</a></p>
          </div>

          <div className="landing-section dark">
            <h3>Suit up</h3>
            <p>Let's make the solo queue obsolete</p>
            <AuthForm action="register" autocomplete="off"/>
            <img className="logo"
                 src="/images/svg/dojo.svg" />
          </div>

        </div>
    )
  }
});

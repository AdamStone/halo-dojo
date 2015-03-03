/** @jsx React.DOM */
var React = require('react');
var ProfileActions = require('../actions/ProfileActions'),
    SharedConstants = require('../../../../shared/constants');

var gameNames = SharedConstants.GAME_NAMES;

module.exports = React.createClass({

  updateBio: function(e) {
    ProfileActions.updateBio(e.target.value);
  },
  
  togglePreference: function(e) {
    var type = e.target.name,
        title = e.target.title;
    ProfileActions.togglePreference(type, title);
  },
  
  toggleAvoidance: function(e) {
    var type = e.target.name,
        title = e.target.title;
    ProfileActions.toggleAvoidance(type, title);
  },
  
  render: function() {
    var games = this.props.profile.games;
    
    return (
      <table className="profile"
             cellSpacing="0"
             cellPadding="0">
        <tr>
        
        <td className="fixed-width">
          <div className="bio">
            <textarea onChange={this.updateBio}
                      value={this.props.profile.bio}
                      placeholder={"Enter anything you want here " + 
                                  "for potential teammates to see."}/>
          </div>
        </td>
                  
        <td className="preferences">
        
          <div className="tile"
               title="Select the Halo titles you want to play">
            <h3>Preferred Games</h3>
            <div>
              {gameNames.map(function(game) {
                 return <img key={game}
                         title={game}
                         name="games"
                         onClick={this.togglePreference}
                         className={"icon" + (
                           games[game] === 1 ? "" : " hover-solid grayscale"
                         )}
                         src={"images/icons/"
                              + game + ".png"}/>
              }, this)}
            </div>
          </div>
          
          
          <div className="tile"
               title="Select the Halo titles you really don't want to play">
            <h3>Avoided Games</h3>
            <div>
              {gameNames.map(function(game) {
                 return <img key={game}
                         title={game}
                         name="games"
                         onClick={this.toggleAvoidance}
                         className={"icon" + (
                           games[game] === -1 ? "" : " hover-solid grayscale"
                         )}
                         src={"images/icons/"
                              + game + ".png"}/>
              }, this)}
            </div>
          </div>


        </td>
        
        </tr>
      </table>
    );
  }
});

/*

          <div className="tile">
            <h3>Gametypes</h3>
              <ul>
                <li>Slayer</li>
                <li>Objective</li>
                <li>Competitive</li>
                <li>Big Team</li>
                <li>Doubles</li>
              </ul>

          </div>*/

/** @jsx React.DOM */
var React = require('react');

var UserStore = require('../stores/UserStore'),
    UserActions = require('../actions/UserActions');

var Server = require('../utils/ServerAPI');

var Joi = require('joi'),
    schema = require('../../../../shared/input-validation');


module.exports = React.createClass({

  addGamertag: function(e) {
    e.preventDefault();
    var gamertagInput = this.refs.addGamertagInput.getDOMNode();
    var gamertag = gamertagInput.value;
    Joi.validate(gamertag, schema.gamertag, 
                 function(err, gamertag) {
      if (err)
        this.setState({
          message: 'Not a valid gamertag'
        });
      else {
        var token = UserStore.getToken();
        Server.addGamertag(gamertag, token, function(err, res) {
        
          if (err) {  // Network error
            console.log(err);
            this.setState({
              message: 'There was an error contacting the server'
            });
          }
          if (res) {
          
            if (res.statusType === 2) {
              // Succeeded
              var gamertags = JSON.parse(res.text);
              UserActions.updateGamertags(gamertags);
              this.hideInput();
            }
            else if (res.status === 400) {
              // Gamertag already claimed
              
              
              
              // TODO start validation cycle
              
              
            
              this.setState({
                message: JSON.parse(res.text).message
              });
            }
            else {
            // Some other error
              this.setState({
                message: JSON.parse(res.text).message
              });
            }        
          }
        }.bind(this));
      }
    }.bind(this));
  },
  
  showInput: function(e) {
    e.stopPropagation();
    this.setState({
      addingGamertag: true
    }, function() {
      this.refs.addGamertagInput.getDOMNode().focus();
    });
  },
  
  hideInput: function(e) {
    this.setState({
      addingGamertag: false,
      message: null
    });
  },

  getInitialState: function() {
    return {
      addingGamertag: false
    };
  },
  
  handleKeyDown: function(e) {
    if (e.keyCode === 27) {
      this.hideInput(e);
    }
  },

  componentDidMount: function() {
    window.addEventListener("keydown", this.handleKeyDown);
  },  

  componentWillUnmount: function() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },  
  
  render: function() {
    return (
      <div className="tile gamertag-tile"
           style={{'cursor': 'pointer'}}
           onClick={this.showInput} >
        <h2>Set your Gamertag</h2>

        {this.state.addingGamertag ?

          <form onSubmit={this.addGamertag}>
            <input className="tile-input"
                   ref="addGamertagInput" />
            <p>
              Make sure you actually own this gamertag!<br/>
              You may be required to validate it
            </p>
          </form>

          :

          null
        }
        
        {this.state.message ?

          <p className="hint">{this.state.message}</p>

          :

          null
        }        

      </div>
    );
  }
});
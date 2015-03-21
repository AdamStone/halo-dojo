/** @jsx React.DOM */
var React = require('react');

var UserStore = require('../stores/UserStore'),
    UserActions = require('../actions/UserActions');

var Server = require('../utils/ServerAPI');

var Joi = require('joi'),
    schema = require('../../../../shared/input-validation');


module.exports = React.createClass({

  // TODO move logic into action creators
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
        Server.auth.addGamertag(gamertag, function(err, response) {

          if (err) {  // Network error
            console.log(err);
            this.setState({
              message: 'There was an error contacting the server'
            });
          }
          if (response) {

            if (response.statusType === 2) {
              // Succeeded
              console.dir(JSON.parse(response.text));
              var data = JSON.parse(response.text);
              UserActions.updateGamertags(data.gamertags, data.main);
            }
            else if (response.status === 400) {
              // Gamertag already claimed



              // TODO start validation cycle



              this.setState({
                message: JSON.parse(response.text).message
              });
            }
            else {
            // Some other error
              this.setState({
                message: JSON.parse(response.text).message
              });
            }
          }
        }.bind(this));
      }
    }.bind(this));
  },

  focus: function(e) {
    e.stopPropagation();
    this.refs.addGamertagInput.getDOMNode().focus();
  },

  getInitialState: function() {
    return {
      addingGamertag: true
    };
  },

  componentDidMount: function() {
    window.addEventListener("keydown", this.handleKeyDown);
  },

  componentWillUnmount: function() {
    window.removeEventListener("keydown", this.handleKeyDown);
  },

  render: function() {
    return (
      <div className="tile-input"
           onClick={this.focus} >
        <h2>Add your Gamertag</h2>

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



/*
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

  handleKeyDown: function(e) {
    if (e.keyCode === 27) {
      this.hideInput(e);
    }
  },
*/

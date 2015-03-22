/** @jsx React.DOM */
var React = require('react');

var UserStore = require('../stores/UserStore'),
    UserActions = require('../actions/UserActions');

var Server = require('../utils/ServerAPI');

var Joi = require('joi'),
    schema = require('../../../../shared/input-validation');


module.exports = React.createClass({

  getInitialState: function() {
    return {
      gamertag: '',
      message: 'Note: Make sure you actually own this gamertag!\n' +
                      'You may be asked to validate it.',
      pending: false
    };
  },

  gamertagChanged: function(e) {
    this.setState({
      gamertag: e.target.value
    });
  },

  // TODO move logic into action creators
  addGamertag: function(e) {
    e.preventDefault();
    var self = this;
    var gamertag = this.state.gamertag;
    Joi.validate(gamertag, schema.gamertag,
                 function(err, gamertag) {
      if (err)
        self.setState({
          message: 'Not a valid gamertag'
        });
      else {
        self.setState({
          pending: true,
          message: 'Getting service record. This may take a moment...'
        });

        Server.auth.addGamertag(gamertag, function(err, response) {

          if (err) {
            // Network error

            console.log(err);
            self.setState({
              message: 'There was an error contacting the server'
            });
          }
          if (response) {

            if (response.statusType === 2) {
              // Succeeded

              var data = JSON.parse(response.text);
              UserActions.updateGamertags(data.gamertags, data.main);

              self.setState({
                pending: false,
                message: 'Gamertag added'
              });

            }
            else if (response.status === 400) {
              // Gamertag already in use

              // TODO start validation cycle



              self.setState({
                message: JSON.parse(response.text).message
              });
            }
            else {
              // Some other error

              self.setState({
                message: JSON.parse(response.text).message
              });
            }
          }
        });
      }
    });
  },

  focus: function(e) {
    e.stopPropagation();
    this.refs.gamertagInput.getDOMNode().focus();
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

        {this.state.pending ?

          <div className="spinner"></div>
        :
          <form onSubmit={this.addGamertag}>
            <input className="tile-input gamertag-input"
                   value={this.state.gamertag}
                   onChange={this.gamertagChanged}
                   ref="gamertagInput" />
          </form>
        }

        {this.state.message ?

          <pre className="hint">{this.state.message}</pre>

          :

          null
        }

      </div>
    );
  }
});

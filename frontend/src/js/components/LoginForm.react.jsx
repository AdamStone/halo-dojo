/** @jsx React.DOM */
var React = require('react');
var Server = require('../utils/ServerAPI'),
    UserActions = require('../actions/UserActions'),
    UIActions = require('../actions/UIActions');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      message: null,
      email: '',
      password: ''
    }
  },
  
  emailChanged: function(e) {
    this.setState({
      email: e.target.value
    });
  },
  
  passwordChanged: function(e) {
    this.setState({
      password: e.target.value
    });
  },
  
  login: function(e) {
    e.preventDefault(); 
    
    Server.submitLogin(this.state.email, this.state.password, 
                       function(err, res) {
      var message;
      if (err) {
        // no response
        message = err.message;
        if (message === 'Origin is not allowed by Access-Control-Allow-Origin')
          message = 'Unable to contact authentication server.';
      }
      if (res) {
        // got response (but could be rejection)
        if (res.statusType === 2) {
          // login succeeded
          UserActions.authenticate(JSON.parse(res.text));
          UIActions.hideOverlay();
          return;
        }
        else {
          // registration rejected
          message = JSON.parse(res.text).message;
        }
      }
      this.setState({
        message: message
      });
    }.bind(this));
  },


  componentDidMount: function() {
    if (this.props.focus)
      this.refs.emailInput.getDOMNode().focus();
  },


  render: function() {
    return (
      <div className="auth-form">
        <form onSubmit={this.login} autoComplete="on">

          <input type="email"
                 name="email"
                 placeholder="Enter your email"
                 value={this.state.email}
                 onChange={this.emailChanged}
                 ref="emailInput"
                 autoComplete="on"/>

          <input type="password"
                 name="password"
                 placeholder="Enter your password"
                 value={this.state.password}
                 onChange={this.passwordChanged}
                 autoComplete="on"/>

          <input type="submit" 
                 value="Login"
                 style={{'cursor': 'pointer'}}/>
        </form>

        { this.state.message ?

          <p className="hint">
            {this.state.message}
          </p>

          : null
        }

      </div>
    );
  }

});
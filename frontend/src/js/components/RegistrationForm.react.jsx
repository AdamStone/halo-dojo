/** @jsx React.DOM */
var React = require('react');
var Server = require('../utils/ServerAPI'),
    UserActions = require('../actions/UserActions');

module.exports = React.createClass({

  getDefaultProps: function() {
    return {
      focus: "false"
    }
  },

  getInitialState: function() {
    return {
      message: null,
      email: '',
      password: ''
    };
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

  register: function(e) {
    e.preventDefault();

    Server.submitRegistration(this.state.email, this.state.password,
                                                function(err, res) {
      var message, token;
      if (err) {
        // no response
        message = err.message;
        if (message === 'Origin is not allowed by ' + 
                        'Access-Control-Allow-Origin') {
          message = 'Unable to contact authentication server.';
        }
      }
      if (res) { 
        // got response (but could be rejection)

        if (res.statusType === 2) {
          // registration succeeded
          
          message = res.text;
          this.setState({
            message: message
          });
          
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
    if (this.props.focus ==="true")
      this.refs.emailInput.getDOMNode().focus();
  },


  // Extra inputs hide autocomplete on chrome
  render: function() {
    return (
      <div className="auth-form">
        <form onSubmit={this.register} autoComplete="off">
          <input style={{"display": "none"}}/>
          <input style={{"display": "none"}} type="password"/>

          <input type="email" 
                 name="email"
                 className="email-input"
                 placeholder="Enter your email"
                 value={this.state.email}
                 onChange={this.emailChanged}
                 ref="emailInput"
                 autoComplete="off"/>

          <input type="password"
                 name="password"
                 className="password-input"
                 placeholder="Create a password"
                 value={this.state.password}
                 onChange={this.passwordChanged}
                 autoComplete="off"/>

          <input type="submit"
                 className="submit-input"
                 value="Register"
                 style={{'cursor': 'pointer'}}/>
        </form>
        
        { this.state.message ?

          <p className="hint">
            {this.state.message}
          </p>

          : 
          null
        }

      </div>
    );
  }

});
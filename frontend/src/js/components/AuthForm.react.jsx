/** @jsx React.DOM */
var React = require('react');
var Server = require('../utils/ServerAPI'),
    ActionCreators = require('../actions/ActionCreators');

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

module.exports = React.createClass({

  propTypes: {
    action: React.PropTypes.oneOf(
      ['register', 'login', 'activate']).isRequired
  },

  getDefaultProps: function() {
    return {
      focus: "false",
      autocomplete: "on",
      action: "submit"    // should be overridden
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

  componentDidMount: function() {
    if (this.props.focus ==="true")
      this.refs.emailInput.getDOMNode().focus();
  },

  onSubmit: function(e) {
    e.preventDefault();

    ActionCreators[this.props.action](
      this.state.email, this.state.password);
  },

  render: function() {
    return (
      <div className="auth-form">
        <form onSubmit={this.onSubmit}
              autoComplete={this.props.autocomplete}>

          {this.props.autocomplete === "off" ?

            // Hidden inputs hide autocomplete on chrome
            <div>
              <input style={{"display": "none"}}/>
              <input style={{"display": "none"}} type="password"/>
            </div>

            : null
          }

          <input type="email"
                 name="email"
                 className="email-input"
                 placeholder="Enter your email"
                 value={this.state.email}
                 onChange={this.emailChanged}
                 ref="emailInput"
                 autoComplete={this.props.autocomplete}/>

          <input type="password"
                 name="password"
                 className="password-input"
                 placeholder="Create a password"
                 value={this.state.password}
                 onChange={this.passwordChanged}
                 autoComplete={this.props.autocomplete}/>

          <input type="submit"
                 className="submit-input"
                 value={capitalize(this.props.action)}
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

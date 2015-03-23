/** @jsx React.DOM */
var React = require('react'),
    ActionCreators = require('../actions/ActionCreators');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      focused: true,
      message: '',
      error: ''
    };
  },

  componentDidMount: function() {
    this.refs.messageInput.getDOMNode().focus();
  },

  sendMessage: function(e) {
    e.preventDefault();
    ActionCreators.sendMessage(this.props.gamertag,
                               this.state.message,
                               function(err) {
      if (err) {
        this.setState({
          error: err
        });
      }
      else {
        this.setState({
          message: ''
        });
      }
    }.bind(this));
  },

  stopProp: function(e) {
    e.stopPropagation();
  },

  messageChanged: function(e) {
    this.setState({
      message: e.target.value
    });
  },

  focus: function() {
    this.setState({focused: true});
  },

  defocus: function() {
    this.setState({focused: false});
    setTimeout(function(self) {
      if (!self.state.focused) {
        self.props.unmount();
      }
    }, 250, this);
  },

  render: function() {
    return (
      <div className="message-toggle"
           onClick={this.stopProp}
           onFocus={this.focus}
           onBlur={this.defocus}>

        <div style={{
          display: 'table',
          width: '100%',
          height: '100%'}}>

          <div className="textarea-sizer">

            <form onSubmit={this.sendMessage}
                  autoComplete="off"
                  className="style-placeholders">

              <input type="text"
                     className="message-input"
                     name="message-input"
                     value={this.state.message}
                     onChange={this.messageChanged}
                     placeholder={"Message " + this.props.gamertag}
                     ref="messageInput"
                     autoComplete="off"/>
            </form>
            <pre className="error-message">{this.state.error}</pre>
          </div>
        </div>
      </div>
    )
  }
});

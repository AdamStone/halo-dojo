/** @jsx React.DOM */
var React = require('react'),
    ActionCreators = require('../actions/ActionCreators'),
    MessagingActions = require('../actions/MessagingActions');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      message: ''
    };
  },

  sendMessage: function(e) {
    e.preventDefault();
    var messageInput = this.refs.messageInput.getDOMNode();
    ActionCreators.sendMessage(this.props.gamertag,
                               messageInput.value);
    messageInput.value="";
  },

  close: function() {
    MessagingActions.close(this.props.gamertag);
  },

  minimize: function() {
    MessagingActions.minimize(this.props.gamertag)
  },

  expand: function() {
    MessagingActions.expand(this.props.gamertag)
  },

  toggle: function() {
    if (this.props.data.minimized) {
      this.expand();
    }
    else {
      this.minimize();
    }
  },

  scrollDown: function() {
    console.log('scroll down called');
    var chatNode = this.refs.chatbox.getDOMNode();
    chatNode.scrollTop = chatNode.scrollHeight - chatNode.clientHeight;
  },

  componentDidMount: function() {
    if (!this.props.minimized) {
      setTimeout(function(self) {
        self.scrollDown();
        self.refs.messageInput.getDOMNode().focus();
      }, 250, this);
    }
  },

  componentDidUpdate: function(prevProps) {
    if (!(this.props.data.minimized ||
          this.props.data.closed)) {

      this.scrollDown();

      if (prevProps.data.minimized) {
        setTimeout(function(self) {
          self.refs.messageInput.getDOMNode().focus();
        }, 250, this);
      }
    }
  },

  render: function() {

    var closed = this.props.data.closed,
        minimized = this.props.data.minimized;

    if (closed) {
      return null;
    }
    var gamertag = this.props.gamertag;
    var messageNodes = this.props.data.conversation.map(
      function(message, i) {
        var className;
        if (message.from === gamertag) {
          className = "message-other";
        }
        else {
          className = "message-self";
        }
        return (
          <div className={className} key={i}>
            <div className="bubble">
              {message.message}
            </div>
          </div>
        );
      });

    var buttonClass = "toggle-button";
    if (!minimized) {
      buttonClass += " expanded";
    }
    var toggleButton = (
      <div className={buttonClass}
           title={this.props.gamertag}
           onClick={this.toggle}>
        <span className="fa fa-envelope"></span>
        {'  '}{this.props.gamertag}
      </div>
    );

    var chatbox = (
      <div className="messenger">

        <span className="minimize fa fa-minus"
              onClick={this.minimize}></span>

        <span className="close fa fa-close"
              onClick={this.close}></span>

        <div className="chatbox selectable"
             ref="chatbox">
          {messageNodes}
        </div>

        <form onSubmit={this.sendMessage}
              autoComplete="off">

          <input type="text"
                 ref="messageInput"
                 name="message-input"
                 autoComplete="off"/>
        </form>

      </div>
    );

    return (
      <div className="message-widget">

        {toggleButton}

        {minimized ? null : chatbox}

      </div>
    );
  }
});

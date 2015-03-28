/** @jsx React.DOM */
var React = require('react'),
    ActionCreators = require('../actions/ActionCreators'),
    MessagingActions = require('../actions/MessagingActions');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      input: '',
      error: '',
      viewed: true
    };
  },

  onClick: function(e) {
    this.focus();
  },

  focus: function(e) {
    if (this.refs.messageInput) {
      this.refs.messageInput.getDOMNode().focus();
    }
    this.setState({
      viewed: true
    });
  },

  sendMessage: function(e) {
    e.preventDefault();
    ActionCreators.sendMessage(this.props.gamertag,
                               this.state.input,
                               function(err) {
      if (err) {
        this.setState({
          error: err
        });
      }
      else {
        this.focus();
        this.setState({
          input: ''
        });
      }
    }.bind(this));
  },

  inputChanged: function(e) {
    this.setState({
      input: e.target.value
    });
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
    var chatNode = this.refs.chatbox.getDOMNode();
    chatNode.scrollTop = chatNode.scrollHeight - chatNode.clientHeight;
  },

  componentDidMount: function() {
    if (!this.props.data.minimized) {
      setTimeout(function(self) {
        self.scrollDown();
        self.focus();
      }, 250, this);
    }
  },

  componentDidUpdate: function(prevProps, prevState) {
    if (!(this.props.data.minimized ||
          this.props.data.closed)) {

      this.scrollDown();

      if (prevProps.data.minimized) {
        setTimeout(function(self) {
          self.focus();
        }, 250, this);
      }
    }
    if (this.props.data.conversation.length >
         prevProps.data.conversation.length) {

      this.setState({
        viewed: false
      });
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

        <span className={this.state.viewed ?
                         "fa fa-envelope-o" :
                         "fa fa-envelope"}></span>

        {'   '}{this.props.gamertag}

      </div>
    );

    var chatbox = (
      <div className="messenger">

        {this.state.error ?

          <span className="error-message">
            {this.state.error}
          </span>

          : null
        }

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
                 value={this.state.input}
                 onChange={this.inputChanged}
                 onFocus={this.focus}
                 autoComplete="off"/>
        </form>

      </div>
    );

    return (
      <div className="message-widget"
           onClick={this.onClick}>

        {toggleButton}

        {minimized ? null : chatbox}

      </div>
    );
  }
});

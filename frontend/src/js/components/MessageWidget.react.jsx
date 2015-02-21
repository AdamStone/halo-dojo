/** @jsx React.DOM */
var React = require('react'),
    ActionCreators = require('../actions/ActionCreators'),
    MessagingActions = require('../actions/MessagingActions');

module.exports = React.createClass({

  sendMessage: function(e) {
    e.preventDefault();
    var messageInput = this.refs.messageInput.getDOMNode();
    ActionCreators.sendMessage(this.props.gamertag, messageInput.value);
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
    var chatNode = this.refs.chatbox.getDOMNode()
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
    if (prevProps.data.minimized && !this.props.data.minimized) {
      setTimeout(function(self) {
        self.scrollDown();
        self.refs.messageInput.getDOMNode().focus();
      }, 250, this);
    }
  },
  
  render: function() {
    
    var gamertag = this.props.gamertag;
    var messageNodes = this.props.data.conversation.map(
      function(message, i) {
        return <div 
          className={"message-" + (message.from === gamertag ? "other" : "self")}
          key={i}>
            
            <div 
              className="bubble">
              
                {message.message}
                
            </div>
            
        </div>
      });
  
    return (
      
      <div className="message-widget"
           style={this.props.data.closed ? {display: "none"} : {}}>
      
      
      
        <div className={"toggle-button" + (this.props.data.minimized ? "" : " expanded")}
             title={this.props.gamertag}
             onClick={this.toggle}>
          <span className="fa fa-envelope"></span>
          {'  '}{this.props.gamertag}
        </div>
        
        
        
        <div className="messenger"
             style={this.props.data.minimized ? 
               {visibility: "hidden"} : {visibility: "visible"}}>
          <span className="minimize fa fa-minus"
                onClick={this.minimize}></span>
          <span className="close fa fa-close"
                onClick={this.close}></span>
          
          <div className="chatbox selectable"
               ref="chatbox">
            {messageNodes}
          </div>
          
          <form onSubmit={this.sendMessage} autoComplete="off">
            
            <input type="text"
                   ref="messageInput"
                   name="message-input"
                   autoComplete="off"
                   />
          </form>
          
        </div>
        
      </div>
    );
  }
});
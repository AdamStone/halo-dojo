/** @jsx React.DOM */
var React = require('react'),
    MessagingActions = require('../actions/MessagingActions');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      focused: true
    };
  },
  
  componentDidMount: function() {
    this.refs.messageInput.getDOMNode().focus();
  },  
  
  sendMessage: function(e) {
    e.preventDefault();
    var messageInput = this.refs.messageInput.getDOMNode();
    MessagingActions.sendMessage(this.props.gamertag, messageInput.value);
    messageInput.value="";    
  },
  
  stopProp: function(e) {
    e.stopPropagation();
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
      <div className="message-toggle" onClick={this.stopProp} onFocus={this.focus} onBlur={this.defocus}>
        <div style={{display: 'table', width: '100%', height: '100%'}}>
          <div className="textarea-sizer">
            <form onSubmit={this.sendMessage} autoComplete="off" className="style-placeholders">
              <input type="text" 
                     className="message-input"
                     name="message-input"
                     placeholder={"Message " + this.props.gamertag} 
                     ref="messageInput"
                     autoComplete="off"/>
            </form>
          </div>
        </div>
      </div>
    )
  }
});
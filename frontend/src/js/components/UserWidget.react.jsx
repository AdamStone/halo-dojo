/** @jsx React.DOM */
var React = require('react'),
    Socket = require('../utils/SocketAPI'),
    UserActions = require('../actions/UserActions');

module.exports = React.createClass({

  connect: function(e) {
    e.preventDefault();
    
    var connectNode = this.refs.connectInput.getDOMNode();
    var gamertag = connectNode.value;
    UserActions.connect(gamertag);
  },
   
  render: function() {
    return (
      <div className="user-widget">
        <div style={{display: 'table', height: '100%', width: '100%' }}>
          <div style={{display: 'table-cell', verticalAlign: 'middle'}}>
          {this.props.user ? this.props.user : 
          
            <form onSubmit={this.connect}>
              <input type="text" 
                     name="gamertag" 
                     placeholder="Enter your Gamertag"
                     ref="connectInput"/>
            </form>
          
          }
          </div>
        </div>
      </div>
    )
  }
});
/*

<form onSubmit={this.sendMessage} autoComplete="off" className="style-placeholders">
  <input type="text" 
         className="message-input"
         name="message-input"
         placeholder={"Message " + this.props.gamertag} 
         ref="messageInput"
         autoComplete="off"/>
</form>*/

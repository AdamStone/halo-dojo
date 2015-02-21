/** @jsx React.DOM */
var React = require('react'),
    MessageWidget = require('./MessageWidget.react.jsx');



module.exports = React.createClass({
   
  render: function() {
    var convos = this.props.messaging;
    var messageWidgets = [];
    for (var gamertag in convos) {
      if (convos.hasOwnProperty(gamertag)) {
        var i = messageWidgets.length;
        var data = convos[gamertag];
        messageWidgets.push(
          <MessageWidget key={i} gamertag={gamertag} data={data}/>
        )
      }
    }
    
    
    return (
      <div className="message-bar">
        <div className="messagebar-align" style={{display: 'table', height: '100%'}}>
          {messageWidgets}
        </div>
      </div>
    );
  }
});
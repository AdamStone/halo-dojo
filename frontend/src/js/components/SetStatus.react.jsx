/** @jsx React.DOM */
var React = require('react'),
    Socket = require('../utils/SocketAPI');

module.exports = React.createClass({
   
  setStatus: function() {

  },
   
  render: function() {
    return (
      <div className="set-status">
        <div className="input-group" style={{display: 'table-row'}}>
          <input placeholder="Set beacon status"/>
          <span className="btn-submit" onClick={this.setStatus}>
            Update
          </span>
        </div>
      </div>
    )
  }
});
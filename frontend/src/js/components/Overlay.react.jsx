/** @jsx React.DOM */
var React = require('react'),
    UIActions = require('../actions/UIActions');


module.exports = React.createClass({
  
  getDefaultProps: function() {
    return {
      escapable: "true"
    }
  },
  
  handleKeyDown: function(e) {  // 27 == Esc
    if (e.keyCode === 27 && this.props.escapable === "true") {
      this.hide(e);
    }
  },
  
  hide: function(e) {
    UIActions.hideOverlay();
  },

  componentDidMount: function() {
    document.addEventListener("keydown", this.handleKeyDown);
  },

  componentWillUnmount: function() {
    document.removeEventListener("keydown", this.handleKeyDown);
  },

  render: function() {
    return (
      <div className="overlay">
        <div className="window">
          <div className="overlay-content">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
});
/** @jsx React.DOM */
var React = require('react'),
    UIActions = require('../Actions/UIActions');
    
module.exports = React.createClass({

  dismiss: function() {
    UIActions.hideOverlay();
  },

  render: function() {
    return (
      <div>
        <h1>Important</h1>

        <p>This site is a work-in-progress and is 
        currently hosted for demonstration and testing
        purposes only. Some features are unimplemented
        or disabled.</p>

        <h3>Any data submitted should be considered 
        potentially insecure</h3>

        <h2 className="dismiss-button"
             onClick={this.dismiss}
             style={{'cursor': 'pointer'
                     }}>
          
          Got it
          
        </h2>
               
      </div>
    );
  }

});
var React = require('react');

var Overlay= require('./Overlay.react.jsx'),
    AuthForm = require('./AuthForm.react.jsx');

module.exports = React.createClass({

  render: function () {
    return (
      <Overlay escapable="false">
        <AuthForm action="activate"
                  focus="true"
                  autocomplete="off"/>
      </Overlay>
    );
  }

});

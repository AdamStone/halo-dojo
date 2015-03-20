var React = require('react');

var Urls = require('../../../../shared/urls');


module.exports = React.createClass({

  getDefaultProps: function() {
    return {
      url: /^\/$/,
      protocol: null,
      condition: true
    }
  },



  render: function() {
    var url, protocol, condition;

    switch (this.props.protocol) {
      case 'http':
        protocol = /^http:$/;
        break;

      case 'https':
        protocol = /^https:$/;
        break;

      default:
        protocol = null;
    }



    if (this.props.condition &&
        (!protocol || window.location.protocol.match(protocol)) &&
        window.location.pathname.match(this.props.url)) {

      return this.props.children;
    }
    else {
      return null;
    }
  }
})

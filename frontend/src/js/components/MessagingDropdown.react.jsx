"use strict";

var React = require('react');

var MessagingActions = require('../actions/MessagingActions'),
    utils = require('../../../../shared/utils');


module.exports = React.createClass({

  getInitialState: function() {
    return {
      expanded: false
    };
  },

  toggle: function(e) {
    this.setState({
      expanded: !this.state.expanded
    });
  },

  hide: function(e) {
    this.setState({
      expanded: false
    });
  },

  itemClick: function(e) {
    var gamertag = e.currentTarget.firstChild.textContent;
    MessagingActions.expand(gamertag);
  },

  handleKeyDown: function(e) {  // 27 == Esc
    // hide dropdown on ESC
    if (e.keyCode === 27) {
      this.hide(e);
    }
  },

  handleClick: function(e) {
    // hide dropdown on click outside this component
    for (var i=0; i < e.path.length; i++) {
      if (e.path[i].className === 'messaging-dropdown') {
        return;
      }
    }
    this.hide(e);
  },

  componentDidMount: function() {
    document.addEventListener("keydown", this.handleKeyDown);
    document.addEventListener("click", this.handleClick);
  },

  componentWillUnmount: function() {
    document.removeEventListener("keydown", this.handleKeyDown);
    document.removeEventListener("click", this.handleClick);
  },



  render: function() {

    var convos = this.props.messaging.conversations,
        gamertags = Object.keys(convos),
        items = [],
        unread = false;

    // List each gamertag and unread status
    for (var i=0; i < gamertags.length; i++) {

      var icon = null,
          iconClass = 'message-icon fa fa-envelope',
          data = convos[gamertags[i]];
      if (data.unread) {
        icon = <span className={iconClass}
                     title="There are unread messages"></span>;
        unread = true;
      }
      var timeString = utils.parseTimestamp(data.lastTime),
          lastTime = <span className="last-time">
                       {timeString}
                     </span>;
      items.push(
        <li onClick={this.itemClick}
            lastTime={data.lastTime}
            key={i}>
          <a>{gamertags[i]}</a>
          {icon || lastTime}
        </li>
      );
    }
    items.sort(function(a, b) {
      return a.props.lastTime > b.props.lastTime;
    });

    var toggleClass = (unread ?
      "fa fa-envelope toggle-button" :
      "fa fa-envelope-o toggle-button");

    var toggleTitle = (unread ?
      "You have unread messages" :
      "No unread messages"
    );

    return (
      <div className="messaging-dropdown">
        <span className={toggleClass}
              onClick={this.toggle}
              title={toggleTitle}></span>

        {this.state.expanded ?
          <div className="dropdown-list">
            <p className="heading">Recent Contacts</p>
            <ul>
              {items}
            </ul>
          </div>
          :
          null
        }
      </div>
    );
  }
});

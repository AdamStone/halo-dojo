/** @jsx React.DOM */
var React = require('react'),
    MessageToggle = require('./MessageToggle.react.jsx');

module.exports = React.createClass({

  stopProp: function(e) {
    e.stopPropagation();
  },

  handleInvite: function(e) {

    // stuff
    e.stopPropagation();
  },

  showMessaging: function() {
    this.setState({
      messagingActive: true
    });
  },

  hideMessaging: function() {
    this.setState({
      messagingActive: false
    });
  },

  getInitialState: function() {
    return {
      messagingActive: false
    }
  },


  render: function() {

    var statusStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
      padding: '0.2em 0.5em'
    };

    var btnMessageStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
      textAlign: 'center'
    };

    var data = this.props.data;

    var activeTime = parseInt(
      (Math.round(new Date().getTime()/1000) - data.time)/60);

    return (
      <div className="tile beacon-tile"
           onClick={this.showMessaging}
           title={"Click to message " + this.props.gamertag}>

        <div style={{display: 'table', width: '100%'}}>

          <div className="gamertag"
               style={{display: 'table-cell'}}>

            <a href="#" onClick={this.stopProp}>
              {this.props.gamertag}
            </a>

          </div>

          {/* hidden focusable element
              to activate messaging by tabbing */}
          <span style={{width: 0}}
                tabIndex={0}
                onFocus={this.showMessaging}
                ref="tabhandle">
          </span>

          {/*<div className="idle-dot-cell"
               style= {{display:'table-cell'}}>
            {!this.props.data.idle ?
              <svg width="100" height="100"
                   viewBox="0 0 100 100" className="idle-dot">
                <circle cx="50" cy="50" r="50" fill="#0f7"/>
              </svg> : null}
          </div>

          <div className="time"
               style={{display: 'table-cell'}}
               title={"Active for " + activeTime + " minute"
                        + (activeTime > 1 ? "s" : "")}>
            {activeTime + ' m'}
          </div>*/}

        </div>

        <div style={{height: '0.75em'}}></div>

        <div style={{display: 'table', width: '100%'}}>

          <p style={statusStyle} className="status">
            {data.status ? data.status : null}
          </p>

        {/*
        <div className="table-spacer" style={{display: 'table-cell'}}></div>

            <div className="invite-button" style={btnMessageStyle} title="Invite" onClick={this.handleInvite}>
              <span className="fa fa-gamepad"></span>
            </div>
        */}

        </div>

        {this.state.messagingActive ?
          <MessageToggle unmount={this.hideMessaging}
                         gamertag={this.props.gamertag}/>
        :

        null}

      </div>
    );
  }
});

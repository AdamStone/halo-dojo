/** @jsx React.DOM */
var React = require('react'),
    ActionCreators = require('../actions/ActionCreators');

module.exports = React.createClass({

  getInitialState: function() {
    return {
      input: this.props.data.status
    };
  },

  onBlur: function(e) {
    if (this.state.input !== this.props.data.status) {
      ActionCreators.setStatus(this.state.input);
    }
  },

  onSubmit: function(e) {
    e.preventDefault();
    var inputNode = this.refs.statusInput.getDOMNode();
    inputNode.blur();
  },

  inputChanged: function(e) {
    this.setState({
      input: e.target.value
    });
  },

  render: function() {

    var data = this.props.data;

    var statusInputStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
      padding: '0.2em 0.5em',
      width: '100%'
    };

    if (data.status) {
      statusInputStyle.border = 'none';
    }

    var btnMessageStyle = {
      display: 'table-cell',
      verticalAlign: 'middle',
      textAlign: 'center'
    };

    var activeTime = parseInt(
      (Math.round(new Date().getTime()/1000) - data.time));

    return (
      <div className="tile beacon-tile user-beacon-tile">

        <div style={{display: 'table', width: '100%'}}>

          <div className="gamertag"
               style={{display: 'table-cell'}}>
            <a href="#" onClick={this.stopProp}>{this.props.gamertag}</a>
          </div>

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

          <form className="style-placeholders"
                onSubmit={this.onSubmit}>
          <input style={statusInputStyle}
                 ref="statusInput"
                 className="status status-input"
                 placeholder="Enter a status message"
                 autoComplete="off"
                 value={this.state.input}
                 onChange={this.inputChanged}
                 onBlur={this.onBlur}
                 autoFocus="true"/>
          </form>

{/*
      <div className="table-spacer" style={{display: 'table-cell'}}></div>

          <div className="invite-button" style={btnMessageStyle} title="Invite" onClick={this.handleInvite}>
            <span className="fa fa-gamepad"></span>
          </div>
   */}

        </div>
      </div>
    );
  }
});

//          <div className="btn-message" style={btnMessageStyle}>
//            <span className="fa fa-newspaper-o" style={{verticalAlign: 'middle'}}></span>
//          </div>


//          <div style={{
//            background: 'url(./images/svg/beacon-active.svg)',
//            backgroundSize: 'contain',
//            backgroundRepeat: 'no-repeat',
//            backgroundPosition: 'right',
//            display: 'table-cell',
//            width: '4em'
//          }}></div>


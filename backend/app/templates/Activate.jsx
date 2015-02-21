/** @jsx React.DOM */

var React = require('react'),
    Request = require('superagent');

module.exports = React.createClass({

  activate: function(e) {
    console.log('activated');
    e.preventDefault();
    var email = this.refs.emailInput.getDOMNode().value;
    var password = this.refs.passwordInput.getDOMNode().value;
    
    var message;
    Request
      .post('/activate/'+this.props.code)
      .send({email: email, password: password})
      .end(function(err, res) {
        if (err) {
          this.setState({
            message: err
          });
        }
        if (res) {
          this.setState({
            message: 'success'
          });
        }
      });
  },
  
  getInitialState: function() {
    return {
      message: null
    }
  },

  render: function() {
    return (
      <html>
        <head>
          <meta charSet="utf-8"/>
          <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
          <title></title>
          <meta name="description" content=""/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>

          <link rel="icon" type="image/png" href="/images/favicon16.png" />
          <link href='http://fonts.googleapis.com/css?family=Quicksand:300,400' rel='stylesheet' type='text/css'/>
          <link href='http://fonts.googleapis.com/css?family=Oxygen:300,400' rel='stylesheet' type='text/css'/>

          <link rel="stylesheet" href="../css/styles.min.css"/>
        </head>
        <body>
          <div className="overlay">
            <div className="window">
              <div className="auth-form">
                <p className="hint">Please log in to activate
                                        your account.</p>
                <form action={"/activate/" + this.props.code} 
                      method="post" autoComplete="off">
                  <input style={{"display": "none"}}/>
                  <input style={{"display": "none"}} 
                         type="password"/>

                  <input type="email"
                         name="email"
                         placeholder="Enter your email"
                         autoComplete="off"/>

                  <input type="password"
                         name="password"
                         placeholder="Enter your password"
                         autoComplete="off"/>

                  <input type="submit" value="Activate"/>
                </form>
                
                {this.state.message ?
                
                  <p className="hint">{this.state.message}</p>

                  :

                  null
                }

              </div>
            </div>
          </div>
        </body>
      </html>
    );
  }
});
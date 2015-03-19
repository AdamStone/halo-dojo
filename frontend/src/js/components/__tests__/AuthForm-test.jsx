jest.dontMock('../AuthForm.react.jsx');

var React, TestUtils, Component, AuthForm, ActionCreators,
    emailInput, passwordInput, form;

function inputData() {
  // Enter valid email and password
  TestUtils.Simulate.change(emailInput, {
    target: {
      value: 'email@example.com'
    }
  });
  TestUtils.Simulate.change(passwordInput, {
    target: {
      value: 'password'
    }
  });
}


describe('AuthForm', function() {

  beforeEach(function() {
    React = require('react/addons');
    TestUtils = React.addons.TestUtils;
    Component = require('../AuthForm.react.jsx');
    ActionCreators = require('../../actions/ActionCreators');

    AuthForm = TestUtils.renderIntoDocument(
      <Component action="register"/>
    );

    emailInput = TestUtils.findRenderedDOMComponentWithClass(
                      AuthForm, 'email-input');
    passwordInput = TestUtils.findRenderedDOMComponentWithClass(
                      AuthForm, 'password-input');
    form = TestUtils.findRenderedDOMComponentWithTag(
                      AuthForm, 'form');
  });



  it('accepts user inputs of email and password', function() {

    // Expect input fields to be empty
    expect(emailInput.getDOMNode().value)
          .toBe('');
    expect(passwordInput.getDOMNode().value)
          .toBe('');

    inputData();

    // Expect input fields reflect change
    expect(emailInput.getDOMNode().value)
          .toBe('email@example.com');
    expect(passwordInput.getDOMNode().value)
          .toBe('password');
  });



  it('calls ActionCreators.register when action="register"',
      function() {

    inputData();

    AuthForm.props.action = 'register';
    TestUtils.Simulate.submit(form);

    expect(ActionCreators.register.mock.calls[0][0])
      .toBe('email@example.com');
    expect(ActionCreators.register.mock.calls[0][1])
      .toBe('password');
    }
  );



  it('calls ActionCreators.login when action="login"',
    function() {

      inputData();

      AuthForm.props.action = 'login';
      TestUtils.Simulate.submit(form);

      expect(ActionCreators.login.mock.calls[0][0])
        .toBe('email@example.com');
      expect(ActionCreators.login.mock.calls[0][1])
        .toBe('password');
    }
  );



  it('calls ActionCreators.activate when action="activate"',
    function() {

      inputData();

      AuthForm.props.action = 'activate';
      TestUtils.Simulate.submit(form);

      expect(ActionCreators.activate.mock.calls[0][0])
        .toBe('email@example.com');
      expect(ActionCreators.activate.mock.calls[0][1])
        .toBe('password');
    }
  );

});

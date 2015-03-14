jest.dontMock('../RegistrationForm.react.jsx');

var React, TestUtils, RegistrationForm, Server,
    form, emailInput, passwordInput, submitInput;

describe('RegistrationForm', function() {

  beforeEach(function() {
    React = require('react/addons'),
    TestUtils = React.addons.TestUtils,
    Component = require('../RegistrationForm.react.jsx');
    Server = require('../../utils/ServerAPI'),
    
    RegistrationForm = TestUtils.renderIntoDocument(
      <Component/>
    );
    
    emailInput = TestUtils.findRenderedDOMComponentWithClass(
                      RegistrationForm, 'email-input');
    passwordInput = TestUtils.findRenderedDOMComponentWithClass(
                      RegistrationForm, 'password-input');
    form = TestUtils.findRenderedDOMComponentWithTag(
                      RegistrationForm, 'form');
  });
  
  

  it('accepts user inputs of email and password', function() {

    // Expect input fields to be empty
    expect(emailInput.getDOMNode().value)
          .toBe('');
    expect(passwordInput.getDOMNode().value)
          .toBe('');  
  
    // Enter email and password
    TestUtils.Simulate.change(emailInput, {
      target: {
        value: 'email'
      }
    });
    TestUtils.Simulate.change(passwordInput, {
      target: {
        value: 'password'
      }
    });
    
    // Expect input fields reflect change
    expect(emailInput.getDOMNode().value)
          .toBe('email');
    expect(passwordInput.getDOMNode().value)
          .toBe('password');
  });
  
  
  
  it('calls server API with form data', function() {
    
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
    
    // Submit form
    TestUtils.Simulate.submit(form);
    
    // Expect server API to be called
    expect(Server.submitRegistration.mock.calls.length)
          .toBe(1);
    expect(Server.submitRegistration.mock.calls[0][0])
          .toBe('email@example.com');
    expect(Server.submitRegistration.mock.calls[0][1])
          .toBe('password');
  });
  
});
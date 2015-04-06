jest.dontMock('../MessagingDropdown.react.jsx');

var React, TestUtils, Component, MessagingDropdown,
    messaging, toggleButton, dropdown, listItems,
    MessagingActions;

describe('MessagingDropdown', function() {

  beforeEach(function() {
    React = require('react/addons');
    TestUtils = React.addons.TestUtils;
    Component = require('../MessagingDropdown.react.jsx');
    MessagingActions = require('../../actions/MessagingActions');
    messaging = {
      conversations: {

        unreadGT: {
          minimized: true,
          closed: true,
          lastTime: 1000,
          messages: [
            {time: 1000,
             text: 'test message',
             to: 'unreadGT',
             from: 'userGT'}
          ],
          unread: true
        },

        readGT: {
          minimized: true,
          closed: true,
          lastTime: 2000,
          messages: [],
          unread: false
        }
      }
    };

    MessagingDropdown = TestUtils.renderIntoDocument(
      <Component messaging={messaging}/>
    );

    toggleButton = TestUtils.findRenderedDOMComponentWithClass(
                             MessagingDropdown, 'toggle-button');
  });



  it('expands on click', function() {
    dropdown = TestUtils.scryRenderedDOMComponentsWithClass(
                         MessagingDropdown, 'dropdown-list');

    expect(dropdown.length).toBe(0);

    TestUtils.Simulate.click(toggleButton);

    dropdown = TestUtils.scryRenderedDOMComponentsWithClass(
                         MessagingDropdown, 'dropdown-list');

    expect(dropdown.length).toBe(1);
  });



  it('hides on ESC', function() {
    TestUtils.Simulate.click(toggleButton);

    var event = document.createEvent("HTMLEvents");
    //             (type,      bubbles, cancelable)
    event.initEvent("keydown", false,   true);
    event.keyCode = 27;  // ESC
    document.dispatchEvent(event);

    dropdown = TestUtils.scryRenderedDOMComponentsWithClass(
                         MessagingDropdown, 'dropdown-list');

    expect(dropdown.length).toBe(0);
  });



  it('hides if click outside component', function() {
    TestUtils.Simulate.click(toggleButton);

    dropdown = TestUtils.findRenderedDOMComponentWithClass(
                         MessagingDropdown, 'dropdown-list');

    var event = document.createEvent("HTMLEvents");
    event.initEvent("click", true, true);
    event.path = [{className: 'NOT-messaging-dropdown'}];
    document.body.dispatchEvent(event);

    dropdown = TestUtils.scryRenderedDOMComponentsWithClass(
                         MessagingDropdown, 'dropdown-list');

    expect(dropdown.length).toBe(0);
  });



  it('doesnt hide if click on dropdown', function() {
    TestUtils.Simulate.click(toggleButton);

    dropdown = TestUtils.findRenderedDOMComponentWithClass(
                         MessagingDropdown, 'dropdown-list');

    var event = document.createEvent("HTMLEvents");
    event.initEvent("click", true, true);
    event.path = [{className: 'messaging-dropdown'}];
    document.body.dispatchEvent(event);

    dropdown = TestUtils.scryRenderedDOMComponentsWithClass(
                         MessagingDropdown, 'dropdown-list');

    expect(dropdown.length).toBe(1);
  });



  it('renders recent convos if .expanded', function() {
    TestUtils.Simulate.click(toggleButton);

    listItems = TestUtils.scryRenderedDOMComponentsWithTag(
                         MessagingDropdown, 'li');

    expect(listItems.length).toBe(2);
  });



  it('opens MessageWidget on item click', function() {
    TestUtils.Simulate.click(toggleButton);

    listItems = TestUtils.scryRenderedDOMComponentsWithTag(
                         MessagingDropdown, 'li');

    TestUtils.Simulate.click(listItems[0]);
    expect(MessagingActions.expand.mock.calls[0][0])
      .toBe('unreadGT');
  });

});

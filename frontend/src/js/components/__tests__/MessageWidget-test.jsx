jest.dontMock('../MessageWidget.react.jsx');

var React, TestUtils, Component, MessageWidget, data,
    chatbox, toggle;

describe('MessageWidget', function() {

  beforeEach(function() {
    React = require('react/addons');
    TestUtils = React.addons.TestUtils;
    Component = require('../MessageWidget.react.jsx');

    data = {
      minimized: true,
      closed: true,
      lastTime: 1000000010,
      messages: [
        {
          text: "first message",
          from: "A",
          to: "B",
          time: 1000000000
        }, {
          text: "second message",
          from: "B",
          to: "A",
          time: 1000000010
        }
      ],
      unread: true
    };

  });



  it('renders .chatbox if !minimized && !closed',
                                        function() {

    data.minimized = false;
    data.closed = false;

    MessageWidget = TestUtils.renderIntoDocument(
      <Component gamertag="Gamertag" data={data}/>
    );

    chatbox = TestUtils.scryRenderedDOMComponentsWithClass(
                      MessageWidget, 'chatbox');

    expect(chatbox.length).toBe(1);
  });



  it('renders no .chatbox if minimized', function() {

    data.minimized = true;
    data.closed = false;

    MessageWidget = TestUtils.renderIntoDocument(
      <Component gamertag="Gamertag" data={data}/>
    );

    chatbox = TestUtils.scryRenderedDOMComponentsWithClass(
                      MessageWidget, 'chatbox');

    expect(chatbox.length).toBe(0);
  });



  it('renders no .chatbox if closed', function() {

    data.minimized = true;
    data.closed = true;

    MessageWidget = TestUtils.renderIntoDocument(
      <Component gamertag="Gamertag" data={data}/>
    );

    chatbox = TestUtils.scryRenderedDOMComponentsWithClass(
                      MessageWidget, 'chatbox');

    expect(chatbox.length).toBe(0);
  });



  it('renders .toggle-button if !minimized && !closed',
                                            function() {

    data.minimized = false;
    data.closed = false;

    MessageWidget = TestUtils.renderIntoDocument(
      <Component gamertag="Gamertag" data={data}/>
    );

    toggle = TestUtils.scryRenderedDOMComponentsWithClass(
                      MessageWidget, 'toggle-button');

    expect(toggle.length).toBe(1);
  });



  it('renders .toggle-button if minimized',
                                            function() {

    data.minimized = true;
    data.closed = false;

    MessageWidget = TestUtils.renderIntoDocument(
      <Component gamertag="Gamertag" data={data}/>
    );

    toggle = TestUtils.scryRenderedDOMComponentsWithClass(
                      MessageWidget, 'toggle-button');

    expect(toggle.length).toBe(1);
  });



  it('renders no .toggle-button if closed', function() {

    data.minimized = true;
    data.closed = true;

    MessageWidget = TestUtils.renderIntoDocument(
      <Component gamertag="Gamertag" data={data}/>
    );

    toggle = TestUtils.scryRenderedDOMComponentsWithClass(
                      MessageWidget, 'toggle-button');

    expect(toggle.length).toBe(0);
  });

});

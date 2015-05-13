jest.dontMock('../WorkInProgressMessage.react.jsx');

var React, TestUtils, Component, OverlayMessage, UIActions;

describe('WorkInProgressMessage', function() {

  beforeEach(function() {
    React = require('react/addons'),
    TestUtils = React.addons.TestUtils,
    Component = require('../WorkInProgressMessage.react.jsx'),
    UIActions = require('../../actions/UIActions');

    WIPMessage = TestUtils.renderIntoDocument(
      <Component/>
    );
  });



  it('fires hideOverlay action when dismissed', function() {
    var dismiss = TestUtils.findRenderedDOMComponentWithClass(
      WIPMessage, 'dismiss-button');

    TestUtils.Simulate.click(dismiss);

    expect(UIActions.hideOverlay.mock.calls.length).toBe(1);
  });

});

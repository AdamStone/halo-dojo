jest.dontMock('../Overlay.react.jsx');

var React, TestUtils, Component, Overlay, UIActions;

describe('Overlay', function() {
  
  beforeEach(function() {
    React = require('react/addons'),
    TestUtils = React.addons.TestUtils,
    Component = require('../Overlay.react.jsx'),
    UIActions = require('../../actions/UIActions');
  });
  
  
  
  it('renders a child component', function() {
      
    Overlay = TestUtils.renderIntoDocument(
      <Component>
        <div className="child-component-test">
          Test component text
        </div>
      </Component>
    );
    
    var childDiv = TestUtils.findRenderedDOMComponentWithClass(
                Overlay, 'child-component-test');
    
    expect(childDiv.getDOMNode().textContent).toBe('Test component text');
  });
  
  
  
  it('is escapable (hide on ESC) by default', function() {
    
    Overlay = TestUtils.renderIntoDocument(
      <Component/>
    );
    
    expect(Overlay.props.escapable).toBe('true');
  });
  
  
  
  it('fires hideOverlay action on ESC if (escapable === "true")', 
                                                  function() {
    Overlay = TestUtils.renderIntoDocument(
      <Component escapable="true"/>
    );
    
    var event = document.createEvent("HTMLEvents");
    //    initEvent(type, bubbles, cancelable)
    event.initEvent("keydown", false, true);
    event.keyCode = 27;
    document.dispatchEvent(event);

    expect(UIActions.hideOverlay.mock.calls.length).toBe(1);
  });
  
  
  
  it('does not fire on ESC if (escapable !== "true")', 
                                                  function() {
    Overlay = TestUtils.renderIntoDocument(
      <Component escapable="false"/>
    );
    
    var event = document.createEvent("HTMLEvents");
    // initEvent(type, bubbles, cancelable)
    event.initEvent("keydown", false, true);
    event.keyCode = 27;
    document.dispatchEvent(event);

    expect(UIActions.hideOverlay.mock.calls.length).toBe(0);
  });
    
});
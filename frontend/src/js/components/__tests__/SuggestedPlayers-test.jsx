jest.dontMock('../SuggestedPlayers.react.jsx');

var React, TestUtils, Component, SuggestedPlayer, ActionCreators;

describe('SuggestedPlayers', function() {

  beforeEach(function() {
    React = require('react/addons');
    TestUtils = React.addons.TestUtils;
    Component = require('../SuggestedPlayers.react.jsx'),
    PlayerTile = require('../PlayerTile.react.jsx'),
    ActionCreators = require('../../actions/ActionCreators');
  });



  it('gets suggested players if not cached', function() {
    var players = {
      data: {},
      cached: false
    };
    var SuggestedPlayers = TestUtils.renderIntoDocument(
      <Component players={players}/>
    );
    expect(ActionCreators.getSuggestedPlayers).toBeCalled();
  });



  it('uses cached data if available', function() {
    var players = {
      data: {},
      cached: true
    };
    var SuggestedPlayers = TestUtils.renderIntoDocument(
      <Component players={players}/>
    );
    expect(ActionCreators.getSuggestedPlayers).not.toBeCalled();
  });



  it('renders player tiles', function() {
    var players = {
      data: {
        Player1: {},
        Player2: {},
        Player3: {}
      },
      cached: true
    };
    var SuggestedPlayers = TestUtils.renderIntoDocument(
      <Component players={players}/>
    );
    var children = Object.keys(SuggestedPlayers
                               ._renderedComponent
                               ._renderedChildren);
    expect(children.length).toBe(3);
  });

});

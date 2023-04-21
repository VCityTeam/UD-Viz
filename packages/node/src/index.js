/**
 * -@ud-viz/node API
 *
 *   @exports udvizNode
 */
module.exports = {
  express: require('express'),
  Game: require('./Game/Game'),
  /** @type {import('./Test')} */
  Test: require('./Test'),
  /** @type {import('./Debug')} */
  Debug: require('./Debug'),
  Shared: require('@ud-viz/shared'),
};

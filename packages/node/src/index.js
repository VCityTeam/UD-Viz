/**
 * -@ud-viz/node API
 *
 *   @exports udvizNode
 */
module.exports = {
  /**
   * @see ExpressAppWrapper
   * @type {import('./ExpressAppWrapper')}
   */
  ExpressAppWrapper: require('./ExpressAppWrapper'),
  /** @type {import('./Game')} */
  Game: require('./Game/Game'),
  /** @type {import('./Test')} */
  Test: require('./Test'),
  /** @type {import('./Debug')} */
  Debug: require('./Debug'),
  Core: require('@ud-viz/core'),
};

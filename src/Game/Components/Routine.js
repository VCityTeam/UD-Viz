/** @format */

/**
 * Object used to handle animation
 * TODO refacto this class so user of this dont need to handle tick + onEnd call
 * see controller script with avatarcameraman to see an example
 */
module.exports = class Routine {
  constructor(tick, onEnd) {
    /**
     * @type {Function} when this function return true means the animation is finished
     */
    this.tick = tick;

    /**
     * @type {Function} callback called at the end of the animation
     */
    this.onEnd = onEnd;
  }
};

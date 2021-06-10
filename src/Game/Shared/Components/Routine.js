/** @format */

module.exports = class Routine {
  constructor(tick, onEnd) {
    this.tick = tick;
    this.onEnd = onEnd;
  }
};

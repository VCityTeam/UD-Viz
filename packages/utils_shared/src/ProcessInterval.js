/**
 * Callback function for ProcessInterval to execute on each tick.
 *
 * @callback ProcessIntervalTickRequester
 * @param {number} dt - The time elapsed since the last tick in milliseconds.
 */

/**
 * @class Representing a loop process based on the setInterval (native JS method).
 */
class ProcessInterval {
  /**
   * Create a new ProcessInterval.
   *
   * @param {object} [options={}] - Options of the process.
   * @param {number} [options.fps=60] - Frame rate per second of the process.
   */
  constructor(options = {}) {
    /**
     * Frame rate per second of the process.
     *
     * @type {number}
     */
    this.fps = options.fps || 60;

    /**
     * Buffer of ProcessIntervalTickRequesters.
     *
     * @type {ProcessIntervalTickRequester[]}
     */
    this.tickRequesters = [];

    /**
     * If true, the process is paused and ProcessIntervalTickRequesters are not called.
     *
     * @type {boolean}
     */
    this.pause = false;
  }

  /**
   * Stop the process and clear all tick requesters.
   */
  stop() {
    // reset requesters
    clearInterval(this.interval);
    this.tickRequesters.length = 0;
    this.pause = false;
  }

  /**
   * Pause or resume the process.
   *
   * @param {boolean} value - The new pause state of the process.
   */
  setPause(value) {
    this.pause = value;
  }

  /**
   * Add a new ProcessIntervalTickRequester to the list.
   *
   * @param {ProcessIntervalTickRequester} cb - The ProcessIntervalTickRequester to add.
   */
  addtickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  /**
   * Start the process and call the tick function on each interval.
   *
   * @param {ProcessIntervalTickRequester=} requester - Optional default ProcessIntervalTickRequester.
   */
  start(requester) {
    if (requester) this.addtickRequester(requester);

    let lastTimeTick = 0;

    /**
     * The tick function called on each interval.
     */
    const tick = () => {
      const now = Date.now();
      let dt = 0;
      if (lastTimeTick) dt = now - lastTimeTick;
      lastTimeTick = now;

      if (this.pause) return;

      this.tickRequesters.forEach((cb) => {
        cb(dt);
      });
    };

    this.interval = setInterval(tick, 1000 / this.fps);
  }
}

module.exports = ProcessInterval;

/**
 * @callback ProcessIntervalTickRequester
 * @param {number} dt
 */

/** @class */
const ProcessInterval = class {
  /**
   * Create a loop process based on the setInterval native js method
   *
   * @param {object} [options={}] - options of the process
   * @param {number} [options.fps=60] - frame rate per second of the process
   */
  constructor(options = {}) {
    /**
     * frame rate per second of the process
     *
     * @type {number}
     */
    this.fps = options.fps || 60;

    /**
     * buffer of the ProcessIntervalTickRequester
     *
     * @type {ProcessIntervalTickRequester[]}
     */
    this.tickRequesters = [];

    /**
     * if true the process is not going to call ProcessIntervalTickRequester
     *
     * @type {boolean}
     */
    this.pause = false;
  }

  /**
   * Stop the process
   */
  stop() {
    // clear interval
    if (this.interval) clearInterval(this.interval);
    // reset requesters
    this.tickRequesters.length = 0;

    this.pause = false;
  }

  /**
   * Pause the process (ProcessIntervalTickRequester are not going to be called)
   *
   * @param {boolean} value - new pause value
   */
  setPause(value) {
    this.pause = value;
  }

  /**
   * Add a ProcessIntervalTickRequester
   *
   * @param {ProcessIntervalTickRequester} cb - ProcessIntervalTickRequester to call
   */
  addtickRequester(cb) {
    this.tickRequesters.push(cb);
  }

  /**
   * Start the process (First call of the setInterval)
   *
   * @param {ProcessIntervalTickRequester=} requester - add a default ProcessIntervalTickRequester
   */
  start(requester) {
    if (requester) this.addtickRequester(requester);

    let lastTimeTick = 0;
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
};

module.exports = ProcessInterval;

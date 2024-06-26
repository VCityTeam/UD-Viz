export class RequestAnimationFrameProcess {
  /**
   * A process based on the requestAnimationFrame native browser method
   *
   * @param {number} [fps=30] - frame rate per second
   */
  constructor(fps) {
    /**
     * false if the is still running
     *
      @type {boolean} */
    this.stopped = false;

    /** @type {boolean} */
    this.pause = false;

    /**
     * frame rate per second 
     *
      @type {number} */
    this.fps = fps || 30;

    /** @type {Array<Function>} */
    this.requesters = [];
  }

  /**
   *
   * @param {Function} r - requester
   */
  addFrameRequester(r) {
    this.requesters.push(r);
  }

  /**
   * @callback cbTickAnimationFrame
   * @param {number} dt Delta time between ticks
   */
  /**
   * Start process
   *
   * @param {cbTickAnimationFrame} requester - callback to call at each tick
   */
  start(requester) {
    if (requester) this.addFrameRequester(requester);

    let now;
    let then = Date.now();
    let delta;
    const tick = () => {
      if (this.stopped) return; // Stop requesting frame

      requestAnimationFrame(tick);

      if (this.pause) return;

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / this.fps) {
        // Update time stuffs
        then = now - (delta % 1000) / this.fps;
        this.requesters.forEach((r) => r(delta));
      }
    };
    tick();
  }

  /**
   * Will stop requesAnimationFrame at the next tick
   */
  stop() {
    this.stopped = true;
  }
}

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

    /**
     * frame rate per second 
     *
      @type {number} */
    this.fps = fps || 30;
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
    let now;
    let then = Date.now();
    let delta;
    const tick = () => {
      if (this.stopped) return; // Stop requesting frame

      requestAnimationFrame(tick);

      now = Date.now();
      delta = now - then;

      if (delta > 1000 / this.fps) {
        // Update time stuffs
        then = now - (delta % 1000) / this.fps;
        requester(delta);
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

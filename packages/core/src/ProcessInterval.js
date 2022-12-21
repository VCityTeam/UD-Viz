const ProcessInterval = class {
  constructor(options = {}) {
    this.fps = options.fps || 60;

    this.tickRequesters = [];

    this.pause = false;

    this.interval = null;
  }

  /**
   * Stop tick of this
   */
  stop() {
    if (this.interval) clearInterval(this.interval);
    this.tickRequesters.length = 0;
    this.pause = false;
  }

  /**
   * True tick world false stop ticking world
   *
   * @param {boolean} value
   */
  setPause(value) {
    this.pause = value;
  }

  /**
   * Add a callback call at after each tick
   *
   * @param {Function} cb
   */
  addtickRequester(cb) {
    this.tickRequesters.push(cb);
  }

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

// const World = require('./World');
const Context = require('./Context');

/**
 * StateComputer working locally
 */
const Engine = class {
  constructor(options = {}) {
    /** @type {Context} */
    this.context = null;

    this.fps = options.fps || 60;

    this.afterTickRequester = [];

    this.pause = false;

    this.interval = null;
  }

  /**
   * Stop tick of this
   */
  stop() {
    if (this.interval) clearInterval(this.interval);
    this.afterTickRequester.length = 0;
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
  addAfterTickRequester(cb) {
    this.afterTickRequester.push(cb);
  }

  /**
   * Init context and start ticking
   *
   * @param {World} world world to tick
   * @param {Function} onLoad call at the end of world load
   */
  start(context) {
    return new Promise((resolve) => {
      this.context = context;
      let lastTimeTick = 0;

      this.context.load().then(() => {
        // start tick
        const tick = () => {
          const now = Date.now();
          let dt = 0;
          if (lastTimeTick) dt = now - lastTimeTick;
          lastTimeTick = now;

          if (this.pause) return;

          this.context.step(dt);

          this.afterTickRequester.forEach((cb) => {
            cb(this.context);
          });
        };

        resolve();
        this.interval = setInterval(tick, 1000 / this.fps);
      });
    });
  }

  /**
   * Pass commands for the next tick
   *
   * @param {Array[Command]} cmds
   */
  onCommands(cmds) {
    const a = this.context.getCommands();
    cmds.forEach(function (cmd) {
      a.push(cmd);
    });
  }

  /**
   *
   * @returns {context}
   */
  getContext() {
    return this.context;
  }

  // StateComputer INTERFACE

  /**
   * Compute the current world state
   *
   * @param withWorldComponent
   * @returns {WorldState}
   */
  computeCurrentState(withWorldComponent = true) {
    return this.context.getWorld().computeWorldState(withWorldComponent);
  }
};

/**
 * Load a world and tick during 1000ms then stop
 *
 * @param {World} world the world to load
 * @param {AssetsManager} assetsManager manager needed to load world assets
 * @param {Bundles} bundles bundles needed to load the world
 * @returns
 */
Engine.WorldTest = function (world, assetsManager, bundles) {
  return new Promise((resolve) => {
    const c = new Engine(assetsManager, 60, bundles);
    c.start(world, function () {
      console.log(world.getName(), ' has loaded');
      setTimeout(function () {
        c.stop();
        console.log('stop test ', world.getName());
        resolve();
      }, 1000); // Stop after 1000ms
    });
  });
};

module.exports = Engine;

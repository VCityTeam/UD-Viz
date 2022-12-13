const World = require('./World');
const WorldContext = require('./WorldContext');

/**
 * StateComputer working locally
 */
const WorldStateComputer = class {
  constructor(assetsManager, fps) {
    this.worldContext = new WorldContext({
      world: null,
      assetsManager: assetsManager,
    });

    this.fps = fps || 60;

    this.afterTickRequester = [];

    this.pause = false;

    this.interval = null;
  }

  /**
   * Stop tick of this
   */
  stop() {
    if (this.interval) clearInterval(this.interval);
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

  resetAfterTickRequester() {
    this.afterTickRequester.length = 0;
  }

  /**
   * Init worldcontext and start ticking
   *
   * @param {World} world world to tick
   * @param {Function} onLoad call at the end of world load
   */
  start(world, onLoad) {
    const wC = this.worldContext;
    const _this = this;

    wC.setWorld(world);

    let lastTimeTick = 0;

    world.load(function () {
      // Loop
      const tick = function () {
        if (_this.pause) return;

        const now = Date.now();
        if (!lastTimeTick) {
          wC.setDt(0);
        } else {
          wC.setDt(now - lastTimeTick);
        }
        lastTimeTick = now;

        wC.getWorld().tick(wC); // Tick with user commands
        wC.getCommands().length = 0; // Clear commands

        _this.afterTickRequester.forEach(function (cb) {
          cb();
        });
      };

      const fps = _this.fps;
      if (!fps) throw new Error('no fps');
      _this.interval = setInterval(tick, 1000 / fps);

      if (onLoad) onLoad();
    }, this.worldContext);
  }

  /**
   * Pass commands for the next tick
   *
   * @param {Array[Command]} cmds
   */
  onCommands(cmds) {
    const a = this.worldContext.getCommands();
    cmds.forEach(function (cmd) {
      a.push(cmd);
    });
  }

  /**
   * Add a new GameObject to the world and call onAdd when object is loaded
   *
   * @param {GameObject} newGO
   * @param {Function} onAdd
   */
  onAddGameObject(newGO, onAdd) {
    this.worldContext
      .getWorld()
      .addGameObject(
        newGO,
        this.worldContext,
        this.worldContext.getWorld().getGameObject(),
        onAdd
      );
  }

  /**
   * Remove the GameObject with the uuid
   *
   * @param {string} uuid
   */
  onRemoveGameObject(uuid) {
    this.worldContext.getWorld().removeGameObject(uuid);
  }

  /**
   *
   * @returns {WorldContext}
   */
  getWorldContext() {
    return this.worldContext;
  }

  // StateComputer INTERFACE

  /**
   * Compute the current world state
   *
   * @param withWorldComponent
   * @returns {WorldState}
   */
  computeCurrentState(withWorldComponent = true) {
    return this.worldContext.getWorld().computeWorldState(withWorldComponent);
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
WorldStateComputer.WorldTest = function (world, assetsManager, bundles) {
  return new Promise((resolve) => {
    const c = new WorldStateComputer(assetsManager, 60, bundles);
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

module.exports = WorldStateComputer;

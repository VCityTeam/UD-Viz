/** @format */

const World = require('./World');
const WorldContext = require('./WorldContext');

/**
 * StateComputer working locally
 */
const WorldStateComputerModule = class WorldStateComputer {
  constructor(assetsManager, fps, bundles) {
    this.worldContext = new WorldContext({
      world: null,
      assetsManager: assetsManager,
      bundles: bundles,
    });

    this.fps = fps || 60;

    this.onAfterTick = null;

    this.pause = false;

    this.interval = null;
  }

  /**
   * stop tick of this
   */
  stop() {
    if (this.interval) clearInterval(this.interval);
  }

  /**
   * true tick world false stop ticking world
   * @param {Boolean} value
   */
  setPause(value) {
    this.pause = value;
  }

  /**
   * Add a callback call at after each tick
   * @param {Function} cb
   */
  setOnAfterTick(cb) {
    this.onAfterTick = cb;
  }

  /**
   * Init worldcontext and start ticking
   * @param {World} world world to tick
   * @param {Function} onLoad call at the end of world load
   */
  load(world, onLoad) {
    const wC = this.worldContext;
    const _this = this;

    wC.setWorld(world);

    let lastTimeTick = 0;

    world.load(function () {
      //loop
      const tick = function () {
        if (_this.pause) return;

        const now = Date.now();
        if (!lastTimeTick) {
          wC.setDt(0);
        } else {
          wC.setDt(now - lastTimeTick);
        }
        lastTimeTick = now;

        wC.getWorld().tick(wC); //tick with user commands
        wC.getCommands().length = 0; //clear commands

        if (_this.onAfterTick) _this.onAfterTick();
      };

      const fps = _this.fps;
      if (!fps) throw new Error('no fps');
      _this.interval = setInterval(tick, 1000 / fps);

      if (onLoad) onLoad();
    }, this.worldContext);
  }

  /**
   * Pass commands for the next tick
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
   * @param {String} uuid
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

  //StateComputer INTERFACE

  /**
   * Compute the current world state
   * @returns {WorldState}
   */
  computeCurrentState(withServerComponent = true) {
    return this.worldContext.getWorld().computeWorldState(withServerComponent);
  }
};

/**
 * Load a world and tick during 1000ms then stop
 * @param {World} world the world to load
 * @param {AssetsManager} assetsManager manager needed to load world assets
 * @param {Bundles} bundles bundles needed to load the world
 * @returns
 */
WorldStateComputerModule.WorldTest = function (world, assetsManager, bundles) {
  return new Promise((resolve, reject) => {
    const c = new WorldStateComputerModule(assetsManager, 60, bundles);
    c.load(world, function () {
      console.log(world.getName(), ' has loaded');
      setTimeout(function () {
        c.stop();
        console.log('stop test ', world.getName());
        resolve();
      }, 1000); //stop after 1000ms
    });
  });
};

module.exports = WorldStateComputerModule;

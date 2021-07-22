/** @format */

const WorldContext = require('./WorldContext');

//TODO make a stop function to stop setInterval

/**
 * StateComputer working locally
 */
module.exports = class WorldStateComputer {
  constructor(assetsManager, fps, bundles) {
    this.worldContext = new WorldContext({
      world: null,
      assetsManager: assetsManager,
      bundles: bundles,
    });

    this.fps = fps || 60;

    this.onAfterTick = null;
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
  onInit(world, onLoad) {
    const wC = this.worldContext;
    const _this = this;

    wC.setWorld(world);

    let lastTimeTick = 0;

    world.load(function () {
      //loop
      const tick = function () {
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
      setInterval(tick, 1000 / fps);

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
  computeCurrentState() {
    return this.worldContext.getWorld().computeWorldState();
  }
};

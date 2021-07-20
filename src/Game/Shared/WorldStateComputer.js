/** @format */

const WorldContext = require('./WorldContext');

//TODO WorldStateComputer do not have tick to make tick the world

/**
 * StateComputer working locally
 */
module.exports = class WorldStateComputer {
  constructor(assetsManager, fps, Shared) {
    this.worldContext = new WorldContext({
      world: null,
      assetsManager: assetsManager,
      Shared: Shared,
    });

    this.fps = fps || 60;

    this.onAfterTick = null;
  }

  setOnAfterTick(cb) {
    this.onAfterTick = cb;
  }

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

  onCommands(cmds) {
    const a = this.worldContext.getCommands();
    cmds.forEach(function (cmd) {
      a.push(cmd);
    });
  }

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

/** @format */

const WorldContext = require('../../Shared/WorldContext');
const Shared = require('../../Shared/Shared');

//TODO LocalComputer do not have tick to make tick the world

/**
 * StateComputer working locally
 */
export class LocalComputer {
  constructor(world, assetsManager) {
    this.worldContext = new WorldContext({
      world: world,
      assetsManager: assetsManager,
      Shared: Shared,
    });
  }

  /**
   * Load world
   * @param {Function} onLoad callback called when world is loaded
   */
  load(onLoad) {
    const _this = this;
    this.worldContext.getWorld().load(onLoad, this.worldContext);
  }

  //StateComputer INTERFACE

  /**
   * Compute the current world state
   * @returns {WorldState}
   */
  computeCurrentState() {
    return this.worldContext.getWorld().computeWorldState();
  }
}

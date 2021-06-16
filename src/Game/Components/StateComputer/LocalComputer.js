/** @format */

const WorldContext = require('../../Shared/WorldContext');
const Shared = require('../../Shared/Shared');

export class LocalComputer {
  constructor(world, assetsManager) {
    this.worldContext = new WorldContext({
      world: world,
      assetsManager: assetsManager,
      Shared: Shared,
    });
  }

  //API
  computeCurrentState() {
    return this.worldContext.getWorld().computeWorldState();
  }
}

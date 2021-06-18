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

  load(onLoad) {
    const _this = this;
    onLoad = function () {
      const tick = function () {
        requestAnimationFrame(tick);
        _this.worldContext.setDt(15);
        _this.worldContext.getWorld().tick(_this.worldContext);
      };
      tick();
    };

    this.worldContext.getWorld().load(onLoad, this.worldContext);
  }

  //API call from GameView
  computeCurrentState() {
    return this.worldContext.getWorld().computeWorldState();
  }
}

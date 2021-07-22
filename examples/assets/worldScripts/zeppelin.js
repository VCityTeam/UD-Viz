/** @format */

let Shared;

module.exports = class WorldGameManager {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;
  }

  onEnterCollision() {
    const result = arguments[1];
    const worldContext = arguments[2];

    const goCollided = result.b.getGameObject();
    worldContext.getWorld().removeGameObject(goCollided.getUUID());
  }
};

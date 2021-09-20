/** @format */

let Shared;

module.exports = class Zeppelin {
  constructor(conf, SharedModule) {
    this.conf = conf;
    Shared = SharedModule;
  }

  //called when this gameobject collider components collides with another one collider components
  onEnterCollision() {
    const go = arguments[0];
    const result = arguments[1];
    const worldContext = arguments[2];

    const goCollided = result.b.getGameObject();
    worldContext.getWorld().removeGameObject(goCollided.getUUID());

    const zeppelinLocalScript = go.fetchLocalScripts()['zeppelin'];
    zeppelinLocalScript.conf.sphereCount++;
  }
};

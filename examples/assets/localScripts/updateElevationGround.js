/** @format */

let udviz = null;
let Command = null;

module.exports = class UpdateElevationGround {
  constructor(conf, udvizBundle) {
    this.conf = conf;
    udviz = udvizBundle;
    Command = udviz.Game.Shared.Command;

    this.raycaster = new udviz.THREE.Raycaster();
  }

  init() {
    const _this = this;

    const localContext = arguments[1];
    const gV = localContext.getGameView();
  }

  tick() {
    //the gameobject parent of this script
    const go = arguments[0];

    //a context containing all data to script clientside script
    const localContext = arguments[1];

    const manager = localContext.getGameView().getLayerManager();
    const ground = [];

    const addObjectToGround = function (nameLayer) {
      let layerManager = null;
      for (let index = 0; index < manager.tilesManagers.length; index++) {
        const element = manager.tilesManagers[index];
        if (element.layer.id == nameLayer) {
          layerManager = element;
          break;
        }
      }

      if (!layerManager) throw new Error('no ', nameLayer);

      layerManager.tiles.forEach(function (t) {
        const obj = t.getObject3D();
        if (obj) ground.push(obj);
      });
    };

    addObjectToGround('3d-tiles-layer-relief');
    addObjectToGround('3d-tiles-layer-road');

    const avatar = go.computeRoot().findByName('avatar');
    const pos = avatar.getPosition();
    const ref = localContext.getGameView().getObject3D().position;

    this.raycaster.ray.origin = new udviz.THREE.Vector3(pos.x, pos.y, 0).add(
      ref
    );
    this.raycaster.ray.direction = new udviz.THREE.Vector3(0, 0, -1);

    // console.log(this.raycaster.ray);
    let minDist = Infinity;
    let z = 0;
    for (let index = 0; index < ground.length; index++) {
      const element = ground[index];
      const intersects = this.raycaster.intersectObjects([element], true);

      if (intersects.length) {
        intersects.forEach(function (i) {
          if (i.distance < minDist) {
            z = -i.distance;
          }
        });
      }
    }

    //notify world with the right elevation
    const computer = localContext.getGameView().getStateComputer();
    computer.onCommands([
      new Command({ type: Command.TYPE.Z_UPDATE, data: z }),
    ]);
  }
};

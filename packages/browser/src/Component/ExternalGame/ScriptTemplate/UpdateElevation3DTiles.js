import { Base } from '../../../Game/BrowserScript';
import * as THREE from 'three';
import JSONUtils from '@ud-viz/core/src/Game/Component/JSONUtils';
import { WorldCommand } from '@ud-viz/core/src/Game/Game';

const defaultConfig = {
  id3DTiles: null,
  nameGO2Update: null,
};

export class UpdateElevation3DTiles extends Base {
  constructor(conf, context, parentGO) {
    // Overwrite conf
    const overWriteConf = JSON.parse(JSON.stringify(defaultConfig));
    JSONUtils.overWrite(overWriteConf, conf);
    super(overWriteConf, context, parentGO);

    this.raycaster = new THREE.Raycaster();
  }

  tick() {
    const manager = this.context.getGameView().getLayerManager();
    const ground = [];

    const addObjectToGround = function (idLayer) {
      let layer = null;
      for (let index = 0; index < manager.tilesManagers.length; index++) {
        const element = manager.tilesManagers[index];
        if (element.layer.id == idLayer) {
          layer = element;
          break;
        }
      }

      if (!layer) throw new Error('no ', idLayer);

      layer.tiles.forEach(function (t) {
        const obj = t.getObject3D();
        if (obj) ground.push(obj);
      });
    };

    this.conf.id3DTiles.forEach((id) => {
      addObjectToGround(id);
    });

    const go = this.parentGameObject
      .computeRoot()
      .findByName(this.conf.nameGO2Update);

    if (!go) throw 'no go to update';

    const pos = go.getPosition();
    const ref = this.context.getObject3D().position;

    this.raycaster.ray.origin = new THREE.Vector3(pos.x, pos.y, 0).add(ref);
    this.raycaster.ray.direction = new THREE.Vector3(0, 0, -1);

    let z = 0;

    for (let index = 0; index < ground.length; index++) {
      const element = ground[index];
      const intersects = this.raycaster.intersectObjects([element], true);

      if (intersects.length) {
        z = -intersects[0].distance;
      }
    }

    // Add commands to the computer directly because not produce by the inputmanager
    this.context
      .getWorldStateComputer()
      .onCommands([
        new WorldCommand({ type: WorldCommand.TYPE.Z_UPDATE, data: z }),
      ]);
  }
}

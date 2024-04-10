import { STShape } from './STShape';
import * as THREE from 'three';
import { createSpriteFromString } from '@ud-viz/utils_browser/src/THREEUtil';

export class STSVector extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer);

    this.delta = isNaN(options.delta) ? 1000 : options.delta;

    /** @type {Map<string,object>} */
    this.featureDateID2ColorOpacity = new Map();

    /** @type {Array<number>} */
    this.possibleDates = [];
  }

  display() {
    super.display();

    const view = this.stLayer.view;
    const rootObject3D = this.stLayer.rootObject3D;
    rootObject3D.clear();
    const box = new THREE.Box3().setFromObject(this.stLayer.c3DTLTemporal.root);
    this.layerCentroid = box.getCenter(new THREE.Vector3());

    rootObject3D.position.copy(this.layerCentroid);

    if (!view.scene.children.includes(rootObject3D)) {
      view.scene.add(rootObject3D);
    }

    this.stLayer.versions.forEach((version) => {
      const copyObject = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      rootObject3D.add(copyObject);

      const newPosition = new THREE.Vector3(
        0,
        0,
        this.delta * (this.stLayer.versions.indexOf(version) + 1)
      );

      version.c3DTLayer.visible = false;

      const dateSprite = createSpriteFromString(version.date.toString());
      copyObject.children.forEach((object) => {
        object.position.copy(newPosition);
        object.updateMatrixWorld();
      });

      dateSprite.position.copy(newPosition);

      // Date label sprite
      dateSprite.position.z += 40;
      dateSprite.scale.multiplyScalar(0.02);
      dateSprite.updateMatrixWorld();
      rootObject3D.add(dateSprite);
    });
    rootObject3D.updateMatrixWorld();

    view.notifyChange();
  }

  update() {}

  dispose() {
    super.dispose();
  }
}

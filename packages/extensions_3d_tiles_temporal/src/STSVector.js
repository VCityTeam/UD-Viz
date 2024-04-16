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

    const geometryDisplayed = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, 0, this.delta * (this.stLayer.versions.length - 1)),
    ]);
    const materialDisplayed = new THREE.LineBasicMaterial({ color: 0x0000ff });
    const vectorLine = new THREE.Line(geometryDisplayed, materialDisplayed);

    rootObject3D.add(vectorLine);
    vectorLine.updateMatrixWorld();

    this.stLayer.versions.forEach((version) => {
      const objectCopy = new THREE.Object3D().copy(
        version.c3DTLayer.root,
        true
      );
      rootObject3D.add(objectCopy);

      const newPosition = new THREE.Vector3(
        0,
        0,
        this.delta * this.stLayer.versions.indexOf(version)
      );

      version.c3DTLayer.visible = false;

      const dateSprite = createSpriteFromString(version.date.toString());
      objectCopy.position.copy(newPosition);
      for (let i = 0; i < objectCopy.children.length; i++) {
        const child = objectCopy.children[i];
        const tileId = version.c3DTLayer.root.children[i].tileId;
        const tile = version.c3DTLayer.tileset.tiles[tileId];
        const tileTransform = tile.transform.elements;
        const tilePosition = new THREE.Vector3(
          tileTransform[12],
          tileTransform[13],
          tileTransform[14]
        );
        child.position.copy(tilePosition.sub(this.layerCentroid));
      }

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

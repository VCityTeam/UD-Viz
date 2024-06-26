import * as THREE from 'three';
import { STLayer } from './STLayer';

export class STShape {
  /**
   *
   * @param {STLayer} stLayer The STLayer instance used to create the shape
   */
  constructor(stLayer) {
    if (new.target === STShape) {
      throw new TypeError('Cannot construct STShape instances directly');
    }
    this.setSTLayer(stLayer);

    /** @type {boolean} */
    this.displayed = false;

    /** @type {THREE.Vector3} */
    this.layerCentroid = null;
  }

  display() {
    this.displayed = true;
    const rootObject3D = this.stLayer.rootObject3D;
    rootObject3D.clear();
    const tiles = this.stLayer.versions[0].c3DTLayer.tileset.tiles;
    let k = 0;
    const position = new THREE.Vector3();
    for (let i = 1; i < tiles.length; i++) {
      const tileTransform = tiles[i].transform.elements;
      const tilePosition = new THREE.Vector3(
        tileTransform[12],
        tileTransform[13],
        tileTransform[14]
      );
      position.add(tilePosition);
      k++;
    }
    this.layerCentroid = position.divideScalar(k);

    rootObject3D.position.copy(this.layerCentroid);

    if (!this.stLayer.view.scene.children.includes(rootObject3D)) {
      this.stLayer.view.scene.add(rootObject3D);
    }
  }

  dispose() {
    this.displayed = false;
    this.stLayer.rootObject3D.clear();
    this.stLayer.rootObject3D = new THREE.Object3D();
    this.stLayer.versions.forEach((version) => {
      version.c3DTLayer.visible = true;
    });
    this.stLayer.view.notifyChange();
  }

  /**
   *
   * @param {STLayer} stLayer The STLayer instance used to create the shape
   */
  setSTLayer(stLayer) {
    /** @type {STLayer} */
    this.stLayer = stLayer;
  }
}

export const DISPLAY_MODE = {
  SEQUENTIAL: 'sequential',
  CHRONOLOGICAL: 'chronological',
};

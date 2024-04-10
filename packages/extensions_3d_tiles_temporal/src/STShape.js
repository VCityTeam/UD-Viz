import * as THREE from 'three';
import { STLayer } from './STLayer';

export class STShape {
  /**
   *
   * @param {STLayer} stLayer
   */
  constructor(stLayer) {
    if (new.target === STShape) {
      throw new TypeError('Cannot construct STShape instances directly');
    }
    this.stLayer = stLayer;

    /** @type {boolean} */
    this.displayed = false;
  }

  display() {
    this.displayed = true;
    const rootObject3D = this.stLayer.rootObject3D;
    rootObject3D.clear();
    const box = new THREE.Box3().setFromObject(
      this.stLayer.versions[0].c3DTLayer.root
    );
    this.layerCentroid = box.getCenter(new THREE.Vector3());

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
}

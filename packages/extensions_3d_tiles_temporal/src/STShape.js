import { Object3D } from 'three';
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
  }

  dispose() {
    this.displayed = false;
    this.stLayer.rootObject3D.clear();
    this.stLayer.rootObject3D = new Object3D();
    this.stLayer.versions.forEach((version) => {
      version.c3DTLayer.visible = true;
    });
    this.stLayer.view.notifyChange();
  }
}

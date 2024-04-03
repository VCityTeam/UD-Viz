import { C3DTilesLayer, View } from 'itowns';
import { Object3D } from 'three';
/**
 * @typedef {object} STLayer
 * @property {View} view
 * @property {Object3D} rootObject3D
 * @property {C3DTilesLayer} c3DTLTemporal
 * @property {Array<number>} datesC3DT
 */

export class STShape {
  /**
   *
   * @param {STLayer} stLayer
   * @param {object} [options]
   */
  constructor(stLayer, options = {}) {
    if (new.target === STShape) {
      throw new TypeError('Cannot construct STShape instances directly');
    }
    this.stLayer = stLayer;
    this.options = options;
  }

  display() {}

  update() {}

  dispose() {}
}

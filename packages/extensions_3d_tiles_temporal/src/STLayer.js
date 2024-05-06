import { C3DTilesLayer, View } from 'itowns';

export class STLayer {
  /**
   * @param {View} view
   * @param {Object3D} rootObject3D
   * @param {Array<{c3DTLayer: C3DTilesLayer, date: number}>} versions
   */
  constructor(view, rootObject3D, versions) {
    this.view = view;
    this.rootObject3D = rootObject3D;

    /** @type {Array<{c3DTLayer: C3DTilesLayer, date: number}>} */
    this.versions = versions;
  }
}

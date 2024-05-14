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
    this.versions.sort((v1, v2) => {
      return v1.date > v2.date;
    });

    this.dateInterval =
      this.versions[this.versions.length - 1].date - this.versions[0].date;
  }
}

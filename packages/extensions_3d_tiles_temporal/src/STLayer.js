import * as THREE from 'three';
import { C3DTilesLayer, View } from 'itowns';

export class STLayer {
  /**
   * @param {View} view The iTowns view
   * @param {THREE.Object3D} rootObject3D The 3D object used as root of all objects (3DTles copies, sprites and lines)
   * @param {Array<{c3DTLayer: C3DTilesLayer, date: number}>} versions Array linking 3DTiles layers with dates
   */
  constructor(view, rootObject3D, versions) {
    /** @type {View} */
    this.view = view;

    /** @type {THREE.Object3D} */
    this.rootObject3D = rootObject3D;

    /** @type {Array<{c3DTLayer: C3DTilesLayer, date: number}>} */
    this.versions = versions;

    this.versions.sort((v1, v2) => {
      return v1.date > v2.date;
    });

    /** @type {number} */
    this.dateInterval =
      this.versions[this.versions.length - 1].date - this.versions[0].date;
  }
}

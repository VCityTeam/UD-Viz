import { C3DTilesLayer, C3DTilesSource, View } from 'itowns';
import { Object3D } from 'three';
import { Temporal3DTilesLayerWrapper } from './index';

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

    /** @type {Array<Temporal3DTilesLayerWrapper>} */
    this.temporalsWrappers = [];

    /** @type {Array<{c3DTLayer: C3DTilesLayer, date: number}>} */
    this.versions = [];

    /** @type {boolean} */
    this.displayed = false;

    this.stLayer.datesC3DT.forEach((date) => {
      const c3DTLayer = new C3DTilesLayer(
        this.stLayer.c3DTLTemporal.id + '_' + date.toString(),
        {
          name: this.stLayer.c3DTLTemporal.id + date.toString(),
          source: new C3DTilesSource({
            url: this.stLayer.c3DTLTemporal.source.url,
          }),
          registeredExtensions: this.stLayer.c3DTLTemporal.registeredExtensions,
        },
        this.stLayer.view
      );
      View.prototype.addLayer.call(this.stLayer.view, c3DTLayer);
      this.temporalsWrappers.push(new Temporal3DTilesLayerWrapper(c3DTLayer));

      // Between two dates there are two intermediate dates like this: 2009 -> firstHalfDate -> secondHalfDate 2012. We want always display firstHlafDate.
      if (date == 2009) {
        this.temporalsWrappers[this.temporalsWrappers.length - 1].styleDate =
          date + 1;
      } else {
        this.temporalsWrappers[this.temporalsWrappers.length - 1].styleDate =
          date - 2;
      }

      const version = { c3DTLayer: c3DTLayer, date: date };
      this.versions.push(version);
    });
  }

  display() {
    this.displayed = true;
  }

  update() {}

  dispose() {
    this.displayed = false;
    this.stLayer.rootObject3D.clear();
    this.stLayer.rootObject3D = new Object3D();
    this.versions.forEach((version) => {
      version.c3DTLayer.visible = true;
    });
    this.stLayer.view.notifyChange();
  }
}

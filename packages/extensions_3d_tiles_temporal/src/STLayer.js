import { Temporal3DTilesLayerWrapper } from './index';
import { C3DTilesLayer, C3DTilesSource, View } from 'itowns';

export class STLayer {
  /**
   * @param {View} view
   * @param {Object3D} rootObject3D
   * @param {C3DTilesLayer} c3DTLTemporal
   * @param {Array<number>} datesC3DT
   */
  constructor(view, rootObject3D, c3DTLTemporal, datesC3DT) {
    this.view = view;
    this.rootObject3D = rootObject3D;
    this.c3DTLTemporal = c3DTLTemporal;
    this.datesC3DT = datesC3DT;

    /** @type {Array<Temporal3DTilesLayerWrapper>} */
    this.temporalsWrappers = [];

    /** @type {Array<{c3DTLayer: C3DTilesLayer, date: number}>} */
    this.versions = [];

    this.datesC3DT.forEach((date) => {
      const c3DTLayer = new C3DTilesLayer(
        this.c3DTLTemporal.id + '_' + date.toString(),
        {
          name: this.c3DTLTemporal.id + date.toString(),
          source: new C3DTilesSource({
            url: this.c3DTLTemporal.source.url,
          }),
          registeredExtensions: this.c3DTLTemporal.registeredExtensions,
        },
        this.view
      );
      View.prototype.addLayer.call(this.view, c3DTLayer);
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
}

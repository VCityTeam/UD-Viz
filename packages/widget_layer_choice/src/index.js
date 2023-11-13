import {
  createLocalStorageCheckbox,
  createLocalStorageDetails,
  createLocalStorageSlider,
} from '@ud-viz/utils_browser';

import { PointsMaterial } from 'three';

import { PlanarView } from 'itowns';

/**
 * @typedef {object} LayerParam
 * @property {import("itowns").Layer} layer - itowns.Layer
 * @property {number} defaultPointCloudSize - default size of a pointcloud layer
 * @property {boolean} [isPointCloud=false] - the layer is a point cloud allow to know if a C3DTilesLayer is a pointcloud or not without pulling tileset.json
 */

export class LayerChoice {
  /**
   *
   * @param {PlanarView} view - itowns view
   * @param {Array<LayerParam>} layerParams - layer params to initialization
   */
  constructor(view, layerParams = []) {
    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    /** @type {PlanarView} */
    this.view = view;

    layerParams.forEach((param) => {
      this.createLayerDomEl(param);
    });
  }

  /**
   *
   * @param {LayerParam} param - param of the layer created
   */
  createLayerDomEl(param) {
    const layerContainerDomElement = createLocalStorageDetails(
      'details' + param.layer.id,
      param.layer.name || param.layer.id,
      this.domElement
    );

    if (!param.layer.isElevationLayer) {
      // visibility checkbox
      const visibleInput = createLocalStorageCheckbox(
        param.layer.id + '_layer_visibility',
        'Visible',
        layerContainerDomElement,
        param.layer.visible
      );

      // sync visible input with param.layer
      param.layer.visible = visibleInput.checked;
      visibleInput.onchange = () => {
        param.layer.visible = visibleInput.checked;
        this.view.notifyChange(this.view.camera.camera3D);
      };
      // opacity checkbox
      const opacityInput = createLocalStorageSlider(
        param.layer.id + '_layer_opacity',
        'Opacité',
        layerContainerDomElement,
        param.layer.opacity
      );

      // sync opcity input with param.layer
      param.layer.opacity = opacityInput.valueAsNumber;
      opacityInput.onchange = () => {
        param.layer.opacity = opacityInput.valueAsNumber;
        this.view.notifyChange(this.view.camera.camera3D);
      };
    }

    if (param.isPointCloud) {
      const pointCloudSize = createLocalStorageSlider(
        param.layer.id + '_layer_pnts_size',
        'Point size',
        layerContainerDomElement,
        {
          step: 0.001,
          max: 0.5,
          min: 0.001,
          defaultValue: param.defaultPointCloudSize || 0.03,
        }
      );

      const updatePointsSize = () => {
        // replace param.layer one for futur pnts requested
        param.layer.material.size = pointCloudSize.valueAsNumber;

        // replace in current pnts
        param.layer.object3d.traverse((child) => {
          if (child.material instanceof PointsMaterial) {
            child.material.size = pointCloudSize.valueAsNumber;
          }
        });

        this.view.notifyChange(this.view.camera.camera3D);
      };

      updatePointsSize();

      // change point cloud size
      pointCloudSize.oninput = updatePointsSize;
    }

    if (param.layer.isElevationLayer) {
      // scale
      // opacity checkbox
      const scaleInput = createLocalStorageSlider(
        param.layer.id + '_layer_scale',
        'Scale',
        layerContainerDomElement,
        param.layer.scale
      );

      // sync opcity input with param.layer
      param.layer.scale = scaleInput.valueAsNumber;
      scaleInput.onchange = () => {
        param.layer.scale = scaleInput.valueAsNumber;
        this.view.notifyChange(this.view.camera.camera3D);
      };
    }

    this.view.notifyChange(this.view.camera.camera3D);
  }
}

import {
  createLocalStorageCheckbox,
  createLocalStorageDetails,
  createLocalStorageSlider,
  focusC3DTilesLayer,
} from '@ud-viz/utils_browser';

import { PointsMaterial } from 'three';

import { PlanarView, ColorLayersOrdering, ImageryLayers } from 'itowns';

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
  constructor(view, layerParams) {
    /** @type {HTMLElement} */
    this.domElement = document.createElement('div');

    /** @type {HTMLDetailsElement} */
    this.colorLayersDomElement = createLocalStorageDetails(
      'color layers details',
      'Color Layers',
      this.domElement
    );

    /** @type {Array<{container:HTMLElement,idLayer:string}>} */
    this.containerColorLayers = [];

    /** @type {PlanarView} */
    this.view = view;

    layerParams =
      layerParams == undefined
        ? this.view.getLayers().map((el) => {
            return { layer: el };
          })
        : layerParams;

    layerParams.forEach((param) => {
      this.createLayerDomEl(param);
    });
  }

  /**
   *
   * @param {LayerParam} param - param of the layer created
   */
  createLayerDomEl(param) {
    const layerContainerDomElement = param.layer.isColorLayer
      ? createLocalStorageDetails(
          'details' + param.layer.id,
          param.layer.name || param.layer.id,
          this.colorLayersDomElement
        )
      : createLocalStorageDetails(
          'details' + param.layer.id,
          param.layer.name || param.layer.id,
          this.domElement
        );

    if (param.layer.isElevationLayer) {
      // scale
      const scaleInput = createLocalStorageSlider(
        param.layer.id + '_layer_scale',
        'Scale',
        layerContainerDomElement,
        {
          defaultValue: param.layer.scale,
        }
      );

      // sync opcity input with param.layer
      param.layer.scale = scaleInput.valueAsNumber;
      scaleInput.onchange = () => {
        param.layer.scale = scaleInput.valueAsNumber;
        this.view.notifyChange(this.view.camera.camera3D);
      };
    } else {
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

      if (param.layer.isC3DTilesLayer) {
        const focusButton = document.createElement('button');
        focusButton.innerText = 'Focus';
        layerContainerDomElement.appendChild(focusButton);
        focusButton.onclick = () => {
          focusC3DTilesLayer(this.view, param.layer);
        };
      }

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

      // order
      if (param.layer.isColorLayer) {
        const buttonDown = document.createElement('button');
        buttonDown.innerText = 'v';
        layerContainerDomElement.appendChild(buttonDown);

        const buttonUp = document.createElement('button');
        buttonUp.innerText = '^';
        layerContainerDomElement.appendChild(buttonUp);

        this.containerColorLayers.push({
          container: layerContainerDomElement,
          idLayer: param.layer.id,
        });

        const updateColorLayerContainers = () => {
          const sequence = ImageryLayers.getColorLayersIdOrderedBySequence(
            this.view.getLayers().filter((el) => el.isColorLayer)
          );

          this.containerColorLayers.sort((a, b) => {
            const aIndexSequence = sequence.indexOf(a.idLayer);
            const bIndexSequence = sequence.indexOf(b.idLayer);
            return bIndexSequence - aIndexSequence;
          });

          // update html
          this.containerColorLayers.forEach((el) => {
            el.container.remove();
          });

          this.containerColorLayers.forEach((el) => {
            this.colorLayersDomElement.appendChild(el.container);
          });
        };
        updateColorLayerContainers();

        buttonDown.onclick = () => {
          ColorLayersOrdering.moveLayerDown(this.view, param.layer.id);
          updateColorLayerContainers();
        };
        buttonUp.onclick = () => {
          ColorLayersOrdering.moveLayerUp(this.view, param.layer.id);
          updateColorLayerContainers();
        };
      }
    }

    if (param.isPointCloud) {
      const pointCloudSize = createLocalStorageSlider(
        param.layer.id + '_layer_pnts_size',
        'Point size',
        layerContainerDomElement,
        {
          step: 0.001,
          max: 5,
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

    this.view.notifyChange(this.view.camera.camera3D);
  }
}

import {
  add3DTilesLayers,
  addBaseMapLayer,
  addElevationLayer,
  addGeoJsonLayers,
  addLabelLayers,
  Frame3DPlanar,
  downloadObjectAsJson,
  readFileAsGltf,
} from './Component/Component';
import * as itowns from 'itowns';
import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { focusCameraOn } from './Component/ItownsUtil';

export class C3DTilesEditor {
  constructor(extent, frame3DPlanarOptions) {
    /** @type {itowns.Extent} */
    this.extent = extent; // ref it to add layers then

    /** @type {Frame3DPlanar} */
    this.frame3DPlanar = new Frame3DPlanar(extent, frame3DPlanarOptions);

    /** @type {THREE.Object3D} */
    this.object3D = null;

    /** @type {TransformControls} */
    const elementToListen =
      this.frame3DPlanar.itownsView.mainLoop.gfxEngine.label2dRenderer
        .domElement;
    this.transformControls = new TransformControls(
      this.frame3DPlanar.camera,
      elementToListen
    );
    this.transformControls.addEventListener('dragging-changed', (event) => {
      this.frame3DPlanar.itownsView.controls.enabled = !event.value;
    });
    this.transformControls.addEventListener('change', () => {
      this.transformControls.updateMatrixWorld();
      this.frame3DPlanar.itownsView.notifyChange();
    });
    this.frame3DPlanar.itownsView.addFrameRequester(
      itowns.MAIN_LOOP_EVENTS.AFTER_CAMERA_UPDATE,
      () => {
        this.transformControls.updateMatrixWorld();
      }
    );

    // initialize ui
    const inputFile = document.createElement('input');
    inputFile.setAttribute('type', 'file');
    inputFile.setAttribute('accept', '.glb, .gltf');
    this.frame3DPlanar.ui.appendChild(inputFile);
    inputFile.onchange = async (e) => {
      const gltf = await readFileAsGltf(e);

      if (this.object3D) {
        this.frame3DPlanar.scene.remove(this.object3D);
      }

      this.object3D = gltf.scene;
      this.frame3DPlanar.scene.add(this.object3D);

      // to actually see it
      this.object3D.position.set(extent.center().x, extent.center().y, 500); // <== place at the center of the extent

      this.transformControls.attach(this.object3D);
      this.transformControls.updateMatrixWorld();
      this.frame3DPlanar.scene.add(this.transformControls);

      // camera focus
      focusCameraOn(
        this.frame3DPlanar.itownsView,
        this.frame3DPlanar.itownsView.controls,
        this.object3D.position
      );

      this.frame3DPlanar.itownsView.notifyChange();
    };

    // gizmo mode ui
    const addButtonMode = (mode) => {
      const buttonMode = document.createElement('button');
      buttonMode.innerText = mode;
      this.frame3DPlanar.ui.appendChild(buttonMode);

      buttonMode.onclick = () => {
        this.transformControls.setMode(mode);
      };
    };
    addButtonMode('translate');
    addButtonMode('rotate');
    addButtonMode('scale');

    // result
    const dowloadButton = document.createElement('button');
    dowloadButton.innerText = 'Download transform';
    this.frame3DPlanar.ui.appendChild(dowloadButton);
    dowloadButton.onclick = () => {
      if (!this.object3D) {
        alert('no object3D loaded');
        return;
      }

      const result = {
        position: this.object3D.position.toArray(),
        rotation: this.object3D.rotation.toArray(),
        scale: this.object3D.scale.toArray(),
      };

      downloadObjectAsJson(result, this.object3D.name);
    };
  }

  /**
   * Add layers of geo data
   *
   * @param {object} configs - different config
   * @todo describe all configs
   */
  addLayers(configs) {
    if (configs.$3DTiles) {
      add3DTilesLayers(configs.$3DTiles, this.frame3DPlanar.itownsView);
    }
    if (configs.elevation) {
      addElevationLayer(
        configs.elevation,
        this.frame3DPlanar.itownsView,
        this.extent
      );
    }
    if (configs.baseMap) {
      addBaseMapLayer(
        configs.baseMap,
        this.frame3DPlanar.itownsView,
        this.extent
      );
    }
    if (configs.labels) {
      addLabelLayers(
        configs.labels,
        this.frame3DPlanar.itownsView,
        this.extent
      );
    }
    if (configs.geoJSON) {
      addGeoJsonLayers(
        configs.geoJSON,
        this.frame3DPlanar.itownsView,
        this.extent
      );
    }
  }
}

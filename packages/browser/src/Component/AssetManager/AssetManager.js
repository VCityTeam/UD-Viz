import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { Howl } from 'howler';
import { textureEncoding } from '../THREEUtil';

import './AssetManager.css';

/**
 * @typedef {object} RenderDataConfig - Contains path, anchor, scale and rotation.
 * @property {string} anchor - Values: center | max | min | center_min
 * @property {{x:number,y:number,z:number}} scale - Object's local scale
 * @property {{x:number,y:number,z:number}} rotation - Object's local rotation
 * @property {string} path - Path to the 3D data file
 */

/**
 * @typedef {object} SoundsConfig - Contains path
 * @property {string} path - Path to the audio file
 */

/**
 * @typedef {object} AssetManagerConfig - Contains configs of assets.
 * @property {Object<string,SoundsConfig>} sounds {@link SoundsConfig}
 * @property {Object<string,RenderDataConfig>} renderData {@link RenderDataConfig}
 */

/**
 * Default material used by native objects
 */
const DEFAULT_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0x00ff00,
});

/**
 * @classdesc Load async assets (gltf, JSON, ...) from a config file and create render data, sounds, and native objects.
 */
export class AssetManager {
  /**
   * Initialize the native render data.
   */
  constructor() {
    /** @type {AssetManagerConfig} */
    this.conf = null;

    /** @type {Object<string,string>} */
    this.soundIDPath = {};

    /** @type {Object<string,RenderData>}*/
    this.renderData = {};

    this.initNativeRenderData();
  }

  /**
   * Return new renderData corresponding to the id passed
   *
   * @param {string} idRenderData - Id of the renderData
   * @returns {RenderData} - A clone of the renderData object
   */
  createRenderData(idRenderData) {
    if (!this.renderData[idRenderData])
      console.error('no render data with id ', idRenderData);

    return this.renderData[idRenderData].clone();
  }

  /**
   * Create a a new Howl object with the given idSound and options.
   *
   * @param {string} idSound - Id of sounds in config
   * @param {object} [options={}] - Arguments to create Howl object.
   * @param {boolean} options.loop - Set to true to automatically loop the sound forever.
   * @returns {Howl} - Used to control the sound
   */
  createSound(idSound, options = {}) {
    const pathSound = this.soundIDPath[idSound];

    if (!pathSound) console.error('no sound with id ', idSound);
    return new Howl({
      src: pathSound,
      loop: options.loop || false,
    });
  }

  /**
   * Build native objects (procedural objects) and stores them in `this.renderData` object.
   *
   */
  initNativeRenderData() {
    const geometryBox = new THREE.BoxGeometry();
    const cube = new THREE.Mesh(geometryBox, DEFAULT_MATERIAL);
    this.renderData['cube'] = new RenderData(cube);

    const geometrySphere = new THREE.SphereGeometry(1, 32, 32);
    const sphere = new THREE.Mesh(geometrySphere, DEFAULT_MATERIAL);
    this.renderData['sphere'] = new RenderData(sphere);

    const geometryTorus = new THREE.TorusGeometry(10, 0.1, 16, 100);
    const torus = new THREE.Mesh(geometryTorus, DEFAULT_MATERIAL);
    this.renderData['torus'] = new RenderData(torus);

    const geometryQuad = new THREE.PlaneGeometry();
    const quad = new THREE.Mesh(geometryQuad, DEFAULT_MATERIAL);
    this.renderData['quad'] = new RenderData(quad);
  }

  /**
   * Load a 3D render data from a config. Then create the {@link LoadingView} process.
   *
   * @param {AssetManagerConfig} config configuration details
   * @param {HTMLDivElement} [parentDiv=document.body] where to add the loadingView
   * @returns {Promise} promise processed to load assets
   */
  loadFromConfig(config = {}, parentDiv = document.body) {
    this.conf = config;
    /** @type {LoadingView}*/
    const loadingView = new LoadingView();
    parentDiv.appendChild(loadingView.html());

    /** @type {Promise[]} */
    const promises = [];

    if (config.renderData) {
      const idLoadingRenderData = '3D';
      loadingView.addLoadingBar(idLoadingRenderData);

      const loader = new GLTFLoader();
      promises.push(
        new Promise((resolve, reject) => {
          let count = 0;
          for (const idRenderData in config.renderData) {
            const renderDataConfig = config.renderData[idRenderData];
            loader.load(
              renderDataConfig.path,
              (result) => {
                result.scene.name = idRenderData;

                this.renderData[idRenderData] = new RenderData(
                  result.scene,
                  renderDataConfig,
                  result.animations
                );

                count++;

                // Update loading bar
                loadingView.updateProgress(
                  idLoadingRenderData,
                  (100 * count) / Object.keys(config.renderData).length
                );

                // Check if finish
                if (count == Object.keys(config.renderData).length) {
                  console.log('render data loaded ', this.renderData);
                  resolve();
                }
              },
              null,
              reject
            );
          }
        })
      );
    }

    if (config.sounds) {
      this.soundIDPath = this.conf.sounds;
    }

    return new Promise((resolve) => {
      Promise.all(promises).then(function () {
        loadingView.dispose();
        resolve();
      });
    });
  }
}

/**
 * @class A view in which loading bar can be added
 */
class LoadingView {
  /**
   * It creates a root HTML, then adds HTML elements for the loading bar.
   */
  constructor() {
    /** @type {HTMLDivElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('assetsLoadingView');

    /** @type {HTMLDivElement} */
    this.parentLoadingBar = document.createElement('div');
    this.parentLoadingBar.classList.add('parent_loading_bar_asset');
    this.rootHtml.appendChild(this.parentLoadingBar);

    /** @type {HTMLDivElement} */
    const label = document.createElement('label');
    label.classList.add('loadingLabel_Assets');
    label.innerHTML = 'Loading assets';
    this.parentLoadingBar.appendChild(label);

    /** @type {Object<string,HTMLDivElement>} Loading bars */
    this.loadingBars = {};
  }

  /**
   *
   * @returns {HTMLDivElement} the element root html of this view
   */
  html() {
    return this.rootHtml;
  }

  /**
   * Removes the root HTML element from the view. {@link LoadingView}
   */
  dispose() {
    this.rootHtml.remove();
  }

  /**
   * Updates the progress bar of a loading bar with the given id.
   * Sets the width of the loading bar with the given percent.
   *
   * @param {string} id of the loading bar
   * @param {number} percent the new percent of the bar
   */
  updateProgress(id, percent) {
    this.loadingBars[id].style.width = percent + '%';
  }

  /**
   * Add a loading bar to this view with a label equals to the id
   *
   * @param {string} id if of the loading bar to add
   */
  addLoadingBar(id) {
    const parent = document.createElement('div');
    parent.classList.add('barBackground-Assets');

    const progress = document.createElement('div');
    progress.classList.add('progressBar-Assets');

    parent.appendChild(progress);

    const label = document.createElement('div');
    label.innerHTML = id;
    parent.appendChild(label);

    this.loadingBars[id] = progress;

    this.parentLoadingBar.appendChild(parent);
  }
}

/**
 * @class Contains a THREE.Object3D and an array of animations
 */
export class RenderData {
  /**
   * It takes an object3D and an optional animations object, and sets the object3D and animations
   * properties of the object
   *
   * @param {THREE.Object3D} object3D - The object to add.
   * @param childObject3D
   * @param {RenderDataConfig} [renderDataConfig = {}]  - Contains path, anchor, scale and rotation.
   * @param {THREE.AnimationClip[]} [animations=null] - An array of animations.
   */
  constructor(childObject3D, renderDataConfig = {}, animations = null) {
    /** @type {THREE.Object3D} Parent object of the object3D to set up*/
    this.object3D = new THREE.Object3D();

    const anchor = renderDataConfig.anchor;
    const scale = renderDataConfig.scale;
    const rotation = renderDataConfig.rotation;

    // Anchor point
    const bbox = new THREE.Box3().setFromObject(childObject3D);
    switch (anchor) {
      case 'center':
        {
          const center = bbox.min.lerp(bbox.max, 0.5);
          childObject3D.position.sub(center);
        }
        break;
      case 'max':
        {
          childObject3D.position.sub(bbox.max);
        }
        break;
      case 'min':
        {
          childObject3D.position.sub(bbox.min);
        }
        break;
      case 'center_min':
        {
          const centerMin = bbox.min.clone().lerp(bbox.max, 0.5);
          centerMin.z = bbox.min.z;
          childObject3D.position.sub(centerMin);
        }
        break;
      default:
    }

    // Scale
    if (scale) {
      const newScale = childObject3D.scale;
      newScale.x *= scale.x;
      newScale.y *= scale.y;
      newScale.z *= scale.z;
      childObject3D.scale.copy(newScale);
    }

    // Rotation
    if (rotation) {
      const newRotation = childObject3D.rotation;
      newRotation.x += rotation.x;
      newRotation.y += rotation.y;
      newRotation.z += rotation.z;
      childObject3D.rotation.copy(newRotation);
    }

    this.object3D.add(childObject3D);

    this.object3D.traverse(function (child) {
      if (child.geometry) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.material) {
        if (child.material.map) child.material.map.encoding = textureEncoding;
        child.material.side = THREE.FrontSide;
        child.material.needsUpdate = true;
      }
    });

    this.object3D.name = childObject3D.name + '_set_up_';

    this.animations = animations;
  }

  getObject3D() {
    return this.object3D;
  }

  getAnimations() {
    return this.animations;
  }

  /**
   * It clones the object3D and then clones all of the materials in the object3D
   *
   * @returns {RenderData} A new RenderData object with a cloned object3D and the same animations.
   */
  clone() {
    const cloneObject = this.object3D.clone();
    cloneObject.traverse((child) => {
      if (child.material) {
        child.material = child.material.clone();
        child.material.needsUpdate = true;
      }
    });

    return new RenderData(cloneObject, {}, this.animations);
  }
}

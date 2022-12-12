import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import * as jquery from 'jquery';
import GameObject from '@ud-viz/core/src/Game/GameObject/GameObject';
import { Howl } from 'howler';
const THREEUtils = require('../../Components/THREEUtils');

// not the BrowserScript of core beacause it's import controller and base which are browser side
import * as BrowserScript from '../../Game/BrowserScript';
// not the Render of core beacause it's import controller and base which are browser side
import * as Render from '../../Game/Render';

/**
 * Default material used by native objects
 */
const DEFAULT_MATERIAL = new THREE.MeshLambertMaterial({
  color: 0x00ff00,
});

import './AssetsManager.css';
import { RenderData } from '../../Game/Render';
import { AudioController } from '../../Game/Audio';

/**
 * Give acess to all assets (image, video, script, worlds, ...)
 */
export class AssetsManager {
  constructor(worldScriptsArray, browserScriptsArray) {
    this.conf = null;

    // transform array of worldscripts into a map
    this.worldScripts = {};
    if (worldScriptsArray) {
      worldScriptsArray.forEach((ws) => {
        this.worldScripts[ws.name] = ws;
      });
    }

    // same for browserScripts
    this.browserScripts = {};
    if (browserScriptsArray) {
      browserScriptsArray.forEach((bs) => {
        this.browserScripts[bs.name] = bs;
      });
    }

    // renderData are loaded async
    this.renderData = {};

    this.prefabs = {};
    this.worldsJSON = null;
  }

  /**
   *
   * @param {GameObject} go
   * @param {*} isServerSide
   * @param intializeWorldComponent
   * @param options
   */
  initGameObject(go, intializeWorldComponent, options = {}) {
    if (!go.isInitialized()) {
      for (const type in go.getComponents()) {
        const c = go.getComponents()[type];
        if (intializeWorldComponent != c.getModel().isWorldComponent())
          continue;

        // create game component controller

        switch (type) {
          case GameObject.Audio.Model.TYPE:
            c.initController(new AudioController(this, c.getModel(), go));
            break;
          case GameObject.WorldScript.Model.TYPE:
            c.initController(
              new GameObject.WorldScript.Controller(
                this,
                c.getModel(),
                go,
                options.worldContext
              )
            );
            break;
          case GameObject.BrowserScript.Model.TYPE:
            c.initController(
              new BrowserScript.Controller(
                this,
                c.getModel(),
                go,
                options.browserContext
              )
            );
            break;
          case GameObject.Render.Model.TYPE:
            c.initController(new Render.Controller(this, c.getModel(), go));
            break;
          case GameObject.Collider.Model.TYPE:
            c.initController(
              new GameObject.Collider.Controller(this, c.getModel(), go)
            );
            break;
          default:
            throw 'Unknown Game Component ' + type;
        }
      }

      go.initialize();
    }

    // recursive
    go.getChildren().forEach((child) => {
      this.initGameObject(child, intializeWorldComponent, options);
    });
  }

  /**
   * Return json prefabs
   *
   * @returns {object} a map containing prefabs JSON loaded
   */
  getPrefabs() {
    return this.prefabs;
  }

  /**
   * Return new model corresponding to the id passed
   *
   * @param {string} idRenderData id of the model
   * @returns {Object{'animations' => THREE.AnimationClip[], 'object' => THREE.Object3D}
   */
  createRenderData(idRenderData) {
    if (!this.renderData[idRenderData])
      console.error('no render data with id ', idRenderData);

    return this.renderData[idRenderData].clone();
  }

  /**
   * Return worlds loaded
   *
   * @returns {JSONArray[WorldJSON]} array of worlds
   */
  getWorldsJSON() {
    return this.worldsJSON;
  }

  /**
   * Create a Howl instance of the sound
   *
   * @param {string} idSound
   * @param {object} options
   * @returns
   */
  createSound(idSound, options = {}) {
    const confSound = this.conf['sounds'][idSound];

    if (!confSound) console.error('no sound with id ', idSound);

    return new Howl({
      src: confSound.path,
      loop: options.loop || false,
    });
  }

  /**
   * Return javascript class with a given id
   *
   * @param {string} idScript id of the script
   * @returns {object} constructor of the class
   */
  fetchWorldScript(idScript) {
    if (!this.worldScripts[idScript])
      console.error('no world script with id ', idScript);
    return this.worldScripts[idScript];
  }

  /**
   * Return javascript class with a given id
   *
   * @param {string} id id of the script
   * @returns {object} constructor of the class
   */
  fetchBrowserScript(id) {
    if (!this.browserScripts[id])
      console.error('no browser script with id ', id);
    return this.browserScripts[id];
  }

  /**
   * Create a new GameObject base on a prefab json
   *
   * @param {string} idprefab id of the prefab
   * @returns {GameObject} the gameobject based on a prefab
   */
  createPrefab(idprefab) {
    if (!this.prefabs[idprefab]) console.error('no prefab with id ', idprefab);
    return new GameObject(this.prefabs[idprefab]);
  }

  /**
   * Return the path of video with a given id
   *
   * @param {string} idVideo id of the video
   * @returns {string} path of the video
   */
  fetchVideoPath(idVideo) {
    if (!this.conf.videos[idVideo]) console.error('no video with id ', idVideo);
    return this.conf.videos[idVideo].path;
  }

  /**
   * Return a json GameObject with a given id
   *
   * @param {string} idprefab id of the prefab
   * @returns {JSON} json gameobject
   */
  fetchPrefabJSON(idprefab) {
    if (!this.prefabs[idprefab]) console.error('no prefab with id ', idprefab);
    return JSON.parse(JSON.stringify(this.prefabs[idprefab]));
  }

  /**
   * Build native objects (procedural objects)
   */
  buildNativeModel() {
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
   * Parse model imported according its metadata
   *
   * @param {string} id id of the model
   * @param {THREE.Object3D} obj the object parsed
   * @param {JSON} renderDataConfig metadata
   */
  parseObject3D(obj, renderDataConfig) {
    const anchor = renderDataConfig.anchor;
    const scale = renderDataConfig.scale;
    const rotation = renderDataConfig.rotation;

    // Anchor point
    const bbox = new THREE.Box3().setFromObject(obj);
    const parent = new THREE.Object3D();
    switch (anchor) {
      case 'center':
        {
          const center = bbox.min.lerp(bbox.max, 0.5);
          obj.position.sub(center);
        }
        break;
      case 'max':
        {
          obj.position.sub(bbox.max);
        }
        break;
      case 'min':
        {
          obj.position.sub(bbox.min);
        }
        break;
      case 'center_min':
        {
          const centerMin = bbox.min.clone().lerp(bbox.max, 0.5);
          centerMin.z = bbox.min.z;
          obj.position.sub(centerMin);
        }
        break;
      default:
    }

    // Scale
    if (scale) {
      const newScale = obj.scale;
      newScale.x *= scale.x;
      newScale.y *= scale.y;
      newScale.z *= scale.z;
      obj.scale.copy(newScale);
    }

    // Rotation
    if (rotation) {
      const newRotation = obj.rotation;
      newRotation.x += rotation.x;
      newRotation.y += rotation.y;
      newRotation.z += rotation.z;
      obj.rotation.copy(newRotation);
    }

    parent.add(obj);

    parent.traverse(function (child) {
      if (child.geometry) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
      if (child.material) {
        if (child.material.map)
          child.material.map.encoding = THREEUtils.textureEncoding;
        child.material.side = THREE.FrontSide;
        child.material.needsUpdate = true;
      }
    });

    return parent;
  }

  /**
   * Load from a server assets described in a config file
   *
   * @param {JSON} config config file
   * @param {Html} parentDiv where to add the loadingView
   * @returns {Array[Promises]} all the promises processed to load assets
   */
  loadFromConfig(config = {}, parentDiv = document.body) {
    this.conf = config;

    /** @type {LoadingView} */
    let loadingView = null;

    if (parentDiv) {
      loadingView = new LoadingView();
      parentDiv.appendChild(loadingView.html());
    }

    // Result
    const promises = [];

    // Load config file
    const _this = this;
    this.buildNativeModel();

    if (config.renderData) {
      const idLoadingRenderData = 'RenderData';
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
                  _this.parseObject3D(result.scene, renderDataConfig),
                  result.animations
                );

                // Check if finish
                count++;

                // Update loading bar
                loadingView.updateProgress(
                  idLoadingRenderData,
                  (100 * count) / Object.keys(config.renderData).length
                );

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

    if (config.worldScripts) {
      console.error('DEPRECATED');
    }

    if (config.localScripts) {
      console.error('DEPRECATED');
    }

    if (config.prefabs) {
      const idLoadingPrefabs = 'Prefabs';
      loadingView.addLoadingBar(idLoadingPrefabs);

      promises.push(
        new Promise((resolve) => {
          let count = 0;
          for (const idPrefab in config.prefabs) {
            const scriptPath = config.prefabs[idPrefab].path;
            jquery.get(
              scriptPath,
              function (prefabstring) {
                _this.prefabs[idPrefab] = JSON.parse(prefabstring);

                // Check if finish
                count++;

                loadingView.updateProgress(
                  idLoadingPrefabs,
                  (100 * count) / Object.keys(config.prefabs).length
                );

                if (count == Object.keys(config.prefabs).length) {
                  console.log('prefabs loaded ', _this.prefabs);
                  resolve();
                }
              },
              'text'
            );
          }
        })
      );
    }

    if (config.worlds) {
      const idLoadingWorlds = 'Worlds';
      loadingView.addLoadingBar(idLoadingWorlds);

      promises.push(
        new Promise((resolve) => {
          jquery.get(
            config.worlds.folder + 'index.json',
            function (indexString) {
              const indexWorldsJSON = JSON.parse(indexString);
              let count = 0;
              _this.worldsJSON = [];

              for (const uuid in indexWorldsJSON) {
                jquery.get(
                  config.worlds.folder + indexWorldsJSON[uuid],
                  function (worldString) {
                    count++;
                    _this.worldsJSON.push(JSON.parse(worldString));

                    loadingView.updateProgress(
                      idLoadingWorlds,
                      (100 * count) / Object.keys(indexWorldsJSON).length
                    );

                    if (count == Object.keys(indexWorldsJSON).length) {
                      console.log('worlds loaded ', _this.worldsJSON);
                      resolve();
                    }
                  },
                  'text'
                );
              }
            },
            'text'
          );
        })
      );
    }

    if (config.css) {
      console.error('DEPRECATED');
    }

    return new Promise((resolve) => {
      Promise.all(promises).then(function () {
        if (loadingView) {
          loadingView.dispose();
        }
        resolve();
      });
    });
  }
}

/**
 * A view in which loading bar can be added
 */
class LoadingView {
  constructor() {
    this.rootHtml = document.createElement('div');
    this.rootHtml.classList.add('assetsLoadingView');

    const label = document.createElement('div');
    label.classList.add('loadingLabel_Assets');
    label.innerHTML = 'ud-viz';
    this.rootHtml.appendChild(label);

    // Loading bars
    this.loadingBars = {};
  }

  /**
   *
   * @returns {Html} the element root html of this view
   */
  html() {
    return this.rootHtml;
  }

  /**
   * Dispose this view
   */
  dispose() {
    this.rootHtml.remove();
  }

  /**
   * Update the progress bar of the loading bar with an id
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
    label.classList.add('labelBar-Assets');
    parent.appendChild(label);

    this.loadingBars[id] = progress;

    this.rootHtml.appendChild(parent);
  }
}

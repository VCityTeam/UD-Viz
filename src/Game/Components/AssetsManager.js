/** @format */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';
import * as jquery from 'jquery';
import GameObject from '../Shared/GameObject/GameObject';
import { Howl } from 'howler';
const THREEUtils = require('../Shared/Components/THREEUtils');

/**
 * Default material used by native objects
 */
const DEFAULT_MATERIAL = new THREE.MeshLambertMaterial({ color: 0x00ff00 });

/**
 * Give acess to all assets (image, video, script, worlds, ...)
 */
export class AssetsManager {
  constructor() {
    this.conf = null;

    //manager to load scripts
    this.prefabs = {};
    this.worldScripts = {};
    this.localScripts = {};
    this.objects = {};
    this.animations = {};
    this.worldsJSON = null;

    //buffer
    this.soundsBuffer = {};
  }

  dispose() {
    for (let key in this.soundsBuffer) {
      this.soundsBuffer[key].forEach(function (s) {
        s.unload();
      });
    }
  }

  /**
   * return json prefabs
   * @returns {Object} a map containing prefabs JSON loaded
   */
  getPrefabs() {
    return this.prefabs;
  }

  /**
   * Return new model corresponding to the id passed
   * @param {String} idRenderData id of the model
   * @returns {Object{'animations' => THREE.AnimationClip[], 'object' => THREE.Object3D}
   */
  createRenderData(idRenderData) {
    if (!this.objects[idRenderData])
      console.error('no model with id ', idRenderData);

    //clone Object
    const result = {
      animations: this.createAnimations(idRenderData),
      object: this.objects[idRenderData].clone(),
    };

    //clone materials as well
    result.object.traverse(function (child) {
      if (child.material) {
        child.material = child.material.clone();
        child.material.needsUpdate = true;
      }
    });

    return result;
  }

  createAnimations(idRenderData) {
    return this.animations[idRenderData];
  }

  /**
   * Return worlds loaded
   * @returns {JSONArray[WorldJSON]} array of worlds
   */
  getWorldsJSON() {
    return this.worldsJSON;
  }

  fetchSound(idSound, options = {}) {
    const confSound = this.conf['sounds'][idSound];

    if (!confSound) console.error('no sound with id ', idSound);

    let result;

    if (!this.soundsBuffer[idSound]) {
      //first this sound is fetched
      result = new Howl({
        src: confSound.path,
        loop: options.loop || false,
      });

      //register for unload
      this.soundsBuffer[idSound] = [result];
    } else {
      //if shared an instance already existing is return
      //TODO conf is the same for all the audio comp not allowing to have shared and not shared sound in the same comp
      //TODO remove shared to well dispose sounds
      if (options.shared) {
        result = this.soundsBuffer[idSound][0];
        if (!result) throw new Error('no sound');
      } else {
        result = new Howl({
          src: confSound.path,
          loop: options.loop || false,
        });
        this.soundsBuffer[idSound].push(result);
      }
    }

    return result;
  }

  /**
   * Return javascript class with a given id
   * @param {String} idScript id of the script
   * @returns {Object} constructor of the class
   */
  fetchWorldScript(idScript) {
    if (!this.worldScripts[idScript])
      console.error('no world script with id ', idScript);
    return this.worldScripts[idScript];
  }

  /**
   * Return javascript class with a given id
   * @param {String} id id of the script
   * @returns {Object} constructor of the class
   */
  fetchLocalScript(id) {
    if (!this.localScripts[id]) console.error('no local script with id ', id);
    return this.localScripts[id];
  }

  /**
   * Create a new GameObject base on a prefab json
   * @param {String} idprefab id of the prefab
   * @returns {GameObject} the gameobject based on a prefab
   */
  createPrefab(idprefab) {
    if (!this.prefabs[idprefab]) console.error('no prefab with id ', idprefab);
    return new GameObject(this.prefabs[idprefab]);
  }

  /**
   * Return the path of video with a given id
   * @param {String} idVideo id of the video
   * @returns {String} path of the video
   */
  fetchVideoPath(idVideo) {
    if (!this.conf.videos[idVideo]) console.error('no video with id ', idVideo);
    return this.conf.videos[idVideo].path;
  }

  /**
   * Return a json GameObject with a given id
   * @param {String} idprefab id of the prefab
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
    this.objects['cube'] = cube;

    const geometrySphere = new THREE.SphereGeometry(1, 32, 32);
    const sphere = new THREE.Mesh(geometrySphere, DEFAULT_MATERIAL);
    this.objects['sphere'] = sphere;

    const geometryTorus = new THREE.TorusGeometry(10, 0.1, 16, 100);
    const torus = new THREE.Mesh(geometryTorus, DEFAULT_MATERIAL);
    this.objects['torus'] = torus;

    this.buildGizmo();
    this.buildPointerMouse();
  }

  /**
   * Build 'gizmo' native model
   */
  buildGizmo() {
    const result = new THREE.Object3D();

    const buildArrowGizmo = function (color, direction, rotation) {
      const scale = 5;
      const height = scale;
      const radius = scale / 20;
      const geo = new THREE.CylinderGeometry(radius, radius, height);
      const material = new THREE.MeshLambertMaterial({ color: color });
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.add(direction.multiplyScalar(height / 2));
      mesh.rotation.copy(rotation);
      return mesh;
    };

    result.add(
      buildArrowGizmo(
        'green',
        new THREE.Vector3(0, 1, 0),
        new THREE.Euler(0, 0, 0)
      )
    );
    result.add(
      buildArrowGizmo(
        'red',
        new THREE.Vector3(1, 0, 0),
        new THREE.Euler(0, 0, Math.PI * 0.5)
      )
    );
    result.add(
      buildArrowGizmo(
        'blue',
        new THREE.Vector3(0, 0, 1),
        new THREE.Euler(Math.PI * 0.5, 0, 0)
      )
    );

    this.objects['gizmo'] = result;
  }

  /**
   * Build 'pointer_mouse' native model
   */
  buildPointerMouse() {
    const geometry = new THREE.CylinderGeometry(0.15, 0, 0.3, 32);
    const cylinder = new THREE.Mesh(geometry, DEFAULT_MATERIAL);
    cylinder.rotateX(Math.PI * 0.5);
    this.objects['pointer_mouse'] = cylinder;
  }

  /**
   * Parse model imported according its metadata
   * @param {String} id id of the model
   * @param {THREE.Object3D} obj the object parsed
   * @param {JSON} modelData metadata
   */
  parse(id, obj, modelData) {
    const anchor = modelData.anchor;
    const scale = modelData.scale;
    const rotation = modelData.rotation;
    const noShadow = modelData.noShadow || false; //WIP

    //rotation
    const quatYUP2ZUP = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(-Math.PI * 0.5, 0, Math.PI)
    );
    obj.applyQuaternion(quatYUP2ZUP);

    //anchor point
    const bbox = new THREE.Box3().setFromObject(obj);
    const parent = new THREE.Object3D();
    switch (anchor) {
      case 'center':
        {
          let center = bbox.min.lerp(bbox.max, 0.5);
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
          let centerMin = bbox.min.clone().lerp(bbox.max, 0.5);
          centerMin.z = bbox.min.z;
          obj.position.sub(centerMin);
        }
        break;
      default:
    }

    //scale
    if (scale) {
      const newScale = obj.scale;
      newScale.x *= scale.x;
      newScale.y *= scale.y;
      newScale.z *= scale.z;
      obj.scale.copy(newScale);
    }

    //rotation
    if (rotation) {
      const newRotation = obj.rotation;
      newRotation.x += rotation.x;
      newRotation.y += rotation.y;
      newRotation.z += rotation.z;
      obj.rotation.copy(newRotation);
    }

    parent.add(obj);

    parent.traverse(function (child) {
      if (child.geometry && !noShadow) {
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

    parent.name = id;

    this.objects[id] = parent;
  }

  /**
   * Load from a server assets described in a config file
   * @param {JSON} config config file
   * @returns {Array[Promises]} all the promises processed to load assets
   */
  loadFromConfig(config = {}) {
    this.conf = config;

    //load config file
    const _this = this;
    const loader = new GLTFLoader();
    this.buildNativeModel();

    const modelPromise = new Promise((resolve, reject) => {
      let count = 0;
      for (let idRenderData in config.renderData) {
        const id = idRenderData;
        const renderData = config.renderData[id];
        loader.load(
          renderData.path,
          (data) => {
            //parse
            _this.parse(id, data.scene, renderData);

            _this.animations[id] = data.animations;

            //check if finish
            count++;
            if (count == Object.keys(config.renderData).length) {
              console.log('objects loaded ', this.objects);
              console.log('animations loaded ', this.animations);
              resolve();
            }
          },
          null,
          reject
        );
      }
    });

    const toEvalCode = function (string) {
      const regexRequire = /^const.*=\W*\n*.*require.*;$/gm;
      const regexType = /^\/\*\*\W*@type.*\*\/$/gm;
      let resultRequire = string.replace(regexRequire, '');
      return resultRequire.replace(regexType, '');
    };

    const worldScriptsPromise = new Promise((resolve, reject) => {
      let count = 0;
      for (let idScript in config.worldScripts) {
        const scriptPath = config.worldScripts[idScript].path;
        jquery.get(
          scriptPath,
          function (scriptString) {
            scriptString = toEvalCode(scriptString);
            _this.worldScripts[idScript] = eval(scriptString);
            //check if finish
            count++;
            if (count == Object.keys(config.worldScripts).length) {
              console.log('World Scripts loaded ', _this.worldScripts);
              resolve();
            }
          },
          'text'
        );
      }
    });
    const localScriptsPromise = new Promise((resolve, reject) => {
      let count = 0;
      for (let idScript in config.localScripts) {
        const scriptPath = config.localScripts[idScript].path;
        jquery.get(
          scriptPath,
          function (scriptString) {
            scriptString = toEvalCode(scriptString);
            _this.localScripts[idScript] = eval(scriptString);
            //check if finish
            count++;
            if (count == Object.keys(config.localScripts).length) {
              console.log('Local Scripts loaded ', _this.localScripts);
              resolve();
            }
          },
          'text'
        );
      }
    });
    const prefabsPromise = new Promise((resolve, reject) => {
      let count = 0;
      for (let idPrefab in config.prefabs) {
        const scriptPath = config.prefabs[idPrefab].path;
        jquery.get(
          scriptPath,
          function (prefabstring) {
            _this.prefabs[idPrefab] = JSON.parse(prefabstring);

            //check if finish
            count++;
            if (count == Object.keys(config.prefabs).length) {
              console.log('prefabs loaded ', _this.prefabs);
              resolve();
            }
          },
          'text'
        );
      }
    });
    const worldsPromise = new Promise((resolve, reject) => {
      if (config.worlds) {
        jquery.get(
          config.worlds.path,
          function (worldsString) {
            _this.worldsJSON = JSON.parse(worldsString);
            console.log('worlds loaded ', _this.worldsJSON);
            resolve();
          },
          'text'
        );
      } else {
        resolve();
      }
    });
    const cssPromise = new Promise((resolve, reject) => {
      let count = 0;
      for (let idCss in config.css) {
        const cssPath = config.css[idCss].path;
        jquery.get(
          cssPath,
          function (cssString) {
            const styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerText = cssString;
            document.head.appendChild(styleSheet);
            //check if finish
            count++;
            if (count == Object.keys(config.css).length) {
              console.log('css loaded');
              resolve();
            }
          },
          'text'
        );
      }
    });

    const promises = [];
    if (config.renderData) promises.push(modelPromise);
    if (config.prefabs) promises.push(prefabsPromise);
    if (config.worldScripts) promises.push(worldScriptsPromise);
    if (config.localScripts) promises.push(localScriptsPromise);
    if (config.worlds) promises.push(worldsPromise);
    if (config.css) promises.push(cssPromise);

    return Promise.all(promises);
  }
}

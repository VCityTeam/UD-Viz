/**
 * Object to render and simulate world
 *
 * @format
 */

const THREE = require('three');
const JSONUtils = require('../Components/JSONUtils');

// GameObject Components
// const RenderModel = require('./Components/Render');
// const ColliderModel = require('./Components/Collider');
const WorldScriptModel = require('./Components/WorldScript').WorldScriptModel;
// const AudioModel = require('./Components/Audio');
// const LocalScriptModel = require('./Components/LocalScript');

/**
 * Objects to compose a Game
 * Work with a graph hierarchy
 * GameObject have component to handle different behaviour
 */
const GameObjectModule = class GameObject {
  /**
   * Create a new GameObject
   *
   * @param {JSON} json data to init this
   * @param {GameObject} parent the parent of this (optional)
   */
  constructor(json, parent) {
    if (!json) throw new Error('no json');

    // Id
    this.uuid = json.uuid || THREE.Math.generateUUID();

    // Components
    this.components = {};
    this.setComponentModelsFromJSON(json);

    // Name
    this.name = json.name || 'none';

    // Default object3d where transform is stored
    this.object3D = new THREE.Object3D();
    this.object3D.name = this.name + '_object3D';
    this.object3D.rotation.reorder('ZXY');
    // Stock data in userData
    this.object3D.userData = {
      gameObjectUUID: this.getUUID(),
    };
    this.setFromTransformJSON(json.transform);

    /**
     * True mean the object is not supposed to move during the game
     * for simulation/network opti
     *
     * @type {boolean}
     */
    this.static = json.static || false;

    // Outdated flag for network opti
    this.outdated = json.outdated || false;

    // Graph hierarchy
    const children = [];
    if (json.children && json.children.length > 0) {
      json.children.forEach((child) => {
        children.push(new GameObject(child, this));
      });
    }
    this.children = children;

    // Uuid of parent if one
    this.parentUUID = null;
    this.setParent(parent);

    // Assets has been initialized
    this.initialized = false;

    // Update the object state in updateFromGO (or not)
    this.noLocalUpdate = json.noLocalUpdate || false;

    // Freeze components and transform
    this.freeze = json.freeze || false;

    // List to force certain component to be serialize
    this.forceSerializeComponentModels =
      json.forceSerializeComponentModels || [];
  }

  /**
   * Bind transform of go into this
   *
   * @param {GameObject} go
   */
  setTransformFromGO(go) {
    if (this.freeze) return;
    this.object3D.position.copy(go.object3D.position);
    this.object3D.scale.copy(go.object3D.scale);
    this.object3D.rotation.copy(go.object3D.rotation);
  }

  /**
   * Set transform of object3D from json
   *
   * @param {JSON} json
   */
  setFromTransformJSON(json = {}) {
    if (this.freeze) return;

    if (json.position) {
      this.object3D.position.fromArray(json.position);
      JSONUtils.parseVector3(this.object3D.position);
    } else {
      this.object3D.position.fromArray([0, 0, 0]);
    }

    if (json.rotation) {
      this.object3D.rotation.fromArray(json.rotation);
      JSONUtils.parseVector3(this.object3D.rotation);
    } else {
      this.object3D.rotation.fromArray([0, 0, 0]);
    }

    if (json.scale) {
      this.object3D.scale.fromArray(json.scale);
      JSONUtils.parseVector3(this.object3D.scale);
    } else {
      this.object3D.scale.fromArray([1, 1, 1]);
    }
  }

  setTransformFromObject3D(object3D) {
    if (this.freeze) return;

    this.object3D.position.copy(object3D.position);
    this.object3D.scale.copy(object3D.scale);
    this.object3D.rotation.copy(object3D.rotation);
  }

  /**
   * Replace data of this with a json object
   *
   * @param {JSON} json
   */
  setFromJSON(json) {
    this.components = {}; // Clear
    this.setComponentModelsFromJSON(json);
    this.setFromTransformJSON(json.transform);
    this.name = json.name;
    this.static = json.static;
    this.outdated = json.outdated;

    this.children.forEach(function (c) {
      const uuidChild = c.getUUID();
      let jsonChild;
      for (let i = 0; i < json.children.length; i++) {
        if (json.children[i].uuid == uuidChild) {
          jsonChild = json.children[i];
          break;
        }
      }
      if (!jsonChild) {
        // C no longer in scene
        return;
      }

      c.setFromJSON(jsonChild);
    });
  }

  /**
   * Initialize components of this
   *
   * @param {AssetsManager} manager must implement an assetsmanager interface can be local or server
   * @param {Library} bundles set of bundle library used by script
   * @param {boolean} isServerSide the code is running on a server or in a browser
   */
  initAssetsComponents(manager, bundles = {}, isServerSide = false) {
    console.error('DEPRECATED');
    if (!this.initialized) {
      this.initialized = true;
      for (const type in this.components) {
        const c = this.components[type];
        if (isServerSide && !c.isServerSide()) continue;
        c.initAssets(manager, bundles);
      }
    }
    this.children.forEach(function (child) {
      child.initAssetsComponents(manager, bundles, isServerSide);
    });
  }

  isInitialized() {
    if (this.initialized) console.warn('GameObject is already initialized');
    this.initialized = true;
  }

  /**
   * Return the world transform of this
   *
   * @returns {object}
   */
  computeWorldTransform() {
    const euler = new THREE.Euler();
    euler.reorder('ZXY');
    const result = {
      position: new THREE.Vector3(),
      rotation: euler,
      scale: new THREE.Vector3(),
    };

    let current = this;
    do {
      result.position.add(current.getPosition());
      result.rotation.add(current.getRotation());
      result.scale.multiply(current.getScale());

      current = current.parent;
    } while (current);

    return result;
  }

  /**
   * Add vector to position of this
   *
   * @param {THREE.Vector3} vector
   */
  move(vector) {
    if (this.freeze) return;

    this.object3D.position.add(vector);
  }

  /**
   * Clamp rotation between 0 => 2*PI
   */
  clampRotation() {
    const r = this.object3D.rotation;
    r.x = (Math.PI * 4 + r.x) % (Math.PI * 2);
    r.y = (Math.PI * 4 + r.y) % (Math.PI * 2);
    r.z = (Math.PI * 4 + r.z) % (Math.PI * 2);
  }

  /**
   * Add vector to rotation of this
   *
   * @param {THREE.Vector3} vector
   */
  rotate(vector) {
    if (this.freeze) return;

    this.object3D.rotateZ(vector.z);
    this.object3D.rotateX(vector.x);
    this.object3D.rotateY(vector.y);

    this.clampRotation();
  }

  /**
   * Return worldScripts of this
   *
   * @returns {object}
   */
  fetchWorldScripts() {
    const c = this.getComponent(WorldScriptComponent.TYPE);
    if (!c) return null;
    return c.getScripts();
  }

  fetchLocalScripts() {
    const c = this.getComponent(LocalScriptModule.TYPE);
    if (!c) return null;
    return c.getScripts();
  }

  /**
   * Return the default forward vector
   *
   * @returns {THREE.Vector3}
   */
  getDefaultForward() {
    return new THREE.Vector3(0, 1, 0);
  }

  /**
   * Return the root gameobject of the graph hierarchy
   *
   * @returns {GameObject}
   */
  computeRoot() {
    if (!this.parent) return this;
    return this.parent.computeRoot();
  }

  /**
   * Compute the forward vector of this
   *
   * @returns {THREE.Vector3}
   */
  computeForwardVector() {
    const quaternion = new THREE.Quaternion().setFromEuler(
      this.object3D.rotation
    );
    const result = this.getDefaultForward().applyQuaternion(quaternion);
    return result;
  }

  /**
   * Compute the backward vector of this
   *
   * @returns {THREE.Vector3}
   */
  computeBackwardVector() {
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      Math.PI
    );
    return this.computeForwardVector().applyQuaternion(quaternion);
  }

  /**
   * Compute Upward vector
   *
   * @returns {THREE.Vector3}
   */
  computeUpVector() {
    const quaternion = new THREE.Quaternion().setFromEuler(
      this.object3D.rotation
    );
    // Console.log('coucou UP');
    const result = THREE.Object3D.DefaultUp.clone().applyQuaternion(quaternion);
    return result;
  }

  /**
   * Compute the downward vector
   *
   * @returns {THREE.Vector3}
   */
  computeDownVector() {
    const quaternion = new THREE.Quaternion().setFromEuler(
      this.object3D.rotation
    );
    // Console.log('coucou DOWN');
    const result = THREE.Object3D.DefaultUp.clone()
      .negate()
      .applyQuaternion(quaternion);
    return result;
  }

  /**
   * Compute the left translation vector
   *
   * @returns {THREE.Vector3}
   */
  computeLeftVector() {
    const quaternion = new THREE.Quaternion().setFromEuler(
      this.object3D.rotation
    );
    // Console.log('coucou LEFT');
    const result = this.getDefaultForward()
      .applyAxisAngle(THREE.Object3D.DefaultUp, Math.PI / 2)
      .applyQuaternion(quaternion);
    return result;
  }

  /**
   * Compute the right translation vector
   *
   * @returns {THREE.Vector3}
   */
  computeRightVector() {
    const quaternion = new THREE.Quaternion().setFromEuler(
      this.object3D.rotation
    );
    // Console.log('coucou RIGHT');
    const result = this.getDefaultForward()
      .applyAxisAngle(THREE.Object3D.DefaultUp, -Math.PI / 2)
      .applyQuaternion(quaternion);
    return result;
  }

  /**
   * Remove the gameobject from its parent
   * Remove its object3D from the scene
   */
  removeFromParent() {
    if (this.parent) {
      const _this = this;
      this.parent.children = this.parent.children.filter(function (ele) {
        return ele.getUUID() != _this.getUUID();
      });
    } else {
      console.warn('no deleted because no parent ', this.toJSON());
    }
  }

  /**
   *
   * @returns {boolean}
   */
  isStatic() {
    return this.static;
  }

  /**
   *
   * @returns {boolean}
   */
  isOutdated() {
    return this.outdated;
  }

  /**
   *
   * @param {boolean} value
   */
  setOutdated(value) {
    this.outdated = value;
  }

  /**
   * Set Components with a json object
   *
   * @param {JSON} json
   */
  setComponentModelsFromJSON(json) {
    const jsonMap = json.componentModels;
    const _this = this;

    if (!jsonMap) return;

    for (const type in jsonMap) {
      const componentModelJSON = jsonMap[type];

      switch (type) {
        // case RenderComponent.TYPE:
        //   if (_this.components[RenderComponent.TYPE])
        //     console.warn('multiple component');

        //   _this.components[RenderComponent.TYPE] = new RenderComponent(
        //     _this,
        //     componentModelJSON
        //   );

        //   break;
        // case AudioComponent.TYPE:
        //   if (_this.components[AudioComponent.TYPE])
        //     console.warn('multiple component');

        //   _this.components[AudioComponent.TYPE] = new AudioComponent(
        //     _this,
        //     componentModelJSON
        //   );

        //   break;
        case WorldScriptModel.TYPE:
          if (_this.components[WorldScriptModel.TYPE])
            console.warn('multiple component');

          _this.components[WorldScriptModel.TYPE] = new GameObjectComponent(
            new WorldScriptModel(componentModelJSON)
          );

          break;
        // case LocalScriptModule.TYPE:
        //   if (_this.components[LocalScriptModule.TYPE])
        //     console.warn('multiple component');

        //   _this.components[LocalScriptModule.TYPE] = new LocalScriptModule(
        //     _this,
        //     componentModelJSON
        //   );

        //   break;
        // case ColliderComponent.TYPE:
        //   if (_this.components[ColliderComponent.TYPE])
        //     console.warn('multiple component');

        //   _this.components[ColliderComponent.TYPE] = new ColliderComponent(
        //     _this,
        //     componentModelJSON
        //   );

        //   break;
        default:
          console.warn('wrong type component', type, componentModelJSON);
      }
    }
  }

  /**
   * Compute the object3D
   *
   * @param {boolean} recursive if true recursive call on children
   * @returns {THREE.Object3D} the object3D of this
   */
  computeObject3D(recursive = true) {
    const obj = this.object3D;

    // Clear children object
    obj.children.length = 0;

    const r = this.getComponent(RenderComponent.TYPE);
    if (r) {
      const rObj = r.getObject3D();
      if (!rObj) throw new Error('no render object3D');
      obj.add(rObj);
    }

    // Add children if recursive
    if (recursive) {
      this.children.forEach(function (child) {
        obj.add(child.computeObject3D());
      });
    }

    return obj;
  }

  getObject3D() {
    return this.object3D;
  }

  /**
   * Get a gameobject component with a given uuid
   *
   * @param {string} uuid the uuid of the component
   * @returns {GameObject.Component} the gameobject component
   */
  getComponentByUUID(uuid) {
    for (const key in this.components) {
      const c = this.components[key];
      if (c.getModel().getUUID() == uuid) return c;
    }

    return null;
  }

  /**
   * Return a clone of this
   *
   * @returns {GameObject}
   */
  clone() {
    return new GameObject(this.toJSON(true));
  }

  /**
   * Apply a callback to all gameobject of the hierarchy
   * Dont apply it to gameobject parent of this
   *
   * @param {Function} cb the callback to apply take a gameobject as first argument
   * @returns {boolean} true stop the propagation (opti) false otherwise
   */
  traverse(cb) {
    if (cb(this)) return true;

    for (let index = 0; index < this.children.length; index++) {
      const element = this.children[index];
      if (element.traverse(cb)) return true;
    }

    return false;
  }

  /**
   * Find a gameobject into the hierarchy with its uuid
   *
   * @param {string} uuid the uuid searched
   * @returns {GameObject} gameobject in the hierarchy with uuid
   */
  find(uuid) {
    let result = null;
    this.traverse(function (g) {
      if (g.getUUID() == uuid) {
        result = g;
        return true;
      }
      return false;
    });
    return result;
  }

  /**
   * Find a gameobject into the hierarchy with a name
   * return the first one encounter
   *
   * @param {string} name
   * @returns
   */
  findByName(name) {
    let result = null;
    this.traverse(function (g) {
      if (g.getName() == name) {
        result = g;
        return true;
      }
      return false;
    });
    return result;
  }

  /**
   * Add a child gameobject to this
   *
   * @param {GameObject} child
   */
  addChild(child) {
    for (let index = 0; index < this.children.length; index++) {
      const element = this.children[index];
      if (element.getUUID() == child.getUUID()) {
        console.log('already add ', child);
        return;
      }
    }

    this.children.push(child);
    child.setParent(this);
  }

  /**
   *
   * @param {GameObject} parent
   */
  setParent(parent) {
    this.parent = parent;

    if (parent) {
      this.parentUUID = parent.getUUID();
    }
  }

  getParent() {
    return this.parent;
  }

  /**
   *
   * @returns {string}
   */
  getParentUUID() {
    return this.parentUUID;
  }

  /**
   *
   * @returns {Array[GameObject]}
   */
  getChildren() {
    return this.children;
  }

  getComponents() {
    return this.components;
  }

  /**
   *
   * @param {string} type
   * @returns {GameObject/Components}
   */
  getComponent(type) {
    return this.components[type];
  }

  /**
   *
   * @param {string} type
   * @param {GameObject/Components} c
   */
  setComponent(type, c) {
    this.components[type] = c;
  }

  /**
   *
   * @returns {string}
   */
  getUUID() {
    return this.uuid;
  }

  /**
   *
   * @returns {THREE.Vector3}
   */
  getRotation() {
    return this.object3D.rotation;
  }

  /**
   * Set rotation and clamp it
   *
   * @param {THREE.Vector3} vector
   */
  setRotation(vector) {
    if (this.freeze) return;

    this.object3D.rotation.set(vector.x, vector.y, vector.z);
    this.clampRotation();
  }

  /**
   *
   * @param {THREE.Vector3} vector
   */
  setPosition(vector) {
    if (this.freeze) return;

    this.object3D.position.set(vector.x, vector.y, vector.z);
  }

  /**
   *
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.object3D.position;
  }

  /**
   *
   * @param {THREE.Vector3} vector
   */
  setScale(vector) {
    if (this.freeze) return;

    this.object3D.scale.set(vector.x, vector.y, vector.z);
  }

  /**
   *
   * @returns {THREE.Vector3}
   */
  getScale() {
    return this.object3D.scale;
  }

  /**
   * If freeze components and transform are not updated
   *
   * @param {boolean} value
   */
  setFreeze(value) {
    this.freeze = value;
  }

  /**
   *
   * @returns {boolean}
   */
  getFreeze() {
    return this.freeze;
  }

  /**
   *
   * @returns {string}
   */
  getName() {
    return this.name;
  }

  /**
   *
   * @param {string} name the new name of the gameobject
   */
  setName(name) {
    this.name = name;
  }

  /**
   *
   * @returns {boolean}
   */
  hasNoLocalUpdate() {
    return this.noLocalUpdate;
  }

  /**
   * Compute this to JSON with or without its server side components
   *
   * @param {boolean} withServerComponent
   * @returns {JSON} the json of this
   */
  toJSON(withServerComponent = false) {
    const children = [];
    this.children.forEach((child) => {
      children.push(child.toJSON(withServerComponent));
    });

    const componentModels = {};
    for (const type in this.components) {
      const c = this.components[type];
      if (!c.getModel().isServerSide() || withServerComponent) {
        componentModels[type] = c.getModel().toJSON();
      }
    }

    // Add forced serialize component model
    for (
      let index = 0;
      index < this.forceSerializeComponentModels.length;
      index++
    ) {
      const type = this.forceSerializeComponentModels[index];
      const c = this.components[type];
      componentModels[type] = c.getModel().toJSON();
    }

    return {
      name: this.name,
      type: GameObjectModule.TYPE,
      static: this.static,
      outdated: this.outdated,
      uuid: this.uuid,
      parentUUID: this.parentUUID,
      forceSerializeComponentModels: this.forceSerializeComponentModels,
      componentModels: componentModels,
      children: children,
      transform: {
        position: this.object3D.position.toArray(),
        rotation: this.object3D.rotation.toArray(),
        scale: this.object3D.scale.toArray(),
      },
      noLocalUpdate: this.noLocalUpdate,
      freeze: this.freeze,
    };
  }
};

GameObjectModule.TYPE = 'GameObject';

/**
 * Lerp transform of g1 to g2 with a given ratio
 *
 * @param {GameObject} g1 first gameobject
 * @param {GameObject} g2 sencond
 * @param {number} ratio a number between 0 => 1
 * @returns {GameObject} g1 interpolated
 */
GameObjectModule.interpolateInPlace = function (g1, g2, ratio) {
  g1.object3D.position.lerp(g2.object3D.position, ratio);
  g1.object3D.scale.lerp(g2.object3D.scale, ratio);
  g1.object3D.quaternion.slerp(g2.object3D.quaternion, ratio);
  return g1;
};

/**
 * Return a deep copy (new uuid are generated) of a gameObject
 *
 * @param {GameObject} gameObject
 * @returns {GameObject} a new gameobject with new uuid base on gameObject
 */
GameObjectModule.deepCopy = function (gameObject) {
  const cloneJSON = gameObject.toJSON(true);
  // Rename uuid
  JSONUtils.parse(cloneJSON, function (json, key) {
    const keyLowerCase = key.toLowerCase();
    if (keyLowerCase === 'uuid') json[key] = THREE.MathUtils.generateUUID();

    if (keyLowerCase === 'name') {
      json[key] = json[key] + ' (clone)';
    }
  });
  return new GameObjectModule(cloneJSON);
};

/**
 * Search in the object3D the object3D sign with uuid
 *
 * @param {string} uuid the uuid of the gameobject
 * @param {THREE.Object3D} obj the 3Dobject where to search
 * @param {boolean} upSearch true up search false bottom search
 * @returns {THREE.Object3D} the object3D sign with the uuid of the gameobject
 */
GameObjectModule.findObject3D = function (uuid, obj, upSearch = true) {
  let result;
  if (upSearch) {
    let current = obj;
    while (current) {
      if (current.userData.gameObjectUUID == uuid) {
        result = current;
        break;
      }

      current = current.parent;
    }
  } else {
    obj.traverse(function (child) {
      if (child.userData.gameObjectUUID == uuid) {
        result = child;
      }
    });
  }

  return result;
};

class GameObjectComponent {
  constructor(model) {
    this.model = model;
    this.controller = null; // will be initialize by assetsManager
  }

  getModel() {
    return this.model;
  }

  getController() {
    return this.controller;
  }

  setController(controller) {
    this.controller = controller;
  }
}

module.exports = GameObjectModule;

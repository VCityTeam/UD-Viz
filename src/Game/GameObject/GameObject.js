/**
 * Object to render and simulate world
 *
 * @format
 */

const THREE = require('three');
const JSONUtils = require('../Components/JSONUtils');

//GameObject Components
const RenderComponent = require('./Components/Render');
const ColliderComponent = require('./Components/Collider');
const WorldScriptComponent = require('./Components/WorldScript');
const AudioComponent = require('./Components/Audio');
const LocalScriptModule = require('./Components/LocalScript');
const THREEUtils = require('../Components/THREEUtils');

/**
 * Objects to compose a Game
 * Work with a graph hierarchy
 * GameObject have component to handle different behaviour
 */
const GameObjectModule = class GameObject {
  /**
   * Create a new GameObject
   * @param {JSON} json data to init this
   * @param {GameObject} parent the parent of this (optional)
   */
  constructor(json, parent) {
    if (!json) throw new Error('no json');

    //id
    this.uuid = json.uuid || THREE.Math.generateUUID();

    //components
    this.components = {};
    this.setComponentsFromJSON(json);

    //name
    this.name = json.name || 'none';

    //default object3d where transform is stored
    this.object3D = new THREE.Object3D();
    this.object3D.name = this.name + '_object3D';
    this.object3D.rotation.reorder('ZXY');
    //stock data in userData
    this.object3D.userData = {
      gameObjectUUID: this.getUUID(),
    };
    this.setFromTransformJSON(json.transform);

    /**
     * true mean the object is not supposed to move during the game
     * for simulation/network opti
     * @type {Boolean}
     */
    this.static = json.static || false;

    //outdated flag for network opti
    this.outdated = json.outdated || false;

    //graph hierarchy
    const children = [];
    if (json.children && json.children.length > 0) {
      json.children.forEach((child) => {
        children.push(new GameObject(child, this));
      });
    }
    this.children = children;

    //uuid of parent if one
    this.parentUUID = null;
    this.setParent(parent);

    //assets has been initialized
    this.initialized = false;

    //update the object state in updateFromGO (or not)
    this.noLocalUpdate = json.noLocalUpdate || false;

    //freeze components and transform
    this.freeze = json.freeze || false;
  }

  /**
   * Client side function since a localContext is needed
   * Update client side component and the Transform of this based on go
   * @param {GameObject} go the gameobject to upadate to
   * @param {LocalContext} localContext this localcontext
   */
  updateFromGO(go, bufferedGO, localContext) {
    if (this.noLocalUpdate || this.freeze) return;

    if (!go.isStatic()) {
      //update transform
      this.setTransformFromGO(go);
    }

    //launch update event for bufferedGO
    for (let key in this.components) {
      const component = this.components[key];
      for (let index = 0; index < bufferedGO.length; index++) {
        const element = bufferedGO[index];

        component.updateFromComponent(
          element.isOutdated(),
          element.getComponent(key),
          localContext
        );
      }
    }
  }

  /**
   * Bind transform of go into this
   * @param {GameObject} go
   */
  setTransformFromGO(go) {
    if (this.freeze) return;
    this.object3D.position.copy(go.object3D.position);
    this.object3D.scale.copy(go.object3D.scale);
    this.object3D.rotation.copy(go.object3D.rotation);
    this.setOutdated(true);
  }

  /**
   * Set transform of object3D from json
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
    this.setOutdated(true);
  }

  /**
   * Replace data of this with a json object
   * @param {JSON} json
   */
  setFromJSON(json) {
    this.components = {}; //clear
    this.setComponentsFromJSON(json);
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
        //c no longer in scene
        return;
      }

      c.setFromJSON(jsonChild);
    });
  }

  /**
   * Initialize components of this
   * @param {AssetsManager} manager must implement an assetsmanager interface can be local or server
   * @param {Library} bundles set of bundle library used by script
   * @param {Boolean} isServerSide the code is running on a server or in a browser
   */
  initAssetsComponents(manager, bundles = {}, isServerSide = false) {
    if (!this.initialized) {
      this.initialized = true;
      for (let type in this.components) {
        const c = this.components[type];
        if (isServerSide && !c.isServerSide()) continue;
        c.initAssets(manager, bundles);
      }
    }
    this.children.forEach(function (child) {
      child.initAssetsComponents(manager, bundles, isServerSide);
    });
  }

  /**
   * Return the world transform of this
   * @returns {Transform}
   */
  computeWorldTransform() {
    const result = new THREEUtils.Transform();

    let current = this;
    do {
      result.getPosition().add(current.getPosition());
      result.getRotation().add(current.getRotation());
      result.getScale().multiply(current.getScale());

      current = current.parent;
    } while (current);

    return result;
  }

  /**
   * Add vector to position of this
   * @param {THREE.Vector3} vector
   */
  move(vector) {
    if (this.freeze) return;

    this.object3D.position.add(vector);
    this.setOutdated(true);
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
   * @param {THREE.Vector3} vector
   */
  rotate(vector) {
    if (this.freeze) return;

    this.object3D.rotateZ(vector.z);
    this.object3D.rotateX(vector.x);
    this.object3D.rotateY(vector.y);

    this.clampRotation();
    this.setOutdated(true);
  }

  /**
   * Return worldScripts of this
   * @returns {Object}
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
   * @returns {THREE.Vector3}
   */
  getDefaultForward() {
    return new THREE.Vector3(0, 1, 0);
  }

  /**
   * Return the root gameobject of the graph hierarchy
   * @returns {GameObject}
   */
  computeRoot() {
    if (!this.parent) return this;
    return this.parent.computeRoot();
  }

  /**
   * Compute the forward vector of this
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
   * @returns {Boolean}
   */
  isStatic() {
    return this.static;
  }

  /**
   *
   * @returns {Boolean}
   */
  isOutdated() {
    return this.outdated;
  }

  /**
   *
   * @param {Boolean} value
   */
  setOutdated(value) {
    this.outdated = value;
  }

  /**
   * Execute worldscript for a given event
   * @param {WorldScript.EVENT} event
   * @param {Array} params array of arguments for scripts
   * @returns {Array} scripts result
   */
  executeWorldScripts(event, params) {
    const script = this.getComponent(WorldScriptComponent.TYPE);
    if (!script) return null;
    return script.execute(event, params);
  }

  /**
   * Set Components with a json object
   * @param {JSON} json
   */
  setComponentsFromJSON(json) {
    const jsonMap = json.components;
    const _this = this;

    if (!jsonMap) return;

    for (let type in jsonMap) {
      const componentJSON = jsonMap[type];

      switch (type) {
        case RenderComponent.TYPE:
          if (_this.components[RenderComponent.TYPE])
            console.warn('multiple component');

          _this.components[RenderComponent.TYPE] = new RenderComponent(
            _this,
            componentJSON
          );

          break;
        case AudioComponent.TYPE:
          if (_this.components[AudioComponent.TYPE])
            console.warn('multiple component');

          _this.components[AudioComponent.TYPE] = new AudioComponent(
            _this,
            componentJSON
          );

          break;
        case WorldScriptComponent.TYPE:
          if (_this.components[WorldScriptComponent.TYPE])
            console.warn('multiple component');

          _this.components[WorldScriptComponent.TYPE] =
            new WorldScriptComponent(_this, componentJSON);

          break;
        case LocalScriptModule.TYPE:
          if (_this.components[LocalScriptModule.TYPE])
            console.warn('multiple component');

          _this.components[LocalScriptModule.TYPE] = new LocalScriptModule(
            _this,
            componentJSON
          );

          break;
        case ColliderComponent.TYPE:
          if (_this.components[ColliderComponent.TYPE])
            console.warn('multiple component');

          _this.components[ColliderComponent.TYPE] = new ColliderComponent(
            _this,
            componentJSON
          );

          break;
        default:
          console.warn('wrong type component', type, componentJSON);
      }
    }
  }

  /**
   * Compute the object3D
   * @param {Boolean} recursive if true recursive call on children
   * @returns {THREE.Object3D} the object3D of this
   */
  computeObject3D(recursive = true) {
    const obj = this.object3D;

    //clear children object
    obj.children.length = 0;

    const r = this.getComponent(RenderComponent.TYPE);
    if (r) {
      const rObj = r.getObject3D();
      if (!rObj) throw new Error('no render object3D');
      obj.add(rObj);
    }

    //add children if recursive
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
   * @param {String} uuid the uuid of the component
   * @returns {GameObject.Component} the gameobject component
   */
  getComponentByUUID(uuid) {
    for (let key in this.components) {
      const c = this.components[key];
      if (c.getUUID() == uuid) return c;
    }

    return null;
  }

  /**
   * Return a clone of this
   * @returns {GameObject}
   */
  clone() {
    return new GameObject(this.toJSON(true));
  }

  /**
   * Apply a callback to all gameobject of the hierarchy
   * Dont apply it to gameobject parent of this
   * @param {Function} cb the callback to apply take a gameobject as first argument
   * @returns {Boolean} true stop the propagation (opti) false otherwise
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
   * @param {String} uuid the uuid searched
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
   * @param {String} name
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
   * @returns {String}
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

  /**
   *
   * @param {String} type
   * @returns {GameObject/Components}
   */
  getComponent(type) {
    return this.components[type];
  }

  /**
   *
   * @param {String} type
   * @param {GameObject/Components} c
   */
  setComponent(type, c) {
    this.components[type] = c;
  }

  addComponent(jsonComponent, manager, bundles, isServerSide) {
    let c = null;

    switch (jsonComponent.type) {
      case RenderComponent.TYPE:
        c = new RenderComponent(this, jsonComponent);
        break;

      case AudioComponent.TYPE:
        c = new AudioComponent(this, jsonComponent);
        break;

      case WorldScriptComponent.TYPE:
        c = new WorldScriptComponent(this, jsonComponent);
        break;

      case LocalScriptModule.TYPE:
        c = new LocalScriptModule(this, jsonComponent);
        break;

      case ColliderComponent.TYPE:
        c = new ColliderComponent(this, jsonComponent);
        break;

      default:
        console.warn(
          'wrong jsonComponent.type component',
          jsonComponent.type,
          jsonComponent
        );
        return;
    }

    if (isServerSide && !c.isServerSide()) return;
    c.initAssets(manager, bundles);

    this.setComponent(jsonComponent.type, c);

    return c;
  }

  /**
   *
   * @returns {String}
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
   * @param {THREE.Vector3} vector
   */
  setRotation(vector) {
    if (this.freeze) return;

    this.object3D.rotation.set(vector.x, vector.y, vector.z);
    this.clampRotation();
    this.setOutdated(true);
  }

  /**
   *
   * @param {THREE.Vector3} vector
   */
  setPosition(vector) {
    if (this.freeze) return;

    this.object3D.position.set(vector.x, vector.y, vector.z);
    this.setOutdated(true);
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
    this.setOutdated(true);
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
   * @param {Boolean} value
   */
  setFreeze(value) {
    this.freeze = value;
  }

  /**
   *
   * @returns {Boolean}
   */
  getFreeze() {
    return this.freeze;
  }

  /**
   *
   * @returns {String}
   */
  getName() {
    return this.name;
  }

  /**
   *
   * @param {String} name the new name of the gameobject
   */
  setName(name) {
    this.name = name;
  }

  /**
   * Compute this to JSON with or without its server side components
   * @param {Boolean} withServerComponent
   * @returns {JSON} the json of this
   */
  toJSON(withServerComponent = false) {
    const children = [];
    this.children.forEach((child) => {
      children.push(child.toJSON(withServerComponent));
    });

    const components = {};
    for (let type in this.components) {
      const c = this.components[type];
      if (!c.isServerSide() || withServerComponent) {
        components[type] = c.toJSON();
      }
    }

    return {
      name: this.name,
      type: GameObjectModule.TYPE,
      static: this.static,
      outdated: this.outdated,
      uuid: this.uuid,
      parentUUID: this.parentUUID,
      components: components,
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
 * @param {GameObject} g1 first gameobject
 * @param {GameObject} g2 sencond
 * @param {Number} ratio a number between 0 => 1
 * @returns {GameObject} g1 interpolated
 */
GameObjectModule.interpolateInPlace = function (g1, g2, ratio) {
  g1.object3D.position.lerp(g2.object3D.position, ratio);
  g1.object3D.scale.lerp(g2.object3D.scale, ratio);
  g1.object3D.quaternion.slerp(g2.object3D.quaternion, ratio);
  return g1;
};

/**
 * return a deep copy (new uuid are generated) of a gameObject
 * @param {GameObject} gameObject
 * @returns {GameObject} a new gameobject with new uuid base on gameObject
 */
GameObjectModule.deepCopy = function (gameObject) {
  const cloneJSON = gameObject.toJSON(true);
  //rename uuid
  JSONUtils.parse(cloneJSON, function (json, key) {
    let keyLowerCase = key.toLowerCase();
    if (keyLowerCase === 'uuid') json[key] = THREE.MathUtils.generateUUID();

    if (keyLowerCase === 'name') {
      json[key] = json[key] + ' (clone)';
    }
  });
  return new GameObjectModule(cloneJSON);
};

/**
 * Search in the object3D the object3D sign with uuid
 * @param {String} uuid the uuid of the gameobject
 * @param {THREE.Object3D} obj the 3Dobject where to search
 * @param {Boolean} upSearch true up search false bottom search
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

module.exports = GameObjectModule;

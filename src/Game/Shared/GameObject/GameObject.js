/**
 * Object to render and simulate world
 *
 * @format
 */

const THREE = require('three');

//GameObject Components
const RenderComponent = require('./Components/Render');
const ColliderComponent = require('./Components/Collider');
const WorldScriptComponent = require('./Components/WorldScript');
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

    //transform
    this.transform = new THREEUtils.Transform();
    this.transform.setFromJSON(json.transform);

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

    //default object3d
    this.object3D = new THREE.Object3D();
    this.object3D.name = this.name + '_object3D';

    //euler buffer
    //to avoid new THREE.Euler on computeObject3D and keep Transform.rotation as a THREE.Vector3
    this.eulerBuffer = new THREE.Euler(0, 0, 0, 'ZXY');
  }

  /**
   * Client side function since a localContext is needed
   * Update client side component and the Transform of this based on go
   * @param {GameObject} go the gameobject to upadate to
   * @param {LocalContext} localContext this localcontext
   */
  updateNoStaticFromGO(go, localContext) {
    //update transform
    this.setTransform(go.getTransform());

    //update render
    const r = this.getComponent(RenderComponent.TYPE);
    if (r) {
      r.updateFromComponent(
        go.getComponent(RenderComponent.TYPE),
        localContext
      );
    }

    //update local scripts
    const ls = this.getComponent(LocalScriptModule.TYPE);
    if (ls) {
      ls.updateFromComponent(
        go.getComponent(LocalScriptModule.TYPE),
        localContext
      );
    }
  }

  /**
   * Replace data of this with a json object
   * @param {JSON} json
   */
  setFromJSON(json) {
    this.components = {}; //clear
    this.setComponentsFromJSON(json);
    this.transform.setFromJSON(json.transform);
    this.name = json.name;
    this.static = json.static;

    //TODO recursive call for children
    if (this.children.length) console.warn('children not set from ', json);
  }

  /**
   * Initialize components of this
   * @param {AssetsManager} manager must implement an assetsmanager interface can be local or server
   * @param {Shared} udvShared ud-viz/Game/Shared module
   * @param {Boolean} isServerSide the code is running on a server or in a browser
   */
  initAssetsComponents(manager, udvShared, isServerSide = false) {
    if (!this.initialized) {
      this.initialized = true;
      for (let type in this.components) {
        const c = this.components[type];
        if (isServerSide && !c.isServerSide()) continue;
        c.initAssets(manager, udvShared);
      }
    }
    this.children.forEach(function (child) {
      child.initAssetsComponents(manager, udvShared, isServerSide);
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
    this.transform.getPosition().add(vector);
    this.outdated = true;
  }

  /**
   * Clamp rotation between 0 => 2*PI
   */
  clampRotation() {
    const r = this.transform.getRotation();
    r.x = (Math.PI * 4 + r.x) % (Math.PI * 2);
    r.y = (Math.PI * 4 + r.y) % (Math.PI * 2);
    r.z = (Math.PI * 4 + r.z) % (Math.PI * 2);
  }

  /**
   * Add vector to rotation of this
   * @param {THREE.Vector3} vector
   */
  rotate(vector) {
    this.transform.getRotation().add(vector);
    this.clampRotation();
    this.outdated = true;
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
    const r = this.transform.getRotation();
    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(r.x, r.y, r.z)
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

      //remove object3D
      if (this.object3D && this.object3D.parent) {
        this.object3D.parent.remove(this.object3D);
      }
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
   * Compute the object3D of this and bind the transform into it
   * @param {Boolean} recursive if true recursive call on children
   * @returns {THREE.Object3D} the object3D of this
   */
  computeObject3D(recursive = true) {
    const r = this.getComponent(RenderComponent.TYPE);
    const obj = this.object3D;
    if (r) {
      this.object3D.add(r.getObject3D());
    }

    //position
    obj.position.copy(this.getPosition());
    //rot
    const rot = this.getRotation();
    this.eulerBuffer.x = rot.x;
    this.eulerBuffer.y = rot.y;
    this.eulerBuffer.z = rot.z;
    obj.rotation.copy(this.eulerBuffer);
    //scale
    obj.scale.copy(this.getScale());

    //add children if recursive
    if (recursive) {
      this.children.forEach(function (child) {
        const childObj = child.computeObject3D();
        if (childObj) obj.add(childObj);
      });
    }

    return obj;
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
    return this.transform.getRotation();
  }

  /**
   * Set rotation and clamp it
   * @param {THREE.Vector3} vector
   */
  setRotation(vector) {
    this.transform.getRotation().set(vector.x, vector.y, vector.z);
    this.clampRotation();
    this.outdated = true;
  }

  /**
   *
   * @param {THREE.Vector3} vector
   */
  setPosition(vector) {
    this.transform.getPosition().set(vector.x, vector.y, vector.z);
    this.outdated = true;
  }

  /**
   *
   * @returns {THREE.Vector3}
   */
  getPosition() {
    return this.transform.getPosition();
  }

  /**
   *
   * @param {THREE.Vector3} vector
   */
  setScale(vector) {
    this.transform.getScale().set(vector.x, vector.y, vector.z);
    this.outdated = true;
  }

  /**
   *
   * @returns {THREE.Vector3}
   */
  getScale() {
    return this.transform.getScale();
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
   * @returns {Transform}
   */
  getTransform() {
    return this.transform;
  }

  /**
   *
   * @param {Transform} transform
   */
  setTransform(transform) {
    this.transform = transform;
    this.outdated = true;
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
      transform: this.transform.toJSON(),
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
  //modify g1 transform
  g1.getTransform().lerp(g2.getTransform(), ratio);
  return g1;
};

module.exports = GameObjectModule;

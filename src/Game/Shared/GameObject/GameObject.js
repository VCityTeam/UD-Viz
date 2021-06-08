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

const GameObjectModule = class GameObject {
  constructor(json, parent) {
    if (!json) throw new Error('no json');
    /******************DATA***************************/
    this.json = json;

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

    //static
    this.static = json.static || false;

    //outdated flag for network opti
    this.outdated = json.outdated || false;

    //nodale structure
    const children = [];
    if (json.children && json.children.length > 0) {
      json.children.forEach((child) => {
        children.push(new GameObject(child, this));
      });
    }
    this.children = children;

    //uuid of parent if one
    this.parentUUID = null;

    /******************INTERNAL***************************/
    this.setParent(parent);

    //assets has been initialized
    this.initialized = false;
    //default object3d
    this.object3D = new THREE.Object3D();
    this.object3D.name = this.name + '_object3D';

    //buffer
    this.eulerBuffer = new THREE.Euler(0, 0, 0, 'ZXY'); //to avoid new THREE.Euler on fetchObject3D
  }

  updateNoStaticFromGO(go, assetsManager) {
    //update transform
    this.setTransform(go.getTransform());
    //update render
    const r = this.getComponent(RenderComponent.TYPE);
    if (r) {
      r.updateFromComponent(
        go.getComponent(RenderComponent.TYPE),
        assetsManager
      );
    }
  }

  setFromJSON(json) {
    this.components = {}; //clear
    this.setComponentsFromJSON(json);
    this.transform.setFromJSON(json.transform);
    this.name = json.name;
    this.static = json.static;

    //TODO recursive call for children
    if (this.children.length) console.warn('children not set from ', json);
  }

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

  move(vector) {
    this.transform.getPosition().add(vector);
    this.outdated = true;
  }

  clampRotation() {
    const r = this.transform.getRotation();
    r.x = (Math.PI * 2 + r.x) % (Math.PI * 2);
    r.y = (Math.PI * 2 + r.y) % (Math.PI * 2);
    r.z = (Math.PI * 2 + r.z) % (Math.PI * 2);
  }

  rotate(vector) {
    this.transform.getRotation().add(vector);
    this.clampRotation();
    this.outdated = true;
  }

  getWorldScripts() {
    const c = this.getComponent(WorldScriptComponent.TYPE);
    if (!c) return null;
    return c.getScripts();
  }

  getDefaultForward() {
    return new THREE.Vector3(0, 1, 0);
  }

  computeRoot() {
    if (!this.parent) return this;
    return this.parent.computeRoot();
  }

  computeForwardVector() {
    const r = this.transform.getRotation();
    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(r.x, r.y, r.z)
    );
    const result = this.getDefaultForward().applyQuaternion(quaternion);
    return result;
  }

  computeBackwardVector() {
    const quaternion = new THREE.Quaternion().setFromAxisAngle(
      new THREE.Vector3(0, 0, 1),
      Math.PI
    );
    return this.computeForwardVector().applyQuaternion(quaternion);
  }

  removeFromParent() {
    if (this.parent) {
      const _this = this;
      this.parent.children = this.parent.children.filter(function (ele) {
        return ele.getUUID() != _this.getUUID();
      });

      //remove object3D
      let obj3D = this.fetchObject3D();
      if (obj3D && obj3D.parent) {
        obj3D.parent.remove(obj3D);
      }
    } else {
      console.warn('no deleted because no parent ', this.toJSON());
    }
  }

  isStatic() {
    return this.static;
  }

  isOutdated() {
    return this.outdated;
  }

  setOutdated(value) {
    this.outdated = value;
  }

  executeScripts(event, params) {
    const script = this.getComponent(WorldScriptComponent.TYPE);
    if (!script) return null;
    return script.execute(event, params);
  }

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

  fetchObject3D(recursive = true) {
    const r = this.getComponent(RenderComponent.TYPE);
    let obj;
    if (!r) {
      obj = this.object3D;
    } else {
      obj = r.getObject3D();
      if (!obj) obj = this.object3D;
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
        const childObj = child.fetchObject3D();
        if (childObj) obj.add(childObj);
      });
    }

    return obj;
  }

  clone() {
    return new GameObject(this.toJSON(true));
  }

  traverse(cb) {
    if (cb(this)) return true;

    for (let index = 0; index < this.children.length; index++) {
      const element = this.children[index];
      if (element.traverse(cb)) return true;
    }

    return false;
  }

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

  setParent(parent) {
    this.parent = parent;

    if (parent) {
      this.parentUUID = parent.getUUID();
    }
  }

  getParentUUID() {
    return this.parentUUID;
  }

  getChildren() {
    return this.children;
  }

  getComponent(type) {
    return this.components[type];
  }

  setComponent(type, c) {
    this.components[type] = c;
  }

  getUUID() {
    return this.uuid;
  }

  getRotation() {
    return this.transform.getRotation();
  }

  setRotation(vector) {
    this.transform.getRotation().set(vector.x, vector.y, vector.z);
    this.clampRotation();
    this.outdated = true;
  }

  setPosition(vector) {
    this.transform.getPosition().set(vector.x, vector.y, vector.z);
    this.outdated = true;
  }

  getPosition() {
    return this.transform.getPosition();
  }

  setScale(vector) {
    this.transform.getScale().set(vector.x, vector.y, vector.z);
    this.outdated = true;
  }

  getScale() {
    return this.transform.getScale();
  }

  getName() {
    return this.name;
  }

  getTransform() {
    return this.transform;
  }

  setTransform(transform) {
    this.transform = transform;
    this.outdated = true;
  }

  //serialize
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

GameObjectModule.interpolateInPlace = function (g1, g2, ratio) {
  //modify g1 transform
  g1.getTransform().lerp(g2.getTransform(), ratio);
  return g1;
};

module.exports = GameObjectModule;

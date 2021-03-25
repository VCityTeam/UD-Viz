/**
 * Object to render and simulate world
 *
 * @format
 */

const THREE = require('three');

//GameObject Components
const RenderComponent = require('./Components/RenderComponent');
const BodyComponent = require('./Components/BodyComponent');
const ScriptComponent = require('./Components/ScriptComponent');

const GameObjectModule = class GameObject {
  constructor(json, parent) {
    if (!json) throw new Error('no json');
    /******************DATA***************************/

    //id
    this.uuid = json.uuid || THREE.Math.generateUUID();

    //components
    this.components = {};
    this.setComponentsFromJSON(json);

    //name
    this.name = json.name || 'none';

    //transform
    this.setTransformFromJSON(json);

    //static
    this.static = json.static || false;

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

    //outdated flag for network opti
    this.outdated = true;
  }

  initAssets(assetsManager, udvShared) {
    if (!this.initialized) {
      this.initialized = true;
      console.log('initAssets ', this);
      for (let type in this.components) {
        const c = this.components[type];
        c.initAssets(assetsManager, udvShared);
      }
    }
    this.children.forEach(function (child) {
      child.initAssets(assetsManager, udvShared);
    });
  }

  computeWorldTransform() {
    const result = {
      position: new THREE.Vector3(),
      rotation: new THREE.Vector3(),
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

  move(vector) {
    this.transform.position.add(vector);
    this.outdated = true;
  }

  rotate(vector) {
    this.transform.rotation.add(vector);
    this.transform.rotation.x =
      (Math.PI * 2 + this.transform.rotation.x) % (Math.PI * 2);
    this.transform.rotation.y =
      (Math.PI * 2 + this.transform.rotation.y) % (Math.PI * 2);
    this.transform.rotation.z =
      (Math.PI * 2 + this.transform.rotation.z) % (Math.PI * 2);

    this.outdated = true;
  }

  getScripts() {
    const c = this.getComponent(ScriptComponent.TYPE);
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
    const quaternion = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        this.transform.rotation.x,
        this.transform.rotation.y,
        this.transform.rotation.z
      )
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
      let obj3D = this.getObject3D();
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

  executeScripts(event, params) {
    const script = this.getComponent(ScriptComponent.TYPE);
    if (!script) return null;
    return script.execute(event, params);
  }

  setComponentsFromJSON(json) {
    const arrayJSON = json.components;
    const _this = this;

    if (!arrayJSON) return;

    arrayJSON.forEach(function (componentJSON) {
      switch (componentJSON.type) {
        case RenderComponent.TYPE:
          if (_this.components[RenderComponent.TYPE])
            console.warn('multiple component');

          _this.components[RenderComponent.TYPE] = new RenderComponent(
            _this,
            componentJSON
          );

          break;
        case ScriptComponent.TYPE:
          if (_this.components[ScriptComponent.TYPE])
            console.warn('multiple component');

          _this.components[ScriptComponent.TYPE] = new ScriptComponent(
            _this,
            componentJSON
          );

          break;
        case BodyComponent.TYPE:
          if (_this.components[BodyComponent.TYPE])
            console.warn('multiple component');

          _this.components[BodyComponent.TYPE] = new BodyComponent(
            _this,
            componentJSON
          );

          break;
        default:
          throw new Error('wrong type component');
      }
    });
  }

  getObject3D() {
    const r = this.getComponent(RenderComponent.TYPE);
    if (!r) return null;
    const obj = r.getObject3D();
    if (!obj) return null;

    //transform
    obj.position.copy(this.getPosition());
    //TODO rotation n'est plus un THREE VEctor3 mais un euler
    obj.rotation.copy(
      new THREE.Euler(
        this.transform.rotation.x,
        this.transform.rotation.y,
        this.transform.rotation.z,
        'ZXY'
      )
    );
    obj.scale.copy(this.getScale());

    //reset
    this.children.forEach(function (child) {
      const childObj = child.getObject3D();
      if (childObj) obj.add(childObj);
    });

    return obj;
  }

  setTransformFromJSON(json) {
    if (json.transform) {
      const l = json.transform.position;
      const r = json.transform.rotation;
      const s = json.transform.scale;
      this.transform = {
        position: new THREE.Vector3(l.x, l.y, l.z),
        rotation: new THREE.Vector3(r.x, r.y, r.z),
        scale: new THREE.Vector3(s.x, s.y, s.z),
      };
    } else {
      this.transform = {
        position: new THREE.Vector3(),
        rotation: new THREE.Vector3(),
        scale: new THREE.Vector3(1, 1, 1),
      };
    }
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
    return this.transform.rotation;
  }

  setRotation(vector) {
    this.transform.rotation.set(vector.x, vector.y, vector.z);
  }

  setPosition(vector) {
    this.transform.position.set(vector.x, vector.y, vector.z);
  }

  getPosition() {
    return this.transform.position;
  }

  setScale(vector) {
    this.transform.scale.set(vector.x, vector.y, vector.z);
  }

  getScale() {
    return this.transform.scale;
  }

  getName() {
    return this.name;
  }

  getTransform() {
    return this.transform;
  }

  setTransform(transform) {
    this.transform = transform;
  }

  //serialize
  toJSON(withServerComponent = false) {
    const children = [];
    this.children.forEach((child) => {
      children.push(child.toJSON(withServerComponent));
    });

    const position = this.transform.position;
    const rot = this.transform.rotation;
    const scale = this.transform.scale;

    //TODO ranger les components dans GameObject comme dans le json
    const components = [];
    for (var type in this.components) {
      const c = this.components[type];
      if (!c.isServerSide() || withServerComponent) components.push(c.toJSON());
    }

    //TODO not declare here or use THREE.Vector3.toJSON
    const V2JSON = function (vector) {
      return { x: vector.x, y: vector.y, z: vector.z };
    };

    return {
      name: this.name,
      type: GameObjectModule.TYPE,
      static: this.static,
      uuid: this.uuid,
      parentUUID: this.parentUUID,
      components: components,
      children: children,
      transform: {
        position: V2JSON(position),
        rotation: V2JSON(rot),
        scale: V2JSON(scale),
      },
    };
  }
};

GameObjectModule.TYPE = 'GameObject';

GameObjectModule.interpolateInPlace = function (g1, g2, ratio) {
  //modify g1 transform
  g1.transform.position.lerp(g2.transform.position, ratio);
  g1.transform.rotation.lerp(g2.transform.rotation, ratio);
  g1.transform.scale.lerp(g2.transform.scale, ratio);

  return g1;
};

module.exports = GameObjectModule;

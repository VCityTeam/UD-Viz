const packageJSON = require('@ud-viz/core/package.json');
const THREE = require('three');
const { Base } = require('./Component/Component');
const ExternalScript = require('./Component/ExternalScript');
const GameScript = require('./Component/GameScript');
const Collider = require('./Component/Collider');
const Audio = require('./Component/Audio');
const Render = require('./Component/Render');

/**
 * Return a deep copy (new uuid are generated) of a gameObject
 *
 * @param {GameObject} gameObject
 * @returns {GameObject} a new gameobject with new uuid base on gameObject
 */
// GameObject.deepCopy = function (gameObject) {
//   const cloneJSON = gameObject.toJSON(true);
//   // Rename uuid
//   JSONUtil.parse(cloneJSON, function (json, key) {
//     const keyLowerCase = key.toLowerCase();
//     if (keyLowerCase === 'uuid') json[key] = THREE.MathUtils.generateUUID();

//     if (keyLowerCase === 'name') {
//       json[key] = json[key] + ' (clone)';
//     }
//   });
//   return new GameObject(cloneJSON);
// };

// /**
//  * Search in the object3D the object3D sign with uuid
//  *
//  * @param {string} uuid the uuid of the gameobject
//  * @param {THREE.Object3D} obj the 3Dobject where to search
//  * @param {boolean} upSearch true up search false bottom search
//  * @returns {THREE.Object3D} the object3D sign with the uuid of the gameobject
//  */
// GameObject.findObject3D = function (uuid, obj, upSearch = true) {
//   let result;
//   if (upSearch) {
//     let current = obj;
//     while (current) {
//       if (current.userData.gameObjectUUID == uuid) {
//         result = current;
//         break;
//       }

//       current = current.parent;
//     }
//   } else {
//     obj.traverse(function (child) {
//       if (child.userData.gameObjectUUID == uuid) {
//         result = child;
//       }
//     });
//   }

//   return result;
// };

const Object3D = class extends THREE.Object3D {
  constructor(json) {
    super();

    this.isGameObject3D = true; // => tag it to make the difference between this and THREE.Object3D

    json = Object3D.parseJSON(json);

    if (json.uuid != undefined) this.uuid = json.uuid;

    /** the uuid of the parent when this has been toJSON */
    this.parentUUID = json.parentUUID || null;

    this.name = json.name || '';

    this.static = json.static || false;
    // https://threejs.org/docs/#manual/en/introduction/How-to-update-things
    this.matrixAutoUpdate = !this.static;

    // maybe find another name
    this.outdated = json.outdated || false;

    this.gameContextUpdate = true;
    if (json.gameContextUpdate != undefined) {
      this.gameContextUpdate = json.gameContextUpdate;
    }

    // List to force certain component to be serialize
    this.forceToJSONComponent = json.forceToJSONComponent || [];

    /** @type {object} */
    this.components = {};
    this.updateComponentFromJSON(json.components);
    this.updateMatrixFromJSON(json.matrix);

    if (json.children) {
      json.children.forEach((childJSON) => {
        this.add(new Object3D(childJSON));
      });
    }
  }

  hasGameContextUpdate() {
    return this.gameContextUpdate;
  }

  updateMatrixFromJSON(jsonMatrix) {
    if (!jsonMatrix) return;
    this.matrix.fromArray(jsonMatrix);
    this.matrix.decompose(this.position, this.quaternion, this.scale);
  }

  /**
   * when using this function components should not have controllers
   *
   * @param {*} json
   */
  updatefromJSON(json) {
    json = Object3D.parseJSON(json);

    this.uuid = json.uuid;

    this.components = {}; // Clear
    this.updateComponentFromJSON(json.components);
    this.updateMatrixFromJSON(json.matrix);
    this.name = json.name;
    this.static = json.static;
    this.outdated = json.outdated;

    this.children.forEach((child) => {
      let jsonChild;
      for (let i = 0; i < json.children.length; i++) {
        if (json.children[i].uuid == child.uuid) {
          jsonChild = json.children[i];
          break;
        }
      }
      if (!jsonChild) {
        // console.warn(child.name, ' no longer in ', this.name);
        return;
      }

      child.updatefromJSON(jsonChild);
    });
  }

  updateComponentFromJSON(componentsJSON) {
    if (!componentsJSON) {
      return;
    }

    for (const type in componentsJSON) {
      const componentModelJSON = componentsJSON[type];

      switch (type) {
        case Render.Component.TYPE:
          if (this.components[Render.Component.TYPE])
            console.warn('multiple component');

          this.components[Render.Component.TYPE] = new Render.Component(
            new Render.Model(componentModelJSON)
          );

          break;
        case Audio.Component.TYPE:
          if (this.components[Audio.Component.TYPE])
            console.warn('multiple component');

          this.components[Audio.Component.TYPE] = new Audio.Component(
            new Audio.Model(componentModelJSON)
          );

          break;
        case GameScript.Component.TYPE:
          if (this.components[GameScript.Component.TYPE])
            console.warn('multiple component');

          this.components[GameScript.Component.TYPE] = new GameScript.Component(
            new GameScript.Model(componentModelJSON)
          );

          break;
        case ExternalScript.Component.TYPE:
          if (this.components[ExternalScript.Component.TYPE])
            console.warn('multiple component');

          this.components[ExternalScript.Component.TYPE] =
            new ExternalScript.Component(
              new ExternalScript.Model(componentModelJSON)
            );

          break;
        case Collider.Component.TYPE:
          if (this.components[Collider.Component.TYPE])
            console.warn('multiple component');

          this.components[Collider.Component.TYPE] = new Collider.Component(
            new Collider.Model(componentModelJSON)
          );

          break;
        default:
          throw new Error('wrong type component ' + type);
      }
    }
  }

  setOutdated(value) {
    this.outdated = value;
  }

  isOutdated() {
    return this.outdated;
  }

  isStatic() {
    return this.static;
  }

  getComponents() {
    return this.components;
  }

  /**
   *
   * @param {string} type
   * @returns {Base}
   */
  getComponent(type) {
    return this.components[type];
  }

  clone() {
    return new Object3D(this.toJSON());
  }

  // possibility to stop the propagation +
  // Remove a object3D can't be done while parent is traversing
  traverse(cb) {
    if (cb(this)) return true;

    for (let index = 0; index < this.children.length; index++) {
      const element = this.children[index];
      if (element.traverse(cb)) return true;
    }

    return false;
  }

  /**
   * do not use the THREE.Object3D parent method
   *
   * @param {*} full
   * @param withMetadata
   * @returns
   */
  toJSON(full = true, withMetadata = false) {
    const result = {};

    result.children = [];
    this.children.forEach((child) => {
      if (!child.isGameObject3D) return;
      result.children.push(child.toJSON(full, false));
    });

    // update matrix
    this.updateMatrix();
    result.matrix = this.matrix.toArray();

    // other attributes
    result.uuid = this.uuid;
    result.name = this.name;
    result.static = this.static;
    result.outdated = this.outdated;
    result.gameContextUpdate = this.gameContextUpdate;
    if (this.parent) {
      result.parentUUID = this.parent.uuid;
    }

    // add components
    result.components = {};
    for (const type in this.components) {
      const c = this.components[type];

      if (!full && c.getController()) {
        continue;
      }

      result.components[type] = c.getModel().toJSON();
    }

    // Add to json the forced component
    result.forceToJSONComponent = this.forceToJSONComponent;
    for (let index = 0; index < this.forceToJSONComponent.length; index++) {
      const type = this.forceToJSONComponent[index];
      const c = this.components[type];
      result.components[type] = c.getModel().toJSON();
    }

    if (withMetadata) {
      // metadata to know this is method which compute the JSON
      return {
        metadata: {
          type: Object3D.name,
          method: this.toJSON.name,
          version: packageJSON.version,
          packageName: packageJSON.name,
        },
        object: result,
      };
    }
    return result;
  }
};

Object3D.parseJSON = function (json) {
  if (!json) {
    console.error(json);
    throw new Error('no json');
  }

  // check if object
  if (json.object) {
    // metadata should be in json.metadata
    // do stuff like versioning then return the object
    return json.object;
  }
  return json;
};

// Util

Object3D.DefaultForward = function () {
  return new THREE.Vector3(0, 1, 0);
};

Object3D.computeForward = function (object3D) {
  return this.DefaultForward().applyQuaternion(object3D.quaternion);
};

Object3D.computeBackward = function (object3D) {
  return this.computeForward(object3D).negate();
};

Object3D.moveForward = function (object3D, value) {
  object3D.position.add(Object3D.computeForward(object3D).setLength(value));
};

Object3D.moveBackward = function (object3D, value) {
  object3D.position.add(
    Object3D.computeForward(object3D).negate().setLength(value)
  );
};

Object3D.rotate = function (object3D, euler) {
  // shoudl check euler order
  object3D.rotateZ(euler.z);
  object3D.rotateX(euler.x);
  object3D.rotateY(euler.y);
};

module.exports = Object3D;

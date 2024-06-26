const packageJSON = require('@ud-viz/game_shared/package.json');
const ExternalScript = require('./component/ExternalScript');
const GameScript = require('./component/GameScript');
const Collider = require('./component/Collider');
const Audio = require('./component/Audio');
const Render = require('./component/Render');

const THREE = require('three');
const { objectParse } = require('@ud-viz/utils_shared');

const Object3D = class extends THREE.Object3D {
  /**
   * Base class extended {@link THREE.Object3D} to compose 3D scene of ud-viz game
   *
   * @param {object} json - json to configure the object3D
   * @param {string=} json.uuid - uuid
   * @param {string=} json.parentUUID - uuid of this parent object3D
   * @param {object=} json.userData - userData
   * @param {string} [json.name=""] - name
   * @param {boolean} [json.static=false] - static
   * @param {boolean} [json.outdated=false] - outdated
   * @param {boolean} [json.visble=true] - visible
   * @param {boolean} [json.gameContextUpdate=true] - should be update from the game context
   * @param {Array<string>} [json.forceToJSONComponent=[]] - force certain component to be export in json
   * @param {Object<string,object>} [json.components={}] - components {@link Component}
   * @param {Array} [json.matrix] - matrix
   * @param {object[]} [json.children] - json of children of object3D
   */
  constructor(json) {
    super();

    /**
     * tag to make difference between this and THREE.Object3D
     *
     * @type {boolean}
     */
    this.isGameObject3D = true;

    // default Game.Object3D Euler order
    this.rotation.reorder('ZXY');

    json = Object3D.parseJSON(json);

    if (json.uuid != undefined) {
      /**
       * uuid of object3D
       *
       * @type {string}
       */
      this.uuid = json.uuid;
    }

    /**
     * uuid of the parent object3D
     *
     * @type {string|null}
     */
    this.parentUUID = json.parentUUID || null;

    /**
     *  user data
     *  
     @type {object} */
    this.userData = json.userData || {};

    /**
     * name of object3D
     *  
      @type {string}*/
    this.name = json.name || '';

    /** @type {boolean} */
    this.visible = json.visible != undefined ? json.visible : true;

    /**
     * true if the object3D is not going to move in space
     *
     * @type {boolean}
     */
    this.static = json.static || false;
    /**
     * {@link https://threejs.org/docs/#manual/en/introduction/How-to-update-things}
     *
     * @type {boolean}
     */
    this.matrixAutoUpdate = !this.static;

    /**
     * true if object3D model has changed
     *
     * @type {boolean}
     */
    this.outdated = json.outdated || false;

    /**
     * true if object3D should consider game context update
     *
     * @type {boolean}
     */
    this.gameContextUpdate = true;
    if (json.gameContextUpdate != undefined) {
      this.gameContextUpdate = json.gameContextUpdate;
    }

    /**
     * force certain component to be export in json
     *
     * @type {string[]}
     */
    this.forceToJSONComponent = json.forceToJSONComponent || [];

    /** @type {Object<string,object>} */
    this.components = {};
    this.updateComponentFromJSON(json.components);
    this.updateMatrixFromJSON(json.matrix);

    if (json.children) {
      json.children.forEach((childJSON) => {
        this.add(new Object3D(childJSON));
      });
    }
  }

  /**
   * @callback Object3DCondition
   * @param {Object3D} object - object3d to test
   * @returns {boolean} - true object3d match condition
   */

  /**
   *
   * @param {Object3DCondition} condition - condition to test
   * @returns {Object3D} - return first object3D in hierarchy matching condition
   */
  getFirst(condition) {
    let result = null;
    this.traverse((child) => {
      if (condition(child)) {
        result = child;
        return true;
      }
      return false;
    });
    return result;
  }

  /**
   *
   * @param {Object3DCondition} condition - condition to test
   * @returns {Object3D} - return an array of objects3D in hierarchy matching condition
   */
  filter(condition) {
    const result = [];
    this.traverse((child) => {
      if (condition(child)) {
        result.push(child);
      }
    });
    return result;
  }

  /**
   *
   * @returns {boolean} - true if this has game context update
   */
  hasGameContextUpdate() {
    return this.gameContextUpdate;
  }

  /**
   *
   * @param {Array} jsonMatrix - array of the matrix
   * @returns {void}
   */
  updateMatrixFromJSON(jsonMatrix) {
    if (!jsonMatrix) return;
    this.matrix.fromArray(jsonMatrix);
    this.matrix.decompose(this.position, this.quaternion, this.scale);
  }

  /**
   *
   * @param {object} json - json to update from
   * @param {string} json.uuid - uuid
   * @param {Object<string,object>=} [json.components={}] - components {@link Component}
   * @param {Array=} [json.matrix] - matrix
   * @param {string} json.name - name
   * @param {boolean} json.static - static
   * @param {boolean} json.outdated - outdated
   * @param {object[]} json.children - json of children of object3D
   */
  updatefromJSON(json) {
    json = Object3D.parseJSON(json);

    this.uuid = json.uuid;

    this.components = {}; // Clear
    this.updateComponentFromJSON(json.components);
    this.updateMatrixFromJSON(json.matrix);
    this.name = json.name;
    this.static = json.static;
    this.visible = json.visible;
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

  /**
   *
   * @param {Object<string,object>} componentsJSON - json components to update from
   */
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

  /**
   *
   * @param {boolean} value - true if object3D is outdated (model has changed)
   */
  setOutdated(value) {
    this.outdated = value;
  }

  /**
   *
   * @returns {boolean} - true if object3D is outdated (model has changed)
   */
  isOutdated() {
    return this.outdated;
  }

  /**
   *
   * @returns {boolean} - true if object3D is static
   */
  isStatic() {
    return this.static;
  }

  /**
   *
   * @returns {Object<string,object>} - components of object3D @see Component
   */
  getComponents() {
    return this.components;
  }

  /**
   *
   * @param {string} type - type of the component
   * @returns {object} - component of type
   */
  getComponent(type) {
    return this.components[type];
  }

  /**
   *
   * @returns {Object3D} - clone of object3D
   */
  clone() {
    return new Object3D(this.toJSON());
  }

  /**
   * @callback TraverseCallback
   * @param {Object3D} object3D - the object3D traversed
   */

  /**
   * Apply a callback to object3D and its children recursively like {@link THREE.Object3D}
   * This is not exactly the same one since there is the possibility to stop the traverse
   * and the possibility to remove an object3D while parent is traversed TODO: object should not be remove though since its cause of bug !!! (maybe test with a descendant for loop (i--))
   *
   * @param {TraverseCallback} cb - callback to apply to object3D and its children recursively
   * @returns {boolean} - true when traverse should be stop
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
   *
   * @param {boolean=} [full=true] - component with controllers should be added to the result
   * @param {boolean=} [withMetadata=false] - add metadata to the result
   * @param {boolean=} [withChildren=true] - add children to the result
   * @returns {object} - object of the object3D if withMetatdata = false, otherwise the object is store in result.object and metadata in result.metadata
   */
  toJSON(full = true, withMetadata = false, withChildren = true) {
    const result = {};

    result.children = [];
    if (withChildren) {
      this.children.forEach((child) => {
        if (!child.isGameObject3D) return;
        result.children.push(child.toJSON(full, false));
      });
    }

    // update matrix
    this.updateMatrix();
    result.matrix = this.matrix.toArray();

    // other attributes
    result.uuid = this.uuid;
    result.name = this.name;
    result.static = this.static;
    result.outdated = this.outdated;
    result.visible = this.visible;
    result.gameContextUpdate = this.gameContextUpdate;
    if (this.parent) {
      result.parentUUID = this.parent.uuid;
    }
    result.userData = this.userData;

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

/**
 * If json has metadata update object of object3D if not nothing is done
 *
 * @param {object} json - json of object3D
 * @returns {object} - json object of object3D
 */
Object3D.parseJSON = function (json) {
  if (!json) {
    console.error(json);
    throw new Error('no json');
  }

  // check if object
  if (json.object) {
    if (!json.metadata) {
      console.info('no metadata');
    }
    // metadata should be in json.metadata
    // do stuff like versioning then return the object
    return json.object;
  }
  return json;
};

/**
 *
 * @returns {THREE.Vector3} - Default forward of Object3D
 */
Object3D.DefaultForward = function () {
  return new THREE.Vector3(0, 1, 0);
};

/**
 *
 * @returns {THREE.Vector3} - Default up vector of Object3D
 */
Object3D.DefaultUp = function () {
  return new THREE.Vector3(0, 0, 1);
};

/**
 *
 * @param {Object3D} object3D - object3D to compute forward vector
 * @returns {THREE.Vector3} - forward vector of object3D
 */
Object3D.computeForward = function (object3D) {
  return Object3D.DefaultForward().applyQuaternion(object3D.quaternion);
};

/**
 *
 * @param {Object3D} object3D - object3D to compute backward vector
 * @returns {THREE.Vector3} - backward vector of object3D
 */
Object3D.computeBackward = function (object3D) {
  return Object3D.computeForward(object3D).negate();
};

/**
 *
 * @param {Object3D} object3D - object3D to compute up vector
 * @returns {THREE.Vector3} - up vector of object3D
 */
Object3D.computeUp = function (object3D) {
  return Object3D.DefaultUp().applyQuaternion(object3D.quaternion);
};

/**
 *
 * @param {Object3D} object3D - object3D to compute down vector
 * @returns {THREE.Vector3} - down vector of object3D
 */
Object3D.computeDown = function (object3D) {
  return Object3D.computeUp(object3D).negate();
};

/**
 * Return a deep copy of object3D (uuids and name are regenerated)
 *
 * @param {Object3D} object3D - object3D to deep copy
 * @returns {Object3D} - deep copy of object3D
 */
Object3D.deepCopy = function (object3D) {
  const cloneJSON = object3D.toJSON(true);
  // Rename uuid
  objectParse(cloneJSON, function (json, key) {
    const keyLowerCase = key.toLowerCase();
    if (keyLowerCase === 'uuid') json[key] = THREE.MathUtils.generateUUID();

    if (keyLowerCase === 'name') {
      json[key] = 'Clone of ' + json[key];
    }
  });
  return new Object3D(cloneJSON);
};

/**
 *
 * Parse parent object till finding a gameobject
 *
 * @param {THREE.Object3D} object - object to fetch into
 * @returns {Object3D} - first gameobject found in hierarchy
 */
Object3D.fetchFirstGameObject3D = function (object) {
  if (object.isGameObject3D) return object;

  let result = object;
  while (result && !result.isGameObject3D) {
    result = result.parent;
  }
  return result;
};

module.exports = Object3D;

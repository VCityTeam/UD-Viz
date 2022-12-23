const Diff = require('./Diff');
const Object3D = require('../Object3D');
const JSONUtil = require('../../JSONUtil');

/**
 * Store the state of the  at a given time
 */
const State = class {
  constructor(json) {
    if (!json) throw new Error('no json');

    // Gameobjects
    this.object3D = new Object3D(json.object3DJSON);

    // Timestamp
    this.timestamp = json.timestamp || -1;

    // Flag to determine if that state has been consumed/treated by the gameview (or something else)
    this._consumed = false;
  }

  setConsumed(value) {
    this._consumed = value;
  }

  hasBeenConsumed() {
    return this._consumed;
  }

  /**
   * Compute the next state with a given Diff
   *
   * @param {Diff} diff the Diff between two State
   * @returns {State} the new State
   */
  add(diff) {
    const nextStateObjectsUUID = diff.getNextStateObjectsUUID();
    const objects3DToUpdateJSON = diff.getObjects3DToUpdateJSON();

    const object3DUpdated = [];

    const cloneObject3D = this.object3D.clone();

    cloneObject3D.traverse((child) => {
      if (!nextStateObjectsUUID.includes(child.uuid)) {
        // not present in the next state => has been removed
        child.removeFromParent();
      } else {
        // Check if an update is needed
        const object3DJSON = objects3DToUpdateJSON[child.uuid];
        if (object3DJSON) {
          child.updatefromJSON(object3DJSON);
          object3DUpdated.push(child.uuid);
        }
      }
    });

    // Object3D still present was not in the previous state
    for (const uuid in objects3DToUpdateJSON) {
      if (object3DUpdated.includes(uuid)) continue;

      const json = objects3DToUpdateJSON[uuid];
      const newObject3D = new Object3D(json, null);
      const parent = cloneObject3D.getObjectByProperty('uuid', json.parentUUID);
      parent.add(newObject3D);
    }

    // DEBUG process.DEV_MODE ?
    let count = 0;
    cloneObject3D.traverse(function (child) {
      if (nextStateObjectsUUID.includes(child.uuid)) count++;
    });
    if (nextStateObjectsUUID.length != count) {
      throw new Error('count of object3D error');
    }

    return new State({
      object3DJSON: cloneObject3D.toJSON(),
      timestamp: diff.getTimeStamp(),
    });
  }

  /**
   * Check if there is gameobject with a given uuid
   *
   * @param {string} uuid uuid to be check
   * @returns {boolean} true if there is a gameobject with this uuid, false otherwise
   */
  includes(uuid) {
    if (this.object3D.getObjectByProperty('uuid', uuid)) {
      return true;
    }
    return false;
  }

  /**
   * Compute the Diff between this and the state passed
   *
   * @param {State} state the state passed to compute the Diff with this
   * @returns {Diff} the difference between this and state
   */
  sub(previousState) {
    const nextStateObjectsUUID = [];
    const objects3DToUpdateJSON = {};
    const alreadyInObjects3DToUpdateJSON = [];
    this.object3D.traverse((child) => {
      nextStateObjectsUUID.push(child.uuid); // Register all uuid
      if (!alreadyInObjects3DToUpdateJSON.includes(child.uuid)) {
        // Not present in objects3DToUpdateJSON
        if (!previousState.includes(child.uuid) || child.isOutdated()) {
          // If not in the previous state or outdated
          objects3DToUpdateJSON[child.uuid] = child.toJSON();
          // Avoid to add child of an outdated object twice because toJSON is recursive
          child.traverse(function (childAlreadyInObjects3DToUpdateJSON) {
            alreadyInObjects3DToUpdateJSON.push(
              childAlreadyInObjects3DToUpdateJSON.uuid
            );
          });
        }
      }
    });

    return new Diff({
      nextStateObjectsUUID: nextStateObjectsUUID,
      objects3DToUpdateJSON: objects3DToUpdateJSON,
      timestamp: this.timestamp,
    });
  }

  log() {
    this.object3D.traverse((child) => {
      console.log(child.name);
      console.log(child.toJSON());
    });
  }

  equals(state) {
    return JSONUtil.equals(this.toJSON(), state.toJSON());
  }

  /**
   * Return a clone of this
   *
   * @returns {State}
   */
  clone() {
    return new State(this.toJSON(true));
  }

  /**
   *
   * @returns {number}
   */
  getTimestamp() {
    return this.timestamp;
  }

  /**
   *
   * @returns {Object3D}
   */
  getObject3D() {
    return this.object3D;
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      type: State.TYPE,
      object3DJSON: this.object3D.toJSON(true),
      timestamp: this.timestamp,
    };
  }
};

State.TYPE = 'State';

// //STATIC

/**
 * Compute the state between w1 and w2, interpolating with a given ratio
 *
 * @param {State} s1 first state if ratio = 0, result = w1
 * @param {State} s2 second state if ratio = 1, result = w2
 * @param {number} ratio a number between 0 => 1
 * @returns {State} the interpolated state
 */
State.interpolate = function (s1, s2, ratio) {
  if (!s2) return s1;

  // Interpolate object3D
  const mapState2 = {};
  s2.getObject3D().traverse(function (object) {
    mapState2[object.uuid] = object;
  });
  const result = s1.clone();
  result.getObject3D().traverse(function (object) {
    if (object.isStatic()) return false; // no need to interpolate

    const s2Object = mapState2[object.uuid];

    if (s2Object) {
      // interpolate
      object.position.lerp(s2Object.position, ratio);
      object.scale.lerp(s2Object.scale, ratio);
      object.quaternion.slerp(s2Object.quaternion, ratio);
    }
  });

  return result;
};

module.exports = State;

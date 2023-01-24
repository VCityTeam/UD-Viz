const Diff = require('./Diff');
const Object3D = require('../Object3D');
const Data = require('../../Data');

/** @class */
const State = class {
  /**
   * Store state of context at a given time
   *
   * @param {Object3D} object3D - context root object3D
   * @param {number} timestamp - time
   */
  constructor(object3D, timestamp) {
    if (!object3D || !timestamp) throw new Error('need parameters');

    /**
     * context root object3D
     *
     * @type {Object3D}
     */
    this.object3D = object3D;

    /**
     * time when the state has been created in ms
     *
     * @type {number}
     */
    this.timestamp = timestamp;

    /**
     * flag to determine if state has been consumed/treated
     *
     * @type {boolean}
     */
    this._consumed = false;
  }

  /**
   *
   * @param {boolean} value - new consumed value
   */
  setConsumed(value) {
    this._consumed = value;
  }

  /**
   *
   * @returns {boolean} - return true if state has been consumed/treated
   */
  hasBeenConsumed() {
    return this._consumed;
  }

  /**
   * Compute next state based on a {@link Diff}
   *
   * @param {Diff} diff - diff between two State
   * @returns {State} - next state
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
        } else {
          child.setOutdated(false); // => this object is no longer outdated
        }
      }
    });

    for (const uuid in objects3DToUpdateJSON) {
      if (object3DUpdated.includes(uuid)) continue; // already update

      // still not updated => did not find parent object3D

      const json = objects3DToUpdateJSON[uuid];
      const newObject3D = new Object3D(json, null);
      const parent = cloneObject3D.getObjectByProperty('uuid', json.parentUUID);
      parent.add(newObject3D);
    }

    // DEBUG
    // let count = 0;
    // cloneObject3D.traverse(function (child) {
    //   if (nextStateObjectsUUID.includes(child.uuid)) count++;
    // });
    // if (nextStateObjectsUUID.length != count) {
    //   throw new Error('count of object3D error');
    // }

    return new State(cloneObject3D, diff.getTimeStamp());
  }

  /**
   * Check if there is an object3D with a given uuid
   *
   * @param {string} uuid - uuid to be check
   * @returns {boolean} - true if there is an object3D with this uuid, false otherwise
   */
  includes(uuid) {
    if (this.object3D.getObjectByProperty('uuid', uuid)) {
      return true;
    }
    return false;
  }

  /**
   * Compute the diff between this and previous state
   *
   * @param {State} previousState - state passed to compute the diff with this
   * @returns {Diff} diff between this and previousState
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

  /**
   *
   * @param {State} state - state to compare to
   * @returns {boolean} - true if states are equal
   */
  equals(state) {
    if (state.timestamp != this.timestamp) return false;
    return Data.objectEquals(
      this.object3D.toJSON(true),
      state.object3D.toJSON(true)
    );
  }

  /**
   *
   * @returns {State} - clone of state
   */
  clone() {
    return new State(this.object3D.clone(), this.timestamp);
  }

  /**
   *
   * @returns {number} - state timestamp
   */
  getTimestamp() {
    return this.timestamp;
  }

  /**
   *
   * @returns {Object3D} - state object3D
   */
  getObject3D() {
    return this.object3D;
  }

  /**
   * export state to serializable json object
   *
   * @returns {object} - serializable json object
   */
  toJSON() {
    return {
      object3D: this.object3D.toJSON(),
      timestamp: this.timestamp,
    };
  }
};

/**
 * Compute a state interpolated between s1 and s2 with a given ratio
 *
 * @param {State} s1 - first state if ratio = 0, result = s1
 * @param {State} s2 - second state if ratio = 1, result = s2
 * @param {number} ratio - a number between 0 => 1
 * @returns {State} - interpolated state
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

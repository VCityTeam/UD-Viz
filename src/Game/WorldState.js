/** @format */

const GameObject = require('./GameObject/GameObject');
const WorldStateDiff = require('./WorldStateDiff');

/**
 * Store the state of the world at a given time
 */
const WorldStateModule = class WorldState {
  constructor(json) {
    if (!json) throw new Error('no json');

    //gameobjects
    this.gameObject = null;
    if (json.gameObject) this.gameObject = new GameObject(json.gameObject);

    //timestamp
    this.timestamp = json.timestamp || -1;

    //coord of the origin (itowns)
    this.origin = json.origin || null;

    //flag to determine if that state has been consumed/treated by the gameview (or something else)
    this._consumed = false;
  }

  setConsumed(value) {
    this._consumed = value;
  }

  hasBeenConsumed() {
    return this._consumed;
  }

  /**
   * Compute the next state with a given WorldStateDiff
   *
   * @typedef {this} WorldState
   *
   * @param {WorldStateDiff} diff the WorldStateDiff between two WorldState
   * @returns {WorldState} the new WorldState
   */
  add(diff) {
    const uuidGO = diff.getGameObjectsUUID();
    const outdatedGameObjectsJSON = diff.getOutdatedGameObjectsJSON();

    const newGO = this.gameObject.clone();
    newGO.traverse(function (g) {
      const uuid = g.getUUID();

      if (!uuidGO.includes(uuid)) {
        //delete all gameobject not in diff
        console.log(g, ' is not in the scene anymore');
        g.removeFromParent();
      } else {
        //update the outdated one
        const o = outdatedGameObjectsJSON[uuid];
        if (o) {
          //update
          g.setFromJSON(o);
          delete outdatedGameObjectsJSON[uuid]; //remove it
        } else {
          //g is not outdated
          g.setOutdated(false);
        }
      }
    });

    //create others which existed not yet
    for (const uuid in outdatedGameObjectsJSON) {
      const json = outdatedGameObjectsJSON[uuid];
      const go = new GameObject(json, null);
      const parent = newGO.find(json.parentUUID);
      parent.addChild(go);
    }

    //DEBUG
    let count = 0;
    newGO.traverse(function (g) {
      const uuid = g.getUUID();
      if (uuidGO.includes(uuid)) count++;
    });
    if (uuidGO.length != count) {
      throw new Error('count of go error');
    }

    const result = new WorldState({
      gameObject: newGO.toJSON(true),
      timestamp: diff.getTimeStamp(),
      origin: this.origin,
    });

    return result;
  }

  /**
   * Check if there is gameobject with a given uuid
   *
   * @param {string} uuid uuid to be check
   * @returns {boolean} true if there is a gameobject with this uuid, false otherwise
   */
  includes(uuid) {
    if (this.gameObject.find(uuid)) {
      return true;
    }
    return false;
  }

  /**
   * Compute the WorldStateDiff between this and the state passed
   *
   * @param {WorldState} state the state passed to compute the WorldStateDiff with this
   * @returns {WorldStateDiff} the difference between this and state
   */
  toDiff(state) {
    const gameObjectsUUID = [];
    const outdatedGameObjectsJSON = {};
    const alreadyInOutdated = [];
    this.gameObject.traverse(function (g) {
      gameObjectsUUID.push(g.getUUID()); //register all uuid
      if (!alreadyInOutdated.includes(g)) {
        //if is not static and is not already register
        if (!state.includes(g.getUUID()) || g.isOutdated()) {
          //if not in the last state or outdated
          outdatedGameObjectsJSON[g.getUUID()] = g.toJSON();
          //avoid to add child of an outdated object twice because toJSON is recursive
          g.traverse(function (outdated) {
            alreadyInOutdated.push(outdated.getUUID());
          });
        }
      }
    });

    return new WorldStateDiff({
      gameObjectsUUID: gameObjectsUUID,
      outdatedGameObjectsJSON: outdatedGameObjectsJSON,
      timestamp: this.timestamp,
    });
  }

  /**
   * return a clone of this
   *
   * @returns {WorldState}
   */
  clone() {
    return new WorldState({
      gameObject: this.gameObject.toJSON(true),
      timestamp: this.timestamp,
      origin: this.origin,
    });
  }

  /**
   *
   * @param {GameObject} g
   */
  setGameObject(g) {
    this.gameObject = g;
  }

  /**
   *
   * @returns {object}
   */
  getOrigin() {
    return this.origin;
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
   * @returns {GameObject}
   */
  getGameObject() {
    return this.gameObject;
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    let gameObjectData = null;
    if (this.gameObject) gameObjectData = this.gameObject.toJSON();

    return {
      type: WorldStateModule.TYPE,
      gameObject: gameObjectData,
      timestamp: this.timestamp,
      origin: this.origin,
    };
  }
};

WorldStateModule.TYPE = 'WorldState';

////STATIC

/**
 * Compute the state between w1 and w2, interpolating with a given ratio
 *
 * @param {WorldState} w1 first state if ratio = 0, result = w1
 * @param {WorldState} w2 second state if ratio = 1, result = w2
 * @param {number} ratio a number between 0 => 1
 * @returns {WorldState} the interpolated state
 */
WorldStateModule.interpolate = function (w1, w2, ratio) {
  if (!w2) return w1;

  //interpolate go
  const mapW2 = {};
  w2.getGameObject().traverse(function (go) {
    mapW2[go.getUUID()] = go;
  });
  const result = w1.clone();
  result.gameObject.traverse(function (go) {
    if (go.isStatic()) return false; //do not stop propagation

    if (mapW2[go.getUUID()]) {
      GameObject.interpolateInPlace(go, mapW2[go.getUUID()], ratio);
    }
  });

  return result;
};

module.exports = WorldStateModule;

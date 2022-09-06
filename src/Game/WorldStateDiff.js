/** @format */

/**
 * This object avoid to send WorldState on network and allow to rebuild a WorldState
 * worldstate(t) + worldstatediff(t+1) = worldstate(t+1)
 */
module.exports = class WorldStateDiff {
  constructor(json) {
    if (!json) throw new Error('no json');

    //Value from t+1 worldstate
    this.timestamp = json.timestamp;

    //Gameobjects uuid
    this.gameObjectsUUID = json.gameObjectsUUID || [];

    //Gameobject which need update
    this.outdatedGameObjectsJSON = json.outdatedGameObjectsJSON || {};
  }

  /**
   * Return array of json gameobject outdated
   *
   * @returns {Array[JSON]}
   */
  getOutdatedGameObjectsJSON() {
    return this.outdatedGameObjectsJSON;
  }

  /**
   * Return list of the current gameobjects UUID
   *
   * @returns {Array[String]}
   */
  getGameObjectsUUID() {
    return this.gameObjectsUUID;
  }

  /**
   * Return timestamp of this WorldStateDiff
   *
   * @returns {number}
   */
  getTimeStamp() {
    return this.timestamp;
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      timestamp: this.timestamp,
      gameObjectsUUID: this.gameObjectsUUID,
      outdatedGameObjectsJSON: this.outdatedGameObjectsJSON,
    };
  }
};

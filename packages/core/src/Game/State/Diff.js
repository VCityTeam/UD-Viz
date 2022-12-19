/**
 * This object avoid to send State on network and allow to rebuild a State
 * state(t) + statediff(t+1) = state(t+1)
 */
const Diff = class {
  constructor(json) {
    if (!json) throw new Error('no json');

    // Value from t+1 state
    this.timestamp = json.timestamp;

    // Objects3D uuid
    this.nextStateObjectsUUID = json.nextStateObjectsUUID || [];

    // Gameobject which need update
    this.objects3DToUpdateJSON = json.objects3DToUpdateJSON || {};
  }

  /**
   * Return array of json gameobject outdated
   *
   * @returns {Array[JSON]}
   */
  getObjects3DToUpdateJSON() {
    return this.objects3DToUpdateJSON;
  }

  /**
   * Return list of the current Objects3D UUID
   *
   * @returns {Array[String]}
   */
  getNextStateObjectsUUID() {
    return this.nextStateObjectsUUID;
  }

  /**
   * Return timestamp of this StateDiff
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
      objects3DToUpdateJSON: this.objects3DToUpdateJSON,
      nextStateObjectsUUID: this.nextStateObjectsUUID,
      timestamp: this.timestamp,
    };
  }
};

module.exports = Diff;

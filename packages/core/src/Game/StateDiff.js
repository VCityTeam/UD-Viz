/**
 * This object avoid to send State on network and allow to rebuild a State
 * state(t) + statediff(t+1) = state(t+1)
 */
module.exports = class StateDiff {
  constructor(json) {
    if (!json) throw new Error('no json');

    // Value from t+1 state
    this.timestamp = json.timestamp;

    // Objects3D uuid
    this.objects3DUUID = json.object3DUUIDS || [];

    //  UUID
    this.uuid = json.uuid;

    // Gameobject which need update
    this.outdatedObjects3DJSON = json.outdatedObjects3DJSON || {};
  }

  /**
   * Return array of json gameobject outdated
   *
   * @returns {Array[JSON]}
   */
  getOutdatedObjects3DJSON() {
    return this.outdatedObjects3DJSON;
  }

  /**
   * Return list of the current Objects3D UUID
   *
   * @returns {Array[String]}
   */
  getObjects3DUUID() {
    return this.Objects3DUUID;
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
   *
   * @returns {string} uuid of the 
   */
  getUUID() {
    return this.UUID;
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      timestamp: this.timestamp,
      UUID: this.UUID,
      Objects3DUUID: this.Objects3DUUID,
      outdatedObjects3DJSON: this.outdatedObjects3DJSON,
    };
  }
};

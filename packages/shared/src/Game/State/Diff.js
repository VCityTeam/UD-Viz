/** @class */
const Diff = class {
  /**
   * Store difference between two following states (state(t) + diff(t,t+1) = state(t+1))
   *
   * @param {object} json - json to configure diff
   * @param {number} json.timestamp - time of state(t+1)
   * @param {Array<string>} json.nextStateObjectsUUID - uuids object3D present in state(t+1)
   * @param {Object<string,object>} json.objects3DToUpdateJSON - map uuid object3D to object3D json where outdated (model has changed)
   */
  constructor(json) {
    if (!json) throw new Error('no json');

    /**
     * time of state(t+1)
     *
     * @type {number}
     */
    this.timestamp = json.timestamp;

    /**
     * uuids object3D present in state(t+1)
     *
     * @type {Array<string>}
     */
    this.nextStateObjectsUUID = json.nextStateObjectsUUID;

    /**
     * map uuid object3D to object3D json where outdated (model has changed)
     *
     * @type {Object<string,object>}
     */
    this.objects3DToUpdateJSON = json.objects3DToUpdateJSON;
  }

  /**
   *
   * @returns {Object<string,object>} - diff objects3D to update
   */
  getObjects3DToUpdateJSON() {
    return this.objects3DToUpdateJSON;
  }

  /**
   *
   * @returns {Array<string>} - diff next state object3D uuid
   */
  getNextStateObjectsUUID() {
    return this.nextStateObjectsUUID;
  }

  /**
   *
   * @returns {number} - dif timestamp
   */
  getTimeStamp() {
    return this.timestamp;
  }
};

module.exports = Diff;

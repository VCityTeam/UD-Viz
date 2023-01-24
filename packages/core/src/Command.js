/** @class */
class Command {
  /**
   * Create a Command (this class can be used to make different process communicate together)
   *
   * @param {object} json - json object to configure the command
   * @param {string} json.type - Type of the command
   * @param {object=} json.data - Data of the command
   */
  constructor(json) {
    if (!json) throw new Error('no json');

    /**
     * Type of the command
     *
     * @type {string}
     */
    this.type = json.type;

    /**
     * Data of the command
     *
     * @type {object|null}
     */
    this.data = null;
    if (json.data != undefined) {
      this.data = json.data;
    }
  }

  /**
   *
   * @returns {object|null} Data of the command
   */
  getData() {
    return this.data;
  }

  /**
   *
   * @returns {string} Type of the command
   */
  getType() {
    return this.type;
  }

  /**
   *
   * @returns {object} - export to json object command
   */
  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }
}

module.exports = Command;

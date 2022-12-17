const Command = class {
  /**
   *
   * @param {object|JSON} json - The JSON  that will be used to create the WorldCommand.
   * @param {string} json.type - Type of the command
   * @param {object|JSON} json.data - Data of the command (optional).
   */
  constructor(json) {
    if (!json) throw new Error('no json');

    /** @type {string} Type of the command */
    this.type = json.type;

    /** @type {object|JSON} Data of the command (optional)*/
    this.data = null;
    if (json.data != undefined) {
      this.data = json.data;
    }
  }

  /**
   *
   * @returns {object|JSON} Data of the command
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
   * Compute this to JSON
   *
   * @returns {object|JSON} object serialized in JSON
   */
  toJSON() {
    return {
      type: this.type,
      data: this.data,
    };
  }
};

module.exports = Command;

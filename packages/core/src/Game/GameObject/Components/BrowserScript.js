const { Model } = require('./Component');

/**
 * Component used to script a GameObject during the client side update (call from GameView)
 */
const BrowserScriptModelModule = class BrowserScriptModel extends Model {
  constructor(json) {
    super(json);

    // Array of localscripts id
    this.idScripts = json.idScripts || [];

    // Conf pass to scripts
    const conf = json.conf || {};
    this.conf = JSON.parse(JSON.stringify(conf)); // deep copy
  }

  /**
   *
   * @returns {JSON}
   */
  getConf() {
    return this.conf;
  }

  /**
   * This component cant be run on the server side
   *
   * @returns {boolean}
   */
  isServerSide() {
    return false;
  }

  /**
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      idScripts: this.idScripts,
      conf: this.conf,
      type: BrowserScriptModelModule.TYPE,
    };
  }
};

BrowserScriptModelModule.TYPE = 'BrowserScript';

module.exports = { Model: BrowserScriptModelModule };

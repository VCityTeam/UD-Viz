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
    this.conf = json.conf || {};
  }

  getIdScripts() {
    return this.idScripts;
  }

  /**
   *
   * @returns {JSON}
   */
  getConf() {
    return this.conf;
  }

  setConf(conf) {
    this.conf = conf;
  }

  /**
   * This component cant be run on the server side
   *
   * @returns {boolean}
   */
  isWorldComponent() {
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

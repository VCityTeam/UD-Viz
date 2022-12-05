const THREE = require('three');

/**
 * Component used to script a GameObject during the client side update (call from GameView)
 */
const LocalScriptModule = class LocalScript {
  constructor(parent, json) {
    // Gameobject of this component
    this.parent = parent;

    // Uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    // Array of localscripts id
    this.idScripts = json.idScripts || [];

    // Type
    this.type = json.type || LocalScriptModule.TYPE;

    // Conf pass to scripts
    const conf = json.conf || {};
    this.conf = JSON.parse(JSON.stringify(conf));

    // Map of scripts
    this.scripts = {};
  }

  /**
   *
   * @returns {JSON}
   */
  getConf() {
    return this.conf;
  }

  /**
   * Initialize scripts
   *
   * @param {AssetsManager} assetsManager local assetsManager
   * @param {Library} bundles set of bundle library used by script
   */
  initAssets(assetsManager, bundles) {
    const _this = this;
    this.idScripts.forEach(function (id) {
      const constructor = assetsManager.fetchLocalScript(id);
      _this.scripts[id] = new constructor(_this.conf, bundles.udviz);
    });
  }

  /**
   * Execute all scripts for a particular event
   *
   * @param {LocalScript.EVENT} event the event trigger
   * @param {Array} params parameters pass to scripts
   */
  execute(event, params) {
    const _this = this;
    let result = false;

    this.idScripts.forEach(function (idScript) {
      result = result || _this.executeScript(idScript, event, params);
    });

    return result;
  }

  /**
   * Execute script with id for a particular event
   *
   * @param {string} id id of the script executed
   * @param {LocalScript.EVENT} event event trigger
   * @param {Array} params parameters pass to the script function
   * @returns {object} result of the script execution
   */
  executeScript(id, event, params) {
    const s = this.scripts[id];

    if (s[event]) {
      return s[event].apply(s, [this.parent].concat(params));
    }
    return false;
  }

  /**
   *
   * @returns {object}
   */
  getScripts() {
    return this.scripts;
  }

  /**
   * This component cant be run on the server side
   *
   * @returns {boolean}
   */
  isServerSide() {
    return false;
  }

  getUUID() {
    return this.uuid;
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
      type: LocalScriptModule.TYPE,
    };
  }
};

LocalScriptModule.TYPE = 'LocalScript';
LocalScriptModule.EVENT = {
  INIT: 'init', // Before first tick
  TICK: 'tick', // Every tick
  ON_NEW_GAMEOBJECT: 'onNewGameObject', // When a go is added
  ON_OUTDATED: 'onOutdated', // Call when outdated is raised
  DISPOSE: 'dispose', // Gameview is disposed
  ON_REMOVE: 'onRemove', // Object is remove from parent
  ON_COMPONENT_UPDATE: 'onComponentUpdate', // Component updated smthg
  ON_RESIZE: 'onResize', // On resize window
};

module.exports = LocalScriptModule;

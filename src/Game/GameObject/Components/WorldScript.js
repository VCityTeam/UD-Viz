/** @format */

const THREE = require('three');

/**
 * Component used to script a GameObject during the world simulation
 */
const WorldScriptModule = class WorldScript {
  constructor(parent, json) {
    // Gameobject of this component
    this.parent = parent;

    // Uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    // Array of worldScripts id
    this.idScripts = json.idScripts || [];

    // Type
    this.type = json.type || WorldScriptModule.TYPE;

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
   * @param {AssetsManager} assetsManager must implement an assetsmanager interface can be local or server
   * @param {Library} bundles set of bundle library used by script
   */
  initAssets(assetsManager, bundles) {
    const _this = this;
    this.idScripts.forEach(function (id) {
      const constructor = assetsManager.fetchWorldScript(id);
      _this.scripts[id] = new constructor(_this.conf, bundles.Game);
    });
  }

  /**
   * Execute all scripts for a particular event
   *
   * @param {WorldScript.EVENT} event the event trigger
   * @param {Array} params parameters pass to scripts
   */
  execute(event, params) {
    const _this = this;

    this.idScripts.forEach(function (idScript) {
      _this.executeScript(idScript, event, params);
    });
  }

  /**
   * Execute script with id for a particular event
   *
   * @param {string} id id of the script executed
   * @param {WorldScript.EVENT} event event trigger
   * @param {Array} params parameters pass to the script function
   * @returns {object} result of the script execution
   */
  executeScript(id, event, params) {
    const s = this.scripts[id];

    if (s[event]) {
      return s[event].apply(s, [this.parent].concat(params));
    }
    return null;
  }

  /**
   *
   * @returns {object}
   */
  getScripts() {
    return this.scripts;
  }

  getUUID() {
    return this.uuid;
  }

  /**
   * This component can be run on the server side
   *
   * @returns {boolean}
   */
  isServerSide() {
    return true;
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
      type: WorldScriptModule.TYPE,
    };
  }
};

WorldScriptModule.TYPE = 'WorldScript';

WorldScriptModule.EVENT = {
  INIT: 'init', // When added
  TICK: 'tick', // Every tick
  LOAD: 'load', // At world load return promises
  ON_ENTER_COLLISION: 'onEnterCollision', // First collsion
  IS_COLLIDING: 'isColliding', // Is colliding
  ON_LEAVE_COLLISION: 'onLeaveCollision', // On leave collision
};

module.exports = WorldScriptModule;

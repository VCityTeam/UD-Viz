/** @format */

const THREE = require('three');

/**
 * Component used to script a GameObject during the world simulation
 */
const WorldScriptModule = class WorldScript {
  constructor(parent, json) {
    //gameobject of this component
    this.parent = parent;

    //uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    //array of worldScripts id
    this.idScripts = json.idScripts || [];

    //type
    this.type = json.type || WorldScriptModule.TYPE;

    //conf pass to scripts
    this.conf = JSON.parse(JSON.stringify(json.conf)) || {};

    //map of scripts
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
   * @param {AssetsManager} assetsManager must implement an assetsmanager interface can be local or server
   * @param {Library} bundles set of bundle library used by script
   */
  initAssets(assetsManager, bundles) {
    const _this = this;
    this.idScripts.forEach(function (id) {
      const constructor = assetsManager.fetchWorldScript(id);
      _this.scripts[id] = new constructor(_this.conf, bundles.Shared);
    });
  }

  /**
   * Execute all scripts for a particular event
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
   * @param {String} id id of the script executed
   * @param {WorldScript.EVENT} event event trigger
   * @param {Array} params parameters pass to the script function
   * @returns {Object} result of the script execution
   */
  executeScript(id, event, params) {
    let s = this.scripts[id];

    if (s[event]) {
      return s[event].apply(s, [this.parent].concat(params));
    } else {
      return null;
    }
  }

  /**
   *
   * @returns {Object}
   */
  getScripts() {
    return this.scripts;
  }

  getUUID() {
    return this.uuid;
  }

  /**
   * This component can be run on the server side
   * @returns {Boolean}
   */
  isServerSide() {
    return true;
  }

  /**
   * Compute this to JSON
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
  INIT: 'init', //when added
  TICK: 'tick', //every tick
  LOAD: 'load', //at world load return promises
  ON_ENTER_COLLISION: 'onEnterCollision', //first collsion
  IS_COLLIDING: 'isColliding', //is colliding
  ON_LEAVE_COLLISION: 'onLeaveCollision', //on leave collision
};

module.exports = WorldScriptModule;

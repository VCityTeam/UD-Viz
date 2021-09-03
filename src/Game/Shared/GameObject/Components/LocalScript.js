/** @format */

const THREE = require('three');
const JSONUtils = require('../../Components/JSONUtils');

//TODO pass ud-viz as parameter to localscript and not only Shared

/**
 * Component used to script a GameObject during the client side update (call from GameView)
 */
const LocalScriptModule = class LocalScript {
  constructor(parent, json) {
    //gameobject of this component
    this.parent = parent;

    //uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    //array of localscripts id
    this.idScripts = json.idScripts || [];

    //type
    this.type = json.type || LocalScriptModule.TYPE;

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
   * @param {LocalScript.EVENT} event the event trigger
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
   * @param {LocalScript.EVENT} event event trigger
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
   * Check if conf differed with component and
   * notify scripts that conf has changed and fire an UPDATE event
   * @param {JSON} component the component json to update to
   * @param {LocalContext} localContext
   */
  updateFromComponent(component, localContext) {
    if (!JSONUtils.equals(this.conf, component.conf)) {
      //replace conf and launch an update event
      this.conf = component.conf;
      for (let id in this.scripts) {
        const s = this.scripts[id];
        s.conf = component.conf;
      }
      this.execute(LocalScriptModule.EVENT.UPDATE, [localContext]);
    }
  }

  /**
   *
   * @returns {Object}
   */
  getScripts() {
    return this.scripts;
  }

  /**
   * This component cant be run on the server side
   * @returns {Boolean}
   */
  isServerSide() {
    return false;
  }

  getUUID() {
    return this.uuid;
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
      type: LocalScriptModule.TYPE,
    };
  }
};

LocalScriptModule.TYPE = 'LocalScript';
LocalScriptModule.EVENT = {
  INIT: 'init', //Before first tick
  TICK: 'tick', //every tick
  ON_NEW_GAMEOBJECT: 'onNewGameObject', //when a go is added
  UPDATE: 'update', //when component need to be updated with newer localScript component
};

module.exports = LocalScriptModule;

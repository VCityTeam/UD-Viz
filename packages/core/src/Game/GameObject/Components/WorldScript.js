const THREE = require('three');

/**
 * Component used to script a GameObject during the world simulation
 */
const WorldScriptModelModule = class WorldScriptModel {
  constructor(json) {
    // Uuid
    this.uuid = json.uuid || THREE.MathUtils.generateUUID();

    // Array of worldScripts id
    this.idScripts = json.idScripts || [];

    // Type
    this.type = json.type || WorldScriptModelModule.TYPE;

    // Conf pass to scripts
    const conf = json.conf || {};
    this.conf = JSON.parse(JSON.stringify(conf));
  }

  /**
   *
   * @returns {JSON}
   */
  getConf() {
    return this.conf;
  }

  /**
   *
   * @returns *
   */
  getIdScripts() {
    return this.idScripts;
  }

  /**
   *
   * @returns
   */
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
      type: WorldScriptModelModule.TYPE,
    };
  }
};

WorldScriptModelModule.TYPE = 'WorldScript';

/**
 *
 * @param {*} parentGO
 * @param {*} json
 */
const WorldScriptControllerModule = class WorldScriptController {
  constructor(scripts) {
    this.scripts = scripts;
  }

  /**
   * Execute all scripts for a particular event
   *
   * @param {WorldScript.EVENT} event the event trigger
   * @param {Array} params parameters pass to scripts
   */
  execute(event, params) {
    this.scripts.forEach((s) => {
      this.executeScript(s, event, params);
    });
  }

  /**
   * Execute script with id for a particular event
   *
   * @param {string} id id of the script executed
   * @param script
   * @param {WorldScript.EVENT} event event trigger
   * @param {Array} params parameters pass to the script function
   * @returns {object} result of the script execution
   */
  executeScript(script, event, params) {
    return script[event].apply(script, params);
  }

  /**
   *
   * @returns {object}
   */
  getScripts() {
    return this.scripts;
  }
};

WorldScriptControllerModule.EVENT = {
  INIT: 'init', // When added
  TICK: 'tick', // Every tick
  LOAD: 'load', // At world load return promises
  ON_ENTER_COLLISION: 'onEnterCollision', // First collsion
  IS_COLLIDING: 'isColliding', // Is colliding
  ON_LEAVE_COLLISION: 'onLeaveCollision', // On leave collision
};

/**
 *
 * @param {*} conf
 * @param {*} context
 */
const WorldScriptBaseModule = class WorldScriptBase {
  constructor(conf, context, parentGO) {
    this.conf = conf;
    this.parentGameObject = parentGO;
    this.context = context;
  }
};

// Fill the class with the different WorldScriptControllerModule.EVENT method
for (const event in WorldScriptControllerModule.EVENT) {
  const eventValue = WorldScriptControllerModule.EVENT[event];
  WorldScriptBaseModule.prototype[eventValue] = () => {
    // empty method override it for custm behavior
  };
}

module.exports = {
  WorldScriptModel: WorldScriptModelModule,
  WorldScriptBase: WorldScriptBaseModule,
  WorldScriptController: WorldScriptControllerModule,
};

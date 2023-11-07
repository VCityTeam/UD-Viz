const { Model, Controller } = require('./Component');

const { objectOverWrite } = require('@ud-viz/utils_shared');

/**
 * @typedef {object} ScriptParams
 * @property {string} id - id of the script
 * @property {number} priority - influence order in which scripts are executed
 */

/**
 * @see module:Script
 * @class
 */
const ScriptModel = class extends Model {
  /**
   * Model of object3D script component
   *
   * @param {object} json - json to configure script model
   * @param {string} json.uuid - uuid of script model
   * @param {Array<ScriptParams>=} json.scriptParams - scripts params
   * @param {object=} json.variables - custom global variables for scripts
   */
  constructor(json) {
    super(json);

    /**
     * scripts params
     *
     * @type {Array<ScriptParams>}
     */
    this.scriptParams = json.scriptParams || [];

    /**
     * custom global variables passed to scripts
     *
     * @type {object}
     */
    this.variables = json.variables || {};
  }
};

/**
 * @see module:Script
 * @class
 */
const ScriptController = class extends Controller {
  /**
   * Controller of object3D script component
   *
   * @param {ScriptModel} model - model of this controller
   * @param {object} object3D - object3D parent of the script component TODO; cyclic reference why controller need to know their object3D ?
   * @param {Map<string,object>} scripts - instances of scripts
   */
  constructor(model, object3D, scripts) {
    super(model, object3D);

    /**
     * instances of scripts
     *
     * @type {Map<string,object>}
     */
    this.scripts = scripts;
  }

  /**
   * Execute all scripts for a particular event
   *
   * @param {string} event - event trigger (event should be a method of the script instances)
   * @param {Array} params - parameters pass to scripts
   */
  execute(event, params) {
    for (const [, script] of this.scripts) {
      this.executeScript(script, event, params);
    }
  }

  /**
   * Execute a script for a particular event
   *
   * @param {object} script - instance of script (class)
   * @param {string} event - event trigger (event should be a method of the script instance)
   * @param {Array} params - parameters to pass to the script
   * @returns {*} - value return by the script (null if no event associated at ths script)
   */
  executeScript(script, event, params) {
    if (!script[event]) {
      console.warn('No Event ' + event + ' on script ' + script.name);
      return null;
    }
    return script[event].apply(script, params);
  }

  /**
   * Modify variables of the model + overwrite variables in scripts
   *
   * @param {object} variables - new variables of this script controller
   */
  setVariables(variables) {
    this.model.variables = variables;
    for (const [, script] of this.scripts) {
      objectOverWrite(script.variables, variables);
    }
  }
};

/**
 * `MODULE` Script
 *
 * @exports Script
 */
module.exports = {
  /** @see ScriptModel*/
  Model: ScriptModel,
  /** @see ScriptController*/
  Controller: ScriptController,
};

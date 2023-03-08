const { Model, Controller } = require('./Component');
const Data = require('../../Data');

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
   * @param {Array<string>=} json.idScripts - ids of scripts
   * @param {object=} json.variables - custom global variables for scripts
   */
  constructor(json) {
    super(json);

    /**
     * ids of scripts
     *
     * @type {Array<string>}
     */
    this.idScripts = json.idScripts || [];

    /**
     * custom global variables passed to scripts
     *
     * @type {object}
     */
    this.variables = json.variables || {};
  }

  /**
   *
   * @returns {object} - script model variables
   */
  getVariables() {
    return this.variables;
  }

  /**
   *
   * @returns {Array<string>} - script model ids scripts
   */
  getIdScripts() {
    return this.idScripts;
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
   * @param {object} object3D - object3D parent of the script component
   * @param {Object<string,object>} scripts - instances of scripts
   */
  constructor(model, object3D, scripts) {
    super(model, object3D);

    /**
     * instances of scripts
     *
     * @type {Object<string,object>}
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
    for (const id in this.scripts) {
      this.executeScript(this.scripts[id], event, params);
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
   *
   * @returns {Object<string,object>} - script controllers scripts
   */
  getScripts() {
    return this.scripts;
  }

  /**
   * Modify variables of the model + overwrite variables in scripts
   *
   * @param {object} variables - new variables of this script controller
   */
  setVariables(variables) {
    this.model.variables = variables;
    for (const id in this.scripts) {
      Data.objectOverWrite(this.scripts[id].variables, variables);
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

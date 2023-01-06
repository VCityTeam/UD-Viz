const { Model, Controller } = require('./Component');
const Data = require('../../Data');

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

    /** @type {Array<string>} - ids of scripts */
    this.idScripts = json.idScripts || [];

    /** @type {object} - custom global variables passed to scripts */
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

const ScriptController = class extends Controller {
  /**
   * Controller of object3D script component
   *
   * @param {ScriptModel} model - model of this controller
   * @param {Object3D} object3D - object3D parent of the script component
   * @param {Object<string,object>} scripts - instances of scripts
   */
  constructor(model, object3D, scripts) {
    super(model, object3D);

    /** @type {Object<string,object>} - instances of scripts */
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
   * @returns {*} - value return by the script
   */
  executeScript(script, event, params) {
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

module.exports = {
  Model: ScriptModel,
  Controller: ScriptController,
};

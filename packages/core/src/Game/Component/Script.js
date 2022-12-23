const { ModelComponent, ControllerComponent } = require('./Component');

const ScriptModel = class extends ModelComponent {
  constructor(json) {
    super(json);

    // Array of worldScripts id
    this.idScripts = json.idScripts || [];

    // Conf pass to scripts
    this.variables = json.variables || {};
  }

  /**
   *
   * @returns {JSON}
   */
  getVariables() {
    return this.variables;
  }

  /**
   *
   * @returns *
   */
  getIdScripts() {
    return this.idScripts;
  }
};

/**
 *
 * @param {*} parentGO
 * @param {*} json
 */
const ScriptController = class extends ControllerComponent {
  /**
   *
   * @param {*} model
   * @param {*} object3D
   */
  constructor(model, object3D, scripts) {
    super(model, object3D);
    this.scripts = scripts;
  }

  /**
   * Execute all scripts for a particular event
   *
   * @param {WorldScript.EVENT} event the event trigger
   * @param {Array} params parameters pass to scripts
   */
  execute(event, params) {
    for (const id in this.scripts) {
      this.executeScript(this.scripts[id], event, params);
    }
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

module.exports = {
  Model: ScriptModel,
  Controller: ScriptController,
};

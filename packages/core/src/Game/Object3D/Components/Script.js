const {
  Component,
  ModelComponent,
  ControllerComponent,
} = require('./Component');

const ScriptComponent = class extends Component {
  /**
   *
   * @param {ModelScript} model
   */
  constructor(model) {
    super(model);
  }
};

ScriptComponent.TYPE = 'Script';

const ScriptModel = class extends ModelComponent {
  constructor(json) {
    super(json);

    // Array of worldScripts id
    this.idScripts = json.idScripts || [];

    // Conf pass to scripts
    this.conf = json.conf || {};
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
   * Compute this to JSON
   *
   * @returns {JSON}
   */
  toJSON() {
    return {
      uuid: this.uuid,
      idScripts: this.idScripts,
      conf: this.conf,
      type: ScriptModel.TYPE,
    };
  }
};

/**
 *
 * @param {*} parentGO
 * @param {*} json
 */
const ScriptController = class extends ControllerComponent {
  constructor(model, object3D, context) {
    super(model, object3D, context);

    this.scripts = {};
    model.getIdScripts().forEach((idScript) => {
      this.scripts[idScript] = context.createInstanceOf(
        idScript,
        object3D,
        this.model.getConf()
      );
    });
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
  Component: ScriptComponent,
  Model: ScriptModel,
  Controller: ScriptController,
};

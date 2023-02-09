const { Component } = require('./Component');
const Script = require('./Script');

/**
 * ExternalScript object3D component
 *
 * @see module:ExternalScript
 */
const ExternalScriptComponent = class extends Component {};

ExternalScriptComponent.TYPE = 'ExternalScript';

/**
 * @see module:ExternalScript
 */
const ExternalScriptModel = class extends Script.Model {
  /**
   *
   * @returns {object} - export external script model to json object
   */
  toJSON() {
    return {
      uuid: this.uuid,
      idScripts: this.idScripts,
      variables: this.variables,
      type: ExternalScriptComponent.TYPE,
    };
  }
};

/**
 * `MODULE` ExternalScript
 *
 * @exports ExternalScript
 */
module.exports = {
  /** @see ExternalScriptComponent*/
  Component: ExternalScriptComponent,
  /** @see ExternalScriptModel*/
  Model: ExternalScriptModel,
};

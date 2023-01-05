const { Component } = require('./Component');
const Script = require('./Script');

/**
 * ExternalScript object3D component
 */
const ExternalScriptComponent = class extends Component {};

ExternalScriptComponent.TYPE = 'ExternalScript';

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

module.exports = {
  Component: ExternalScriptComponent,
  Model: ExternalScriptModel,
};

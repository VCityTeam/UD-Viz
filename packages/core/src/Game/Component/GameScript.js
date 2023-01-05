const { Component } = require('./Component');
const Script = require('./Script');

/**
 * GameScript object3D component
 */
const GameScriptComponent = class extends Component {};

GameScriptComponent.TYPE = 'GameScript';

const GameScriptModel = class extends Script.Model {
  /**
   *
   * @returns {object} - export gamescript model to json object
   */
  toJSON() {
    return {
      uuid: this.uuid,
      idScripts: this.idScripts,
      variables: this.variables,
      type: GameScriptComponent.TYPE,
    };
  }
};

module.exports = {
  Component: GameScriptComponent,
  Model: GameScriptModel,
};

const { Component } = require('./Component');
const Script = require('./Script');

const GameScriptComponent = class extends Component {
  constructor(model) {
    super(model);
  }
};

GameScriptComponent.TYPE = 'GameScript';

const GameScriptModel = class extends Script.Model {
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

const { Component } = require('./Component');
const Script = require('./Script');

const ExternalScriptComponent = class extends Component {
  constructor(model) {
    super(model);
  }
};

ExternalScriptComponent.TYPE = 'ExternalScript';

const ExternalScriptModel = class extends Script.Model {
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

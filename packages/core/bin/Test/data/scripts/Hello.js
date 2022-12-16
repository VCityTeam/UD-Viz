const Core = require('../../../../src/index');

module.exports = class Hello extends Core.Game.ScriptBase {
  constructor(context, object3D, conf) {
    super(context, object3D, conf);

    console.log('Hello Game from ', this.object3D.name);
  }
};

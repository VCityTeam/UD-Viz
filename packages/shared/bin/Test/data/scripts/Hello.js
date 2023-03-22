const Shared = require('../../../../src/index');

module.exports = class Hello extends Shared.Game.ScriptBase {
  constructor(context, object3D, conf) {
    super(context, object3D, conf);

    console.log('Hello Game from ', this.object3D.name);
  }

  static get CLASS_ID() {
    return 'HELLO SCRIPT ID';
  }
};

const { ScriptBase } = require('../../../src/index');

module.exports = class Hello extends ScriptBase {
  constructor(context, object3D, conf) {
    super(context, object3D, conf);

    console.log('Hello Game from ', this.object3D.name);
  }

  static get ID_SCRIPT() {
    return 'HELLO SCRIPT ID';
  }
};

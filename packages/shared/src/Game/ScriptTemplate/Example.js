const ScriptBase = require('../Context').ScriptBase;

module.exports = class Example extends ScriptBase {
  load() {
    console.log('load example');
  }
};

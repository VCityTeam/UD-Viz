const ScriptBase = require('../Context').ScriptBase;

// this class is just an example

module.exports = class Example extends ScriptBase {
  load() {
    console.log('Example script load');
  }
};

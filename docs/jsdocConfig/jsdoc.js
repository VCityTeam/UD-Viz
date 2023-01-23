const { merge } = require('webpack-merge');

const jsdocJson = {
  common: require('./jsdoc.common.json'),
  core: require('./jsdoc.core.json'),
  node: require('./jsdoc.node.json'),
  browser: require('./jsdoc.browser.json'),
  home: require('./jsdoc.home.json'),
};

let config;
switch (process.env.PACKAGE) {
  case 'browser':
    config = merge(jsdocJson.common, jsdocJson.browser);
    break;
  case 'node':
    config = merge(jsdocJson.common, jsdocJson.node);
    break;
  case 'core':
    config = merge(jsdocJson.common, jsdocJson.core);
    break;
  case 'home':
    config = merge(jsdocJson.common, jsdocJson.home);
    break;
}
console.log('PACKAGE ' + process.env.PACKAGE + ' START GENERATE DOC');
module.exports = config;

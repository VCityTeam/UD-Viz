/**
 * Merges JSDoc configuration files based on the provided PACKAGE environment variable.
 * Generates documentation configuration for different packages (browser, node, shared, home).
 *
 * @returns {object} Merged JSDoc configuration.
 */

const { merge } = require('webpack-merge');

const jsdocJson = {
  common: require('./jsdoc.common.json'),
  shared: require('./jsdoc.shared.json'),
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
  case 'shared':
    config = merge(jsdocJson.common, jsdocJson.shared);
    break;
  case 'home':
    config = merge(jsdocJson.common, jsdocJson.home);
    break;
}
console.log('PACKAGE ' + process.env.PACKAGE + ' START GENERATE DOC');
module.exports = config;

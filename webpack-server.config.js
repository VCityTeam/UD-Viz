/** @format */

/*
 * Webpack for a server side bundle:
 *  - requires env parameter: cli parameter
 */

const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = (env) => {
  return {
    target: 'node',
    externals: [nodeExternals()],
    entry: path.resolve(__dirname, 'src/' + env + '.js'),
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'examples/local_modules/' + env + ''),
      filename: '' + env + '.js',
      library: '' + env + '',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  };
};

const path = require('path');
const nodeExternals = require('webpack-node-externals');

const mode = process.env.NODE_ENV;

module.exports = () => {
  return {
    target: 'node',
    mode: mode,
    externals: [nodeExternals()],
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
      path: path.resolve(__dirname, 'dist/'),
      filename: 'udvizNode.js',
      library: 'udvizNode',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  };
};

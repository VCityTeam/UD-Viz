const path = require('path');
const nodeExternals = require('webpack-node-externals');

const mode = process.env.NODE_ENV;

let outputPath;
if (mode === 'development') {
  outputPath = path.resolve(__dirname, 'dist/' + process.env.TYPE + '/debug');
} else {
  outputPath = path.resolve(__dirname, 'dist/' + process.env.TYPE + '/release');
}

module.exports = () => {
  return {
    target: 'node',
    mode: mode,
    externals: [nodeExternals()],
    entry: path.resolve(__dirname, 'src/index.js'),
    output: {
      path: outputPath,
      filename: process.env.TYPE + '.js',
      library: 'udvizNode',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  };
};

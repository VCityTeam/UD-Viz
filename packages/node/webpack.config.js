const path = require('path');
const nodeExternals = require('webpack-node-externals');

const mode = process.env.NODE_ENV;

let entryPath;
if (process.env.TYPE === 'lib') {
  entryPath = path.resolve(__dirname, 'src/index.js');
} else {
  entryPath = path.resolve(__dirname, 'src/defaultGameThread.js');
}

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
    entry: entryPath,
    output: {
      path: outputPath,
      filename: process.env.TYPE + '.js',
      library: 'udvizNode',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
  };
};

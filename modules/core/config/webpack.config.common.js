module.exports = {
  entry: ['./src/index.js'],
  output: {
    filename: 'bundle.js',
    library: 'udvizCore',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [],
  },
  resolve: {
    modules: [
      'node_modules', // The default
      'src',
    ],
  },
};

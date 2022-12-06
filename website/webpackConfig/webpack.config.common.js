module.exports = {
  entry: ['./src/index.js'],
  output: {
    filename: 'bundle.js',
    library: 'udvizBrowser',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader', // Tells webpack how to append CSS to the DOM as a style tag.
          'css-loader', // Tells webpack how to read a CSS file.
        ],
      },
    ],
  },
  resolve: {
    modules: [
      'node_modules', // The default
      'src',
    ],
  },
};

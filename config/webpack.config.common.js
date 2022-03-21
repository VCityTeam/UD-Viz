const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'udv.js',
    library: 'udv',
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
      {
        test: /\.json$/,
        include: [path.resolve(__dirname, 'src')],
        loader: 'raw-loader',
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

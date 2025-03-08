const path = require('path');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const entry = process.env.ENTRY;
if (!entry) throw new Error('webpack: no entry point');

const result = {
  entry: entry,
  output: {
    filename: process.env.NAME + '.js',
    library: 'udviz',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [],
  },
  resolve: {
    modules: ['node_modules'],
  },
  plugins: [],
};

if (process.env.ANALYZE) {
  result.plugins.push(new BundleAnalyzerPlugin());
}

// inject css in bundle (show_room and game_browser_template are using css)
result.module.rules.push({
  test: /\.css$/,
  use: [
    'style-loader', // Tells webpack how to append CSS to the DOM as a style tag.
    'css-loader', // Tells webpack how to read a CSS file.
  ],
});

// production or development
if (process.env.NODE_ENV == 'production') {
  result.output.path = path.resolve(process.cwd(), './dist/production');
  result.mode = 'production';
} else {
  result.mode = 'development';
  result.devtool = 'source-map';
  result.output.path = path.resolve(process.cwd(), './dist/development');
}

module.exports = result;

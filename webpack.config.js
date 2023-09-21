const path = require('path');
const fs = require('fs');
const nodeExternals = require('webpack-node-externals'); // to build nodejs bundle

// go read in package folder webpack.params
const params = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), './webpack.params.json'))
);

if (!params.libraryName || !params.entry) {
  throw new Error('wrong webpack params');
}

const result = {
  entry: params.entry,
  output: {
    filename: 'bundle.js',
    library: params.libraryName,
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

// node
if (params.targetNode) {
  result.target = 'node';
  result.externals = [nodeExternals()];
}

// inject css in bundle
if (params.withCss) {
  result.module.rules.push({
    test: /\.css$/,
    use: [
      'style-loader', // Tells webpack how to append CSS to the DOM as a style tag.
      'css-loader', // Tells webpack how to read a CSS file.
    ],
  });
}

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

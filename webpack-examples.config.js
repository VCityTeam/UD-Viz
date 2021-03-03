/** @format */

/*
 * Webpack for a client side bundle:
 *  - requires env parameter: cli parameter
 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const commonConfig = require('./webpack-common.config.js');

const babelrc = fs.readFileSync(path.resolve(__dirname, '.babelrc'));
const babelConf = JSON.parse(babelrc);

module.exports = (env) => {
  return {
    entry: path.resolve(__dirname, 'src/' + env + '.js'),
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'examples/local_modules/' + env + ''),
      filename: '' + env + '.js',
      library: '' + env + '',
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          include: [path.resolve(__dirname, 'src')],
          loader: 'babel-loader',
          // Please consider modifying .babelrc too
          // .babelrc is used for transpiling src/ into lib/ in the prepublish
          // phase, see package.json
          options: babelConf,
        },
        {
          // We also want to (web)pack the style files:
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          // (web)pack "small" images
          test: /\.(png|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 100000, // Convert images < 100kb to base64 strings
                name: 'images/[hash]-[name].[ext]',
              },
            },
          ],
        },
        commonConfig.jsonLoader,
      ],
    },
  };
};

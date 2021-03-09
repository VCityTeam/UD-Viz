/** @format */

/*
 * Webpack for a client side bundle:
 *  - requires env parameter: cli parameter
 */

const fs = require('fs');
const path = require('path');

module.exports = () => {
  return {
    mode: 'development',
    entry: path.resolve(__dirname, "./src/udv.js"),
    devtool: 'source-map',
    output: {
      path: path.resolve(__dirname, 'dist/debug/'),
      filename: "udv-debug.js",
      library: "udv-debug",
      libraryTarget: 'umd',
      umdNamedDefine: true,
    },
    //TODO mettres les rules des plugins dans des fichiers de conf a part
    module: {
      rules: [
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
        {
          test: /\.json$/,
          include: [path.resolve(__dirname, 'src')],
          loader: 'raw-loader',
        },
      ],
    },
  };
};

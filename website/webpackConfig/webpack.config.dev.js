const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, '../dist/debug'),
  },
  devServer: {
    port: 8000,
    hot: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'debug.html',
    }),
  ],
};

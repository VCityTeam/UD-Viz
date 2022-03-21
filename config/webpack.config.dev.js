const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, './dist/debug'),
  },
};

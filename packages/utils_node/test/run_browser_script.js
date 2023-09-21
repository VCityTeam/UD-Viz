const { test } = require('@ud-viz/utils_node');
const path = require('path');

test
  .browserScripts(path.resolve(__dirname, './assets/browserScripts/'))
  .then(() => process.exit(0));

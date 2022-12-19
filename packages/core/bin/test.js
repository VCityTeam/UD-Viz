const NodeTester = require('@ud-viz/node').NodeTester;
const path = require('path');

const nodeTester = new NodeTester();
nodeTester.start(path.resolve('./bin/Test')).then(() => {
  console.log('@ud-viz/core test succeed');
});

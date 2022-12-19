const Test = require('@ud-viz/node').Test;
const path = require('path');

Test.scripts(path.resolve('./bin/Test')).then(() => {
  console.log('@ud-viz/core test succeed');
});

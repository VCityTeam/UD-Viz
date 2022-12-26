const Test = require('@ud-viz/node').Test;

console.log('@ud-viz/browser test start');

/**
 * ./dist/debug/bundle.js must have been builded
 */
Test.browserScripts('./bin/Test', './dist/debug/bundle.js')
  .then(() => {
    Test.html('./examples').then(() => {
      console.log('@ud-viz/browser test finished');
    });
  })
  .catch((error) => {
    console.error(error);
  });

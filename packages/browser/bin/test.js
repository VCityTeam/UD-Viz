const Test = require('@ud-viz/node').Test;

console.log('@ud-viz/browser test start');

/**
 * ./dist/debug/bundle.js must have been builded
 */
Test.browserScripts('./bin/Test', './dist/debug/bundle.js').catch((error) => {
  console.error(error);
});

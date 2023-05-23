const Test = require('@ud-viz/node').Test;

console.log('@ud-viz/browser test start');

const bundlePath =
  process.env.NODE_ENV === 'production'
    ? './dist/release/bundle.js'
    : './dist/debug/bundle.js';

/**
 * ./dist/debug/bundle.js must have been builded
 */
Test.browserScripts('./bin/Test', bundlePath).catch((error) => {
  console.error(error);
});

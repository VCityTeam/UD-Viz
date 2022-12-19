const Test = require('@ud-viz/node').Test;

console.log('@ud-viz/browser test start');
Test.browserScripts('./bin/Test', './dist/debug/bundle.js')
  .then(() => {
    console.log('@ud-viz/browser test finished');
  })
  .catch((error) => {
    console.error(error);
  });

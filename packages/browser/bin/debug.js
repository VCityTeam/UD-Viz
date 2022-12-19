const exec = require('child-process-promise').exec;
const BrowserTester = require('@ud-viz/node').BrowserTester;

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
};

exec('npm run build-debug')
  .then(printExec)
  .then(() => {
    const browserTester = new BrowserTester();
    console.log('@ud-viz/browser test start');
    browserTester
      .start('./bin/Test', './dist/debug/bundle.js')
      .then(() => {
        console.log('@ud-viz/browser test finished');
      })
      .catch((error) => {
        console.error(error);
      });
  });

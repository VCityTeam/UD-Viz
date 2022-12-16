const exec = require('child-process-promise').exec;
const Tester = require('@ud-viz/node').Tester;
const path = require('path');

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

console.log('Build @ud-viz/core debug');
exec('npm run build-debug')
  .catch((error) => {
    console.error('@ud-viz/core build ', error);
  })
  .then(printExec)
  .then(() => {
    const tester = new Tester();
    tester.start(path.resolve('./bin/Test')).then(() => {
      console.log('Build @ud-viz/core test succeed');
    });
  })
  .catch((error) => {
    console.error('@ud-viz/core test ', error);
    console.error(error);
  });

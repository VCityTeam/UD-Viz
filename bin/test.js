const exec = require('child-process-promise').exec;
const Test = require('@ud-viz/node').Test;

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

console.log('Build @ud-viz/core');
exec('npm run build-core')
  .catch((error) => {
    console.log('@ud-viz/core build failed');
    console.error(error);
    process.exit(1); //
  })
  .then(printExec)
  .then(() => {
    console.log('Build @ud-viz/browser');
    exec('npm run build-browser')
      .catch((error) => {
        console.log('@ud-viz/browser build failed');
        console.error(error);
        process.exit(1);
      })
      .then(printExec)
      .then(() => {
        console.log('Build @ud-viz/node');
        exec('npm run build-node')
          .catch((error) => {
            console.log('@ud-viz/node build failed');
            console.error(error);
            process.exit(1);
          })
          .then(printExec)
          .then(() => {
            Test.scripts('./packages/core/bin/Test').then(() => {
              Test.browserScripts(
                './packages/browser/bin/Test',
                './packages/browser/dist/release/bundle.js'
              ).then(() => {
                Test.html('./packages/browser/examples');
              });
            });
          });
      });
  });

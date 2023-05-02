const Constant = require('./Constant');

const exec = require('child-process-promise').exec;
const Test = require('@ud-viz/node').Test;

const cp = require('node:child_process');

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

console.log('Build @ud-viz/shared');
exec('npm run build-shared')
  .catch((error) => {
    console.log('@ud-viz/shared build failed');
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
            Test.scripts('./packages/shared/bin/Test').then(() => {
              Test.browserScripts(
                './packages/browser/bin/Test',
                './packages/browser/dist/release/bundle.js'
              ).then(() => {
                const fork = cp.fork(`${__dirname}/examplesBackEnd.js`);
                fork.on('message', (message) => {
                  if (message == Constant.MESSAGE.READY) {
                    console.log('Examples Back-end is ready');
                    // index.html
                    Test.html('.', Constant.DEFAULT_PORT).then(() => {
                      // examples/*.html
                      Test.html('./examples', Constant.DEFAULT_PORT).then(
                        () => {
                          fork.kill();
                          process.exit(0); // stop test process
                        }
                      );
                    });
                  }
                });
              });
            });
          });
      });
  });

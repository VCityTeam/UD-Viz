/** @file Running the build-debug script in the browser package. */

const ExpressAppWrapper = require('@ud-viz/node').ExpressAppWrapper;
const exec = require('child-process-promise').exec;

/**
 * It prints the stdout and stderr of a result object
 *
 * @param {{stdout:string,stderr:string}} result - The result of the command execution.
 */
const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
};

const app = new ExpressAppWrapper();
app
  .start({
    folder: './',
    port: 8000,
    withGameSocketService: true,
  })
  .then(() => {
    exec('npm run build-debug --prefix ./packages/browser').then(printExec);
  });

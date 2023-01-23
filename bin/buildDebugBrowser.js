/** @file Running the build-debug script in the browser package. */

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

/** Running the build-debug script in the browser package. */
exec('npm run build-debug --prefix ./packages/browser').then(printExec);

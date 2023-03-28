/** @file Running the build-debug script in the browser package. */
const exec = require('child-process-promise').exec;
const spawn = require('child_process').spawn;

/**
 * It prints the stdout and stderr of a result object
 *
 * @param {{stdout:string,stderr:string}} result - The result of the command execution.
 */
const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
};

// itowns transpile
// run a build debug browser bundle
// exec('npm run transpile --prefix ../itowns')
//   .then(printExec)
//   .then(() => {
//   });
    exec('npm run build-debug --prefix ./packages/browser').then(printExec);

const child = spawn('cross-env NODE_ENV=development node', ['./bin/host.js'], {
  shell: true,
});

child.stdout.on('data', (data) => {
  console.log(`${data}`);
});
child.stderr.on('data', (data) => {
  console.error('\x1b[31m', 'host' + ` ERROR :\n${data}`);
});

// exec('cross-env NODE_ENV=development node ./bin/host.js').then(printExec);

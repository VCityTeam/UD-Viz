const exec = require('child-process-promise').exec;
const spawn = require('child_process').spawn;

/**
 * `MODULE` Debug
 *
  @module Debug */
/**
 * Debug tools for UD-VIZ mono repository
 */
module.exports = {
  /**
   * Common routine of debug for -@ud-viz/* packages
   * First build debug bundle with an "npm run build-debug"
   * Then launch test with "node ./bin/test.js" if option withTest is true
   *
   * @param {string} packageName - name of package being debugged for log purpose
   * @param {boolean} withTest - test should be part of the routine
   */
  routine: function (packageName, withTest = true) {
    const printExec = function (result) {
      console.log('stdout: \n', result.stdout);
      console.error('stderr: \n', result.stderr);
    };

    console.log('Build debug bundle  ', packageName);
    exec('npm run build-debug')
      .catch((error) => {
        console.error(packageName + ' failed building debug bundle ', error);
      })
      .then(printExec)
      .then(() => {
        if (withTest) {
          console.log('Test ', packageName);

          const child = spawn('node', ['./bin/test.js'], {
            shell: true,
          });

          child.stdout.on('data', (data) => {
            console.log(`${data}`);
          });
          child.stderr.on('data', (data) => {
            console.error('\x1b[31m', `ERROR :${data}`);
          });
        }
      });
  },
};

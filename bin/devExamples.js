/**
 * @file This script executes build and runs the backend script.
 *
 * requires {@link https://www.npmjs.com/package/child-process-promise}
 * requires {@link https://nodejs.org/api/child_process.html}
 */

const { exec } = require('child-process-promise');
const spawn = require('child_process').spawn;

/**
 * Prints the stdout and stderr of a command execution result.
 *
 * @param {{stdout: string, stderr: string}} result - The result of the command execution.
 */
function printExec(result) {
  /**
   * Log the standard output and standard error of a command execution result.
   *
   * @function
   * @param {{stdout: string, stderr: string}} result - The result of the command execution.
   */
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
}

const runBackEnd = () => {
  /**
   * Spawn a child process to run the 'backEnd.js' script with specific settings.
   *
   * @param {string} command - The command to execute.
   * @param {string[]} args - The arguments for the command.
   * @param {object} options - The options for spawning the child process.
   */
  const child = spawn(
    'cross-env NODE_ENV=development node',
    ['./bin/backEnd.js'],
    {
      shell: true,
    }
  );

  /**
   * Log data from the child process's standard output.
   */
  child.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  /**
   * Log error data from the child process's standard error in red color.
   */
  child.stderr.on('data', (data) => {
    console.error('\x1b[31m', ` ERROR :\n${data}`);
  });
};

exec('npm run build-dev-examples').then(printExec).then(runBackEnd);

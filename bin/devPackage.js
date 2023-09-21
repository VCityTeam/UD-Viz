const exec = require('child-process-promise').exec;
const spawn = require('child_process').spawn;
const path = require('path');

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

const packageName = require(path.resolve(process.cwd(), './package.json')).name;

const noTest = process.argv[2] === 'no-test' || false;

console.log('build examples bundle  ', packageName);
exec('cd .. && npm run build-dev-examples')
  .catch((error) => {
    console.error(packageName + ' failed building examples bundle ', error);
  })
  .then(printExec)
  .then(() => {
    if (!noTest) {
      console.log('test ', packageName);

      const child = spawn(
        'cross-env NODE_ENV=development npm',
        ['run', 'test'],
        {
          shell: true,
        }
      );

      child.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
      child.stderr.on('data', (data) => {
        console.error('\x1b[31m', `ERROR :${data}`);
      });
    }
  });

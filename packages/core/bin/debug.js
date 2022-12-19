const exec = require('child-process-promise').exec;

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
  .then(
    exec('npm run test')
      .then(printExec)
      .catch((error) => {
        console.error('@ud-viz/core test ', error);
        console.error(error);
      })
  );

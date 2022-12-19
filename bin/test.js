const exec = require('child-process-promise').exec;

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

console.log('Build @ud-viz/core');
exec('npm run build-core')
  .catch((error) => {
    console.log('@ud-viz/core build failded');
    console.error(error);
    process.exit(1); //
  })
  .then(printExec)
  .then(() => {
    console.log('Build @ud-viz/browser');
    exec('npm run build-browser')
      .catch((error) => {
        console.log('@ud-viz/browser build failded');
        console.error(error);
        process.exit(1);
      })
      .then(printExec)
      .then(() => {
        console.log('Build @ud-viz/node');
        exec('npm run build-node')
          .catch((error) => {
            console.log('@ud-viz/node build failded');
            console.error(error);
            process.exit(1);
          })
          .then(printExec);
      });
  });

// should run test cmd of all packages

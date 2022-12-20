const exec = require('child-process-promise').exec;

module.exports = {
  routine: function (packageName) {
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
      .then(() => console.log('Test @ud-viz/core'))
      .then(() => {
        exec('npm run test')
          .catch((error) => {
            console.error(packageName + ' test failed', error);
          })
          .then(printExec);
      });
  },
};

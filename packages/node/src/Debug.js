const exec = require('child-process-promise').exec;

module.exports = {
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
          exec('npm run test')
            .catch((error) => {
              console.error(packageName + ' test failed', error);
            })
            .then(printExec);
        }
      });
  },
};

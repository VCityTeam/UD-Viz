const exec = require('child-process-promise').exec;
const spawn = require('child_process').spawn;

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

          const child = spawn('node', ['./bin/test.js'], {
            shell: true,
          });

          child.stdout.on('data', (data) => {
            console.log(`${data}`);
          });
          child.stderr.on('data', (data) => {
            console.error('\x1b[31m', `ERROR :${data}`);
          });

          // exec('npm run test')
          //   .catch((error) => {
          //     console.error(packageName + ' test failed', error);
          //   })
          //   .then(printExec);
        }
      });
  },
};

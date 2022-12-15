const exec = require('child-process-promise').exec;
const { spawn } = require('child_process');

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
};

exec('npm run build-debug')
  .then(printExec)
  .then(() => {
    const child = spawn('node', ['./bin/test.js'], { shell: true });
    child.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
    });
    child.stderr.on('data', (data) => {
      console.error(`child stderr:\n${data}`);
    });
    child.once('close', (error) => {
      if (error) throw '@ud-viz/core test failed';
      console.log('@ud-viz/core test success');
    });
  });

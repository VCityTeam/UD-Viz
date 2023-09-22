const fs = require('fs');
const { exec } = require('child-process-promise');

const packagesFolder = './packages';

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

const run = async () => {
  const dirents = fs.readdirSync(packagesFolder, { withFileTypes: true });

  for (let index = 0; index < dirents.length; index++) {
    const dirent = dirents[index];

    if (dirent.isDirectory()) {
      await exec(
        'cd ' + packagesFolder + '/' + dirent.name + ' && npm run test'
      )
        .then(printExec)
        .catch((error) => {
          throw error;
        });
    }
  }
};

run();

const fs = require('fs');
const exec = require('child-process-promise').exec;

const version = process.argv[2];

const subStringVersion = version.split('.');
if (subStringVersion.length != 3)
  throw new Error('Version format length error');
subStringVersion.forEach((digit) => {
  if (isNaN(digit)) {
    throw new Error('Version format digit error');
  }
});

console.log('Change ud-viz-monorepo version to ', version);

/**
 * It prints the stdout and stderr of a result object
 *
 * @param {{stdout:string,stderr:string}} result - The result of the command execution.
 */
const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
};

const changeVersionPackageJSON = function (path) {
  return new Promise((resolve) => {
    console.log(path, '[x]');
    const content = JSON.parse(fs.readFileSync(path));
    content.version = version;

    // update dependencie
    for (const key in content.dependencies) {
      if (key.startsWith('@ud-viz/')) {
        content.dependencies[key] = version;
      }
    }

    fs.writeFileSync(path, JSON.stringify(content));
    exec('npx prettier ' + path + ' -w')
      .then(printExec)
      .then(resolve);
  });
};

changeVersionPackageJSON('./packages/shared/package.json').then(() => {
  changeVersionPackageJSON('./packages/browser/package.json').then(() => {
    changeVersionPackageJSON('./packages/node/package.json').then(() => {
      changeVersionPackageJSON('./package.json').then(() => {
        exec('npm run reset')
          .then(printExec)
          .then(() => {
            exec(
              'git log | grep -v ^commit | grep -v ^Author | grep -v ^Date | grep -vi merge | grep . | head -n 150 > ./docs/static/ChangelogDiff.txt'
            )
              .then(printExec)
              .then(() => {
                console.log(
                  'PrePublish done, you have to update ./docs/static/Changelog.md with ./docs/static/ChangelogDiff.txt'
                );
              });
          });
      });
    });
  });
});

/**
 * @file Performs version management tasks within a monorepo:
 * - Updates package.json files and dependencies to the provided version
 * - Formats code with prettier
 * - Executes reset and generates changelog diffs
 * @param {string} version - The version to update to.
 */

const fs = require('fs');
const exec = require('child-process-promise').exec;

/** @type {string} The version argument provided from the command line. */
const version = process.argv[2];
if (!version) throw new Error('no version argument found');

/** @type {string[]} The version split into segments. */
const subStringVersion = version.split('.');

/** Check the provided version argument. */
if (subStringVersion.length != 3)
  throw new Error('Version format length error');
subStringVersion.forEach((digit) => {
  if (isNaN(digit)) {
    throw new Error('Version format digit error');
  }
});

console.log('Change ud-viz-monorepo version to ', version);

/**
 * Prints the stdout and stderr of a command execution result.
 *
 * @param {{stdout: string, stderr: string}} result - The result of the command execution.
 */
const printExec = function (result) {
  console.log('stdout:\n', result.stdout);
  console.log('stderr:\n', result.stderr);
};

/**
 * Updates the version number in a package.json file and updates the dependencies
 * that start with "@ud-viz/" to the same version number.
 *
 * @param {string} path - The file path to the `package.json` file to update.
 * @returns {Promise<void>} A Promise that resolves when the update is complete.
 */
const changeVersionPackageJSON = function (path) {
  return new Promise((resolve) => {
    console.log(path, '[x]');
    const content = JSON.parse(fs.readFileSync(path));
    content.version = version;

    // Update dependencies
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

// Update version and dependencies for multiple package.json files
changeVersionPackageJSON('./packages/shared/package.json').then(() => {
  changeVersionPackageJSON('./packages/browser/package.json').then(() => {
    changeVersionPackageJSON('./packages/node/package.json').then(() => {
      changeVersionPackageJSON('./package.json').then(() => {
        const commandReset = `npm run reset`;
        console.log('RUN', commandReset);

        // Execute reset command
        exec(commandReset)
          .then(printExec)
          .then(() => {
            const commandGenerateChangelog = `git describe --tags --match v* --abbrev=0 | xargs -I tag sh -c 'git log tag..HEAD --pretty=format:%s > ./docs/static/ChangelogDiff.txt'`;
            console.log('RUN', commandGenerateChangelog);

            // Generate changelog diffs
            exec(commandGenerateChangelog).then(() => {
              console.log(
                'PrePublish done, you have to update ./docs/static/Changelog.md with ./docs/static/ChangelogDiff.txt'
              );
            });
          });
      });
    });
  });
});

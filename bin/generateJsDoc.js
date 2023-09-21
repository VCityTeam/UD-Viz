const fs = require('fs');
const { computeFileFormat } = require('@ud-viz/utils_shared');
const { exec } = require('child-process-promise');

const docScriptTag = (includeScriptTag) => {
  console.info('include script tag in ./docs/static ', includeScriptTag);

  const parseDirectory = (directoryPath) => {
    const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
    dirents.forEach((dirent) => {
      if (dirent.isFile() && computeFileFormat(dirent.name) == 'md') {
        const filePath = directoryPath + '/' + dirent.name;

        // read contents of the file
        const data = fs.readFileSync(filePath, {
          encoding: 'utf-8',
        });

        if (!includeScriptTag) {
          fs.writeFileSync(
            filePath,
            data
              .replace(/<script/g, '<!-- <script')
              .replace(/script>/g, 'script> -->')
          );
        } else {
          fs.writeFileSync(
            filePath,
            data
              .replace(/<!-- <script/g, '<script')
              .replace(/script> -->/g, 'script>')
          );
        }
      } else if (dirent.isDirectory()) {
        parseDirectory(directoryPath + '/' + dirent.name); // recursive
      }
    });
  };
  parseDirectory('./docs/static');
};

const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.error('stderr: \n', result.stderr);
};

const generateDoc = () => {
  return new Promise((resolve, reject) => {
    const promises = [];

    promises.push(
      exec('jsdoc -c ./docs/jsdocConfig/jsdocHome.js').then(printExec)
    );

    // packages
    const dirents = fs.readdirSync('./packages', { withFileTypes: true });
    dirents.forEach(async (dirent) => {
      if (dirent.isDirectory()) {
        promises.push(
          exec(
            'cross-env PACKAGE=' +
              dirent.name +
              ' jsdoc -c ./docs/jsdocConfig/jsdocPackage.js'
          ).then(printExec)
        );
      }
    });

    Promise.all(promises).then(resolve).catch(reject);
  });
};

const generateArchitectureDoc = () => {
  const packages = [];
  const peerDependencies = [];
  const packagesFolder = './packages';

  const dirents = fs.readdirSync(packagesFolder, { withFileTypes: true });
  dirents.forEach((dirent) => {
    if (dirent.isDirectory()) {
      packages.push(dirent.name);

      const packageContent = JSON.parse(
        fs.readFileSync(packagesFolder + '/' + dirent.name + '/package.json')
      );

      const removeOrganizationName = (string) => {
        return string.replace('@ud-viz/', '');
      };

      const namePackage = removeOrganizationName(packageContent.name);

      for (const peerDepName in packageContent.peerDependencies) {
        if (peerDepName.startsWith('@ud-viz/')) {
          peerDependencies.push(
            namePackage + '-->' + removeOrganizationName(peerDepName)
          );
        }
      }
    }
  });

  // @ud-viz packages architecture

  const filePath = './docs/static/architecture.md';

  fs.writeFileSync(
    filePath,
    '# @ud-viz packages architecture\n\n<!-- <script src="./jsdoc-tuts-mermaid.js"></script> -->\n'
  );

  // mermaid graph generation
  [
    '```mermaid',
    'flowchart TB',
    'subgraph ud-viz/packages',
    ...packages,
    'end',
    ...peerDependencies,
  ].forEach((line) => {
    fs.appendFileSync(filePath, '\n' + line, (err) => {
      if (err) throw err;
    });
  });
};

docScriptTag(true);
generateArchitectureDoc();
generateDoc().then(() => docScriptTag(false));

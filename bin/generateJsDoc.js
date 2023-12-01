const fs = require('fs');
const { computeFileFormat } = require('@ud-viz/utils_shared');
const { exec } = require('child-process-promise');
const path = require('path');

const docScriptTag = (injectMermaidScriptTag) => {
  console.info('include script tag in ./docs/static ', injectMermaidScriptTag);

  const SCRIPT_TAG_MERMAID =
    '\n' + '<script src="../js/jsdoc-tuts-mermaid.js"></script>';

  const parseDirectory = (directoryPath) => {
    const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
    dirents.forEach((dirent) => {
      if (dirent.isFile() && computeFileFormat(dirent.name) == 'md') {
        const filePath = directoryPath + '/' + dirent.name;

        // read contents of the file
        let data = fs.readFileSync(filePath, {
          encoding: 'utf-8',
        });

        if (data.includes('```mermaid')) {
          // contains mermaid graph
          if (injectMermaidScriptTag) {
            data += SCRIPT_TAG_MERMAID;
            fs.writeFileSync(filePath, data);
          } else {
            fs.writeFileSync(
              filePath,
              data.replace(new RegExp(SCRIPT_TAG_MERMAID, 'g'), '')
            );
          }
        }
      } else if (dirent.isDirectory()) {
        parseDirectory(directoryPath + '/' + dirent.name); // recursive
      }
    });
  };
  parseDirectory('.');
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

  fs.writeFileSync(filePath, '# @ud-viz packages architecture\n\n');

  // mermaid graph generation
  [
    '```mermaid',
    'flowchart TB',
    'subgraph ud-viz/packages',
    ...packages,
    'end',
    ...peerDependencies,
    '```',
    '>This file is auto generated',
  ].forEach((line) => {
    fs.appendFileSync(filePath, '\n' + line, (err) => {
      if (err) throw err;
    });
  });
};

const generatePackagesArchitectureDoc = async () => {
  const packagesFolderPath = path.resolve(__dirname, '../packages');

  fs.readdirSync(packagesFolderPath).forEach(async (packageName) => {
    const packagePath = path.join(packagesFolderPath, packageName);
    const lstat = fs.lstatSync(packagePath);
    const isDirectory = lstat.isDirectory();

    if (!isDirectory) {
      return;
    }

    const autoMermaidCommand = `node ${packagesFolderPath}/utils_node/bin/autoMermaid.js -e ${packagePath}/src -o ${packagePath}/architecture.md`;

    const result = await exec(autoMermaidCommand);

    console.log(result.stdout);
    console.error(result.stderr);
  });
};

generatePackagesArchitectureDoc();

generateArchitectureDoc();
// docScriptTag(true);
// generateDoc().then(() => docScriptTag(false));

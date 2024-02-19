const fs = require('fs');
const { computeFileFormat } = require('@ud-viz/utils_shared');
const { exec } = require('child-process-promise');

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

docScriptTag(true);
generateDoc().then(() => docScriptTag(false));

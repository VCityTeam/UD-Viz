const fs = require('fs');
const { Data } = require('@ud-viz/shared');

const commentScriptTag = process.argv[2] == 'include';

const parseDirectory = (directoryPath) => {
  const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
  dirents.forEach((dirent) => {
    if (dirent.isFile() && Data.computeFileFormat(dirent.name) == 'md') {
      const filePath = directoryPath + '/' + dirent.name;

      const contentMd = fs.readFileSync(filePath, {
        encoding: 'utf-8',
      });

      console.log(filePath);
    } else if (dirent.isDirectory()) {
      parseDirectory(directoryPath + '/' + dirent.name); // recursive
    }
  });
};

console.log(`\nComment script tag: ${commentScriptTag}\n`);
parseDirectory('./docs/static');

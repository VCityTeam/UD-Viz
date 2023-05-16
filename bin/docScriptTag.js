/** @file If first argument is `include` script tag are uncommented if nothing is passed script tag are commented */

const fs = require('fs');
const { Data } = require('@ud-viz/shared');

const includeScriptTag = process.argv[2] == 'include';

const parseDirectory = (directoryPath) => {
  const dirents = fs.readdirSync(directoryPath, { withFileTypes: true });
  dirents.forEach((dirent) => {
    if (dirent.isFile() && Data.computeFileFormat(dirent.name) == 'md') {
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

console.log(`\nInclude script tag: ${includeScriptTag}\n`);
parseDirectory('./docs/static');

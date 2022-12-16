const fs = require('fs');
const spawn = require('child_process').spawn;

const Tester = class {
  constructor() {}

  test(folderPath, file) {
    return new Promise((resolve, reject) => {
      const pathFile = folderPath + '/' + file.name;

      const child = spawn('node', [pathFile], {
        shell: true,
      });

      child.stdout.on('data', (data) => {
        console.log(file.name + ` :\n${data}`);
      });
      child.stderr.on('data', (data) => {
        console.error('\x1b[31m', file.name + ` ERROR :\n${data}`);
      });

      child.on('close', (error) => {
        if (error) {
          console.log(file.name, ' failed');
          reject(error);
          return;
        }
        console.log(file.name, ' succeed');
        resolve();
      });
    });
  }

  start(folderPath) {
    return new Promise((resolve) => {
      fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
        if (!files.length) return;

        let index = 0;

        const process = async (file) => {
          if (file.isFile()) {
            await this.test(folderPath, file);
          }

          if (files.length >= index) {
            index++;
            process(files[index]);
          } else {
            resolve();
          }
        };

        try {
          process(files[0]);
        } catch (error) {
          throw new Error(error);
        }
      });
    });
  }
};

module.exports = Tester;

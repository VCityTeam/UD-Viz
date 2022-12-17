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

        const process = async () => {
          const file = files[index];

          if (!file) console.log(index, files);

          if (file.isFile()) {
            await this.test(folderPath, file);
          }

          if (index < files.length - 1) {
            index++;
            process();
          } else {
            resolve();
          }
        };

        try {
          process();
        } catch (error) {
          throw new Error(error);
        }
      });
    });
  }
};

module.exports = Tester;

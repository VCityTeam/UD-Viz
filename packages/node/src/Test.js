const puppeteer = require('puppeteer');
const HttpServer = require('./Templates/HttpServer');
const fs = require('fs');
const spawn = require('child_process').spawn;

/**
 *
 * @param {*} testFolderPath
 * @param {*} bundlePath
 * @returns
 */
const browserScripts = function (testFolderPath, bundlePath) {
  return new Promise((resolve, reject) => {
    // start a server
    const serverPort = 8000;
    const httpServer = new HttpServer();
    httpServer
      .start({ folder: './', port: serverPort })
      .then(async () => {
        fs.readdir(
          testFolderPath,
          { withFileTypes: true },
          async (err, files) => {
            if (err) {
              reject(err);
              return;
            }

            if (files.length) {
              // launch a headless browser
              const browser = await puppeteer.launch({
                headless: true,
                args: [
                  '--disable-gpu',
                  '--disable-dev-shm-usage',
                  '--disable-setuid-sandbox',
                  '--no-first-run',
                  '--no-sandbox',
                  '--no-zygote',
                  '--deterministic-fetch',
                  '--disable-features=IsolateOrigins',
                  '--disable-site-isolation-trials',
                  // '--single-process', => avoid random Target Close
                ],
              });
              // console.log('browser opened');

              let index = 0;

              const process = async () => {
                const currentFile = files[index];
                if (currentFile.isFile()) {
                  // console.log(currentFile.name + ' start test');

                  // open a new page
                  const page = await browser.newPage();

                  // console log of the page are print in console.log of this process
                  page.on('console', async (msg) => {
                    const msgArgs = msg.args();
                    for (let i = 0; i < msgArgs.length; ++i) {
                      console.log(
                        currentFile.name + ': ' + (await msgArgs[i].jsonValue())
                      );
                    }
                  });

                  // page connect to server
                  await page.goto('http://localhost:' + serverPort);
                  // console.log(currentFile.name, ' connect to server');
                  // import bundle.js
                  await page.evaluate(fs.readFileSync(bundlePath, 'utf8'));
                  // console.log(currentFile.name, ' has imported bundle');
                  // test script
                  await page.evaluate(
                    eval(
                      fs.readFileSync(
                        testFolderPath + '/' + currentFile.name,
                        'utf8'
                      )
                    )
                  );

                  console.log(currentFile.name, ' succeed');
                  // close
                  await page.close();

                  // console.log(currentFile.name, ' close page');
                }

                if (index < files.length - 1) {
                  index++;
                  await process();
                }
              };

              await process();

              await browser.close();
              // console.log('browser closed');
            }

            httpServer.stop();
            resolve();
          }
        );
      })
      .catch(reject);
  });
};

/**
 *
 * @param {*} folderPath
 * @returns
 */
const scripts = function (folderPath) {
  return new Promise((resolve) => {
    const test = function (folderPath, file) {
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
    };

    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
      if (!files.length) return;

      let index = 0;

      const process = async () => {
        const file = files[index];

        if (!file) console.log(index, files);

        if (file.isFile()) {
          await test(folderPath, file);
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
};

module.exports = {
  scripts: scripts,
  browserScripts: browserScripts,
};

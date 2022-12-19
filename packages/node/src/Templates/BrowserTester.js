const puppeteer = require('puppeteer');
const HttpServer = require('./HttpServer');
const fs = require('fs');

module.exports = class BrowserTester {
  constructor() {}

  start(testFolderPath, bundlePath) {
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
                const browser = await puppeteer.launch();
                console.log('browser opened');

                let index = 0;

                const process = async () => {
                  const currentFile = files[index];
                  if (currentFile.isFile()) {
                    console.log(currentFile.name + ' start test');

                    // open a new page
                    const page = await browser.newPage();

                    // console log of the page are print in console.log of this process
                    page.on('console', async (msg) => {
                      const msgArgs = msg.args();
                      for (let i = 0; i < msgArgs.length; ++i) {
                        console.log(
                          currentFile.name +
                            ': ' +
                            (await msgArgs[i].jsonValue())
                        );
                      }
                    });

                    // page connect to server
                    await page.goto('http://localhost:' + serverPort);
                    console.log(currentFile.name, ' connect to server');
                    // import bundle.js
                    await page.evaluate(fs.readFileSync(bundlePath, 'utf8'));
                    console.log(currentFile.name, ' has imported bundle');
                    // test script
                    await page.evaluate(
                      eval(
                        fs.readFileSync(
                          testFolderPath + '/' + currentFile.name,
                          'utf8'
                        )
                      )
                    );

                    console.log(currentFile.name, ' has passed test');
                    // close
                    await page.close();

                    console.log(currentFile.name, ' close page');
                  }

                  if (index < files.length - 1) {
                    index++;
                    await process();
                  }
                };

                await process();

                await browser.close();
                console.log('browser closed');
              }

              resolve();
            }
          );
        })
        .catch(reject);
    });
  }
};

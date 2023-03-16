const puppeteer = require('puppeteer');
const fs = require('fs');
const spawn = require('child_process').spawn;
const { PendingXHR } = require('pending-xhr-puppeteer');

/**
 * `MODULE` Test
 *
 * @module Test
 */

/**
 * Test browser scripts by opening a new page on a puppeteer browser and evaluating the script, script should have a structure like below
 *
 * @example () => {
 *  return new Promise((resolve)=>{
 *    //do test
 *    resolve(); // test succeed
 *  }};
 * @param {string} testFolderPath - path of the folder where scripts belong
 * @param {string} bundlePath - path of the bundle needed for scripts to work
 * @todo goto necessary ?
 * @returns {Promise} - promise resolving when test have passed
 */
const browserScripts = function (testFolderPath, bundlePath) {
  return folderInBrowserPage(testFolderPath, async (page, currentFile) => {
    console.log('\n\nstart testing script ', currentFile.name);

    // import bundle.js
    await page.evaluate(fs.readFileSync(bundlePath, 'utf8'));
    // console.log(currentFile.name, ' has imported bundle');
    // test script
    await page.evaluate(
      eval(fs.readFileSync(testFolderPath + '/' + currentFile.name, 'utf8'))
    ); // without the eval here console.log are not catch

    console.log(currentFile.name, ' test succeed');
  });
};

/**
 * Test scripts by spawning them and waiting the process to exit, script should have a structure like below
 *
 * @example
 * //do test
 * process.exit(0);// test succeed
 * @param {string} folderPath - path of the folder where scripts belong
 * @returns {Promise} - a promise resolving when test have passed
 */
const scripts = function (folderPath) {
  return new Promise((resolve) => {
    const test = function (folderPath, file) {
      return new Promise((resolveTest, rejectTest) => {
        const pathFile = folderPath + '/' + file.name;

        const child = spawn('node', [pathFile], {
          shell: true,
        });

        child.stdout.on('data', (data) => {
          console.log(`${data}`);
        });
        child.stderr.on('data', (data) => {
          console.error('\x1b[31m', file.name + ` ERROR :\n${data}`);
        });

        child.on('close', (error) => {
          if (error) {
            console.log(file.name, ' failed');
            rejectTest(error);
            return;
          }
          console.log(file.name, ' succeed');
          resolveTest();
        });
      });
    };

    fs.readdir(folderPath, { withFileTypes: true }, (err, files) => {
      if (!files || !files.length) return;

      let index = 0;

      const process = async () => {
        const file = files[index];

        if (!file) console.log(index, files);

        if (file.isFile()) {
          console.log('\n\n' + file.name, ' start');
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

/**
 * Open html files in a page of a puppeteer browser in order to catch error
 *
 * @param {string} folderPath - path of the folder where html files belong
 * @param {number} port - port of the server http listening
 * @returns {Promise} - promise resolving when test have passed
 */
const html = function (folderPath, port) {
  return folderInBrowserPage(folderPath, (page, currentFile) => {
    // check if file is an html file
    const indexLastPoint = currentFile.name.lastIndexOf('.');
    const fileFormat = currentFile.name.slice(indexLastPoint + 1);
    if (fileFormat != 'html') return Promise.resolve();

    return new Promise((resolve) => {
      console.log('\n\nSTART TESTING', currentFile.name);

      const pendingXHR = new PendingXHR(page);

      const intervalLog = setInterval(() => {
        console.log(pendingXHR.pendingXhrCount(), ' PENDING XHR');
      }, 5000);

      // page connect to html file
      page
        .goto(
          'http://localhost:' +
            port +
            '/' +
            folderPath +
            '/' +
            currentFile.name,
          { waitUntil: 'domcontentloaded', timeout: 30000 } // waitUntil: "networkIdle0" is not trigger when a canvas is rendering...
        )
        .then(async () => {
          console.log('PAGE CONNECTED TO ', currentFile.name);

          const waitForNewXHR = async () => {
            // this minTime Promise is to let time to async page process to generate new XHR
            const minTimePromise = new Promise((resolve) => {
              const minTimeToWaitNewAsyncXHR = 500; // 500ms
              setTimeout(resolve, minTimeToWaitNewAsyncXHR);
            });

            // code take from there => https://stackoverflow.com/questions/46160929/puppeteer-wait-for-all-images-to-load-then-take-screenshot
            console.log('wait for element in page to load');
            await page.evaluate(async () => {
              // wait images
              const selectors = Array.from(document.querySelectorAll('img'));
              await Promise.all(
                selectors.map((img) => {
                  if (img.complete) return;
                  return new Promise((resolve, reject) => {
                    img.addEventListener('load', resolve);
                    img.addEventListener('error', reject);
                  });
                })
              );

              // wait iframe
              const iframes = Array.from(document.querySelectorAll('iframe'));
              await Promise.all(
                iframes.map((iframe) => {
                  if (iframe.contentWindow.document.readyState === 'complete')
                    return;
                  return new Promise((resolve, reject) => {
                    iframe.addEventListener('load', resolve);
                    iframe.addEventListener('error', reject);
                  });
                })
              );
            });
            console.log('element loaded');

            return minTimePromise.catch((reason) => {
              throw new Error('Error while waiting new XHR ', reason);
            });
          };

          // since some request can generate other request (load a config to perform another request for example)
          // we are waiting for all current request to finish then wait new XHR and do that recursively

          const waitAllXHR = async () => {
            await pendingXHR.waitForAllXhrFinished();
            await waitForNewXHR();
            const pendingCount = pendingXHR.pendingXhrCount();
            if (pendingCount) {
              console.log('WAITING ', pendingCount, ' XHR');
              await waitAllXHR();
            }
          };

          await waitAllXHR();

          clearInterval(intervalLog);
          console.log(currentFile.name, ' test succeed');
          resolve();
        });
    });
  });
};

/**
 * @callback PageTestFile
 * @param {puppeteer.Page} page - page where the test is going to be done
 * @param {fs.Dirent} currentFile - file being tested
 * @returns {Promise} - promise resolving when test has passed
 */

/**
 *
 * @param {string} testFolderPath - path of the folder where belong files to test
 * @param {PageTestFile} pageTest - description of the test
 * @returns {Promise} - a promise resolving when test have passed
 */
const folderInBrowserPage = function (testFolderPath, pageTest) {
  return new Promise((resolve, reject) => {
    fs.readdir(testFolderPath, { withFileTypes: true }, async (err, files) => {
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
            '--disable-web-security', // allow cross request origin'
          ],
        });
        // console.log('browser opened');

        let index = 0;

        const process = async () => {
          const currentFile = files[index];
          if (currentFile.isFile()) {
            // open a new page
            const page = await browser.newPage();

            // console log of the page are print in console.log of this process
            // https://pptr.dev/api/puppeteer.pageeventobject
            page
              .on('console', (message) =>
                console.log(`${message.type().toUpperCase()} ${message.text()}`)
              )
              .on('error', ({ message }) => {
                throw new Error(currentFile.name, ' ERROR: ', message);
              })
              .on('pageerror', ({ message }) => {
                throw new Error(currentFile.name, ' ERROR: ', message);
              })
              .on('response', (response) => {
                const log = `${response.status()} ${response.url()}`;
                if (response.status() == 404) {
                  throw new Error(log);
                } else {
                  console.log(log);
                }
              })
              .on('requestfailed', (request) => {
                throw new Error(
                  `${request.failure().errorText} ${request.url()}`
                );
              });

            await pageTest(page, currentFile);

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

      resolve();
    });
  });
};

module.exports = {
  scripts: scripts,
  browserScripts: browserScripts,
  html: html,
};

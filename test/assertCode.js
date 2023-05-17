const Constant = require('../bin/Constant');
const exec = require('child-process-promise').exec;
const Test = require('@ud-viz/node').Test;
const path = require('path');
const cp = require('node:child_process');

const main = async function () {
  // Build 3 bundle packages
  // console.info('Build bundle of @ud-viz/shared');
  // const sharedBundleBuildResult = await exec('npm run build-shared');
  // console.info(sharedBundleBuildResult.stdout);

  // console.info('Build bundle of @ud-viz/browser');
  // const browserBundleBuildResult = await exec('npm run build-browser');
  // console.info(browserBundleBuildResult.stdout);

  // console.info('Build bundle of @ud-viz/node');
  // const nodeBundleBuildResult = await exec('npm run build-node');
  // console.info(nodeBundleBuildResult.stdout);

  // Packages unit test
  console.info('Unit test of @ud-viz/shared');
  const sharedUnitTestResult = await exec(
    'npm run test --prefix ./packages/shared'
  );
  console.info(sharedUnitTestResult.stdout);

  console.info('Unit test of @ud-viz/browser');
  const browserUnitTestResult = await exec(
    'npm run test --prefix ./packages/browser'
  );
  console.info(browserUnitTestResult.stdout);

  // Examples (TODO website ? => https://github.com/VCityTeam/UD-Viz/issues/648) functional test
  const backEndFork = cp.fork(
    path.resolve(__dirname, '../bin/backEndExamples.js')
  );

  // wait backend fork to be ready
  backEndFork.on('message', async (message) => {
    if (message == Constant.MESSAGE.READY) {
      console.log('Examples Back-end is ready');
      // index.html
      await Test.html('.', Constant.DEFAULT_PORT);
      await Test.html('./examples', Constant.DEFAULT_PORT);
      backEndFork.kill();
      process.exit(0); // stop test process
    }
  });
};

main();

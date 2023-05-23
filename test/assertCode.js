const Constant = require('../bin/Constant');
const exec = require('child-process-promise').exec;
const Test = require('@ud-viz/node').Test;
const path = require('path');
const cp = require('node:child_process');

const main = async function () {
  // Build 3 bundle packages
  console.info('\nBuild bundle of @ud-viz/shared');
  const sharedBundleBuildResult = await exec('npm run build-shared');
  console.info(sharedBundleBuildResult.stdout);

  console.info('\nBuild bundle of @ud-viz/browser');
  const browserBundleBuildResult = await exec('npm run build-browser');
  console.info(browserBundleBuildResult.stdout);

  console.info('\nBuild bundle of @ud-viz/node');
  const nodeBundleBuildResult = await exec('npm run build-node');
  console.info(nodeBundleBuildResult.stdout);

  // Packages unit test
  console.info('\nUnit test of @ud-viz/shared');
  const sharedUnitTestResult = await exec(
    'npm run test --prefix ./packages/shared'
  );
  console.info(sharedUnitTestResult.stdout);

  console.info('\nUnit test of @ud-viz/browser');
  const browserUnitTestResult = await exec(
    'npm run test --prefix ./packages/browser'
  );
  console.info(browserUnitTestResult.stdout);

  // Examples (TODO website ? => https://github.com/VCityTeam/UD-Viz/issues/648) functional test
  console.info('\nFunctional test of examples');
  const backEndFork = cp.fork(
    path.resolve(__dirname, '../bin/backEndExamples.js')
  );

  backEndFork.on('error', () => {
    throw new Error('backend examples error');
  });

  const runExamples = () => {
    return new Promise((resolve) => {
      backEndFork.on('message', async (message) => {
        if (message == Constant.MESSAGE.READY) {
          console.log('Examples Back-end is ready');
          // index.html
          await Test.html('.', Constant.DEFAULT_PORT);
          await Test.html('./examples', Constant.DEFAULT_PORT);
          resolve();
        }
      });
    });
  };
  await runExamples();
  backEndFork.kill();

  // game
  console.info('\nFunctional test of game tutorials');

  const gameBackEndFork = cp.fork(
    path.resolve(__dirname, './tutorials/game/multiplayerSimpleGame/backend.js')
  );

  gameBackEndFork.on('error', () => {
    throw new Error('backend game tutorial error');
  });

  const runFrontEnd = () => {
    return new Promise((resolve) => {
      gameBackEndFork.on('message', async (backEndMessage) => {
        if (backEndMessage == Constant.MESSAGE.READY) {
          // Test front end
          await Test.html('./test/tutorials/game', Constant.DEFAULT_PORT);
          resolve();
        }
      });
    });
  };

  await runFrontEnd();

  gameBackEndFork.kill();
};

main();

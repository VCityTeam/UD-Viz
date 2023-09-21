const { MESSAGE, DEFAULT_PORT } = require('../bin/constant');
const { test } = require('@ud-viz/utils_node');
const path = require('path');
const cp = require('node:child_process');
const fs = require('fs');
const { exec } = require('child-process-promise');

const main = async function () {
  // Functional test
  console.info('\nFunctional test of examples');

  // check if example bundle exists
  const bundlePath = path.resolve(
    process.cwd(),
    process.env.NODE_ENV === 'development'
      ? './dist/development/bundle.js'
      : './dist/production/bundle.js'
  );

  if (!fs.existsSync(bundlePath)) {
    console.log('build bundle ', bundlePath);
    if (process.env.NODE_ENV == 'production') {
      await exec('npm run build-examples');
    } else {
      await exec('npm run build-dev-examples');
    }
  }

  const backEndFork = cp.fork(path.resolve(__dirname, '../bin/backEnd.js'));

  backEndFork.on('error', () => {
    throw new Error('backend examples error');
  });

  const runWebsiteFrontEnd = () => {
    return new Promise((resolve) => {
      backEndFork.on('message', async (message) => {
        if (message == MESSAGE.READY) {
          console.log('Back-end is ready');
          // index.html
          await test.html('.', DEFAULT_PORT);
          await test.html('./examples', DEFAULT_PORT);
          resolve();
        }
      });
    });
  };
  await runWebsiteFrontEnd();
  backEndFork.kill();

  // game
  console.info('\nFunctional test of game tutorials');

  const gameBackEndFork = cp.fork(
    path.resolve(
      __dirname,
      './tutorials/game/game_multiplayer_backend/backend.js'
    )
  );

  gameBackEndFork.on('error', () => {
    throw new Error('backend game tutorial error');
  });

  const runTutorialsFrontEnd = () => {
    return new Promise((resolve) => {
      gameBackEndFork.on('message', async (backEndMessage) => {
        if (backEndMessage == MESSAGE.READY) {
          // test front end
          await test.html('./test/tutorials/game', DEFAULT_PORT);
          resolve();
        }
      });
    });
  };

  await runTutorialsFrontEnd();

  gameBackEndFork.kill();
};

main();

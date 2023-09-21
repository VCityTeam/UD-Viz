#!/usr/bin/env node

const { test } = require('@ud-viz/utils_node');
const path = require('path');
const fs = require('fs');
const { exec } = require('child-process-promise');

const name = require(path.resolve(process.cwd(), './package.json')).name;
const folderName = path.resolve(process.cwd(), process.argv[2]);

const bundlePath = path.resolve(
  process.cwd(),
  process.env.NODE_ENV === 'development'
    ? './dist/development/bundle.js'
    : './dist/production/bundle.js'
);

const forceBuild =
  typeof process.argv[3] == 'string' ? process.argv[3] == 'force-build' : false;

const run = async () => {
  // build bundle if there is not
  if (!fs.existsSync(bundlePath) || forceBuild) {
    console.log('build bundle ', bundlePath);
    if (process.env.NODE_ENV === 'development') {
      await exec('npm run build-dev');
    } else {
      await exec('npm run build');
    }
  }

  test
    .scripts(folderName)
    .then(() => {
      console.log(name + ' test succeed');
    })
    .catch((error) => {
      throw error;
    });
};

run();

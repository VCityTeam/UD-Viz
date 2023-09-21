const { test } = require('@ud-viz/utils_node');
const path = require('path');

const name = require(path.resolve(process.cwd(), './package.json')).name;
const folderName = path.resolve(process.cwd(), process.argv[2]);

test
  .scripts(folderName)
  .then(() => {
    console.log(name + ' test succeed');
  })
  .catch((error) => {
    throw error;
  });

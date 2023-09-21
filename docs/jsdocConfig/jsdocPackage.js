const { merge } = require('webpack-merge');
const fs = require('fs');

const commonConfig = require('./jsdoc.common.json');

// home is by default
const menu = [
  {
    title: 'udviz',
    id: 'udvizHome',
    link: '../',
  },
];

// compute menu to other packages
const dirents = fs.readdirSync('./packages', { withFileTypes: true });
dirents.forEach((dirent) => {
  if (dirent.isDirectory()) {
    menu.push({
      title: 'udviz/' + dirent.name,
      id: 'udviz/' + dirent.name,
      link: '../' + dirent.name,
    });
  }
});

const packageConfig = {
  source: {
    include: ['packages/' + process.env.PACKAGE + '/src'],
  },
  opts: {
    destination: './docs/html/' + process.env.PACKAGE,
    theme_opts: {
      title: '@ud-viz/' + process.env.PACKAGE,
      menu: menu,
    },
    readme: './packages/' + process.env.PACKAGE + '/Readme.md',
  },
};

console.log('@ud-viz/' + process.env.PACKAGE + ' START GENERATE DOC');
module.exports = merge(commonConfig, packageConfig);

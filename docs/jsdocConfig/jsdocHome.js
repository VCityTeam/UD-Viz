const { merge } = require('webpack-merge');

const fs = require('fs');

const commonConfig = require('./jsdoc.common.json');

// home is by default
const menu = [
  {
    title: 'udviz',
    id: 'udvizHome',
    link: './',
  },
];

// compute menu to other packages
const dirents = fs.readdirSync('./packages', { withFileTypes: true });
dirents.forEach((dirent) => {
  if (dirent.isDirectory()) {
    menu.push({
      title: 'udviz/' + dirent.name,
      id: 'udviz/' + dirent.name,
      link: './' + dirent.name,
    });
  }
});

const homeConfig = {
  source: {
    include: ['./bin'],
  },
  opts: {
    destination: './docs/html/',
    theme_opts: {
      title: '@ud-viz',
      menu: menu,
    },
    readme: './Readme.md',
  },
};

console.log('HOME START GENERATE DOC');
module.exports = merge(commonConfig, homeConfig);

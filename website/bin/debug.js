const { spawn } = require('child_process');
const HttpServer = require('@ud-viz/node').HttpServer;

const debugServer = new HttpServer();
debugServer
  .start({
    folder: './',
    port: 8000,
  })
  .then(() => {
    const child = spawn('nodemon', [
      '--trace-warnings',
      '--verbose',
      '--watch',
      'src',
      '--watch',
      '../packages/browser/src',
      '--watch',
      './assets/html',
      '--delay',
      '2500ms',
      './bin/debugRoutine.js',
      '-e',
      'js,css,html',
    ]);
    child.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
    });
    child.stderr.on('data', (data) => {
      console.error(`child stderr:\n${data}`);
    });
  });

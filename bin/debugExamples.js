const { spawn } = require('child_process');
const ExpressAppWrapper = require('@ud-viz/node').ExpressAppWrapper;

const app = new ExpressAppWrapper();
app
  .start({
    folder: './',
    port: 8000,
  })
  .then(() => {
    const child = spawn(
      'nodemon',
      [
        '--trace-warnings',
        '--verbose',
        '--watch',
        './packages/core/src',
        '--watch',
        './packages/browser/src',
        '--delay',
        '2500ms',
        './bin/buildDebugBrowser.js',
        '-e',
        'js,css,html',
      ],
      { shell: true }
    );
    child.stdout.on('data', (data) => {
      console.log(`child stdout:\n${data}`);
    });
    child.stderr.on('data', (data) => {
      console.error(`child stderr:\n${data}`);
    });
  });

/** @file Running the build-debug script in the browser package. */

const ExpressAppWrapper = require('@ud-viz/node').ExpressAppWrapper;
const app = new ExpressAppWrapper();
app
  .start({
    folder: './',
    port: 8000,
    withGameSocketService: true,
  })
  .then(() => {
    const app = new ExpressAppWrapper();
    app.start({
      folder: './',
      port: 8000,
    });
  });

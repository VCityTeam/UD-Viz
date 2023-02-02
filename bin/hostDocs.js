const ExpressAppWrapper = require('@ud-viz/node').ExpressAppWrapper;

const app = new ExpressAppWrapper();
app.start({
  folder: './docs/',
  port: 8001,
});

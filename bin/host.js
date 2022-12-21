const ExpressAppWrapper = require('@ud-viz/node').ExpressAppWrapper;

const app = new ExpressAppWrapper();
app.start({
  folder: './',
  port: 8000,
});

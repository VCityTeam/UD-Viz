const HttpServer = require('@ud-viz/node').HttpServer;

const debugServer = new HttpServer();
debugServer.start({
  folder: './',
  port: 8000,
});

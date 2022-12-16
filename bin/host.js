const HttpServer = require('@ud-viz/node').HttpServer;

const httpServer = new HttpServer();
httpServer.start({
  folder: './',
  port: 8000,
});

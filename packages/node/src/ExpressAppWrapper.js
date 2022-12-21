const express = require('express');

const HttpServer = class {
  constructor() {
    this.server = null;
  }

  stop() {
    this.server.close();
    console.log('Server stop');
  }

  start(config) {
    return new Promise((resolve, reject) => {
      const app = express();
      // Serve
      app.use(express.static(config.folder)); // What folder is served

      // http server
      this.server = app.listen(config.port, function (err) {
        if (err) {
          console.error('Server does not start');
          reject();
          return;
        }
        console.log(
          'Server listening on Port',
          config.port,
          ' folder ' + config.folder
        );

        resolve();
      });
    });
  }
};

module.exports = HttpServer;

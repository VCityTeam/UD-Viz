const express = require('express');

const ExpressAppWrapper = class {
  constructor() {
    this.httpServer = null;
  }

  stop() {
    this.httpServer.close();
    console.log('Server stop');
  }

  start(config) {
    return new Promise((resolve, reject) => {
      const app = express();
      // Serve
      app.use(express.static(config.folder)); // What folder is served

      // when a client connect to config.folder
      // response of app is 200 OK https://developer.mozilla.org/fr/docs/Web/HTTP/Status/200
      // then response is send to client
      app.get('', (req, res) => {
        res.status(200).send();
      });

      // listen
      this.httpServer = app.listen(config.port, function (err) {
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

module.exports = ExpressAppWrapper;

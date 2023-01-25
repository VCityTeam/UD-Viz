const express = require('express');
const http = require('http'); // just for doc
const { stringReplace } = require('string-replace-middleware');

const NODE_ENV = process.env.NODE_ENV || 'development';

const ExpressAppWrapper = class {
  /**
   * Wrapper of an express app
   */
  constructor() {
    /**
     * a node http server
     *
      @type {http.Server}  */
    this.httpServer = null;
  }

  /**
   * Close http server
   */
  stop() {
    this.httpServer.close();
    console.log('Server stop');
  }

  /**
   * Start http server to listen on a certain port
   *
   * @param {object} config - object to configure express app
   * @param {string} config.folder - path of the folder to serve
   * @param {number} config.port - port on which server should listen
   * @returns {Promise} - promise resolving when server is listening
   */
  start(config) {
    return new Promise((resolve, reject) => {
      const app = express();

      app.use(
        stringReplace(
          {
            RUN_MODE: NODE_ENV === 'production' ? 'release' : 'debug',
          },
          {
            contentTypeFilterRegexp: /text\/html/,
          }
        )
      );

      // Serve
      app.use(express.static(config.folder)); // What folder is served

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

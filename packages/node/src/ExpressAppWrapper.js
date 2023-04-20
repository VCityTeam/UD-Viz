const express = require('express');
const http = require('http'); // just for doc
const udvizVersion = require('@ud-viz/node/package.json').version;
const reload = require('reload');

const NODE_ENV = process.env.NODE_ENV || 'development';

// not working
// let pathStringReplace =
//   'string-replace-middleware/dist/string-replace-middleware.cjs.';
// if (NODE_ENV === 'development') {
//   pathStringReplace += 'development.js';
// } else {
//   pathStringReplace += 'production.min.js';
// }

const {
  stringReplace,
} = require('string-replace-middleware/dist/string-replace-middleware.cjs.development.js'); // import a commonjs version of string replace

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
   * Close http server + stop gamesocketservice if one
   *
   */
  stop() {
    this.httpServer.close();
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

      const runMode = NODE_ENV === 'production' ? 'release' : 'debug';

      console.log('ExpressAppWrapper start on mode', runMode);

      app.use(
        stringReplace(
          {
            RUN_MODE: runMode,
          },
          {
            contentTypeFilterRegexp: /text\/html/,
          }
        )
      );

      app.use(
        stringReplace(
          {
            UDVIZ_VERSION: udvizVersion,
          },
          {
            contentTypeFilterRegexp: /text\/html/,
          }
        )
      );

      // Serve
      if (config.folder) app.use(express.static(config.folder)); // What folder is served

      /**
       * @typedef {object} ReloadOpts
       * @property {number} port default 9856
       * @property {object} httpsOption default null
       * @property {number} httpServerOrPort default port
       * @property {boolean} forceWss default false
       * @property {boolean} verboseLogging default false
       * @property {boolean} webSocketServerWaitStart default false
       * @property {string} route default '/reload/reload.js'
       */

      /** @type {ReloadOpts} */
      const reloadOpts = config.reloadOpts || {};

      // listen

      /* Start an HTTP server with Express 
      `reload` package is used  to enable live reloading of the server when changes are made to the code.*/
      reload(app, reloadOpts).then(() => {
        this.httpServer = app.listen(config.port, (err) => {
          if (err) {
            console.error('Server does not start');
            reject();
            return;
          }
          console.log(
            'Http server listening on port',
            config.port,
            'folder ' + config.folder
          );

          resolve();
        });
      });
    });
  }
};

module.exports = ExpressAppWrapper;

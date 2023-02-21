const express = require('express');
const http = require('http'); // just for doc
const udvizVersion = require('@ud-viz/node/package.json').version;
const Shared = require('@ud-viz/shared');
const Game = require('./Game/Game');
const path = require('path');

const NODE_ENV = process.env.NODE_ENV || 'development';

const {
  stringReplace,
} = require('string-replace-middleware/dist/string-replace-middleware.cjs.' +
  NODE_ENV +
  '.js'); // import a commonjs version of string replace

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

    /**
     * @type {Game.SocketService|null}
     */
    this.gameSocketService = null;
  }

  /**
   * Close http server + stop gamesocketservice if one
   *
   * @returns {Promise} - a promise resolving when express app wrapper has closed all its related process
   */
  stop() {
    let result = Promise.resolve();

    if (this.gameSocketService) {
      // if there is a gamesocket service promise returned is resolved when all thread have been closed
      result = this.gameSocketService.stop();
    }
    this.httpServer.close();

    return result;
  }

  /**
   * Start http server to listen on a certain port
   *
   * @param {object} config - object to configure express app
   * @param {string} config.folder - path of the folder to serve
   * @param {number} config.port - port on which server should listen
   * @param {boolean} [config.withDefaultGameSocketService=false] - initialize a gamesocketservice
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
      app.use(express.static(config.folder)); // What folder is served

      // listen
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

        if (config.withDefaultGameSocketService) {
          // initialize a default game socket service

          this.gameSocketService = new Game.SocketService(this.httpServer);

          const gameManagerScriptPath = path.resolve(
            __dirname,
            './Game/ScriptTemplate/GameManager.js'
          );

          this.gameSocketService.initializeGameThreads(
            {
              NativeCommandManager:
                'package:@ud-viz/shared/src/Game/ScriptTemplate/NativeCommandManager.js',
              GameManager: 'file:' + gameManagerScriptPath,
            },
            [
              new Shared.Game.Object3D({
                name: 'Note Game',
                static: true,
                components: {
                  GameScript: {
                    idScripts: ['GameManager', 'NativeCommandManager'],
                  },
                  ExternalScript: {
                    idScripts: ['NoteUI', 'CameraManager'],
                  },
                },
              }),
            ]
          );

          console.log('Default GameSocketService initialized');
        }

        resolve();
      });
    });
  }
};

module.exports = ExpressAppWrapper;

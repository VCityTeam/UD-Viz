/**
 * @file Sets up an Express backend server for examples, serving static files,
 * replacing HTML strings, and enabling a game socket service.
 * The behavior adapts based on the environment mode (NODE_ENV) inject in process.env with cross-env package.
 * See {@link https://nodejs.org/api/process.html#processenv-env}, {@link https://www.npmjs.com/package/cross-env}
 *
 * requires {@link https://www.npmjs.com/package/@ud-viz/game_node}
 * requires {@link https://www.npmjs.com/package/@ud-viz/utils_shared}
 * requires {@link https://www.npmjs.com/package/reload}
 * requires {@link https://www.npmjs.com/package/string-replace-middleware}
 */

const udvizVersion = require('../package.json').version;

const path = require('path');
const { MESSAGE, RELOAD_PORT, DEFAULT_PORT } = require('./constant');
const reload = require('reload');
const { stringReplace } = require('string-replace-middleware');
const express = require('express');
const { SocketService } = require('@ud-viz/game_node');
const {
  NoteManager,
  DomElement3DCubeManager,
} = require('@ud-viz/game_node_template');
const { Object3D } = require('@ud-viz/game_shared');
const {
  NativeCommandManager,
  constant,
} = require('@ud-viz/game_shared_template');

/**
 * The environment mode.
 *
 * @type {string}
 */
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('Back-end starting in', NODE_ENV, 'mode');

/**
 * Express application instance.
 *
 * @type {object}
 */
const app = new express();

// Apply string replacements for different values in HTML responses
app.use(
  stringReplace(
    {
      RUN_MODE: NODE_ENV,
    },
    {
      contentTypeFilterRegexp: /text\/html/,
    }
  )
);

app.use(
  stringReplace(
    {
      SCRIPT_TAG_RELOAD:
        NODE_ENV == 'development'
          ? '<script src="/reload/reload.js"></script>'
          : '',
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

// Serve static files
app.use(express.static(path.resolve(__dirname, '../')));

/**
 * The HTTP server instance.
 *
 * @type {object}
 */
const httpServer = app.listen(DEFAULT_PORT, (err) => {
  if (err) {
    console.error('Server could not start');
    return;
  }
  console.log('Http server listening on port', DEFAULT_PORT);
});

// Initialize examples game socket service
const gameSocketService = new SocketService(httpServer);
gameSocketService
  .loadGameThreads(
    [
      // Define the game thread
      new Object3D({
        name: 'Note game',
        static: true,
        components: {
          GameScript: {
            idScripts: [NoteManager.ID_SCRIPT, NativeCommandManager.ID_SCRIPT],
          },
          ExternalScript: {
            idScripts: [
              constant.ID_SCRIPT.NOTE_UI,
              constant.ID_SCRIPT.CAMERA_MANAGER,
            ],
          },
        },
      }),
      new Object3D({
        uuid: 'dom_element_3d_cube_game_uuid',
        name: 'Avatar jitsi game',
        static: true,
        components: {
          GameScript: {
            idScripts: [
              DomElement3DCubeManager.ID_SCRIPT,
              NativeCommandManager.ID_SCRIPT,
            ],
            variables: {
              idRenderData: 'cube',
              domElement3D: {
                position: { x: 0, y: 0.52, z: 0.5 },
                rotation: { x: Math.PI * 0.5, y: Math.PI, z: 0 },
                scale: { x: 1, y: 1, z: 1 },
              },
              defaultSpeedTranslate: 0.5,
              defaultSpeedRotate: 0.001,
            },
          },
          ExternalScript: {
            idScripts: [],
          },
        },
      }),
    ],
    './bin/gameThreadChild.js'
  )
  .then(() => {
    console.log('Game SocketService initialized');
    // Notify parent process if possible
    if (process.send) {
      process.send(MESSAGE.READY);
    }
    reload(app, { port: RELOAD_PORT });
  });

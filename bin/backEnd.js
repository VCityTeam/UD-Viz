/**
 * @file Sets up an Express backend server for examples, serving static files,
 * replacing HTML strings, and enabling a game socket service.
 * The behavior adapts based on the environment mode (NODE_ENV) inject in procosss.env with cross-env package.
 * See {@link https://nodejs.org/api/process.html#processenv-env}, {@link https://www.npmjs.com/package/cross-env}
 *
 * requires {@link https://www.npmjs.com/package/@ud-viz/node}
 * requires {@link https://www.npmjs.com/package/@ud-viz/shared}
 * requires {@link https://www.npmjs.com/package/reload}
 * requires {@link https://www.npmjs.com/package/string-replace-middleware}
 */

const udvizNode = require('@ud-viz/node');
const udvizVersion = require('../package.json').version;
const { Game } = require('@ud-viz/shared');
const Constant = require('./Constant');
const reload = require('reload');
const { stringReplace } = require('string-replace-middleware');

/**
 * The environment mode.
 *
 * @type {string}
 */
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * The runtime mode determined by the environment.
 *
 * @type {string}
 */
const runMode = NODE_ENV === 'production' ? 'release' : 'debug';

console.log('Back-end starting in', runMode, 'mode');

/**
 * Express application instance.
 *
 * @type {object}
 */
const app = new udvizNode.express();

// Apply string replacements for different values in HTML responses
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
      SCRIPT_TAG_RELOAD:
        runMode == 'debug' ? '<script src="/reload/reload.js"></script>' : '',
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
app.use(udvizNode.express.static('./'));

/**
 * The HTTP server instance.
 *
 * @type {object}
 */
const httpServer = app.listen(Constant.DEFAULT_PORT, (err) => {
  if (err) {
    console.error('Server could not start');
    return;
  }
  console.log('Http server listening on port', Constant.DEFAULT_PORT);
});

// Initialize examples game socket service
const gameSocketService = new udvizNode.Game.SocketService(httpServer);
gameSocketService
  .loadGameThreads(
    [
      // Define the game thread
      new Game.Object3D({
        name: 'Note Game',
        static: true,
        components: {
          GameScript: {
            idScripts: [
              udvizNode.Game.ScriptTemplate.NoteGameManager.ID_SCRIPT,
              Game.ScriptTemplate.NativeCommandManager.ID_SCRIPT,
            ],
          },
          ExternalScript: {
            idScripts: [
              Game.ScriptTemplate.Constants.ID_SCRIPT.NoteUI,
              Game.ScriptTemplate.Constants.ID_SCRIPT.CameraManager,
            ],
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
      process.send(Constant.MESSAGE.READY);
    }
    reload(app, { port: Constant.RELOAD_PORT });
  });

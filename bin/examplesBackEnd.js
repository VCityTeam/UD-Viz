/** @file main examples backend */

const udvizNode = require('@ud-viz/node');
const udvizVersion = require('../package.json').version;
const { Game } = require('@ud-viz/shared');
const Constant = require('./Constant');
const reload = require('reload');
const { stringReplace } = require('string-replace-middleware');

// run an express app wrapper with a gamesocket service
const NODE_ENV = process.env.NODE_ENV || 'development';
const runMode = NODE_ENV === 'production' ? 'release' : 'debug';

console.log('Examples server start on mode', runMode);

const app = new udvizNode.express();
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

app.use(udvizNode.express.static('./'));

const httpServer = app.listen(Constant.DEFAULT_PORT, (err) => {
  if (err) {
    console.error('Server does not start');
    return;
  }
  console.log('Http server listening on port', Constant.DEFAULT_PORT);
});

// initialize examples game socket service
const gameSocketService = new udvizNode.Game.SocketService(httpServer);
gameSocketService
  .loadGameThreads(
    [
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
    './bin/examplesGameThreadChild.js'
  )
  .then(() => {
    console.log('Examples Game SocketService initialized');
    // if can send message to parent notify it
    if (process.send) {
      process.send(Constant.MESSAGE.READY);
    }
    reload(app, { port: Constant.RELOAD_PORT });
  });

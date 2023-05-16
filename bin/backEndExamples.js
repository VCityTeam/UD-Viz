/** @file main examples backend */

const udvizNode = require('@ud-viz/node');
const udvizVersion = require('../package.json').version;
const { Game } = require('@ud-viz/shared');
const Constant = require('./Constant');
const reload = require('reload');
const { stringReplace } = require('string-replace-middleware');
const fs = require('fs');
const path = require('path');
const exec = require('child-process-promise').exec;

// run an express app wrapper with a gamesocket service
const NODE_ENV = process.env.NODE_ENV || 'development';
const runMode = NODE_ENV === 'production' ? 'release' : 'debug';

console.log('Examples back-end start on mode', runMode);

const app = new udvizNode.express();

// if the backend is run in debug mode the json editor end point is activated
if (runMode == 'debug') {
  app.use(udvizNode.express.json()); // for application/json => fill req.body

  app.post('/save_config_editor', function (req, res) {
    try {
      const relativeConfigPath = req.body.path.slice(1); // remove the `.` from path
      const savedContent = req.body.content;

      const absoluteConfigPath = path.resolve(
        __dirname,
        '../examples' + relativeConfigPath
      );

      // save file
      fs.writeFileSync(absoluteConfigPath, JSON.stringify(savedContent));

      // format file
      exec('npx prettier ' + absoluteConfigPath + ' -w');
    } catch (e) {
      console.error(e);
    }
  });
}

// if this is runMode == debug some debug content is injected in .html see debugContent.html
const debugContent = fs.readFileSync(
  path.resolve(__dirname, './debugContent.html'),
  {
    encoding: 'utf-8',
  }
);

app.use(
  stringReplace(
    {
      DEBUG_CONTENT: runMode == 'debug' ? debugContent : '',
    },
    {
      contentTypeFilterRegexp: /text\/html/,
    }
  )
);

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
    './bin/gameThreadChildExamples.js'
  )
  .then(() => {
    console.log('Examples Game SocketService initialized');
    // if can send message to parent notify it
    if (process.send) {
      process.send(Constant.MESSAGE.READY);
    }
    reload(app, { port: Constant.RELOAD_PORT });
  });

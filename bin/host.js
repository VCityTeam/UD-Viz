/** @file Running the default host script */

const udvizNode = require('@ud-viz/node');
const { Game } = require('@ud-viz/shared');
const exec = require('child-process-promise').exec;
const Constant = require('./Constant');

/**
 * It prints the stdout and stderr of a result object
 *
 * @param {{stdout:string,stderr:string}} result - The result of the command execution.
 */
const printExec = function (result) {
  console.log('stdout: \n', result.stdout);
  console.log('stderr: \n', result.stderr);
};

// run an express app wrapper with a gamesocket service
const app = new udvizNode.ExpressAppWrapper();
app
  .start({
    folder: './',
    port: Constant.DEFAULT_PORT,
  })
  .then(() => {
    // initialize a default game socket service
    const gameSocketService = new udvizNode.Game.SocketService(app.httpServer);

    // build default thread bundle
    exec('npm run build-default-thread --prefix ./packages/node')
      .then(printExec)
      .then(() => {
        gameSocketService.initializeGameThreads(
          [
            new Game.Object3D({
              name: 'Note Game',
              static: true,
              components: {
                GameScript: {
                  idScripts: ['NoteGameManager', 'NativeCommandManager'],
                },
                ExternalScript: {
                  idScripts: ['NoteUI', 'CameraManager'],
                },
              },
            }),
          ],
          './packages/node/dist/default_thread/release/default_thread.js'
        );

        console.log('Default GameSocketService initialized');

        // if can send message to parent notify it
        if (process.send) {
          process.send(Constant.MESSAGE.READY);
          console.log('Host is ready');
        }
      });
  });

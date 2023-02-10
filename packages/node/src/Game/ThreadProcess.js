const path = require('path');
const workerThreads = require('worker_threads');
const { Data, Game, ProcessInterval, Command } = require('@ud-viz/shared');
const Thread = require('./Thread');

if (workerThreads.isMainThread) {
  throw new Error('Its not a worker');
}

const parentPort = workerThreads.parentPort;
/** @type {Game.Context} - thread game context */
let gameContext = null;
let commands = null;
const gameScriptClass = {};

parentPort.on('message', (int32ArrayMessage) => {
  const objectMessage = Data.int32ArrayToObject(int32ArrayMessage);
  const data = objectMessage[Thread.KEY.DATA];
  switch (objectMessage[Thread.KEY.TYPE]) {
    case Thread.EVENT.INIT:
      // import gamescript class
      for (const key in data.gameScriptsPath) {
        const classPath = data.gameScriptsPath[key];
        const indexFirstDoublePoint = classPath.indexOf(':');
        const type = classPath.slice(0, indexFirstDoublePoint);
        const realPath = classPath.slice(
          indexFirstDoublePoint + 1,
          classPath.length
        );

        switch (type) {
          case 'file':
            gameScriptClass[key] = require(path.resolve(realPath));
            break;
          case 'package':
            gameScriptClass[key] = require(realPath);
            break;
          default:
            console.error(
              'Wrong type path, your path should be file:path/to/your/file or package:name_package/path/to/your/file'
            );
        }
      }

      gameContext = new Game.Context(
        gameScriptClass,
        new Game.Object3D(data.gameObject3D)
      );

      gameContext.load().then(() => {
        const process = new ProcessInterval({ fps: 60 });
        process.start((dt) => {
          // simulation
          gameContext.step(dt);
          const currentState = gameContext.toState(false); // false because no need to send component already controlled
          // post state to main thread
          const message = {};
          message[Thread.KEY.TYPE] = Thread.EVENT.CURRENT_STATE;
          message[Thread.KEY.DATA] = currentState.toJSON();
          parentPort.postMessage(Data.objectToInt32Array(message));
        });

        console.log(
          'Thread process ',
          gameContext.object3D.name,
          ' initialized'
        );
      });
      break;
    case Thread.EVENT.COMMANDS:
      commands = [];
      data.forEach(function (c) {
        commands.push(new Command(c));
      });
      gameContext.onCommands(commands);
      break;
    case Thread.EVENT.ADD_OBJECT3D:
      gameContext.addObject3D(data.object3D, data.parentUUID);
      break;
    case Thread.EVENT.ON_NEW_SOCKET_WRAPPER:
      gameContext.dispatch(Thread.EVENT.ON_NEW_SOCKET_WRAPPER, data);
      break;
    case Thread.EVENT.ON_SOCKET_WRAPPER_REMOVE:
      gameContext.dispatch(Thread.EVENT.ON_SOCKET_WRAPPER_REMOVE, data);
      break;
    case Thread.EVENT.STOP:
      console.log(gameContext.object3D.name, ' stop');
      process.exit(0);
      break; // mandatory to respect the rules of the linter
    default:
      console.warn(objectMessage, ' not handle');
  }
});

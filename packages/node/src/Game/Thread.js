const workerThreads = require('worker_threads');
const {
  Data,
  Game,
  ProcessInterval,
  Command,
  Constant,
} = require('@ud-viz/core');
const path = require('path');

const EVENT_KEY = 0;
const DATA_KEY = 1;

const Thread = class {
  constructor(path) {
    this.worker = new workerThreads.Worker(path);

    /** @type {Object<string,Function>} */
    this.callbacks = {};

    /** @type {Array} - current socket wrapper connected in thread */
    this.socketWrappers = [];

    // listen
    this.worker.on('message', (int32ArrayMessage) => {
      const objectMessage = Data.int32ArrayToObject(int32ArrayMessage);
      if (this.callbacks[objectMessage[EVENT_KEY]]) {
        this.callbacks[objectMessage[EVENT_KEY]](objectMessage[DATA_KEY]);
      }
    });
  }

  addSocketWrapper(socketWrapper) {
    this.socketWrappers.push(socketWrapper);
    this.post(Thread.EVENT.ON_NEW_SOCKET_WRAPPER, socketWrapper.socket.id);

    // reset commands link
    socketWrapper.socket.removeAllListeners(
      Constant.WEBSOCKET.MSG_TYPE.COMMANDS
    );
    socketWrapper.socket.on(
      Constant.WEBSOCKET.MSG_TYPE.COMMANDS,
      (commands) => {
        this.post(Thread.EVENT.COMMANDS, commands);
      }
    );
  }

  // parent thread => child thread
  post(msgType, data) {
    const object = {};
    object[EVENT_KEY] = msgType;
    object[DATA_KEY] = data;
    this.worker.postMessage(Data.objectToInt32Array(object));
  }

  // register callback from child thread => parent thread
  on(msgType, callback) {
    this.callbacks[msgType] = callback;
  }

  static Routine() {
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
      const data = objectMessage[DATA_KEY];
      switch (objectMessage[EVENT_KEY]) {
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
              message[EVENT_KEY] = Thread.EVENT.CURRENT_STATE;
              message[DATA_KEY] = currentState.toJSON();
              parentPort.postMessage(Data.objectToInt32Array(message));
            });
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
  }
};

Thread.EVENT = {
  // parent => child
  INIT: 'init',
  COMMANDS: 'commands',
  ADD_OBJECT3D: 'add_object3D',
  ON_NEW_SOCKET_WRAPPER: 'on_new_socket_wrapper',
  ON_SOCKET_WRAPPER_REMOVE: 'on_socket_wrapper_remove',
  STOP: 'stop',
  // child => parent
  CURRENT_STATE: 'current_state',
};

module.exports = Thread;

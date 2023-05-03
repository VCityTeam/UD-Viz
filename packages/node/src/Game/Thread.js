const workerThreads = require('worker_threads');
const {
  Data,
  Constant,
  Game,
  ProcessInterval,
  Command,
} = require('@ud-viz/shared');
const SocketWrapper = require('./SocketWrapper');
const THREE = require('three');

/**
 * Different Event between Parent and Child
 */
const EVENT = {
  // parent => child
  INIT: 'init',
  COMMANDS: 'commands',
  ADD_OBJECT3D: 'add_object3D',
  REMOVE_OBJECT3D: 'remove_object3D',
  ON_NEW_SOCKET_WRAPPER: 'on_new_socket_wrapper',
  ON_SOCKET_WRAPPER_REMOVE: 'on_socket_wrapper_remove',
  // child => parent
  CURRENT_STATE: 'current_state',
  APPLY_RESOLVE: 'apply_resolve',
};

/**
 * Event message structure
 */
const KEY = {
  DATA: 0,
  TYPE: 1,
  APPLY_UUID: 2, // mean parent is waiting an answer from child to resolve apply promise
};

/**
 * @classdesc - {@link workerThreads} wrapper, different event can be send/receive by the thread
 */
const Parent = class {
  /**
   * Manage communication between socket wrapper and worker thread
   *
   * @param {string} threadProcessPath - path to the thread process
   */
  constructor(threadProcessPath) {
    /**
     *  worker
     * 
     @type {workerThreads.Worker}*/

    console.log('start thread @ ', threadProcessPath);
    this.worker = new workerThreads.Worker(threadProcessPath);

    /** @type {Object<string,Function>} */
    this.callbacks = {};

    /**  
     * current socket wrapper connected in thread
     * 
    @type {Array<SocketWrapper>}*/
    this.socketWrappers = [];

    /** @type {Object<string,Function>} */
    this._resolveApply = {};

    // listen
    this.worker.on('message', (int32ArrayMessage) => {
      const objectMessage = Data.int32ArrayToObject(int32ArrayMessage);
      if (this.callbacks[objectMessage[KEY.TYPE]]) {
        this.callbacks[objectMessage[KEY.TYPE]](objectMessage[KEY.DATA]);
      }
    });

    // wait resolve signal from child thread
    this.on(EVENT.APPLY_RESOLVE, (applyUUID) => {
      const resolve = this._resolveApply[applyUUID];
      if (!resolve) throw new Error('no resolve for ', applyUUID);
      resolve();
      delete this._resolveApply[applyUUID];
    });
  }

  /**
   * Add a socket wrapper in this thread
   *
   * @param {SocketWrapper} socketWrapper - socket wrapper to add
   */
  addSocketWrapper(socketWrapper) {
    this.socketWrappers.push(socketWrapper);
    this.post(EVENT.ON_NEW_SOCKET_WRAPPER, socketWrapper.socket.id);

    // reset last state of socket wrapper
    socketWrapper.lastStateSend = null;

    // reset commands link
    socketWrapper.socket.removeAllListeners(
      Constant.WEBSOCKET.MSG_TYPE.COMMANDS
    );
    socketWrapper.socket.on(
      Constant.WEBSOCKET.MSG_TYPE.COMMANDS,
      (commands) => {
        this.post(EVENT.COMMANDS, commands);
      }
    );
  }

  /**
   *
   * @param {SocketWrapper} socketWrapper - socket wrapper to remove
   * @returns {boolean} - true if removed
   */
  removeSocketWrapper(socketWrapper) {
    const index = this.socketWrappers.indexOf(socketWrapper);
    if (index >= 0) this.socketWrappers.splice(index, 1);
    this.post(EVENT.ON_SOCKET_WRAPPER_REMOVE, socketWrapper.socket.id);
    socketWrapper.socket.removeAllListeners(
      Constant.WEBSOCKET.MSG_TYPE.COMMANDS
    );

    return index >= 0;
  }

  /**
   * Send Message to child thread
   *
   * @param {string} msgType - message type
   * @param {object} data - seriablizable data
   */
  post(msgType, data) {
    const object = {};
    object[KEY.TYPE] = msgType;
    object[KEY.DATA] = data;
    this.worker.postMessage(Data.objectToInt32Array(object));
  }

  /**
   * Receive message from child thread
   *
   * @param {string} msgType - message type
   * @param {Function} callback - callback to apply
   */
  on(msgType, callback) {
    this.callbacks[msgType] = callback;
  }

  /**
   * Same as `this.post` but return a promise resolving when thread child has applied message
   *
   *
   * @param {string} msgType - message type
   * @param {object} data - seriablizable data
   * @returns {Promise} - promise resolving when thread child has applied message
   */
  apply(msgType, data) {
    return new Promise((resolve) => {
      const object = {};
      object[KEY.TYPE] = msgType;
      object[KEY.DATA] = data;
      const applyUUID = THREE.MathUtils.generateUUID();
      object[KEY.APPLY_UUID] = applyUUID;
      this.worker.postMessage(Data.objectToInt32Array(object));

      this._resolveApply[applyUUID] = resolve;
    });
  }
};

/** Code below is used in the thread child */

/**
 * Run child process which can be summarize as so:
 * Listen {@link EVENT} of the parent and wait the gameobject
 * When gameobject is received launch a {@link Game.Context} and step it over time
 * Resolve {@link Child} so an user can customize this process with its own event
 *
 * @param {Object<string,Function>} gameScriptClass - class needs by object3D
 * @returns {Promise} - a promise resolving when game context is initialized and returning {@link Child}
 */
function runChildProcess(gameScriptClass = {}) {
  return new Promise((resolve) => {
    if (workerThreads.isMainThread) {
      throw new Error('Its not a worker');
    }

    const parentPort = workerThreads.parentPort;

    const threadChild = new Child(parentPort);

    /** @type {Game.Context} */
    let gameContext = null;
    let commands = null;

    parentPort.on('message', (int32ArrayMessage) => {
      const objectMessage = Data.int32ArrayToObject(int32ArrayMessage);
      const data = objectMessage[KEY.DATA];
      const applyUUID = objectMessage[KEY.APPLY_UUID];
      const promises = [];

      // dispatch for custom event & record promise associated for apply resolve
      promises.push(threadChild.dispatch(objectMessage[KEY.TYPE], data));

      switch (objectMessage[KEY.TYPE]) {
        case EVENT.INIT:
          gameContext = new Game.Context(
            gameScriptClass,
            new Game.Object3D(data.gameObject3D)
          );

          // init is not sync record promise
          promises.push(
            gameContext.load().then(() => {
              const process = new ProcessInterval({ fps: 60 });
              process.start((dt) => {
                // simulation
                gameContext.step(dt);
                const currentState = gameContext.toState(false); // false because no need to send component already controlled
                // post state to main thread
                const message = {};
                message[KEY.TYPE] = EVENT.CURRENT_STATE;
                message[KEY.DATA] = currentState.toJSON();
                parentPort.postMessage(Data.objectToInt32Array(message));
              });

              console.log(
                'Child process ',
                gameContext.object3D.name,
                ' initialized',
                gameContext.object3D.uuid
              );

              threadChild.initGameContext(gameContext);

              resolve(threadChild);
            })
          );
          break;
        case EVENT.COMMANDS:
          commands = [];
          data.forEach(function (c) {
            commands.push(new Command(c));
          });
          gameContext.onCommands(commands);
          break;
        case EVENT.ADD_OBJECT3D:
          // add is not sync record in promises for apply
          promises.push(
            gameContext.addObject3D(
              new Game.Object3D(data.object3D),
              data.parentUUID
            )
          );
          break;
        case EVENT.REMOVE_OBJECT3D:
          gameContext.removeObject3D(data);
          break;
        case EVENT.ON_NEW_SOCKET_WRAPPER:
          gameContext.dispatch(EVENT.ON_NEW_SOCKET_WRAPPER, data);
          break;
        case EVENT.ON_SOCKET_WRAPPER_REMOVE:
          gameContext.dispatch(EVENT.ON_SOCKET_WRAPPER_REMOVE, data);
          break;
        default:
          console.warn(objectMessage[KEY.TYPE], ' not handle natively');
      }

      if (applyUUID) {
        Promise.all(promises).then(() => {
          const applyResolveMessage = {};
          applyResolveMessage[KEY.TYPE] = EVENT.APPLY_RESOLVE;
          applyResolveMessage[KEY.DATA] = applyUUID;
          parentPort.postMessage(Data.objectToInt32Array(applyResolveMessage));
        });
      }
    });
  });
}

/**
 * @class class containing parentPort and a gameContext of a child thread {@link Child}
 * most of the time you want to use the method `on` to trigger event
 */
class Child {
  /**
   *
   * @param {workerThreads.MessagePort} parentPort - parent port of this thread
   */
  constructor(parentPort) {
    /** @type {Game.Context} */
    this.gameContext = null;

    /** @type {workerThreads.MessagePort} */
    this.parentPort = parentPort;

    /** @type {Object<string,Promise>} */
    this.promises = {};
  }

  /**
   *
   * @param {Game.Context} value - game context of thread
   */
  initGameContext(value) {
    this.gameContext = value;
  }

  /**
   * @callback PromiseListener
   * @param {*} params
   * @returns {Promise}
   */

  /**
   * Add a listener to parent thread message
   *
   * @param {string} eventID - event id
   * @param {PromiseListener|undefined} promise - callback return a promise or nothing
   */
  on(eventID, promise) {
    for (const event in Parent.EVENT) {
      if (EVENT[event] === eventID) {
        throw new Error('native Thread event');
      }
    }

    this.promises[eventID] = promise;
  }

  /**
   *
   * @param {string} eventID - event to notify listener of
   * @param {object} data - serializable data
   * @returns {Promise} - promise resolving when event has finished
   */
  dispatch(eventID, data) {
    if (this.promises[eventID]) {
      return this.promises[eventID](data);
    }
    return Promise.resolve();
  }
}

module.exports = {
  Parent: Parent,
  Child: Child,
  runChildProcess: runChildProcess,
  EVENT: EVENT,
  KEY: KEY,
};

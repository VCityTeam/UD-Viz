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
const MESSAGE_EVENT = {
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

const CHILD_EVENT = {
  ON_GAME_CONTEXT_LOADED: 'on_game_context_loaded',
};

/**
 * Event message structure
 */
const MESSAGE_KEY = {
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
    if (!workerThreads.isMainThread) {
      throw new Error('Its not the main thread');
    }
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
      if (this.callbacks[objectMessage[MESSAGE_KEY.TYPE]]) {
        this.callbacks[objectMessage[MESSAGE_KEY.TYPE]](
          objectMessage[MESSAGE_KEY.DATA]
        );
      }
    });

    // wait resolve signal from child thread
    this.on(MESSAGE_EVENT.APPLY_RESOLVE, (applyUUID) => {
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
    this.post(MESSAGE_EVENT.ON_NEW_SOCKET_WRAPPER, socketWrapper.socket.id);

    // reset last state of socket wrapper
    socketWrapper.lastStateSend = null;

    // reset commands link
    socketWrapper.socket.removeAllListeners(
      Constant.WEBSOCKET.MSG_TYPE.COMMANDS
    );
    socketWrapper.socket.on(
      Constant.WEBSOCKET.MSG_TYPE.COMMANDS,
      (commands) => {
        this.post(MESSAGE_EVENT.COMMANDS, commands);
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
    this.post(MESSAGE_EVENT.ON_SOCKET_WRAPPER_REMOVE, socketWrapper.socket.id);
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
    object[MESSAGE_KEY.TYPE] = msgType;
    object[MESSAGE_KEY.DATA] = data;
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
      object[MESSAGE_KEY.TYPE] = msgType;
      object[MESSAGE_KEY.DATA] = data;
      const applyUUID = THREE.MathUtils.generateUUID();
      object[MESSAGE_KEY.APPLY_UUID] = applyUUID;
      this.worker.postMessage(Data.objectToInt32Array(object));

      this._resolveApply[applyUUID] = resolve;
    });
  }
};

/**
 * @class class containing parentPort and a gameContext of a child thread {@link Child}
 * most of the time you want to use the method `on` to trigger event
 */
class Child {
  constructor() {
    if (workerThreads.isMainThread) {
      throw new Error('Its not a worker');
    }

    /** @type {Game.Context} */
    this.gameContext = null;

    /** @type {Object<string,Promise>} */
    this.promises = {};
  }

  /**
   * Run child process which can be summarize as so:
   * Listen {@link EVENT} of the parent and wait the gameobject
   * When gameobject is received launch a {@link Game.Context} and step it over time
   *
   * @param {Object<string,Function>} gameScriptClass - class needs by object3D
   */
  start(gameScriptClass = {}) {
    // buffer
    let commands = null;

    workerThreads.parentPort.on('message', (int32ArrayMessage) => {
      const objectMessage = Data.int32ArrayToObject(int32ArrayMessage);
      const data = objectMessage[MESSAGE_KEY.DATA];
      const applyUUID = objectMessage[MESSAGE_KEY.APPLY_UUID];
      const promises = [];

      // dispatch for custom event & record promise associated for apply resolve
      promises.push(this.dispatch(objectMessage[MESSAGE_KEY.TYPE], data));

      switch (objectMessage[MESSAGE_KEY.TYPE]) {
        case MESSAGE_EVENT.INIT:
          this.gameContext = new Game.Context(
            gameScriptClass,
            new Game.Object3D(data.gameObject3D)
          );

          // init is not sync record promise
          promises.push(
            this.gameContext.load().then(() => {
              const process = new ProcessInterval({ fps: 60 });
              process.start((dt) => {
                // simulation
                this.gameContext.step(dt);
                const currentState = this.gameContext.toState(false); // false because no need to send component already controlled
                // post state to main thread
                const message = {};
                message[MESSAGE_KEY.TYPE] = MESSAGE_EVENT.CURRENT_STATE;
                message[MESSAGE_KEY.DATA] = currentState.toJSON();
                workerThreads.parentPort.postMessage(
                  Data.objectToInt32Array(message)
                );
              });

              console.log(
                'Child process ',
                this.gameContext.object3D.name,
                ' initialized',
                this.gameContext.object3D.uuid
              );

              this.dispatch(
                CHILD_EVENT.ON_GAME_CONTEXT_LOADED,
                this.gameContext
              );
            })
          );
          break;
        case MESSAGE_EVENT.COMMANDS:
          commands = [];
          data.forEach(function (c) {
            commands.push(new Command(c));
          });
          this.gameContext.onCommands(commands);
          break;
        case MESSAGE_EVENT.ADD_OBJECT3D:
          // add is not sync record in promises for apply
          promises.push(
            this.gameContext.addObject3D(
              new Game.Object3D(data.object3D),
              data.parentUUID
            )
          );
          break;
        case MESSAGE_EVENT.REMOVE_OBJECT3D:
          this.gameContext.removeObject3D(data);
          break;
        case MESSAGE_EVENT.ON_NEW_SOCKET_WRAPPER:
          this.gameContext.dispatch(MESSAGE_EVENT.ON_NEW_SOCKET_WRAPPER, data);
          break;
        case MESSAGE_EVENT.ON_SOCKET_WRAPPER_REMOVE:
          this.gameContext.dispatch(
            MESSAGE_EVENT.ON_SOCKET_WRAPPER_REMOVE,
            data
          );
          break;
        default:
          console.warn(objectMessage[MESSAGE_KEY.TYPE], ' not handle natively');
      }

      if (applyUUID) {
        Promise.all(promises).then(() => {
          const applyResolveMessage = {};
          applyResolveMessage[MESSAGE_KEY.TYPE] = MESSAGE_EVENT.APPLY_RESOLVE;
          applyResolveMessage[MESSAGE_KEY.DATA] = applyUUID;
          workerThreads.parentPort.postMessage(
            Data.objectToInt32Array(applyResolveMessage)
          );
        });
      }
    });
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
  MESSAGE_EVENT: MESSAGE_EVENT,
  MESSAGE_KEY: MESSAGE_KEY,
  CHILD_EVENT: CHILD_EVENT,
};

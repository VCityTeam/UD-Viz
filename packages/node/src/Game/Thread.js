const workerThreads = require('worker_threads');
const { Data, Constant } = require('@ud-viz/shared');
const SocketWrapper = require('./SocketWrapper');

/**
 * @classdesc - {@link workerThreads} wrapper, different event can be send/receive by the thread
 */
const Thread = class {
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

    this.worker = new workerThreads.Worker(threadProcessPath);

    /** @type {Object<string,Function>} */
    this.callbacks = {};

    /**  
     * current socket wrapper connected in thread
     * 
    @type {Array<SocketWrapper>}*/
    this.socketWrappers = [];

    // listen
    this.worker.on('message', (int32ArrayMessage) => {
      const objectMessage = Data.int32ArrayToObject(int32ArrayMessage);
      if (this.callbacks[objectMessage[Thread.KEY.TYPE]]) {
        this.callbacks[objectMessage[Thread.KEY.TYPE]](
          objectMessage[Thread.KEY.DATA]
        );
      }
    });
  }

  /**
   * Add a socket wrapper in this thread
   *
   * @param {SocketWrapper} socketWrapper - socket wrapper to add
   */
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

  /**
   * Send Message to child thread
   *
   * @param {string} msgType - message type
   * @param {object} data - seriablizable data
   */
  post(msgType, data) {
    const object = {};
    object[Thread.KEY.TYPE] = msgType;
    object[Thread.KEY.DATA] = data;
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
};

/**
 * Different Event between Thread and workerThread.Worker
 */
Thread.EVENT = {
  // parent => child
  INIT: 'init',
  COMMANDS: 'commands',
  ADD_OBJECT3D: 'add_object3D',
  ON_NEW_SOCKET_WRAPPER: 'on_new_socket_wrapper',
  ON_SOCKET_WRAPPER_REMOVE: 'on_socket_wrapper_remove',
  // child => parent
  CURRENT_STATE: 'current_state',
};

/**
 * Message structure
 */
Thread.KEY = {
  DATA: 0,
  TYPE: 1,
};

module.exports = Thread;

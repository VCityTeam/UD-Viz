const workerThreads = require('worker_threads');
const { Data, Game, ProcessInterval, Command } = require('@ud-viz/shared');
const Thread = require('./Thread');

/**
 *
 * @param {Object<string,Function>} gameScriptClass - class needs by object3D
 * @returns {Promise} - a promise resolving when game context is initialized and returning thread context {@link ThreadContext}
 */
module.exports = function routine(gameScriptClass = {}) {
  return new Promise((resolve) => {
    if (workerThreads.isMainThread) {
      throw new Error('Its not a worker');
    }

    const parentPort = workerThreads.parentPort;

    const threadContext = new ThreadContext(parentPort);

    /** @type {Game.Context} */
    let gameContext = null;
    let commands = null;

    parentPort.on('message', (int32ArrayMessage) => {
      const objectMessage = Data.int32ArrayToObject(int32ArrayMessage);
      const data = objectMessage[Thread.KEY.DATA];
      const applyUUID = objectMessage[Thread.KEY.APPLY_UUID];
      const promises = [];

      // dispatch for custom event & record promise associated for apply resolve
      promises.push(
        threadContext.dispatch(objectMessage[Thread.KEY.TYPE], data)
      );

      switch (objectMessage[Thread.KEY.TYPE]) {
        case Thread.EVENT.INIT:
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
                message[Thread.KEY.TYPE] = Thread.EVENT.CURRENT_STATE;
                message[Thread.KEY.DATA] = currentState.toJSON();
                parentPort.postMessage(Data.objectToInt32Array(message));
              });

              console.log(
                'Thread process ',
                gameContext.object3D.name,
                ' initialized',
                gameContext.object3D.uuid
              );

              threadContext.initGameContext(gameContext);

              resolve(threadContext);
            })
          );
          break;
        case Thread.EVENT.COMMANDS:
          commands = [];
          data.forEach(function (c) {
            commands.push(new Command(c));
          });
          gameContext.onCommands(commands);
          break;
        case Thread.EVENT.ADD_OBJECT3D:
          // add is not sync record in promises for apply
          promises.push(
            gameContext.addObject3D(
              new Game.Object3D(data.object3D),
              data.parentUUID
            )
          );
          break;
        case Thread.EVENT.REMOVE_OBJECT3D:
          gameContext.removeObject3D(data);
          break;
        case Thread.EVENT.ON_NEW_SOCKET_WRAPPER:
          gameContext.dispatch(Thread.EVENT.ON_NEW_SOCKET_WRAPPER, data);
          break;
        case Thread.EVENT.ON_SOCKET_WRAPPER_REMOVE:
          gameContext.dispatch(Thread.EVENT.ON_SOCKET_WRAPPER_REMOVE, data);
          break;
        default:
          console.warn(objectMessage[Thread.KEY.TYPE], ' not handle natively');
      }

      if (applyUUID) {
        Promise.all(promises).then(() => {
          console.log(objectMessage[Thread.KEY.TYPE], ' applied');
          const applyResolveMessage = {};
          applyResolveMessage[Thread.KEY.TYPE] = Thread.EVENT.APPLY_RESOLVE;
          applyResolveMessage[Thread.KEY.DATA] = applyUUID;
          parentPort.postMessage(Data.objectToInt32Array(applyResolveMessage));
        });
      }
    });
  });
};

/**
 * @class class containing all information to manipulate a worker thread
 */
class ThreadContext {
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
    for (const event in Thread.EVENT) {
      if (Thread.EVENT[event] === eventID) {
        throw new Error('native ThreadProcess event');
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

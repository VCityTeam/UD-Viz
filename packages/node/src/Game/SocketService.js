const socketio = require('socket.io');
const { Game, Constant } = require('@ud-viz/shared');
const Thread = require('./Thread');
const SocketWrapper = require('./SocketWrapper');
const GameThread = require('./Thread');

/**
 * @callback SocketConnectionCallback
 * @param {socketio.Socket} socket
 */

/**
 * @callback SocketReadyForGameCallback
 * @param {socketio.Socket} socket
 * @param {Thread} thread
 */

/**
 * @classdesc Websocket game service, create threads to simulate gameobject + socket
 */
const SocketService = class {
  /**
   *
   * @param {import('http').Server} httpServer - http server
   * @param {object} options - options
   * @param {number} [options.pingInterval=2000] - ping interval of the socket connection in ms
   * @param {number} [options.pingTimeout=5000] - ping timeout in ms
   * @param {Array<SocketConnectionCallback>} [options.socketConnectionCallbacks=[]] - callback to apply when socket is connected
   * @param {Array<SocketReadyForGameCallback>} [options.socketReadyForGameCallbacks=[]] - callback to apply when socket is ready for game
   */
  constructor(httpServer, options = {}) {
    /**
     * @type {socketio.Server}
     */
    this.io = new socketio.Server(httpServer, {
      pingInterval: options.pingInterval || 2000,
      pingTimeout: options.pingTimeout || 5000,
    });

    /** @type {Array<SocketConnectionCallback>} */
    this.socketConnectionCallbacks = options.socketConnectionCallbacks || [];

    /** @type {Array<SocketReadyForGameCallback>} */
    this.socketReadyForGameCallbacks =
      options.socketReadyForGameCallbacks || [];

    this.io.on('connection', this.onSocketConnection.bind(this));

    /**
     *  threads running a gamecontext
     *  
     @type {Object<string,GameThread>} */
    this.threads = {};

    /** 
     * socket wrappers currently connected
     * 
     @type {Object<string,SocketWrapper>}  */
    this.socketWrappers = {};
  }

  /**
   * Stop threads + disconnect socket client + close websocket connection
   *
   * @returns {Promise} - a promise resolving when all thread have been closed
   */
  stop() {
    const promises = [];

    for (const key in this.threads) {
      const thread = this.threads[key];
      promises.push(thread.worker.terminate());
    }

    this.io.disconnectSockets();

    this.io.close();

    return Promise.all(promises);
  }

  /**
   * Launch thread running game context simulation
   *
   * @param {string[]} gameScriptsPath - class needed by game context
   * @param {Game.Object3D} gameObjects3D - gameobject3D to simulate
   * @param {string} threadProcessPath - path to the thread process
   * @param {string=} entryGameObject3DUUID - uuid of default gameobject to connect socket connected
   */
  initializeGameThreads(
    gameObjects3D,
    threadProcessPath,
    entryGameObject3DUUID
  ) {
    // default gameobject3D when socket connect
    this.entryGameObject3DUUID = entryGameObject3DUUID || gameObjects3D[0].uuid;

    gameObjects3D.forEach((gameObject3D) => {
      this.threads[gameObject3D.uuid] = new Thread(threadProcessPath);
      this.threads[gameObject3D.uuid].post(Thread.EVENT.INIT, {
        gameObject3D: gameObject3D,
      });

      this.threads[gameObject3D.uuid].on(
        Thread.EVENT.CURRENT_STATE,
        (state) => {
          this.threads[gameObject3D.uuid].socketWrappers.forEach((sW) => {
            sW.sendState(state);
          });
        }
      );
    });
  }

  /**
   *init
   * @param {socketio.Socket} socket - new socket connected to game service
   */
  onSocketConnection(socket) {
    const socketWrapper = new SocketWrapper(socket);
    this.socketWrappers[socket.id] = socketWrapper; // register

    // wait for client to be ready for game
    socket.on(Constant.WEBSOCKET.MSG_TYPE.READY_FOR_GAME, () => {
      if (!this.threads[this.entryGameObject3DUUID]) {
        console.warn('no thread');
        return;
      }

      this.threads[this.entryGameObject3DUUID].addSocketWrapper(socketWrapper);

      // apply callbacks
      this.socketReadyForGameCallbacks.forEach((c) => {
        c(socket, this.threads[this.entryGameObject3DUUID]);
      });
    });

    socket.on('disconnect', () => {
      console.log('socket', socket.id, 'disconnected');
      delete this.socketWrappers[socket.id]; // remove from current socket connected
      // remove socketwrapper in thread
      for (const key in this.threads) {
        const s = this.threads[key].socketWrappers.filter((el) => {
          if (el.socket.id == socket.id) {
            return true;
          }
        });
        if (s.length > 0) {
          if (s.length != 1)
            throw new Error('socket should only be there once');
          const index = this.threads[key].socketWrappers.indexOf(s[0]);
          this.threads[key].socketWrappers.splice(index, 1);
          this.threads[key].post(
            GameThread.EVENT.ON_SOCKET_WRAPPER_REMOVE,
            socket.id
          );
        }
      }
    });

    // apply callbacks
    this.socketConnectionCallbacks.forEach((c) => {
      c(socket);
    });
  }
};

module.exports = SocketService;

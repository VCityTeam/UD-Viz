const { Parent, MESSAGE_EVENT } = require('./thread');
const SocketWrapper = require('./SocketWrapper');

const socketio = require('socket.io');
const { Object3D, constant } = require('@ud-viz/game_shared');

/**
 * @callback SocketCallback
 * @param {SocketWrapper} socketWrapper
 */

/**
 * @callback SocketThreadCallback
 * @param {SocketWrapper} socketWrapper
 * @param {Parent} thread
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
   * @param {Array<SocketCallback>} [options.socketConnectionCallbacks=[]] - callback to apply when socket is connected
   * @param {Array<SocketCallback>} [options.socketDisconnectionCallbacks=[]] - callback to apply when socket is disconnected
   * @param {Array<SocketThreadCallback>} [options.socketReadyForGamePromises=[]] - callback to apply when socket is ready for game
   */
  constructor(httpServer, options = {}) {
    /**
     * @type {socketio.Server}
     */
    this.io = new socketio.Server(httpServer, {
      pingInterval: options.pingInterval || 2000,
      pingTimeout: options.pingTimeout || 20000, // 20sec
    });

    /** @type {Array<SocketCallback>} */
    this.socketConnectionCallbacks = options.socketConnectionCallbacks || [];

    /** @type {Array<SocketCallback>} */
    this.socketDisconnectionCallbacks =
      options.socketDisconnectionCallbacks || [];

    /** @type {Array<SocketThreadCallback>} */
    this.socketReadyForGamePromises = options.socketReadyForGamePromises || [];

    this.io.on('connection', this.onSocketConnection.bind(this));

    /**
     *  threads running a gamecontext
     *  
     @type {Object<string,Parent>} */
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
   * @param {Array<Object3D>} gameObjects3D - array of gameobject3D to simulate
   * @param {string} threadProcessPath - path to the thread process
   * @param {string=} entryGameObject3DUUID - uuid of default gameobject to connect socket connected
   * @returns {Promise} - a promises resolving when all thread have been initialized
   */
  loadGameThreads(gameObjects3D, threadProcessPath, entryGameObject3DUUID) {
    const promises = [];

    // default gameobject3D when socket connect
    this.defaultEntryGameObject3DUUID =
      entryGameObject3DUUID || gameObjects3D[0].uuid;

    gameObjects3D.forEach((gameObject3D) => {
      this.threads[gameObject3D.uuid] = new Parent(threadProcessPath);
      promises.push(
        this.threads[gameObject3D.uuid].apply(MESSAGE_EVENT.INIT, {
          gameObject3D: gameObject3D,
        })
      );

      this.threads[gameObject3D.uuid].on(
        MESSAGE_EVENT.CURRENT_STATE,
        (state) => {
          this.threads[gameObject3D.uuid].socketWrappers.forEach((sW) => {
            sW.sendState(state);
          });
        }
      );
    });

    return Promise.all(promises);
  }

  /**
   * init
   *
   * @param {socketio.Socket} socket - new socket connected to game service
   */
  onSocketConnection(socket) {
    const socketWrapper = new SocketWrapper(socket);
    this.socketWrappers[socket.id] = socketWrapper; // register

    // wait for client to be ready for game
    socket.on(
      constant.WEBSOCKET.MSG_TYPE.READY_FOR_GAME,
      (readyForGameParams) => {
        const entryGameObject3DUUID =
          readyForGameParams.entryGameObject3DUUID ||
          this.defaultEntryGameObject3DUUID;

        if (!this.threads[entryGameObject3DUUID]) {
          console.warn('no thread');
          return;
        }

        // apply promises
        const promises = [];
        this.socketReadyForGamePromises.forEach((c) => {
          const p = c(socketWrapper, entryGameObject3DUUID, readyForGameParams);
          if (p) promises.push(p);
        });

        Promise.all(promises).then(() => {
          this.threads[entryGameObject3DUUID].addSocketWrapper(socketWrapper);
        });
      }
    );

    socket.on('disconnect', () => {
      console.log('socket', socket.id, 'disconnected');
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

          this.threads[key].removeSocketWrapper(s[0]);

          this.socketDisconnectionCallbacks.forEach((c) => {
            c(s[0], this.threads[key]);
          });
        }
      }

      delete this.socketWrappers[socket.id]; // remove from current socket connected
    });

    // apply callbacks
    this.socketConnectionCallbacks.forEach((c) => {
      c(socketWrapper);
    });
  }
};

module.exports = SocketService;

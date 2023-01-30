const socketio = require('socket.io');
const { Game, Constant } = require('@ud-viz/core');
const Thread = require('./Thread');
const SocketWrapper = require('./SocketWrapper');
const GameThread = require('./Thread');

module.exports = class SocketService {
  constructor(httpServer, options = {}) {
    const io = socketio(httpServer, {
      pingInterval: options.pingInterval || 2000,
      pingTimeout: options.pingTimeout || 5000,
    });

    io.on('connection', this.onSocketConnection.bind(this));

    /** @type {Object<string,GameThread>} - threads running a gamecontext */
    this.threads = {};

    /** @type {Object<string,SocketWrapper>} - socket currently connected */
    this.socketWrappers = {};
  }

  /**
   *
   * @param {*} gameScriptClass
   * @param {Game.Object3D[]} gameObjects3D
   * @param {*} threadPath
   */
  initializeGameThreads(
    gameScriptsPath,
    gameObjects3D,
    threadPath,
    entryGameObject3DUUID
  ) {
    // default gameobject3D when socket connect
    this.entryGameObject3DUUID = entryGameObject3DUUID || gameObjects3D[0].uuid;

    gameObjects3D.forEach((gameObject3D) => {
      this.threads[gameObject3D.uuid] = new Thread(threadPath);
      this.threads[gameObject3D.uuid].post(Thread.EVENT.INIT, {
        gameScriptsPath: gameScriptsPath,
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
   *
   * @param {socketio.Socket} socket - new socket connected to game service
   */
  onSocketConnection(socket) {
    const socketWrapper = new SocketWrapper(socket);
    this.socketWrappers[socket.id] = socketWrapper; // register

    // wait for client to be ready for game
    socket.on(Constant.WEBSOCKET.MSG_TYPE.READY_FOR_GAME, () => {
      this.threads[this.entryGameObject3DUUID].addSocketWrapper(socketWrapper);
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
  }
};

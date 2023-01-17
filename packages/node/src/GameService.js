const socketio = require('socket.io');

module.exports = class GameService {
  constructor(httpServer, options = {}) {
    console.log('gameservice active');

    const io = socketio(httpServer, {
      pingInterval: options.pingInterval || 2000,
      pingTimeout: options.pingTimeout || 5000,
    });

    io.on('connection', this.onSocketConnection.bind(this));
  }

  onSocketConnection(newSocket) {
    console.log(newSocket);
  }
};

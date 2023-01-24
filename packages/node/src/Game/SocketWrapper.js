const { Constant, Game } = require('@ud-viz/core');

module.exports = class SocketWrapper {
  constructor(socket) {
    this.socket = socket;
    this.lastStateSend = null;
  }

  sendState(stateJSON) {
    const state = new Game.State(
      new Game.Object3D(stateJSON.object3D),
      stateJSON.timestamp
    );

    if (!this.lastState) {
      // there is no last state meaning it's the first time the user is notify for this game
      this.socket.emit(Constant.WEBSOCKET.MSG_TYPE.NEW_GAME, {
        state: stateJSON,
      });
    } else {
      this.socket.emit(
        Constant.WEBSOCKET.MSG_TYPE.GAME_DIFF,
        state.sub(this.lastState)
      );
    }

    this.lastState = state;
  }
};

const { constant, State, Object3D } = require('@ud-viz/game_shared');
const { objectEquals } = require('@ud-viz/utils_shared');
const { Socket } = require('socket.io');

/**
 * @classdesc - wrapper of a socket {@link Socket} + buffer of the last game state send to client (allow to send stateDiff)
 */
module.exports = class SocketWrapper {
  /**
   * Send game state to client
   *
   * @param {Socket} socket - socket to wrap
   * @param {object=} userData - user data
   */
  constructor(socket, userData = {}) {
    /**
     * socket embeded
     *  
     @type {Socket}*/
    this.socket = socket;

    /**
     *  last state send to client use to compute GameStateDiff
     * 
     @type {State|null} */
    this.lastStateSend = null;

    /** @type {object} */
    this.userData = userData;
  }

  /**
   * Send a statediff or a state to client
   *
   * @param {object} stateJSON - state serialized
   */
  sendState(stateJSON) {
    if (
      this.lastStateSend &&
      objectEquals(this.lastStateSend.object3D.toJSON(), stateJSON.object3D)
    ) {
      // TODO: not sure if this optimization is worth it
      return;
    }

    const state = new State(
      new Object3D(stateJSON.object3D),
      stateJSON.timestamp
    );

    if (!this.lastStateSend) {
      // there is no last state meaning it's the first time the user is notify for this game
      this.socket.emit(constant.WEBSOCKET.MSG_TYPE.NEW_GAME, {
        state: stateJSON,
        userData: this.userData,
      });
    } else {
      this.socket.emit(
        constant.WEBSOCKET.MSG_TYPE.GAME_DIFF,
        state.sub(this.lastStateSend)
      );
    }

    this.lastStateSend = state;
  }
};

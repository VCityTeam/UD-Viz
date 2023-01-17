import { SocketIOWrapper } from '../Component/SocketIOWrapper';

export class MultiPlayerGamePlanar {
  constructor(socketIOWrapper) {
    /** @type {SocketIOWrapper} - websocket communication */
    this.socketIOWrapper = socketIOWrapper;
  }

  start() {
    // start listening on socket events
    this.socketIOWrapper.on() 
  }
}

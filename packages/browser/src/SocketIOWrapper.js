import io from 'socket.io-client';

/** @class */
export class SocketIOWrapper {
  /**
   * Socket io client wrapper {@link https://www.npmjs.com/package/socket.io-client}, used to manage a websocket communication
   */
  constructor() {
    this.socket = null;
    this.events = {};
  }

  /**
   * Start websocket communication with window.location.host
   */
  connectToServer() {
    return new Promise((resolve, reject) => {
      // Communication protocol
      const socketProtocol = window.location.protocol.includes('https')
        ? 'wss'
        : 'ws';

      // Instantiate socket and connect to the server serving index.html
      this.socket = io(`${socketProtocol}://${window.location.host}`, {
        reconnection: false,
        secure: true,
        transports: ['polling', 'websocket'],
        autoConnect: true,
      });

      // connected
      this.socket.on('connect', () => {
        console.log('Connected to server!');
        resolve();
      });

      // error
      this.socket.on('connect_error', () => {
        reject();
      });

      // disconnect
      this.socket.on('disconnect', (reason) => {
        console.info('Disconnected from server. reason is ', reason);
      });
    });
  }

  /**
   * Reset all events listened or only the ones listed in events parameter
   *
   * @param {Array<string>} events - list of events to reset
   */
  reset(events) {
    if (events) {
      const _this = this;
      events.forEach((element) => {
        delete _this.events[element];
        _this.socket.removeAllListeners(element);
      });
    } else {
      for (const event in this.events) {
        this.socket.removeAllListeners(event);
      }
      this.events = {};
    }
  }

  /**
   * @callback cbSocketIO
   * @param {...*} args Args
   */
  /**
   * Register a callback on an event
   *
   * @param {string} event - event id
   * @param {cbSocketIO} callback - callback called when the event is received
   */
  on(event, callback) {
    this.events[event] = true;
    this.socket.on(event, callback);
  }

  /**
   * Emit an event to the server with attach data
   *
   * @param {string} event - event id
   * @param {object} data - attached data (all serializable data are supported)
   */
  emit(event, data) {
    this.socket.emit(event, data);
  }
}

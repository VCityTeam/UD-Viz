/** @format */

import io from 'socket.io-client';

/**
 * Handle communication with a server using socket.io-client npm package
 * (https://www.npmjs.com/package/socket.io-client)
 */
export class WebSocketService {
  constructor() {
    this.socket = null;
    this.events = {};
  }

  /**
   * Start communication with the server (the one hosting index.html by default)
   */
  connectToServer() {
    // Communication protocol
    const socketProtocol = window.location.protocol.includes('https')
      ? 'wss'
      : 'ws';

    const loc = `${window.location.pathname}`;
    const path = loc.substring(0, loc.lastIndexOf('/'));
    // Instantiate socket and connect to the server serving index.html
    this.socket = io(`${socketProtocol}://${window.location.host}`, {
      reconnection: false,
      secure: true,
      transports: ['polling', 'websocket'],
      path: path + '/socket.io/',
    });

    this.socket.on('connect', () => {
      console.log('Connected to server!');
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('Disconnected from server. reason = ', reason);
    });
  }

  /**
   * Reset all events listened or only the ones listed in events parameter
   *
   * @param {Array} events list of events to reset can be null
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
   * Assign a callback to a specific event
   *
   * @param {Shared.Components.Constants} event the event listened
   * @param {Function} callback function called when the event is received
   */
  on(event, callback) {
    this.events[event] = true;
    this.socket.on(event, callback);
  }

  /**
   * Fire an event to the server with data attached
   *
   * @param {Shared.Components.Constants} event the event fired
   * @param {JSON} data data passed
   */
  emit(event, data) {
    this.socket.emit(event, data);
  }
}

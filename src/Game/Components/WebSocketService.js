/** @format */

/**
 * Handle a WebSocket communication client side with socket.io with server hosting the app
 */

import io from 'socket.io-client';

export class WebSocketService {
  constructor() {
    this.socket = null;

    this.events = {};
  }
  connectToServer() {
    //protocol
    const socketProtocol = window.location.protocol.includes('https')
      ? 'wss'
      : 'ws';

    //instantiate socket and connect to the server serving index.html
    this.socket = io(`${socketProtocol}://${window.location.host}`, {
      reconnection: false,
      secure: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server!');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server.');
    });
  }

  reset() {
    for (let event in this.events) {
      this.socket.removeAllListeners(event);
    }
    this.events = {};
  }

  on(event, callback) {
    this.events[event] = true;
    this.socket.on(event, callback);
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }
}

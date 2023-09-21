const { Object3D } = require('@ud-viz/game_shared');
const { SocketService } = require('../src/index');
const { Server } = require('http');
const path = require('path');

const http = new Server();
const service = new SocketService(http);
service.loadGameThreads(
  [new Object3D({})],
  path.resolve(__dirname, './assets/child.js')
);

setTimeout(() => {
  service.stop();
  http.close();
}, 500);

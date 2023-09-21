const { Map, NoteGameManager } = require('../src/index');

const { Object3D } = require('@ud-viz/game_shared');
const { SocketService } = require('@ud-viz/game_node');
const { Server } = require('http');
const path = require('path');

const http = new Server();
const service = new SocketService(http);
service.loadGameThreads(
  [
    new Object3D({
      components: {
        GameScript: {
          idScripts: [Map.ID_SCRIPT, NoteGameManager.ID_SCRIPT],
          variables: {
            clientFolder: path.resolve(__dirname, './assets/'),
            heightmap_path: './heightmap.jpeg',
            heightmap_geometry: {
              min: 0,
              max: 10,
            },
          },
        },
      },
    }),
  ],
  path.resolve(__dirname, './assets/child.js')
);

setTimeout(() => {
  service.stop();
  http.close();
}, 500);

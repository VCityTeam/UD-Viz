/** @file It illustrates backend implementations of a this tutorial {@link game} */

const { SocketService } = require('@ud-viz/game_node');
const { Object3D } = require('@ud-viz/game_shared');
const express = require('express');
const path = require('path');
const { DEFAULT_PORT, MESSAGE } = require('../../../../bin/constant');

console.log('Run backend simple game');

const app = express();
app.use(express.static('.'));

const httpServer = app.listen(DEFAULT_PORT, function () {
  console.log(`app listening on port ${DEFAULT_PORT}!`);
});

// initialize examples game socket service
const gameSocketService = new SocketService(httpServer);

const gameObject3D = new Object3D({
  static: true,
  components: {
    GameScript: {
      idScripts: ['game_context_script'],
    },
    ExternalScript: {
      idScripts: ['game_external_context_script'],
    },
  },
});

gameSocketService
  .loadGameThreads(
    [gameObject3D],
    path.resolve(__dirname, './gameThreadChild.js')
  )
  .then(() => {
    if (process.send) process.send(MESSAGE.READY);
  });

/** @file It illustrates backend implementations of a this tutorial {@link game} */

const path = require('path');
const { DEFAULT_PORT, MESSAGE } = require('../../../../bin/constant');
const { SocketService } = require('@ud-viz/game_node');
const { Object3D } = require('@ud-viz/game_shared');
const express = require('express');
const { stringReplace } = require('string-replace-middleware');

console.log('Run backend');

const app = express();

// Apply string replacements for different values in HTML responses
app.use(
  stringReplace(
    {
      RUN_MODE: process.env.NODE_ENV || 'production',
    },
    {
      contentTypeFilterRegexp: /text\/html/,
    }
  )
);

app.use(express.static(path.resolve(__dirname, '../../../../')));

const httpServer = app.listen(DEFAULT_PORT, function () {
  console.log(`app listening on port ${DEFAULT_PORT}!`);
});

// initialize examples game socket service
const gameSocketService = new SocketService(httpServer);

const gameObject3D = new Object3D({
  static: true,
  components: {
    GameScript: {
      scriptParams: [{ id: 'game_context_script' }],
    },
    ExternalScript: {
      scriptParams: [{ id: 'game_external_context_script' }],
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

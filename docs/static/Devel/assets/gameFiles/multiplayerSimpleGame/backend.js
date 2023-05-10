/** @file It illustrates backend implementations of a this tutorial {@link game} */

const udvizNode = require('@ud-viz/node');
const { Game } = require('@ud-viz/shared');
const path = require('path');

const app = udvizNode.express();
const port = 3000;

app.get('/', function (req, res) {
  res.sendFile(
    path.resolve(__dirname, '../../examples/MultiplayerSimpleGame.html')
  );
});

const httpServer = app.listen(port, function () {
  console.log(`Example app listening on port ${port}!`);
});

// initialize examples game socket service
const gameSocketService = new udvizNode.Game.SocketService(httpServer);

const gameObject3D = new Game.Object3D({
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

gameSocketService.loadGameThreads(
  [gameObject3D],
  './bin/multiplayerSimpleGame/gameThreadChild.js'
);

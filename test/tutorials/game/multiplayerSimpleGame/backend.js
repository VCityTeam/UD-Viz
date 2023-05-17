/** @file It illustrates backend implementations of a this tutorial {@link game} */

const udvizNode = require('@ud-viz/node');
const { Game } = require('@ud-viz/shared');
const path = require('path');
const Constant = require('../../../../bin/Constant');

console.log('Run backend simple game');

const app = udvizNode.express();
app.use(udvizNode.express.static('.'));

const httpServer = app.listen(Constant.DEFAULT_PORT, function () {
  console.log(`app listening on port ${Constant.DEFAULT_PORT}!`);
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

gameSocketService
  .loadGameThreads(
    [gameObject3D],
    path.resolve(__dirname, './gameThreadChild.js')
  )
  .then(() => {
    if (process.send) process.send(Constant.MESSAGE.READY);
  });

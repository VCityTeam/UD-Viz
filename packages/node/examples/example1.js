const { Game, Core, ExpressAppWrapper } = require('../src/index');

const expressAppWrapper = new ExpressAppWrapper();

expressAppWrapper
  .start({
    folder: '../browser',
    port: 8000,
  })
  .then(() => {
    const gameService = new Game.SocketService(expressAppWrapper.httpServer);
    gameService.initializeGameThreads(
      {
        Object3DSync:
          'package:@ud-viz/core/src/Game/ScriptTemplate/Object3DSync.js',
        GameManager: 'file:examples/script/gameScript/gameManager.js',
      },
      [
        new Core.Game.Object3D({
          static: true,
          components: {
            GameScript: {
              idScripts: ['GameManager', 'Object3DSync'],
            },
          },
        }),
      ],
      './examples/script/gameThread.js'
    );
  });

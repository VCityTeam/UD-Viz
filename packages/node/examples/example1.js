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
        Example: 'package:@ud-viz/core/src/Game/ScriptTemplate/Example.js',
        GameManager: 'file:examples/script/gameScript/gameManager.js',
      },
      [
        new Core.Game.Object3D({
          static: true,
          components: {
            GameScript: {
              idScripts: ['GameManager', 'Example'],
            },
            ExternalScript: {
              idScripts: ['NoteUI'],
            },
          },
        }),
      ],
      './examples/script/gameThread.js'
    );
  });

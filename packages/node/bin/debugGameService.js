const GameService = require('../src/index').GameService;
const ExpressAppWrapper = require('../src/index').ExpressAppWrapper;

const expressAppWrapper = new ExpressAppWrapper();

expressAppWrapper
  .start({
    folder: '../browser',
    port: 8000,
  })
  .then(() => {
    const gameService = new GameService(expressAppWrapper.httpServer);
  });

const { thread } = require('@ud-viz/game_node');
const gameNodeTemplate = require('../../src/index');

const child = new thread.Child();
child.on(thread.CHILD_EVENT.ON_GAME_CONTEXT_LOADED, () =>
  console.log('game context loaded')
);

child.start(gameNodeTemplate);

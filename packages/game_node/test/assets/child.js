const { Child, CHILD_EVENT } = require('../../src/thread');

const child = new Child();
child.on(CHILD_EVENT.ON_GAME_CONTEXT_LOADED, () =>
  console.log('game context loaded')
);

child.start({});

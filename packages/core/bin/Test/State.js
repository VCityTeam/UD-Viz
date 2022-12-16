const Core = require('../../src/index');
const object2JSON = require('./data/object3D/object2.json');
const HelloScript = require('./data/scripts/Hello');

const context = new Core.Game.Context(object2JSON, {
  classScripts: [HelloScript],
});

context.load().then(() => {
  const state1 = context.toState();
  if (!state1.includes(context.object3D.uuid)) {
    console.error('state ', state1.toJSON());
    console.error('uuid ', context.object3D.uuid);
    throw new Error('State.includes error');
  }

  const child2 = context.object3D.getObjectByName('child2');
  context.removeObject3D(child2.uuid);
  const child1 = context.object3D.getObjectByName('child1');
  child1.setOutdated(true);

  const state2 = context.toState();
  if (state2.includes(child2.uuid)) throw new Error('child2 not remove');

  const diff = state2.toDiff(state1);

  const rebuildedState = state1.add(diff);

  if (!rebuildedState.equals(state2)) {
    state2.log();
    rebuildedState.log();
    throw new Error('state not well rebuild');
  }
});

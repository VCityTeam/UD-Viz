const Core = require('../../src/index');
const object2JSON = require('./data/object3D/object2.json');
const HelloScript = require('./data/scripts/Hello');

const context = new Core.Game.Context({ Hello: HelloScript }, object2JSON);

context.load().then(() => {
  const state1 = context.toState();
  if (!state1.includes(context.object3D.uuid)) {
    console.error('state ', state1.toJSON());
    console.error('uuid ', context.object3D.uuid);
    throw new Error('State.includes error');
  }

  const child1 = context.object3D.getObjectByName('child1');
  const child2 = context.object3D.getObjectByName('child2');

  // modify object3D
  context.removeObject3D(child2.uuid);
  child1.setOutdated(true);

  const state2 = context.toState();
  if (state2.includes(child2.uuid)) throw new Error('child2 not remove');
  if (!state2.includes(child1.uuid))
    throw new Error('cant find child1 in state2');

  if (!state2.getObject3D().getObjectByName('child1'))
    throw new Error('cant find child1 by name in state2');

  const stateDiff = state2.sub(state1);

  const rebuildedState2 = state1.add(stateDiff);

  const rebuildedChild1 = rebuildedState2
    .getObject3D()
    .getObjectByName('child1');
  if (!rebuildedChild1) {
    console.log(stateDiff);
    throw new Error('cant find child1 by name in rebuilded state');
  }

  if (!rebuildedState2.equals(state2)) {
    state2.log();
    rebuildedState2.log();
    throw new Error('state not well rebuild');
  }
});

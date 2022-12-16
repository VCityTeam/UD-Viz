const Core = require('../../src');
const object1JSON = require('./data/object3D/object1.json');
const HelloScript = require('./data/scripts/Hello');

const context = new Core.Game.Context(object1JSON, [HelloScript]);

const newGameObject = new Core.Game.Object3D({
  object: { name: 'new object' },
});
context.addObject3D(newGameObject).then(() => {
  context.removeObject3D(newGameObject.uuid);
  process.exit(0); // test succceed
});

const Core = require('../../src');
const object1JSON = require('./data/object3D/object1.json');
const HelloScript = require('./data/scripts/Hello');

const context = new Core.Game.Context(
  { Hello: HelloScript },
  new Core.Game.Object3D(object1JSON)
);

context.load().then(() => {
  const newGameObject = new Core.Game.Object3D({
    object: {
      name: 'new object',
      outdated: false,
      components: {
        Audio: {},
        Collider: {},
        GameScript: {},
        Render: {},
        ExternalScript: {},
      },
    },
  });

  const cloneGameObject = newGameObject.clone();

  if (
    !Core.Data.objectEquals(cloneGameObject.toJSON(), newGameObject.toJSON())
  ) {
    throw new Error('clone is not equal');
  }

  const otherGameObject = new Core.Game.Object3D({
    object: { name: 'other object', outdated: true },
  });

  otherGameObject.updatefromJSON(cloneGameObject.toJSON());
  if (
    !Core.Data.objectEquals(cloneGameObject.toJSON(), otherGameObject.toJSON())
  ) {
    throw new Error('updateFromJSON not working');
  }

  // context
  context.addObject3D(newGameObject).then(() => {
    context.removeObject3D(newGameObject.uuid);
    process.exit(0); // test succceed
  });
});

const Shared = require('../../src');
const object1JSON = require('./data/object3D/object1.json');
const HelloScript = require('./data/scripts/Hello');

const context = new Shared.Game.Context(
  [HelloScript],
  new Shared.Game.Object3D(object1JSON)
);

context.load().then(() => {
  const newGameObject = new Shared.Game.Object3D({
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
    !Shared.Data.objectEquals(cloneGameObject.toJSON(), newGameObject.toJSON())
  ) {
    throw new Error('clone is not equal');
  }

  const otherGameObject = new Shared.Game.Object3D({
    object: { name: 'other object', outdated: true },
  });

  otherGameObject.updatefromJSON(cloneGameObject.toJSON());
  if (
    !Shared.Data.objectEquals(
      cloneGameObject.toJSON(),
      otherGameObject.toJSON()
    )
  ) {
    throw new Error('updateFromJSON not working');
  }

  // context
  context.addObject3D(newGameObject).then(() => {
    context.removeObject3D(newGameObject.uuid);
    process.exit(0); // test succceed
  });
});

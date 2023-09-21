const { Object3D, Context } = require('../src');
const { objectEquals } = require('@ud-viz/utils_shared');
const object1JSON = require('./assets/object3D/object1.json');
const HelloScript = require('./assets/scripts/Hello');

const context = new Context([HelloScript], new Object3D(object1JSON));

context.load().then(() => {
  const newGameObject = new Object3D({
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

  if (!objectEquals(cloneGameObject.toJSON(), newGameObject.toJSON())) {
    throw new Error('clone is not equal');
  }

  const otherGameObject = new Object3D({
    object: { name: 'other object', outdated: true },
  });

  otherGameObject.updatefromJSON(cloneGameObject.toJSON());
  if (!objectEquals(cloneGameObject.toJSON(), otherGameObject.toJSON())) {
    throw new Error('updateFromJSON not working');
  }

  // context
  context.addObject3D(newGameObject).then(() => {
    context.removeObject3D(newGameObject.uuid);
    process.exit(0); // test succceed
  });
});

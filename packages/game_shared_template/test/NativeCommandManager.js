const { NativeCommandManager } = require('../src/index');
const { Context, Object3D } = require('@ud-viz/game_shared');

const instance = new NativeCommandManager(
  new Context({}, new Object3D({ name: 'root' })),
  new Object3D({ name: 'manager_object' })
);

instance.init();

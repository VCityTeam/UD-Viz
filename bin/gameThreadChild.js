const { NativeCommandManager } = require('@ud-viz/game_shared_template');
const { thread } = require('@ud-viz/game_node');
const {
  NoteManager,
  DomElement3DCubeManager,
} = require('@ud-viz/game_node_template');

const child = new thread.Child();
child.start([NativeCommandManager, NoteManager, DomElement3DCubeManager]);

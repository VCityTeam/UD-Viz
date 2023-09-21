const { NativeCommandManager } = require('@ud-viz/game_shared_template');
const { thread } = require('@ud-viz/game_node');
const { NoteGameManager } = require('@ud-viz/game_node_template');

const child = new thread.Child();
child.start([NativeCommandManager, NoteGameManager]);

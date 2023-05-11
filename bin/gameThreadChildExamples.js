const Shared = require('@ud-viz/shared');
const Thread = require('../packages/node/src/Game/Thread');
const NoteGameManager = require('../packages/node/src/Game/ScriptTemplate/NoteGameManager');

const child = new Thread.Child();
child.start([Shared.Game.ScriptTemplate.NativeCommandManager, NoteGameManager]);

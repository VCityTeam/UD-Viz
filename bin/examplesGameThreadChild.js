const Shared = require('@ud-viz/shared');
const { runChildProcess } = require('../packages/node/src/Game/Thread');
const NoteGameManager = require('../packages/node/src/Game/ScriptTemplate/NoteGameManager');

runChildProcess([
  Shared.Game.ScriptTemplate.NativeCommandManager,
  NoteGameManager,
]);

const Shared = require('@ud-viz/shared');
const { childProcess } = require('../packages/node/src/Game/Thread');
const NoteGameManager = require('../packages/node/src/Game/ScriptTemplate/NoteGameManager');

childProcess([
  Shared.Game.ScriptTemplate.NativeCommandManager,
  NoteGameManager,
]);

const ThreadProcessRoutine = require('./Game/ThreadProcessRoutine');
const NoteGameManager = require('./Game/ScriptTemplate/NoteGameManager');
const { Game } = require('@ud-viz/shared');

ThreadProcessRoutine({
  NoteGameManager: NoteGameManager,
  NativeCommandManager: Game.ScriptTemplate.NativeCommandManager,
});

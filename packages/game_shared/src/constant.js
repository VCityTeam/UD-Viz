module.exports = {
  WEBSOCKET: {
    MSG_TYPE: {
      // server => client
      NEW_GAME: 'new_game',
      GAME_DIFF: 'game_diff',
      // client => server
      READY_FOR_GAME: 'ready_for_game',
      COMMANDS: 'commands',
    },
  },
};

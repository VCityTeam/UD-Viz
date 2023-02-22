module.exports = {
  WEBSOCKET: {
    MSG_TYPE: {
      // server => client
      NEW_GAME: 'new_game',
      GAME_DIFF: 'game_diff',
      EXTERNAL_CONTEXT_USER_DATA: 'external_context_user_data',
      // client => server
      READY_FOR_GAME: 'ready_for_game',
      COMMANDS: 'commands',
    },
  },
};

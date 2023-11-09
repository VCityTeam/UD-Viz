module.exports = {
  WEBSOCKET: {
    MSG_TYPE: {
      // server => client
      NEW_GAME: 'new_game',
      GAME_DIFF: 'game_diff',
      USER_DATA_UPDATE: 'user_data_update',
      // client => server
      READY_FOR_GAME: 'ready_for_game',
      COMMANDS: 'commands',
    },
  },
};

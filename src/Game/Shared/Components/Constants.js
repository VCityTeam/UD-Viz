/** @format */

/**
 * Constants of ud-viz/Shared
 */
module.exports = Object.freeze({
  /**
   * Define the type of message of a websocket communication
   */
  WEBSOCKET: {
    MSG_TYPES: {
      JOIN_WORLD: 'join_world', //send to client to indicate the first state when joining a world
      COMMANDS: 'cmds', //send to server by client
      WORLDSTATE_DIFF: 'worldstate_diff', //send diff of the world server => client
      SIGN_UP: 'sign_up',
      SIGN_IN: 'sign_in',
      GUEST_CONNECTION: 'guest_connection',
      SERVER_ALERT: 'server_alert',
      SIGNED: 'signed',
      READY_TO_RECEIVE_STATE: 'ready_to_receive_state',
      ON_AVATAR_GO: 'on_avatar_go',
      QUERY_AVATAR_GO: 'query_avatar_go',
      SAVE_AVATAR_GO: 'save_avatar_go',
      SAVE_WORLDS: 'save_worlds',
      CREATE_BBB_ROOM: 'create_bbb_room',
      ON_BBB_URL: 'on_bbb_url',
    },
  },
});

/** @format */
module.exports = Object.freeze({
  WEBSOCKET: {
    MSG_TYPES: {
      JOIN_WORLD: 'join_world',
      COMMANDS: 'cmds',
      WORLDSTATE_DIFF: 'worldstate_diff',
      SIGN_UP: 'sign_up',
      SIGN_IN: 'sign_in',
      SERVER_ALERT: 'server_alert',
      SIGNED: 'signed',
      GAME_APP_LOADED: 'game_app_loaded',
      ON_AVATAR_GO: 'on_avatar_go',
      QUERY_AVATAR_GO: 'query_avatar_go',
    },
  },

  //THREAD

  pack(obj) {
    let OString = JSON.stringify(obj);
    let SABuffer = new SharedArrayBuffer(
      Int32Array.BYTES_PER_ELEMENT * OString.length
    );
    let sArray = new Int32Array(SABuffer);

    for (let i = 0; i < OString.length; i++) {
      sArray[i] = OString.charCodeAt(i);
    }

    return sArray;
  },
  unpack(array) {
    let str = String.fromCharCode.apply(this, array);
    return JSON.parse(str);
  },
});

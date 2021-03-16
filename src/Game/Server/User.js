/** @format */

const Data = require('../Shared/Data');
const Command = require('../Shared/Command');
const WorldThread = require('./WorldThread');
const WorldState = require('../Shared/WorldState');

const UserModule = class User {
  constructor(socket, worldUUID, avatarID, thread) {
    this.socket = socket;
    this.worldUUID = worldUUID;
    this.thread = thread;

    this.avatarID = avatarID;

    //to know if just joined or not
    this.firstState = null;

    this.init();
  }

  setAvatarID(id) {
    this.avatarID = id;
  }

  getAvatarID() {
    return this.avatarID;
  }

  sendWorldState(stateJSON) {
    let state = new WorldState(stateJSON);

    if (!this.firstState) {
      this.firstState = state;
      this.socket.emit(Data.WEBSOCKET.MSG_TYPES.JOIN_SERVER, {
        state: stateJSON,
        avatarID: this.getAvatarID(),
      });
    } else {
      const diffJSON = state.toDiff(this.firstState);
      this.socket.emit(Data.WEBSOCKET.MSG_TYPES.WORLDSTATE_DIFF, diffJSON);
    }
  }

  getThread() {
    return this.thread;
  }

  init() {
    const _this = this;

    //cmds
    this.socket.on(Data.WEBSOCKET.MSG_TYPES.COMMANDS, function (cmdsJSON) {
      const commands = [];
      //parse
      cmdsJSON.forEach(function (cmdJSON) {
        const command = new Command(cmdJSON);
        //sign command
        command.setUserID(_this.getUUID());
        command.setAvatarID(_this.getAvatarID());
        commands.push(command);
      });
      _this.thread.post(WorldThread.MSG_TYPES.COMMANDS, commands);
    });
  }

  getUUID() {
    return this.socket.id;
  }
};

module.exports = UserModule;

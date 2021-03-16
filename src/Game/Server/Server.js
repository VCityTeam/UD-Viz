/**
 * Handle a UDV Server
 *
 * @format
 */
const express = require('express');
const socketio = require('socket.io');
const WorldThread = require('./WorldThread');
const User = require('./User');
const Data = require('../Shared/Data');

export class Server {
  constructor(config) {
    //config
    this.config = config;

    //express app
    this.app;

    //http server
    this.server;

    //websocket
    this.io;

    //clients
    this.users = {};

    //map world to thread
    this.worldToThread = {};
  }

  initWorlds(worldsJSON) {
    //instanciate Worlds with config
    const _this = this;

    worldsJSON.forEach((worldJSON) => {
      //create a worldThread
      const thread = new WorldThread(_this.config.thread.script);

      //post data to create world
      thread.post(WorldThread.MSG_TYPES.INIT, worldJSON); //thread post function will pack data

      //mapping between world and thread
      _this.worldToThread[worldJSON.uuid] = thread;

      thread.on(WorldThread.MSG_TYPES.WORLDSTATE, function (data) {
        const worldstateJSON = data;

        const users = _this.computeUsers(thread); //compute clients concerned
        users.forEach(function (user) {
          if (!worldstateJSON) throw new Error('no worldstateJSON');
          user.sendWorldState(worldstateJSON);
        });
      });
    });
  }

  computeUsers(thread) {
    var result = [];
    for (var idUser in this.users) {
      const u = this.users[idUser];
      if (u.getThread() == thread) result.push(u);
    }
    return result;
  }

  //create app express and listen to config.PORT
  start() {
    //express
    this.app = express();
    //serve
    this.app.use(express.static(this.config.folder)); //what folder is served

    //http server
    const port = this.config.port;
    const folder = this.config.folder;
    this.server = this.app.listen(port, function (err) {
      if (err) console.log('Error in server setup');
      console.log('Server listening on Port', port, ' folder ' + folder);
    });

    //websocket
    this.io = socketio(this.server);

    //cb
    this.registerCallbacks();
  }

  registerCallbacks() {
    //server callbacks
    this.io.on('connection', this.registerClient.bind(this));
  }

  registerClient(socket) {
    //entry
    let uuidWorld = this.config.entryWorld;
    if (!(uuidWorld && this.worldToThread[uuidWorld] != undefined)) {
      uuidWorld = Object.keys(this.worldToThread)[0];
    }

    console.log('Register client => ', socket.id);

    //register the client
    const thread = this.worldToThread[uuidWorld];
    const avatarJSON = Data.createAvatarJSON();
    const user = new User(socket, uuidWorld, avatarJSON.uuid, thread);
    this.users[user.getUUID()] = user;
    thread.post(WorldThread.MSG_TYPES.ADD_GAMEOBJECT, avatarJSON);

    const _this = this;
    socket.on('disconnect', () => {
      console.log('Unregister client => ', socket.id);
      thread.post(WorldThread.MSG_TYPES.REMOVE_GAMEOBJECT, user.getAvatarID());
      delete _this.users[user.getUUID()];
    });
  }
}

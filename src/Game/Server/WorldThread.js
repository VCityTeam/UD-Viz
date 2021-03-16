/**
 * Wrapper worker_threads
 *
 * @format
 */

const workerThreads = require('worker_threads');
const Data = require('../Shared/Data');
const Command = require('../Shared/Command');
const GameObject = require('../Shared/GameObject/GameObject');
const World = require('../Shared/World');
const gm = require('gm');
const PNG = require('pngjs').PNG;

const WorldThreadModule = class WorldThread {
  constructor(path) {
    //thread js
    this.worker = new workerThreads.Worker(path);

    //callbacks
    this.callbacks = {};

    //listen
    this.worker.on(
      'message',
      function (msgPacked) {
        const msg = Data.unpack(msgPacked);
        if (this.callbacks[msg.msgType]) {
          this.callbacks[msg.msgType](msg.data);
        }
      }.bind(this)
    );
  }

  post(msgType, data) {
    this.worker.postMessage(
      Data.pack({
        msgType: msgType,
        data: data,
      })
    );
  }

  on(msgType, callback) {
    this.callbacks[msgType] = callback;
  }
};

//dont know how to create static var other way
WorldThreadModule.MSG_TYPES = {
  INIT: 'init',
  COMMANDS: 'cmds',
  WORLDSTATE: 'state',
  ADD_GAMEOBJECT: 'add_gameobject',
  REMOVE_GAMEOBJECT: 'remove_gameobject',
};

WorldThreadModule.routine = function (serverConfig) {
  if (workerThreads.isMainThread) {
    throw new Error('Its not a worker');
  }

  const parentPort = workerThreads.parentPort;

  //Variables
  let lastTimeTick = 0;
  let world; //the world being simulated
  const commands = [];

  //Callbacks
  const onInit = function (worldJSON) {
    world = new World(worldJSON, {
      isServerSide: true,
      modules: { gm: gm, PNG: PNG },
    });
    world.load(function () {
      //loop
      const tick = function () {
        let dt;
        const now = Date.now();
        if (!lastTimeTick) {
          dt = 0;
        } else {
          dt = now - lastTimeTick;
        }
        lastTimeTick = now;

        world.tick(commands, dt); //tick with user commands
        commands.length = 0; //clear commands

        const currentState = world.computeWorldState();

        //post worldstate to main thread
        const message = {
          msgType: WorldThreadModule.MSG_TYPES.WORLDSTATE,
          data: currentState.toJSON(),
        };
        parentPort.postMessage(Data.pack(message));
      };
      const fps = serverConfig.thread.fps;
      if (!fps) throw new Error('no fps');
      setInterval(tick, 1000 / fps);
    });
  };

  const onCommands = function (cmdsJSON) {
    cmdsJSON.forEach(function (cmdJSON) {
      commands.push(new Command(cmdJSON));
    });
  };

  const onAddGameObject = function (goJson) {
    world.addGameObject(new GameObject(goJson));
  };

  const onRemoveGameObject = function (uuid) {
    world.removeGameObject(uuid);
  };

  //listening parentPort
  parentPort.on('message', (msgPacked) => {
    const msg = Data.unpack(msgPacked);
    switch (msg.msgType) {
      case WorldThreadModule.MSG_TYPES.INIT:
        onInit(msg.data);
        break;
      case WorldThreadModule.MSG_TYPES.COMMANDS:
        onCommands(msg.data);
        break;
      case WorldThreadModule.MSG_TYPES.ADD_GAMEOBJECT:
        onAddGameObject(msg.data);
        break;
      case WorldThreadModule.MSG_TYPES.REMOVE_GAMEOBJECT:
        onRemoveGameObject(msg.data);
        break;
      default:
        console.log('default msg ', msg.data);
    }
  });
};

module.exports = WorldThreadModule;

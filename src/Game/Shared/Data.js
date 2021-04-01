/** @format */
const RenderComponent = require('./GameObject/Components/Render');
const ScriptComponent = require('./GameObject/Components/Script');
const GameObject = require('./GameObject/GameObject.js');
const ColliderComponent = require('./GameObject/Components/Collider');

const THREE = require('three');

module.exports = Object.freeze({
  WEBSOCKET: {
    MSG_TYPES: {
      JOIN_SERVER: 'join_server',
      COMMANDS: 'cmds',
      WORLDSTATE_DIFF: 'worldstate_diff',
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

  //BUILDER  TODO Assetmanager load directly .json in prefabs
  createAvatarJSON() {
    return {
      uuid: THREE.Math.generateUUID(),
      children: [],
      name: 'avatar',
      type: GameObject.TYPE,
      components: [
        {
          type: ColliderComponent.TYPE,
          shapes: [
            {
              type: 'Circle',
              center: { x: 0, y: 0 },
              radius: 0.5,
            },
          ],
        },
        { type: RenderComponent.TYPE, idModel: 'avatar' },
        {
          type: ScriptComponent.TYPE,
          idScripts: ['avatar'],
        },
      ],
      transform: {
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        scale: { x: 1, y: 1, z: 1 },
      },
    };
  },
});

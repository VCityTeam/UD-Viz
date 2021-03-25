/** @format */

const es5Data = require('./Data');
// export { es5Data as Data };

const es5Command = require('./Command');
// export { es5Command as Command };

const es5GameObject = require('./GameObject/GameObject');
// export { es5GameObject as GameObject };

const es5World = require('./World');
// export { es5World as World };

const es5WorldState = require('./WorldState');
// export { es5WorldState as WorldState };

const THREE = require('three');

module.exports = {
  Data: es5Data,
  Command: es5Command,
  GameObject: es5GameObject,
  World: es5World,
  WorldState: es5WorldState,
  THREE: THREE,
};

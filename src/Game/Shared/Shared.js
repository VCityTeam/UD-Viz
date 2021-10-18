/** @format */

const commnJsComponents = require('./Components/Components');

const commonJsCommand = require('./Command');

const commonJsGameObject = require('./GameObject/GameObject');

const commonJsRender = require('./GameObject/Components/Render');

const commonJsAudio = require('./GameObject/Components/Audio');

const commonJsWorld = require('./World');

const commonJsWorldState = require('./WorldState');

const commonJsWorldStateDiff = require('./WorldStateDiff');

const commonJsWorldStateComputer = require('./WorldStateComputer');

const THREE = require('three');

const proj4 = require('proj4');

const detectCollision = { Circle, Polygon, Collisions } = require('detect-collisions');

module.exports = {
  Components: commnJsComponents,
  Command: commonJsCommand,
  GameObject: commonJsGameObject,
  Render: commonJsRender,
  Audio: commonJsAudio,
  World: commonJsWorld,
  WorldState: commonJsWorldState,
  WorldStateDiff: commonJsWorldStateDiff,
  WorldStateComputer: commonJsWorldStateComputer,
  DetectCollision: detectCollision,
  THREE: THREE,
  proj4: proj4,
};

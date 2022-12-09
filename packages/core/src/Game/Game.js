const commonJsComponents = require('./Components/Components');

const commonJsCommand = require('./Command');

const commonJsGameObject = require('./GameObject/GameObject');

const commonJsWorld = require('./World');

const commonJsWorldState = require('./WorldState');

const commonJsWorldStateDiff = require('./WorldStateDiff');

const commonJsWorldStateComputer = require('./WorldStateComputer');

const commonJsWorldStateInterpolator = require('./WorldStateInterpolator');

module.exports = {
  Components: commonJsComponents,
  Command: commonJsCommand,
  GameObject: commonJsGameObject,
  World: commonJsWorld,
  WorldState: commonJsWorldState,
  WorldStateDiff: commonJsWorldStateDiff,
  WorldStateInterpolator: commonJsWorldStateInterpolator,
  WorldStateComputer: commonJsWorldStateComputer,
};

const commonJsComponents = require('./Components/Components');

const commonJsCommand = require('./WorldCommand');

const commonJsGameObject = require('./GameObject/GameObject');

const commonJsWorld = require('./World');

const commonJsWorldState = require('./WorldState');

const commonJsWorldStateDiff = require('./WorldStateDiff');

const commonJsWorldStateComputer = require('./WorldStateComputer');

const commonJsWorldStateInterpolator = require('./WorldStateInterpolator');

module.exports = {
  Components: commonJsComponents,
  WorldCommand: commonJsCommand,
  GameObject: commonJsGameObject,
  World: commonJsWorld,
  WorldState: commonJsWorldState,
  WorldStateDiff: commonJsWorldStateDiff,
  WorldStateInterpolator: commonJsWorldStateInterpolator,
  WorldStateComputer: commonJsWorldStateComputer,
};

// @ud-viz/core API

module.exports = {
  Component: {
    Data: require('./Components/Data'),
    JSONUtils: require('./Components/JSONUtils'),
    Type: require('./Components/Type'),
  },
  Game: {
    Engine: require('./Game/Engine'),
    Context: require('./Game/Context').Context,
    ScriptBase: require('./Game/Context').ScriptBase,
    Object3D: require('./Game/Object3D/Object3D'),
  },
};

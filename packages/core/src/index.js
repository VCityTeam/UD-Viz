/**
 * ud-viz core library (browser + node compatible)
 */
module.exports = {
  Data: require('./Data'),
  Type: require('./Type'),
  ProcessInterval: require('./ProcessInterval'),
  EventSender: require('./EventSender'),
  Command: require('./Command'),
  Game: {
    Context: require('./Game/Context').Context,
    ScriptBase: require('./Game/Context').ScriptBase,
    Object3D: require('./Game/Object3D'),
    StateInterpolator: require('./Game/State/Interpolator'),
    State: require('./Game/State/State'),
    Component: {
      Render: require('./Game/Component/Render').Component,
      Audio: require('./Game/Component/Audio').Component,
      ExternalScript: require('./Game/Component/ExternalScript').Component,
      ScriptController: require('./Game/Component/Script').Controller,
      Controller: require('./Game/Component/Component').Controller,
    },
    /**
     * Constant used in Game
     */
    CONSTANT: {
      MOVE_FORWARD: 'move_forward',
      MOVE_BACKWARD: 'move_backward',
      MOVE_LEFT: 'move_left',
      MOVE_RIGHT: 'move_right',
      Z_UPDATE: 'z_update',
    },
  },
};

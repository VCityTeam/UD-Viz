/* eslint-disable jsdoc/require-property-description */

/**
 * ud-viz shared library (browser + node compatible)
 *
 * @exports udvizShared
 */
module.exports = {
  Constant: require('./Constants'),
  /** @type {import("./Data")} */
  Data: require('./Data'),
  /** @type {import("./Type")} */
  Type: require('./Type'),
  /** @type {import("./ProcessInterval").ProcessInterval} */
  ProcessInterval: require('./ProcessInterval'),
  /** @type {import("./EventSender").EventSender} */
  EventSender: require('./EventSender'),
  Command: require('./Command'),
  Game: {
    Context: require('./Game/Context').Context,
    ScriptBase: require('./Game/Context').ScriptBase,
    Object3D: require('./Game/Object3D'),
    StateInterpolator: require('./Game/State/Interpolator'),
    State: require('./Game/State/State'),
    StateDiff: require('./Game/State/Diff'),
    ScriptTemplate: require('./Game/ScriptTemplate/ScriptTemplate'),
    Component: {
      Render: require('./Game/Component/Render').Component,
      Collider: require('./Game/Component/Collider').Component,
      Audio: require('./Game/Component/Audio').Component,
      ExternalScript: require('./Game/Component/ExternalScript').Component,
      GameScript: require('./Game/Component/GameScript').Component,
      ScriptController: require('./Game/Component/Script').Controller,
      Controller: require('./Game/Component/Component').Controller,
      Model: require('./Game/Component/Component').Model,
    },
  },
};

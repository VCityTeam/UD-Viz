/* eslint-disable jsdoc/require-property-description */

/**
 * ud-viz core library (browser + node compatible)
 *
 * @exports udvizShared
 */
module.exports = {
  /** @type {import("./Data")} */
  Data: require('./Data'),
  /** @type {import("./Type")} */
  Type: require('./Type'),
  /** @type {import("./ProcessInterval").ProcessInterval} */
  ProcessInterval: require('./ProcessInterval'),
  /** @type {import("./EventSender").EventSender} */
  EventSender: require('./EventSender'),
  /** @type {import("./Command").Command} */
  Command: require('./Command'),
  /**
   * @type {object}
   * @property {import("./Game/Context").Context} Context
   * @property {import("./Game/Context").ScriptBase} ScriptBase
   * @property {import("./Game/Object3D").Object3D} Object3D
   * @property {import("./Game/State/Interpolator").Interpolator} StateInterpolator
   * @property {import("./Game/State/State").State} State
   * @property {object} Component
   * @property {import("./Game/Component/Render").Component} Component.Render
   * @property {import("./Game/Component/Audio").Component} Component.Audio
   * @property {import("./Game/Component/ExternalScript").Component} Component.ExternalScript
   * @property {import("./Game/Component/Script").Controller} Component.ScriptController
   * @property {import("./Game/Component/Component").Controller} Component.Controller
   * @property {import("./Game/Component/Component").Model} Component.Model
   */
  Game: {
    Context: require('./Game/Context').Context,
    ScriptBase: require('./Game/Context').ScriptBase,
    Object3D: require('./Game/Object3D'),
    StateInterpolator: require('./Game/State/Interpolator'),
    State: require('./Game/State/State'),
    ScriptTemplate: require('./Game/ScriptTemplate/ScriptTemplate'),
    Component: {
      Render: require('./Game/Component/Render').Component,
      Audio: require('./Game/Component/Audio').Component,
      ExternalScript: require('./Game/Component/ExternalScript').Component,
      ScriptController: require('./Game/Component/Script').Controller,
      Controller: require('./Game/Component/Component').Controller,
      Model: require('./Game/Component/Component').Model,
    },
  },
};

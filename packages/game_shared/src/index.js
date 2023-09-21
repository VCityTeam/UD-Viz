/* eslint-disable jsdoc/require-property-description */

/**
 * game shared library (browser + node compatible)
 *
 * @exports gameShared
 */
module.exports = {
  constant: require('./constant'),
  Command: require('./Command'),
  Context: require('./Context').Context,
  ScriptBase: require('./Context').ScriptBase,
  Object3D: require('./Object3D'),
  // state
  StateInterpolator: require('./state/Interpolator'),
  State: require('./state/State'),
  StateDiff: require('./state/Diff'),
  // component
  RenderComponent: require('./component/Render').Component,
  ColliderComponent: require('./component/Collider').Component,
  AudioComponent: require('./component/Audio').Component,
  ExternalScriptComponent: require('./component/ExternalScript').Component,
  GameScriptComponent: require('./component/GameScript').Component,
  // controller
  ScriptController: require('./component/Script').Controller,
  Controller: require('./component/Component').Controller,
  // model
  Model: require('./component/Component').Model,
};

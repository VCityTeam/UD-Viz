// @ud-viz/browser bundle API

// Component temporary everything need out of the bundle should be expose TODO_ISSUE
import * as Component from './Component/Component.js';
export { Component };

export { AllWidget } from './AllWidget/AllWidget';

import * as FileUtil from './Component/FileUtil';
export { FileUtil };

import * as THREEUtil from './Component/THREEUtil';
export { THREEUtil };

import * as Widget from './Component/Itowns/Widget/Widget';
export { Widget };

export { InputManager } from './Component/InputManager';

export { Planar as Frame3DPlanar } from './Component/Frame3D/Planar';

export { Billboard } from './Component/Frame3D/Component/Billboard';

// // Game
// import { Base } from './Game/BrowserScript';
// export { Base as BrowserScriptBase };

/**
 * External packages => These packages should be peerDep to force user of @ud-viz/browser to npm i them
 * Make a second index.js (indexBundle.js) so examples can still work
 * Like itowns => https://github.com/iTowns/itowns/blob/master/src/MainBundle.js
 */

// import * as udvizCore from '@ud-viz/core';
// export { udvizCore };

// itowns
import * as itowns from 'itowns';
import * as itownsWidgets from 'itowns/widgets';
export { itowns, itownsWidgets };

// // Jquery => should be peerDep for lib purpose
// import * as jquery from 'jquery';
// export { jquery };

// THREE
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
export {
  THREE,
  OrbitControls,
  TransformControls,
  ConvexGeometry,
  EffectComposer,
  RenderPass,
  ShaderPass,
};

// proj4
import * as proj4 from 'proj4';
export { proj4 };

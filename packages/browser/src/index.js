// @ud-viz/browser bundle API

// Template

export { AllWidget } from './AllWidget/AllWidget';

export { SinglePlayerGamePlanar } from './SinglePlayerGamePlanar/SinglePlayerGamePlanar';

// Template.Component

import * as ExternalScriptTemplate from './Component/ExternalGame/ScriptTemplate/ScriptTemplate';
export { ExternalScriptTemplate };

import * as ExternalGame from './Component/ExternalGame/ExternalGame';
export { ExternalGame };

import * as FileUtil from './Component/FileUtil';
export { FileUtil };

import * as THREEUtil from './Component/THREEUtil';
export { THREEUtil };

import * as Widget from './Component/Widget/Widget';
export { Widget };

export { InputManager } from './Component/InputManager';

export { AssetManager } from './Component/AssetManager/AssetManager';

export { Frame3DPlanar } from './Component/Frame3D/Frame3DPlanar';

export { Frame3DBase } from './Component/Frame3D/Frame3DBase/Frame3DBase';

export { Billboard } from './Component/Frame3D/Component/Billboard';

export { RequestAnimationFrameProcess } from './Component/RequestAnimationFrameProcess';

import * as Core from '@ud-viz/core';
export { Core };

export {
  add3DTilesLayers,
  addBaseMapLayer,
  addElevationLayer,
  addGeoJsonLayers,
} from './Component/Itowns/AddLayerFromConfig';

// // Game
// import { Base } from './Game/BrowserScript';
// export { Base as BrowserScriptBase };

/**
 * External packages => These packages should be peerDep to force user of @ud-viz/browser to npm i them
 * Make a second index.js (indexBundle.js) so examples can still work
 * Like itowns => https://github.com/iTowns/itowns/blob/master/src/MainBundle.js
 *
 * - @ud-viz/core also ?
 */

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

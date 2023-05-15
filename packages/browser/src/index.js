/** @file @ud-viz/browser API */

export { SocketIOWrapper } from './SocketIOWrapper.js';

export { InputManager } from './InputManager';

import * as THREEUtil from './THREEUtil';
export { THREEUtil };

export { default as FileUtil } from './FileUtil.js';

export * from './HTMLUtil.js';

export { AssetManager, RenderData } from './AssetManager/AssetManager.js';

export { RequestService } from './RequestService';

export * from './ItownsUtil';

export * from './LocalStorageUtil.js';

export * from './Frame3D/Frame3D';

export * from './GUI/GUI';

import * as Game from './Game/Game';
export { Game };

import * as Widget from './Widget/Widget';
export { Widget };

/**
 * External packages => These packages should be peerDep to force user of @ud-viz/browser to npm i them
 * Make a second index.js (indexBundle.js) so examples can still work
 * Like itowns => https://github.com/iTowns/itowns/blob/master/src/MainBundle.js
 *
 * - @ud-viz/shared also ?
 */

// shared
import * as Shared from '@ud-viz/shared';
export { Shared };

// itowns
import * as itowns from 'itowns';
import * as itownsWidgets from 'itowns/widgets';
export { itowns, itownsWidgets };

// Jquery => should be peerDep for lib purpose
import * as jquery from 'jquery';
export { jquery };

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

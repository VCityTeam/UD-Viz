// @ud-viz/browser API

// Components
import * as Components from './Components/Components.js';
export { Components };

// Itowns
import * as Itowns from './Itowns/Itowns';
export { Itowns };

// // Templates
// import * as Templates from './Templates/Templates.js';
// export { Templates };

// // Game
// import { Base } from './Game/BrowserScript';
// export { Base as BrowserScriptBase };

// // External package

// import * as udvizCore from '@ud-viz/core';
// export { udvizCore };

// // itowns => should be peerDep to force user to npm i its itowns and not expose it in api (no confusion with itowns above) ?
// import * as itowns from 'itowns';
// import * as itownsWidgets from 'itowns/widgets';
// export { itowns, itownsWidgets };

// // Jquery => should be peerDep for lib purpose
// import * as jquery from 'jquery';
// export { jquery };

// THREE
import * as THREE from 'three';
// Modules of three necessary but not expose in THREE API => THREE should be a peerDep like itowns to force user library to import it
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

// // Proj4 => should be peerDep for lib purpose
// import * as proj4 from 'proj4';
// export { proj4 };

/** @format */

// ud-viz API

// Components
import * as Components from './Components/Components.js';
export { Components };

// Widgets
import * as Widgets from './Widgets/Widgets.js';
export { Widgets };

// Game
import * as Game from './Game/Game.js';
export { Game };

// Templates
import * as Templates from './Templates/Templates.js';
export { Templates };

// Views
import * as Views from './Views/Views';
export { Views };

// External package

// itowns
import * as itowns from 'itowns';
import * as itownsWidgets from 'itowns/widgets';
export { itowns, itownsWidgets };

// Jquery
import * as jquery from 'jquery';
export { jquery };

// THREE
import * as THREE from 'three';
// Modules of three necessary but not expose in THREE API
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

// Proj4
import * as proj4 from 'proj4';
export { proj4 };

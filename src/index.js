/** @format */

//ud-viz API

//Components
import * as Components from './Components/Components.js';
export { Components };

//Widgets
import * as Widgets from './Widgets/Widgets.js';
export { Widgets };

//Game
import * as Game from './Game/Game.js';
export { Game };

//Templates
import * as Templates from './Templates/Templates.js';
export { Templates };

//Views
import * as Views from './Views/Views';
export { Views };

//external package

//itowns
import * as itowns from 'itowns';
//Wait to update itowns 2.38.0 at least
// import * as itownsWidgets from "itowns/widgets"
// export { itowns, itownsWidgets };
export { itowns };

//jquery
import * as jquery from 'jquery';
export { jquery };

//THREE
import * as THREE from 'three';
//modules of three necessary but not expose in THREE API
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

//proj4
import * as proj4 from 'proj4';
export { proj4 };

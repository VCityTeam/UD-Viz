// @ud-viz packages

// extensions 3DTiles
export * as extensions3DTilesTemporal from '@ud-viz/extensions_3d_tiles_temporal';

// frame 3d
export * as frame3d from '@ud-viz/frame3d';

// smdb
export * as smdb from '@ud-viz/smdb';

// showroom
export * as showRoom from '@ud-viz/show_room';

// point cloud visualizer
export * as pointCloudVisualizer from '@ud-viz/point_cloud_visualizer';

// game
export * as gameShared from '@ud-viz/game_shared';
export * as gameSharedTemplate from '@ud-viz/game_shared_template';
export * as gameBrowser from '@ud-viz/game_browser';
export * as gameBrowserTemplate from '@ud-viz/game_browser_template';
export * as gameEditor from '@ud-viz/game_editor';

// utils
export * from '@ud-viz/utils_browser';
export * from '@ud-viz/utils_shared';

// widget
export * as widgetC3DTiles from '@ud-viz/widget_3d_tiles';
export * as widgetBaseMap from '@ud-viz/widget_base_map';
export * as widgetBookmark from '@ud-viz/widget_bookmark';
export * as widgetCameraPositioner from '@ud-viz/widget_camera_positioner';
export * as widgetPlanarControls from '@ud-viz/widget_planar_controls';
export * as widgetExtensions3DTilesTemporal from '@ud-viz/widget_extensions_3d_tiles_temporal';
export * as widgetGeocoding from '@ud-viz/widget_geocoding';
export * as widgetLayerChoice from '@ud-viz/widget_layer_choice';
export * as widgetSlideShow from '@ud-viz/widget_slide_show';
export * as widgetSPARQL from '@ud-viz/widget_sparql';
export * as widgetWorkspace from '@ud-viz/widget_workspace';
export * as widgetVersioning from '@ud-viz/widget_versioning';
export * as widgetGuidedTour from '@ud-viz/widget_guided_tour';
export * as widgetLegonizer from '@ud-viz/widget_legonizer';

// peerDep
import * as THREE from 'three';
import * as itowns from 'itowns';
import * as proj4 from 'proj4';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
export {
  THREE,
  itowns,
  proj4,
  TransformControls,
  RenderPass,
  ShaderPass,
  EffectComposer,
};

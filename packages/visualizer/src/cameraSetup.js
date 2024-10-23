import {
  localStorageSetMatrix4,
  localStorageSetVector3,
} from '@ud-viz/utils_browser';
import { C3DTILES_LAYER_EVENTS, Layer, PlanarView } from 'itowns';
import { Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import { Visualizer } from '.';

/**
 * Sets up default camera settings for an iTowns view.
 *
 * @param {PlanarView} itownsView - iTowns view
 * @param {OrbitControls} orbitControls - Orbit controls for the camera.
 * @param {Array<Layer>} layers - layers in the scene.
 * @param {object} [camOptions] - camera options.
 * @param {object} [camOptions.default] - Default camera options.
 * @param {object} [camOptions.default.position] - Default camera position coordinates.
 */
export function setUpCameraDefaults(
  itownsView,
  orbitControls,
  layers,
  camOptions
) {
  const camera3D = itownsView.camera.camera3D;

  // Try to set camera position from local storage
  if (
    !localStorageSetMatrix4(
      camera3D.matrixWorld,
      Visualizer.CAMERA_LOCAL_STORAGE_KEY
    )
  ) {
    // If not in local storage, use default position from options
    if (camOptions && camOptions.default)
      camera3D.position.set(
        camOptions.default.position.x,
        camOptions.default.position.y,
        camOptions.default.position.z
      );
  } else {
    // If found in local storage, decompose the matrix to set position, rotation, and scale
    camera3D.matrixWorld.decompose(
      camera3D.position,
      camera3D.quaternion,
      camera3D.scale
    );
    camera3D.updateProjectionMatrix();
  }

  // Try to set orbit controls target from local storage
  if (
    !localStorageSetVector3(
      orbitControls.target,
      Visualizer.TARGET_LOCAL_STORAGE_KEY
    )
  ) {
    // If not in local storage, set up a listener to set target when tile content is loaded
    const listener = (layer) => {
      const bb = layer.tileContent.boundingVolume.box;
      const center = bb.getCenter(new Vector3());
      const target = layer.tileContent.position.clone().add(center.clone());
      orbitControls.target.copy(target);
      orbitControls.update();
      itownsView.notifyChange(camera3D);

      // Remove the listener from all layers once target is set
      layers.forEach((layer) =>
        layer.removeEventListener(
          C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
          listener
        )
      );
    };

    // Add the listener to all layers
    layers.forEach((layer) => {
      layer.addEventListener(
        C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
        listener
      );
    });
  }
}

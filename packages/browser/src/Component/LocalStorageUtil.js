import * as THREE from 'three';

/**
 * Some unique key to not collide with another item recorded in localStorage
 */
const KEY = {
  CAMERA: 'ab9b47f4-930d-48d8-a810-aa184181a560',
};

/**
 * If there was a camera matrix recorded in localStorage restore it matrix world + when tab is closing record current camera matrix world
 * /!\ calling this function make window reference the camera avoiding it to be GC and could cause memory leak
 * You want to use this only when there is just one camera during the lifecycle of your application
 *
 * @param {THREE.PerspectiveCamera} camera - camera to track
 * @returns {boolean} true if camera has been setted with localStorage
 */
export function localStorageSetCamera(camera) {
  if (!camera) throw new Error('no camera to track');

  // listen the close tab event
  window.addEventListener('beforeunload', () => {
    camera.updateMatrixWorld();
    localStorage.setItem(KEY.CAMERA, camera.matrixWorld.toArray().toString());
  });

  // check if there was a previous camera matrix
  const storedMatrixArrayString = localStorage.getItem(KEY.CAMERA);

  if (storedMatrixArrayString) {
    let error = false;
    try {
      const storedMatrixArray = storedMatrixArrayString
        .split(',')
        .map((x) => parseFloat(x));

      const storedCameraMatrixWorld = new THREE.Matrix4().fromArray(
        storedMatrixArray
      );
      storedCameraMatrixWorld.decompose(
        camera.position,
        camera.quaternion,
        camera.scale
      );
    } catch (e) {
      error = true;
      console.error(e);
    }
    return !error;
  }

  return false;
}

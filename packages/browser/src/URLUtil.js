import { Data } from '@ud-viz/shared';
import * as THREE from 'three';

export const CAMERA_MATRIX_URL_KEY = 'camera_matrix';

/**
 * Initialize camera matrix with url search params produced by `appendCameraMatrixToURL`
 *
 * @param {THREE.PerspectiveCamera} camera - camera to initialize with url
 * @returns {boolean} true if a camera matrix has been found in url
 */
export function URLSetCameraMatrix(camera) {
  const paramsUrl = new URLSearchParams(window.location.search);
  if (paramsUrl.has(CAMERA_MATRIX_URL_KEY)) {
    const matrix4SubStrings = Data.matrix4ArrayFromURIComponent(
      decodeURIComponent(paramsUrl.get(CAMERA_MATRIX_URL_KEY))
    );
    if (matrix4SubStrings) {
      // compatible matrix4 uri
      const cameraMatrix = new THREE.Matrix4().fromArray(
        matrix4SubStrings.map((x) => parseFloat(x))
      );
      cameraMatrix.decompose(camera.position, camera.quaternion, camera.scale);
      return true;
    }
  }
  return false;
}

/**
 * Append in search params of an url the camera matrix
 *
 * @param {URL} url - url to append the camera matrix
 * @param {THREE.PerspectiveCamera} camera - camera to read the matrix from
 * @returns {URL} - url to append the camera matrix
 */
export function appendCameraMatrixToURL(url, camera) {
  url.searchParams.append(
    encodeURI(CAMERA_MATRIX_URL_KEY),
    encodeURIComponent(camera.matrixWorld.toArray().toString())
  );
  return url;
}

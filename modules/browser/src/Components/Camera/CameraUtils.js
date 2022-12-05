/** @format */

const THREE = require('three');

/**
 * Makes the camera move to focus on the target position.
 *
 * @param {itowns.View} view The iTowns view.
 * @param {itowns.PlanarControls} controls The camera controls.
 * @param {THREE.Vector3} targetPos The target position.
 * @param {*} [options] Optional parameters for the travel. Accepted entries
 * are :
 * - `duration` : the duration of the movement, in seconds. The promise will
 * resolve after this value. If not specified, the value `auto` is used for
 * the movement (see the `PlanarControls.initateTravel` method), and the promise
 * resolves imediatly.
 * - `verticalDistance` : Desired height of the camera relative to the target
 * position.
 * - `horizontalDistance` : Desired distance of the camera from the target
 * position.
 */
export function focusCameraOn(view, controls, targetPos, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const duration = options.duration || null;
      const verticalDist = options.verticalDistance || 800;
      const horizontalDist = options.horizontalDistance || 1000;

      const cameraPos = view.camera.camera3D.position.clone();
      const direction = new THREE.Vector3().subVectors(targetPos, cameraPos);
      const currentDist = Math.sqrt(
        direction.x * direction.x + direction.y * direction.y
      );
      cameraPos.addScaledVector(direction, 1 - horizontalDist / currentDist);
      cameraPos.z = targetPos.z + verticalDist;
      const travelDuration = duration ? duration : 'auto';
      const timeoutDuration = duration ? duration * 1000 : 0;
      controls.initiateTravel(cameraPos, travelDuration, targetPos, true);
      setTimeout(resolve, timeoutDuration);
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Compute near and far camera attributes to fit a quadrilatere of the extent + height size
 *
 * @param {THREE.Camera} camera
 * @param {itowns.Extent} extent
 * @param {number} height
 */
export function computeNearFarCamera(camera, extent, height) {
  const points = [
    new THREE.Vector3(extent.west, extent.south, 0),
    new THREE.Vector3(extent.west, extent.south, height),
    new THREE.Vector3(extent.west, extent.north, 0),
    new THREE.Vector3(extent.west, extent.north, height),
    new THREE.Vector3(extent.east, extent.south, 0),
    new THREE.Vector3(extent.east, extent.south, height),
    new THREE.Vector3(extent.east, extent.north, 0),
    new THREE.Vector3(extent.east, extent.north, height),
  ];

  const dirCamera = camera.getWorldDirection(new THREE.Vector3());

  let min = Infinity;
  let max = -Infinity;
  points.forEach(function (p) {
    const pointDir = p.clone().sub(camera.position);
    const cos = pointDir.dot(dirCamera) / pointDir.length(); // Dircamera length is 1
    const dist = p.distanceTo(camera.position) * cos;
    if (min > dist) min = dist;
    if (max < dist) max = dist;
  });

  camera.near = Math.max(min, 0.000001);
  camera.far = max;

  camera.updateProjectionMatrix();
}

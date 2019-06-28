/**
 * Makes the camera move to focus on the target position.
 * 
 * @param {itowns.View} view The iTowns view.
 * @param {itowns.PlanarControls} controls The camera controls.
 * @param {THREE.Vector3} targetPos The target position.
 * @param {number} [duration] The duration of travel, in seconds. If not specified
 * the value 'auto' is used for `initiateTravel` and the promise resolves
 * without waiting for the travel to be finished.
 */
export function focusCameraOn(view, controls, targetPos, duration) {
  return new Promise((resolve, reject) => {
    try {
      let cameraPos = view.camera.camera3D.position.clone();
      const deltaZ = 800;
      const horizontalDistance = 1.3 * deltaZ;
      const dist = cameraPos.distanceTo(targetPos);
      const direction = (new THREE.Vector3()).subVectors(targetPos, cameraPos);
      cameraPos.addScaledVector(direction, (1 - horizontalDistance / dist));
      cameraPos.z = targetPos.z + deltaZ;
      let travelDuration = duration ? duration : 'auto';
      let timeoutDuration = duration ? duration * 1000 : 0;
      controls.initiateTravel(cameraPos, travelDuration, targetPos, true);
      setTimeout(resolve, timeoutDuration);
    } catch (e) {
      reject(e);
    }
  });
}
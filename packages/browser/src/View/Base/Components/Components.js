import * as THREE from 'three';

export { Billboard } from './Billboard';

/**
 *
 * @param {*} camera
 * @param {*} min
 * @param {*} max
 */
export function computeNearFarCamera(camera, min, max) {
  const points = [
    new THREE.Vector3(min.x, min.y, min.z),
    new THREE.Vector3(min.x, min.y, max.z),
    new THREE.Vector3(min.x, max.y, min.z),
    new THREE.Vector3(min.x, max.y, max.z),
    new THREE.Vector3(max.x, min.y, min.z),
    new THREE.Vector3(max.x, min.y, max.z),
    new THREE.Vector3(max.x, max.y, min.z),
    new THREE.Vector3(max.x, max.y, max.z),
  ];

  const dirCamera = camera.getWorldDirection(new THREE.Vector3());

  let minDist = Infinity;
  let maxDist = -Infinity;
  points.forEach(function (p) {
    const pointDir = p.clone().sub(camera.position);
    const cos = pointDir.dot(dirCamera) / pointDir.length(); // Dircamera length is 1
    const dist = p.distanceTo(camera.position) * cos;
    if (minDist > dist) minDist = dist;
    if (maxDist < dist) maxDist = dist;
  });

  camera.near = Math.max(minDist, 0.000001);
  camera.far = maxDist;

  camera.updateProjectionMatrix();
}

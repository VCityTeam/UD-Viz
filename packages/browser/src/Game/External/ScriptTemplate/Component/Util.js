import * as itowns from 'itowns';
import * as THREE from 'three';

/**
 * Compute relative elevation from ground of a Object3D
 *
 * @param {THREE.Object3D} object3D - object3D
 * @param {itowns.TiledGeometryLayer} tileLayer - tile layer used to compute elevation
 * @param {string} crs - coordinates referential system
 * @returns {number} - relative elevation
 */
export function computeRelativeElevationFromGround(object3D, tileLayer, crs) {
  const parentGOWorldPos = new THREE.Vector3();
  object3D.parent.matrixWorld.decompose(
    parentGOWorldPos,
    new THREE.Quaternion(),
    new THREE.Vector3()
  );
  const goWorldPos = new THREE.Vector3();
  object3D.matrixWorld.decompose(
    goWorldPos,
    new THREE.Quaternion(),
    new THREE.Vector3()
  );
  const elevation = itowns.DEMUtils.getElevationValueAt(
    tileLayer,
    new itowns.Coordinates(crs, goWorldPos),
    1 // PRECISE_READ_Z
  );

  return elevation - parentGOWorldPos.z;
}

/**
 * Modify left and top css attributes of your html element to place in scene3D
 *
 * @param {HTMLElement} htmlToMove - html element to modify left and top attributes
 * @param {THREE.Vector3} worldPos - world position where to move your html
 * @param {THREE.PerspectiveCamera} camera - camera of the scene3D
 */
export function moveHtmlToWorldPosition(htmlToMove, worldPos, camera) {
  worldPos.project(camera);

  // compute position on screen
  // note that this is working only when parent div of the html is 100% window size
  const widthHalf = window.innerWidth * 0.5,
    heightHalf = window.innerHeight * 0.5;
  worldPos.x = worldPos.x * widthHalf + widthHalf;
  worldPos.y = -(worldPos.y * heightHalf) + heightHalf;

  htmlToMove.style.left = worldPos.x + 'px';
  htmlToMove.style.top = worldPos.y + 'px';
}

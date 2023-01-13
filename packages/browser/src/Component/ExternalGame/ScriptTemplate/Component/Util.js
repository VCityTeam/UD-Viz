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

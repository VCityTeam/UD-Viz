import { C3DTilesLayer } from 'itowns';
import {
  Box3,
  BufferAttribute,
  BufferGeometry,
  Matrix3,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from 'three';

/**
 * Creates a mock-up object based.
 *
 * @param {Array<C3DTilesLayer>} layers Array of layers, contains information about objects in a 3D scene.
 * @param {Box3} area Box3 the selected area for the mock-up.
 * @returns {Mesh} mock-up object
 */
export function createMockUpObject(layers, area) {
  if (!area.min || !area.max)
    throw new Error("area is not a Box3 or hasn't min and max field");
  if (!layers.length) {
    console.warn("Can't create mockUp without layers");
    return null;
  }

  // Parse geometry intersected
  const geometryMockUp = new BufferGeometry();
  const positionsMockUp = [];
  const normalsMockUp = [];
  const materialsMockup = [];

  const addToFinalMockUp = (positions, normals, color) => {
    let materialIndex = -1;
    const material = materialsMockup.filter((mat, index) => {
      if (mat.color.getHex() == color) {
        materialIndex = index;
        return true;
      }
      return false;
    });
    if (material.length == 0) {
      materialsMockup.push(new MeshStandardMaterial({ color: color }));
      materialIndex = materialsMockup.length - 1;
    }

    geometryMockUp.addGroup(
      positionsMockUp.length / 3,
      positions.length / 3,
      materialIndex
    );

    positionsMockUp.push(...positions);
    normalsMockUp.push(...normals);
  };

  // compute potential object intersecting
  const potentialObjects = new Map();
  layers.forEach((l) => {
    l.object3d.traverse((child) => {
      if (child.geometry && child.geometry.attributes._BATCHID) {
        const bbChild = child.geometry.boundingBox
          .clone()
          .applyMatrix4(child.matrixWorld);
        if (area.intersectsBox(bbChild))
          potentialObjects.set(child.uuid, child);
      }
    });
  });

  // compute gml_id intersecting
  const gmlIDs = [];
  const bbBuffer = new Box3();
  layers.forEach((l) => {
    /* First pass to find gmlids to add to mock up */
    for (const [, c3dTfeatures] of l.tilesC3DTileFeatures) {
      for (const [, feature] of c3dTfeatures) {
        const gmlId = feature.getInfo().batchTable['gml_id'];
        if (gmlIDs.includes(gmlId) || !gmlId) continue; // gml id already added
        if (!potentialObjects.has(feature.object3d.uuid)) continue; // object3d not intersecting with area

        feature.computeWorldBox3(bbBuffer);

        if (area.intersectsBox(bbBuffer)) gmlIDs.push(gmlId);
      }
    }
  });

  // add to mockup gmlids recorded
  const bufferPos = new Vector3();
  const bufferNormal = new Vector3();
  layers.forEach((l) => {
    for (const [, c3dTfeatures] of l.tilesC3DTileFeatures) {
      for (const [, feature] of c3dTfeatures) {
        const gmlId = feature.getInfo().batchTable['gml_id'];
        if (gmlIDs.includes(gmlId)) {
          // add to the mockup

          const positions = [];
          const normals = [];
          const normalMatrixWorld = new Matrix3().getNormalMatrix(
            feature.object3d.matrixWorld
          );

          feature.groups.forEach((group) => {
            const positionIndexStart = group.start * 3;
            const positionIndexCount = (group.start + group.count) * 3;

            for (
              let index = positionIndexStart;
              index < positionIndexCount;
              index += 3
            ) {
              bufferPos.x =
                feature.object3d.geometry.attributes.position.array[index];
              bufferPos.y =
                feature.object3d.geometry.attributes.position.array[index + 1];
              bufferPos.z =
                feature.object3d.geometry.attributes.position.array[index + 2];

              positions.push(
                ...bufferPos
                  .applyMatrix4(feature.object3d.matrixWorld)
                  .toArray()
              );

              bufferNormal.x =
                feature.object3d.geometry.attributes.normal.array[index];
              bufferNormal.y =
                feature.object3d.geometry.attributes.normal.array[index + 1];
              bufferNormal.z =
                feature.object3d.geometry.attributes.normal.array[index + 2];

              normals.push(
                ...bufferNormal.applyMatrix3(normalMatrixWorld).toArray()
              );
            }
          });

          addToFinalMockUp(positions, normals, feature.object3d.material.color);
        }
      }
    }
  });

  // create mock up from geometry
  geometryMockUp.setAttribute(
    'position',
    new BufferAttribute(new Float32Array(positionsMockUp), 3)
  );
  geometryMockUp.setAttribute(
    'normal',
    new BufferAttribute(new Float32Array(normalsMockUp), 3)
  );

  // center geometryockUp on xy and put it at zero on z
  geometryMockUp.computeBoundingBox();
  const bbMockUp = geometryMockUp.boundingBox;
  const centerMockUp = bbMockUp.min.clone().lerp(bbMockUp.max, 0.5);
  const geoPositionsMockUp = geometryMockUp.attributes.position.array;
  for (let index = 0; index < geoPositionsMockUp.length; index += 3) {
    geoPositionsMockUp[index] -= centerMockUp.x;
    geoPositionsMockUp[index + 1] -= centerMockUp.y;
    geoPositionsMockUp[index + 2] -= bbMockUp.min.z; // so it's on the table
  }

  // create mesh
  const mockUpObject = new Mesh(geometryMockUp, materialsMockup);
  mockUpObject.name = 'MockUp Object';

  return mockUpObject;
}

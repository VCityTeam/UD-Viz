/** @format */

const THREE = require('three');

import * as Components from '../../Components/Components';

/**
 *
 * @param layerManager
 * @param areaSelected
 */
export function updateMockUpObject(layerManager, areaSelected) {
  const area = areaSelected;
  let mockUpObject;
  if (area.min && area.max) {
    // Update 3DTiles mock up object
    // if (this.mockUpObject && this.mockUpObject.parent) {
    //   this.mockUpObject.parent.remove(this.mockUpObject);
    // }

    // Parse geometry intersected
    const materialsMockup = [];
    const geometryMockUp = new THREE.BufferGeometry();
    const positionsMockUp = [];
    const normalsMockUp = [];

    const addToFinalMockUp = (positions, normals, material) => {
      let materialIndex = -1;
      for (let index = 0; index < materialsMockup.length; index++) {
        const m = materialsMockup[index];
        if (m.uuid == material.uuid) {
          materialIndex = index;
          break;
        }
      }
      if (materialIndex == -1) {
        materialsMockup.push(material);
        materialIndex = materialsMockup.length - 1;
      }

      // TODO could mix group between them
      geometryMockUp.addGroup(
        positionsMockUp.length / 3,
        positions.length / 3,
        materialIndex
      );

      // positionsMockUp.push(...positions);
      // normalsMockUp.push(...normals);

      positions.forEach((p) => {
        positionsMockUp.push(p);
      });

      normals.forEach((n) => {
        normalsMockUp.push(n);
      });
    };

    layerManager.tilesManagers.forEach((tileManager) => {
      const object = tileManager.layer.root;

      if (!object) return;

      // Gml and cityobjectid intersecting area
      const cityObjectIDs = [];
      const gmlIds = [];

      // Add cityobject intersecting area
      object.traverse((child) => {
        if (child.geometry && !child.userData.metadata.children) {
          const tileId = Components.getTileFromMesh(child).tileId;

          // Check if its belong to the area
          const bb = child.geometry.boundingBox;

          const minChild = bb.min.clone().applyMatrix4(child.matrixWorld);
          const maxChild = bb.max.clone().applyMatrix4(child.matrixWorld);

          if (intersectArea(area, minChild, maxChild)) {
            // Check more precisely what batchID intersect
            const positions = child.geometry.attributes.position.array;
            const normals = child.geometry.attributes.normal.array;
            const batchIds = child.geometry.attributes._BATCHID.array;

            if (
              positions.length != normals.length ||
              positions.length != 3 * batchIds.length
            ) {
              throw 'wrong count geometry';
            }

            // Buffer attr
            let minBB, maxBB;

            const currentPositions = [];
            const currentNormals = [];
            let currentCount = -1;
            const position = new THREE.Vector3();
            const normal = new THREE.Vector3();
            const normalMatrixWorld = new THREE.Matrix3().getNormalMatrix(
              child.matrixWorld
            );

            // Check if the current positions normals should be add to mockup geometry
            const checkCurrentBatch = () => {
              // Find material
              const groups = child.geometry.groups;
              let currentMaterial;
              for (let j = 0; j < groups.length; j++) {
                const group = groups[j];
                if (
                  currentCount >= group.start &&
                  currentCount <= group.start + group.count
                ) {
                  // Include
                  currentMaterial = child.material[group.materialIndex];
                  break;
                }
              }

              if (!currentMaterial) throw 'do not find material';

              // Compute bb
              minBB = new THREE.Vector2(Infinity, Infinity); // Reset
              maxBB = new THREE.Vector2(-Infinity, -Infinity); // Reset

              for (let index = 0; index < currentPositions.length; index += 3) {
                const x = currentPositions[index];
                const y = currentPositions[index + 1];

                minBB.x = Math.min(x, minBB.x);
                minBB.y = Math.min(y, minBB.y);
                maxBB.x = Math.max(x, maxBB.x);
                maxBB.y = Math.max(y, maxBB.y);
              }

              if (intersectArea(area, minBB, maxBB)) {
                // Intersect area should be add
                addToFinalMockUp(
                  currentPositions,
                  currentNormals,
                  currentMaterial
                );

                // Record cityobject id and gml id for further pass
                cityObjectIDs.push(
                  new Components.CityObjectID(tileId, currentBatchID)
                );

                let gmlID =
                  tileManager.tiles[tileId].cityObjects[currentBatchID].props
                    .gml_id;

                if (!gmlID)
                  gmlID =
                    tileManager.tiles[tileId].cityObjects[currentBatchID].props
                      .id;

                if (!gmlIds.includes(gmlID)) gmlIds.push(gmlID);
              }

              // Reset
              currentPositions.length = 0;
              currentNormals.length = 0;
            };

            let currentBatchID = batchIds[0];
            for (let i = 0; i < positions.length; i += 3) {
              const count = i / 3;
              currentCount = count;
              const batchID = batchIds[count];

              if (currentBatchID != batchID) {
                // New batch id check if previous one should be add to geometry
                checkCurrentBatch();
                currentBatchID = batchID;
              }

              // Position
              position.x = positions[i];
              position.y = positions[i + 1];
              position.z = positions[i + 2];

              // Add world position
              position.applyMatrix4(child.matrixWorld);
              currentPositions.push(position.x);
              currentPositions.push(position.y);
              currentPositions.push(position.z);

              // Normal
              normal.x = normals[i];
              normal.y = normals[i + 1];
              normal.z = normals[i + 2];

              // Add world normal
              normal.applyMatrix3(normalMatrixWorld);
              currentNormals.push(normal.x);
              currentNormals.push(normal.y);
              currentNormals.push(normal.z);
            }
            // The last batchID has not been checked
            checkCurrentBatch();
          }
        }
      });

      // Add missing batch if not intersected
      object.traverse((child) => {
        if (child.geometry && !child.userData.metadata.children) {
          const tileId = Components.getTileFromMesh(child).tileId;

          // Atributes
          const positions = child.geometry.attributes.position.array;
          const normals = child.geometry.attributes.normal.array;
          const batchIds = child.geometry.attributes._BATCHID.array;

          if (
            positions.length != normals.length ||
            positions.length != 3 * batchIds.length
          ) {
            throw 'wrong count geometry';
          }

          const normalMatrixWorld = new THREE.Matrix3().getNormalMatrix(
            child.matrixWorld
          );

          for (let i = 0; i < batchIds.length; i++) {
            const batchID = batchIds[i];
            const cityObjectId = new Components.CityObjectID(tileId, batchID);

            const cityObject = tileManager.getCityObject(cityObjectId);

            let gmlID = cityObject.props.gml_id;
            if (!gmlID) gmlID = cityObject.props.id;

            if (gmlIds.includes(gmlID)) {
              // Cityobject having a gmlid intersecting
              let alreadyAdded = false;
              for (let j = 0; j < cityObjectIDs.length; j++) {
                const alreadyAddCityObjectID = cityObjectIDs[j];
                if (cityObjectId.equal(alreadyAddCityObjectID)) {
                  alreadyAdded = true;
                  break;
                }
              }

              if (!alreadyAdded) {
                // Cityobject not intersecting but having a gml id intersecting
                const chunkPositions = positions.slice(
                  cityObject.indexStart * 3,
                  (cityObject.indexEnd + 1) * 3
                ); // +1 because slice does not include last index

                const chunkNormals = normals.slice(
                  cityObject.indexStart * 3,
                  (cityObject.indexEnd + 1) * 3
                );

                if (cityObject.indexCount <= 2) {
                  throw 'wrong indexCount';
                }

                // Apply world transform
                const position = new THREE.Vector3();
                const normal = new THREE.Vector3();
                for (let j = 0; j < chunkPositions.length; j += 3) {
                  // Position
                  position.x = chunkPositions[j];
                  position.y = chunkPositions[j + 1];
                  position.z = chunkPositions[j + 2];

                  // Add world position
                  position.applyMatrix4(child.matrixWorld);
                  chunkPositions[j] = position.x;
                  chunkPositions[j + 1] = position.y;
                  chunkPositions[j + 2] = position.z;

                  // Normal
                  normal.x = chunkNormals[j];
                  normal.y = chunkNormals[j + 1];
                  normal.z = chunkNormals[j + 2];

                  // Add world normal
                  normal.applyMatrix3(normalMatrixWorld);
                  chunkNormals[j] = normal.x;
                  chunkNormals[j + 1] = normal.y;
                  chunkNormals[j + 2] = normal.z;
                }

                // One cityobject get one material index dynamic search
                const count = cityObject.indexStart;
                let added = false; // Just for debug
                for (let j = 0; j < child.geometry.groups.length; j++) {
                  const group = child.geometry.groups[j];

                  if (
                    count >= group.start &&
                    count <= group.start + group.count
                  ) {
                    // Found material add to mock up and break
                    addToFinalMockUp(
                      chunkPositions,
                      chunkNormals,
                      child.material[group.materialIndex]
                    );
                    added = true;
                    break;
                  }
                }
                if (!added) throw 'do not find material'; // Just for debug
              }
            }
          }
        }
      });
    });

    // Create mock up from geometry
    geometryMockUp.setAttribute(
      'position',
      new THREE.BufferAttribute(new Float32Array(positionsMockUp), 3)
    );
    geometryMockUp.setAttribute(
      'normal',
      new THREE.BufferAttribute(new Float32Array(normalsMockUp), 3)
    );

    // Center geometryockUp on xy and put it at zero on z
    geometryMockUp.computeBoundingBox();
    const bbMockUp = geometryMockUp.boundingBox;
    const centerMockUp = bbMockUp.min.clone().lerp(bbMockUp.max, 0.5);
    const geoPositionsMockUp = geometryMockUp.attributes.position.array;
    for (let index = 0; index < geoPositionsMockUp.length; index += 3) {
      geoPositionsMockUp[index] -= centerMockUp.x;
      geoPositionsMockUp[index + 1] -= centerMockUp.y;
      geoPositionsMockUp[index + 2] -= bbMockUp.min.z; // So it's on the table
    }

    // Create mesh
    mockUpObject = new THREE.Mesh(geometryMockUp, materialsMockup);
    mockUpObject.name = 'MockUp Object';

    return mockUpObject;
  }
}

/**
 *
 * @param areaSelected
 * @param min
 * @param max
 */
export function intersectArea(areaSelected, min, max) {
  const area = areaSelected;

  if (!area.min || !area.max) return false;

  // TODO could be optimize if not compute at each intersect
  const minArea = new THREE.Vector2(
    Math.min(area.min.x, area.max.x),
    Math.min(area.min.y, area.max.y)
  );
  const maxArea = new THREE.Vector2(
    Math.max(area.min.x, area.max.x),
    Math.max(area.min.y, area.max.y)
  );

  return (
    minArea.x <= max.x &&
    maxArea.x >= min.x &&
    minArea.y <= max.y &&
    maxArea.y >= min.y
  );
}

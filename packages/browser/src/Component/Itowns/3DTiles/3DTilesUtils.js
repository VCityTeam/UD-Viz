import * as THREE from 'three';
import { TilesManager } from './TilesManager';

/**
 * Create a geometric outliers for each tile of a tileset when its geometry is loaded
 * Each outlier tile geometry does not keep the batchid for each outliers.
 * May be slow to create / load.
 *
 * @param {THREE.Object3D} tile  A 3DObject (should be a tile send by Tilesmanager.EVENT_TILE_LOADED)
 * @param {number} threshOldAngle  An edge is only rendered if the angle (in degrees) between the face normals of the adjoining faces exceeds this value. default = 1 degree.
 */
export function appendWireframeToTileset(tile, threshOldAngle = 30) {
  if (
    tile.children[0] &&
    tile.children[0].children[0] &&
    tile.children[0].children[0].geometry &&
    tile.children[0].children[0].geometry.isBufferGeometry
  ) {
    const geom = tile.children[0].children[0];
    if (!geom.userData.hasOutlier) {
      // This bool avoid to create multiple outliers for one geometry
      geom.userData.hasOutlier = true;

      // THREE.EdgesGeometry needs triangle indices to be created.
      // Create a new array for the indices
      const indices = [];

      // Iterate over every group of three vertices in the unindexed mesh and add the corresponding indices to the indices array
      for (let i = 0; i < geom.geometry.attributes.position.count; i += 3) {
        indices.push(i, i + 1, i + 2);
      }
      geom.geometry.setIndex(indices);

      // Create Outliers
      const geo = new THREE.EdgesGeometry(geom.geometry, threshOldAngle);
      const mat = new THREE.LineBasicMaterial({
        color: 0x000000,
      });
      const edges = new THREE.LineSegments(geo, mat);
      geom.add(edges);
    }
  }
}

/**
 * Create a geometric outliers for each tile of a tileset when its geometry is loaded
 * Each outlier tile geometry keep the batchid for each outliers to apply styles on a specific outlier using a CityObjectID.
 * This method is slower than createOutliersOfTileset().
 *
 * @param {TilesManager} tilesManager A TilesManage object from UD-Viz.
 */
export function appendWireframeByBatchIDToTileset(tilesManager) {
  tilesManager.addEventListener(
    TilesManager.EVENT_TILE_LOADED,
    function (tile) {
      if (tilesManager.tiles[tile.tileId] != undefined) {
        if (tilesManager.tiles[tile.tileId].cityObjects != undefined) {
          const geom =
            tilesManager.tiles[tile.tileId].getObject3D().children[0]
              .children[0];
          if (!geom.hasOutlier) {
            // This event can be triggered multiple times, even when the geometry is loaded.
            // This bool avoid to create multiple outliers for one geometry
            geom.hasOutlier = true;

            // Get the geometry that have the same _BATCHID to create its own outlier
            let startIndex = 0;

            // Position array that will be filled with each geometry ordered by _BATCHID
            const pos = new Array();

            // BatchID array that will be filled with _BATCHID
            const batchid = new Array();

            // Iterate through each _BATCHID geometry
            for (let i = 1; i < geom.geometry.attributes._BATCHID.count; i++) {
              if (
                geom.geometry.attributes._BATCHID.array[i - 1] !=
                geom.geometry.attributes._BATCHID.array[i]
              ) {
                const positionByBatchId = new THREE.BufferAttribute(
                  geom.geometry.attributes.position.array.slice(
                    startIndex,
                    i * 3
                  ),
                  3
                );

                // Create a geometry for this _BATCHID
                const mesh = new THREE.BufferGeometry();
                mesh.setAttribute('position', positionByBatchId);

                // THREE.EdgesGeometry needs triangle indices to be created.
                // Create a new array for the indices
                const indices = [];

                // Iterate over every group of three vertices in the unindexed mesh and add the corresponding indices to the indices array
                for (let j = 0; j < mesh.attributes.position.count; j += 3) {
                  indices.push(j, j + 1, j + 2);
                }
                mesh.setIndex(indices);

                // Create the outlier geometry for this _BATCHID
                const edges = new THREE.EdgesGeometry(mesh, 30);

                // Add this outlier geometry to the outlier geometry of the tile
                for (let l = 0; l < edges.attributes.position.count * 3; l++)
                  pos.push(edges.attributes.position.array[l]);
                // Fill the _BATCHID buffer
                for (let l = 0; l < edges.attributes.position.count; l++)
                  batchid.push(geom.geometry.attributes._BATCHID.array[i - 1]);

                startIndex = i * 3;
              }
            }

            const mat = new THREE.LineBasicMaterial({ color: 0x000000 });
            const tileEdges = new THREE.EdgesGeometry();
            tileEdges.setAttribute(
              'position',
              new THREE.BufferAttribute(Float32Array.from(pos), 3)
            );
            const wireframe = new THREE.LineSegments(tileEdges, mat);
            wireframe.geometry.setAttribute(
              '_BATCHID',
              new THREE.BufferAttribute(Int32Array.from(batchid), 1)
            );
            geom.add(wireframe);
          }
        }
      }
    }
  );
}

/**
 * Search a batch table in a tile. A tile is a THREE.js 3DObject with a
 * 3-level hierarchy : Object3D > Scene > Mesh. This function searches into the
 * for the batch table (which is located in the Object3D level).
 *
 * @param {object} tile A 3DTiles tile object from THREE.js.
 * @returns {object} The batch table of the tile
 */
export function getBatchTableFromTile(tile) {
  if (tile.batchTable) {
    return tile.batchTable;
  } else if (tile.parent) {
    return getBatchTableFromTile(tile.parent);
  }
  return undefined;
}

/**
 * Gets an object batch ID from an intersection. This methods takes one of the
 * 3 points of the intersection triangle and retrieves the corresponding batch
 * ID in the intersection tile.
 *
 * @param {object} inter An intersection
 * @returns {number} The batch ID of the intersected geometry
 */
export function getBatchIdFromIntersection(inter) {
  const index = inter.face.a;
  return inter.object.geometry.attributes._BATCHID.array[index];
}

/**
 * Get the first intersection object where the target is a 3D object with
 * a batch id (a.k.a. the "Mesh" of a tile).
 *
 * @param {Array<object>} intersects The array of intersections, provided by
 * itowns.View.pickObjectsAt
 * @returns {object} The first intersection of a visible tile
 */
export function getFirstTileIntersection(intersects) {
  for (const inter of intersects) {
    const tile = getTileFromMesh(inter.object);
    if (inter.object.visible && tile.visible && tile.content.visible) {
      return inter;
    }
  }
  return null;
}

/**
 * Retrieve all visible 3DTiles visible tiles (ie. those that are currently
 * rendered in the scene). This function recursively explores the tileset to
 * find all tiles and return them in a flattened array.
 *
 * @param {*} layer The 3DTiles layer.
 * @returns {Array<object>} An array of all visible tiles
 */
export function getVisibleTiles(layer) {
  const rootTile = layer.object3d.children[0];
  const tiles = [];
  const exploreTree = (node) => {
    if (node) {
      if (node.batchTable) {
        // It's an actual tile
        tiles.push(node);
      }
      for (
        let childIndex = 0;
        childIndex < node.children.length;
        childIndex++
      ) {
        const child = node.children[childIndex];
        if (child.type === 'Object3D') {
          // This child can be a tile or contain tiles so we explore it too
          exploreTree(child);
        }
      }
    }
  };
  exploreTree(rootTile);
  return tiles;
}

/**
 * Counts the number of 3DTiles tiles displayed by the view.
 *
 * @param {*} layer The 3DTiles layer.
 * @returns {number} The number of visible tiles
 */
export function getVisibleTileCount(layer) {
  return getVisibleTiles(layer).length;
}

/**
 * Finds the tile in the tileset with the specific ID.
 *
 * @param {*} rootTile The root tile of the 3DTiles tileset.
 * @param {*} tileId The tile id.
 * @returns {object} A 3DTiles tile object from THREE.js.
 */
export function getTileInTileset(rootTile, tileId) {
  let i = 0;
  let tile;
  if (rootTile.tileId === tileId) return rootTile;
  else if ('tileId' in rootTile && tileId != 0) {
    while (!tile && i < rootTile.children.length) {
      tile = getTileInTileset(rootTile.children[i], tileId);
      i++;
    }
  }
  return tile;
}

/**
 * Find the tile in the 3DTiles layer with the specifid ID.
 *
 * @param {*} layer The 3DTiles layer.
 * @param {number} tileId The tile id.
 * @returns {object} A 3DTiles tile object from THREE.js.
 */
export function getTileInLayer(layer, tileId) {
  const rootTile = layer.object3d.children[0];
  const tile = getTileInTileset(rootTile, tileId);
  return tile;
}

/**
 * Creates tile groups and associate them with the given materials.
 *
 * @param {*} tile The 3DTiles tile.
 * @param {Array<any>} materialsProps An array of material parameters. Each entry
 * should be an object that will be passed as parameter in the THREE.Material
 * constructor. Accepted values are for example `color` or `opacity`; actually
 * any property of the `MeshLambertMaterial` class is valid (see [THREE.js
 * documentation](https://threejs.org/docs/#api/en/materials/MeshLambertMaterial)).
 * @param {Array<any>} ranges An array of ranges. A range is an object with 3
 * propeties :
 * - `start`: the start index of the group of vertices
 * - `count`: the number of vertices of the group
 * - `material`: the index of the material in the materials array
 * @example
 * // Fetch the tile
 * let tile = getTileInLayer(this.layer, 6);
 * // Define 2 materials : #0 is red and a bit transparent, #1 is invisible
 * let materialProps = [
 *   { color: 0xff0000, opacity: 0.8},
 *   { opacity: 0}
 * ];
 * // Define 3 ranges associated with the materials
 * let ranges = [
 *   { start: 34629, count: 102, material: 1 },
 *   { start: 34131, count: 174, material: 0 },
 *   { start: 34731, count: 462, material: 0 }
 * ];
 * createTileGroups(tile, materialProps, ranges);
 */
export function createTileGroups(tile, materialsProps, ranges) {
  const meshes = getMeshesFromTile(tile);

  for (const [index, mesh] of meshes.entries()) {
    const defaultMaterial = Array.isArray(mesh.material)
      ? mesh.material[0]
      : mesh.material;

    // Reset the materials
    mesh.material = [defaultMaterial];

    // Material index table (index in materialProps -> index in mesh.material)
    const materialIndexTable = {};

    // Create the materials
    for (
      let materialIndex = 0;
      materialIndex < materialsProps.length;
      materialIndex++
    ) {
      const props = materialsProps[materialIndex];
      if (props.transparent === undefined) {
        props.transparent = true;
      }
      materialIndexTable[materialIndex] = mesh.material.length;
      mesh.material.push(new THREE.MeshStandardMaterial(props));
    }

    // Clear the existing groups
    mesh.geometry.groups = [];

    // Total of vertices in the tile
    const total = mesh.geometry.attributes._BATCHID.count;
    let meshRanges = ranges[index];

    if (meshRanges.length > 0) {
      // Sort the meshRanges by increasing start index
      meshRanges.sort((a, b) => {
        return a.start - b.start;
      });
      // Merge consecutive meshRanges with the same material
      const mergedRanges = [];
      for (let index = 0; index < meshRanges.length; index++) {
        const range = meshRanges[index];
        if (index === 0) {
          mergedRanges.push(range);
        } else {
          const currentMergingRange = mergedRanges[mergedRanges.length - 1];
          if (
            currentMergingRange.start + currentMergingRange.count ===
              range.start &&
            currentMergingRange.material === range.material
          ) {
            currentMergingRange.count += range.count;
          } else {
            mergedRanges.push(range);
          }
        }
      }
      meshRanges = mergedRanges;

      // Add the new groups
      for (let rangeIndex = 0; rangeIndex < meshRanges.length; rangeIndex++) {
        const range = meshRanges[rangeIndex];
        mesh.geometry.addGroup(
          range.start,
          range.count,
          materialIndexTable[range.material]
        );
      }

      // Fill the "blanks" between the meshRanges with the default material
      if (meshRanges[0].start > 0) {
        mesh.geometry.addGroup(0, meshRanges[0].start, 0);
      }
      for (let i = 0; i < meshRanges.length - 1; ++i) {
        const start = meshRanges[i].start + meshRanges[i].count;
        const count = meshRanges[i + 1].start - start;
        if (count > 0) {
          mesh.geometry.addGroup(start, count, 0);
        }
      }
      if (
        meshRanges[meshRanges.length - 1].start +
          meshRanges[meshRanges.length - 1].count <
        total
      ) {
        const start =
          meshRanges[meshRanges.length - 1].start +
          meshRanges[meshRanges.length - 1].count;
        mesh.geometry.addGroup(start, total - start, 0);
      }
    } else {
      // If no meshRanges array is specified, just add a group containing all vertices
      mesh.geometry.addGroup(0, total, 0);
    }
  }
}

/**
 * Tells the iTowns view to update the scene. If you made changes to some colors
 * for example, you need to call this function to actually see the changes.
 *
 * @param {*} view The iTowns view.
 * @param {*} layer An iTowns layer
 */
export function updateITownsView(view, layer) {
  try {
    view.mainLoop.gfxEngine.renderViewToBuffer(
      {
        scene: layer.object3d,
        camera: view.camera,
      },
      { x: 0, y: 0, width: 0, height: 0 }
    );
    view.notifyChange();
  } catch (e) {
    console.error(e);
  }
}

/**
 * Returns all the THREE.js meshes in the tile
 *
 * @param {object} tile A 3DTiles tile object from THREE.js.
 * @returns {Array<THREE.Mesh>} An array of the THREE.js meshes in the tile
 */
export function getMeshesFromTile(tile) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  // Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.children[0].type === 'Mesh')) {
    tile = tile.children[0];
  }

  for (const mesh of tile.children) {
    if (!mesh.geometry.attributes._BATCHID) {
      throw 'Invalid tile';
    }
    if (mesh.geometry.type !== 'BufferGeometry') {
      throw 'Tile has no buffer geometry';
    }
  }

  return tile.children;
}

/**
 * Returns the tile in which a mesh is contained
 *
 * @param {THREE.mesh} object A THREE.js mesh
 * @returns {object} A 3DTiles tile object from THREE.js.
 */
export function getTileFromMesh(object) {
  if (!object) {
    throw 'Object not loaded in view';
  }

  // Find the 'Object3D' part of the tile
  while (!!object.parent && !(object.type === 'Object3D')) {
    object = object.parent;
  }

  if (!object.batchTable) {
    throw 'Invalid tile : no batch table';
  }

  return object;
}

import * as THREE from 'three';
import { Data } from '@ud-viz/core';

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

// #OBSOLETE
/**
 * Changes the color of a tile, or specific vertices of the tile, using the
 * BufferGeometry.
 *
 * @param {*} tile The 3DTiles tile object from THREE.js
 * @param {Array<number>} newColor An array of RGB value between 0 and 1.
 * @param {Array<number>} [indexArray] Optional. The indexes of vertices to
 * change the color. By default, all vertices has their color changed. The array
 * is assumed to be **sorted** and **contiguous**.
 */
export function setTileVerticesColor(tile, newColor, indexArray = null) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  // Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Cannot change vertices color';
  }

  // Create the new color array
  const indexCount = tile.geometry.attributes._BATCHID.count;
  const colors = new Float32Array(indexCount * 3);

  const lowerBound = indexArray[0];
  const upperBound = indexArray[indexArray.length - 1];
  for (let i = 0; i < indexCount; i++) {
    let vertexColor = newColor;
    if (!!indexArray && (lowerBound > i || upperBound < i)) {
      // If i is not one of the selected indexes, we keep the previous color
      const previousColor = tile.geometry.attributes.color
        ? tile.geometry.attributes.color.array.slice(i * 3, i * 3 + 3)
        : tile.material.color.toArray();
      vertexColor = previousColor;
    }

    colors[i * 3] = vertexColor[0];
    colors[i * 3 + 1] = vertexColor[1];
    colors[i * 3 + 2] = vertexColor[2];
  }

  // We need to use the color of the vertices, not the material
  tile.material.vertexColors = true;

  if (!tile.geometry.attributes.color) {
    // If no vertex color is present, we need to add the BufferAttribute
    tile.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  } else {
    // Else we need to update the existing attribute
    tile.geometry.attributes.color.set(colors);
    tile.geometry.attributes.color.needsUpdate = true;
  }
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
 * Create groups in the tile mesh from the given batch IDs and materials.
 *
 * @param {*} tile The 3DTiles tile.
 * @param {Array<any>} groups An array of group descriptors. A group descriptor
 * is a dictionnary containing two entries :
 * - `material` contains the material parameters, such as `color` or `opacity`.
 * - `batchIDs` contains the batch IDs to be applied the given material.
 * @example
 * // Fetch the tile
 * let tile = getTileInLayer(layer, 6);
 * // Create groups for two types of objects : the first type has a red,
 * // transparent material. The second one is invisible.
 * createTileGroupsFromBatchIDs(tile, [
 *   {
 *     material: {color: 0xff0000, opacity: 0.8},
 *     batchIDs: [64, 67]
 *   },
 *   {
 *     material: {opacity: 0},
 *     batchIDs: [66]
 *   }
 * ]);
 */
export function createTileGroupsFromBatchIDs(tile, groups) {
  const materials = [];
  const ranges = [];

  const mesh = getMeshesFromTile(tile)[0];

  // Create an array we can loop on to search all batchIDs, plus a stucture
  // to associate batchIDs with their material
  const batchIDs = [];
  const materialIndexTable = {};
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    const group = groups[groupIndex];

    // Check if a similar material has been added
    let materialIndex = materials.findIndex((mat) => {
      return Data.objectEquals(mat, group.material);
    });
    if (materialIndex < 0) {
      // If the material is new, push it
      materialIndex = materials.length;
      materials.push(group.material);
    }

    // Push the batch IDs and remember their material
    for (
      let batchIDIndex = 0;
      batchIDIndex < group.batchIDs.length;
      batchIDIndex++
    ) {
      const batchID = group.batchIDs[batchIDIndex];
      batchIDs.push(batchID);
      materialIndexTable[batchID] = materialIndex;
    }
  }

  // Sort the batch IDs
  batchIDs.sort((a, b) => {
    return a - b;
  });

  // We need to find the ranges of the various batch IDs
  let searchingIndex = 0;
  let searchingBatchID = batchIDs[searchingIndex];
  let addingRange = {
    material: materialIndexTable[searchingBatchID],
  };

  // Loop once over all vertices to find the ranges
  for (
    let index = 0, total = mesh.geometry.attributes._BATCHID.count;
    index < total;
    index++
  ) {
    const batchID = mesh.geometry.attributes._BATCHID.array[index];

    // If we found a batch ID that is greater than the one we're searching, it
    // means we found the end of the range.
    if (batchID > searchingBatchID) {
      addingRange.count = index - addingRange.start;
      ranges.push(addingRange);

      if (searchingBatchID === undefined) {
        // No more batch IDs to search
        break;
      }

      searchingIndex += 1;
      searchingBatchID = batchIDs[searchingIndex];
      addingRange = {
        material: materialIndexTable[searchingBatchID],
      };
    }

    // If we find the correct batch ID, store the start index
    if (batchID === searchingBatchID && !addingRange.start) {
      addingRange.start = index;
    }

    if (
      index === mesh.geometry.attributes._BATCHID.count - 1 &&
      !!addingRange.start &&
      !addingRange.count
    ) {
      addingRange.count = index - addingRange.start + 1;
      ranges.push(addingRange);
    }
  }

  // Create the tile groups
  createTileGroups(mesh, materials, ranges);
}

/**
 * Removes vertex-specific colors of the tile and switch back to the material's
 * color.
 *
 * @param {*} tile The 3DTiles tile.
 */
export function removeTileVerticesColor(tile) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  // Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Cannot change vertices color';
  }

  // Remove color attribute
  tile.geometry.deleteAttribute('color');

  // We go back to the color of the material
  tile.material.vertexColors = false;
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
 * Computes and returns the centroid of the vertices given as parameter.
 *
 * @param {*} tile The 3DTiles tile.
 * @param {*} indexArray The indexes of the vertices. It is assumed to be
 * **sorted** and **contiguous**.
 * @returns {THREE.Vector3} The centroid of the vertices.
 */
export function getVerticesCentroid(tile, indexArray) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  // Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Cannot change vertices color';
  }

  const vertexSum = new THREE.Vector3(0, 0, 0);
  const positionArray = tile.geometry.attributes.position.array;
  for (let i = indexArray[0]; i <= indexArray[indexArray.length - 1]; ++i) {
    vertexSum.x += positionArray[i * 3];
    vertexSum.y += positionArray[i * 3 + 1];
    vertexSum.z += positionArray[i * 3 + 2];
  }
  const vertexCount = indexArray.length;
  const vertexCentroid = vertexSum
    .divideScalar(vertexCount)
    .applyMatrix4(tile.matrixWorld);
  return vertexCentroid;
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

/**
 * Creates a Tiles Info (TI) object from a 3DTiles Layer.
 * The TI is an object containing associations between tile, batch IDs and
 * data specific to the batched geometry (vertex indexes, centroid, properties
 * from the batch table).
 *
 * @param {*} layer The 3DTiles layer.
 * @param {*} tilesInfo An existing TI for this layer. Tiles that are currently
 * loaded in the layer will be added to the TI if they're not already present.
 * If no TI is provided, a brand new one will be instantiated with currently
 * loaded tiles.
 * @example
 * let layer = view.getLayerById(config['3DTilesLayerID']);
 * //Fetch the TI
 * let tilesInfo = getTilesBatchInfo(layer);
 * // Get intersections from mouse position
 * let intersections = view.pickObjectsAt(mouseEvent, 5);
 * // Get the first intersecting tile
 * let firstInter = getFirstTileIntersection(intersections);
 * // Retrieve the object's ID
 * let tileId = getObject3DFromTile(firstInter.object).tileId;
 * let batchId = getBatchIdFromIntersection(firstInter);
 * //Display the building's infos
 * console.log(tilesInfo.tiles[tileId][batchId]);
 * @example
 * let layer = view.getLayerById(config['3DTilesLayerID']);
 * //Initialize the TI
 * let tilesInfo = getTilesBatchInfo(layer);
 * //When the visible tiles change, update the TI
 * tilesInfo = getTilesBatchInfo(layer, tilesInfo);
 * @returns {object} An object holding the information of a tile
 */
export function getTilesInfo(layer, tilesInfo = null) {
  // Instantiate the TI if it does not exist
  if (!tilesInfo) {
    tilesInfo = {};
    tilesInfo.totalTileCount = 0;
    tilesInfo.loadedTileCount = 0;
    tilesInfo.tiles = {};
    tilesInfo.tileset;
  }
  const tileset = layer.tileset;
  const tileCount = tileset.tiles.length;
  tilesInfo.totalTileCount = tileCount;
  const rootTile = layer.object3d.children[0];
  tilesInfo.tileset = rootTile;
  const tiles = getVisibleTiles(layer);
  // Tiles contains every tile currently loaded in the scene. We iterate
  // over them to visit the ones that we have not visited yet.
  for (const tile of tiles) {
    const tileId = tile.tileId;
    // Check if this tile is already loaded (visited) in the TI
    if (!tilesInfo.tiles[tileId]) {
      const batchTable = tile.batchTable;
      const attributes = tile.children[0].children[0].geometry.attributes;

      // Map batchId -> object info
      tilesInfo.tiles[tileId] = {};

      const newbatchIds = [];
      // For each vertex get the corresponding batch ID
      attributes._BATCHID.array.forEach((batchId, arrayIndex) => {
        // Creates a dict entry for the batch ID
        if (!tilesInfo.tiles[tileId][batchId]) {
          tilesInfo.tiles[tileId][batchId] = {};
          tilesInfo.tiles[tileId][batchId].arrayIndexes = [];
          tilesInfo.tiles[tileId][batchId].tileId = tile.tileId;
          tilesInfo.tiles[tileId][batchId].batchId = batchId;
          tilesInfo.tiles[tileId][batchId].centroid = null;
          tilesInfo.tiles[tileId][batchId].props = {};

          for (const key of Object.keys(batchTable.content)) {
            tilesInfo.tiles[tileId][batchId].props[key] =
              batchTable.content[key][batchId];
          }

          newbatchIds.push(batchId);
        }
        // Associates the vertex to the corresponding building ID
        tilesInfo.tiles[tileId][batchId].arrayIndexes.push(arrayIndex);
      });
      // For each newly added building, compute the centroid
      for (const batchId of newbatchIds) {
        tilesInfo.tiles[tileId][batchId].centroid = getVerticesCentroid(
          tile,
          tilesInfo.tiles[tileId][batchId].arrayIndexes
        );
      }
      tilesInfo.loadedTileCount += 1;
    }
  }
  return tilesInfo;
}

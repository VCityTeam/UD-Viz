import * as THREE from '../../../node_modules/three/build/three.js';
import { objectEquals } from '../DataProcessing/DataProcessing.js';

/**
 * Search a batch table in a tile. A tile is a THREE.js 3DObject with a 
 * 3-level hierarchy : Object3D > Scene > Mesh. This function searches into the
 * for the batch table (which is located in the Object3D level).
 * 
 * @param {*} tile A 3DTiles tile object from THREE.js.
 */
export function getBatchTableFromTile(tile) {
  if (!!tile.batchTable) {
    return tile.batchTable;
  } else if (!!tile.parent) {
    return getBatchTableFromTile(tile.parent);
  }
  return undefined;
}

/**
 * Gets an object batch ID from an intersection. This methods takes one of the
 * 3 points of the intersection triangle and retrieves the corresponding batch
 * ID in the intersection tile.
 * 
 * @param {*} inter An intersection
 */
export function getBatchIdFromIntersection(inter) {
  let index = inter.face.a;
  return inter.object.geometry.attributes._BATCHID.array[index];
}

/**
 * Get the first intersection object where the target is a 3D object with
 * a batch id (a.k.a. the "Mesh" of a tile).
 * 
 * @param {Array<any>} intersects The array of intersections, provided by
 * itowns.View.pickObjectsAt
 */
export function getFirstTileIntersection(intersects) {
  for (let inter of intersects) {
    let geomAttributes = inter.object.geometry.attributes;
    if (!!geomAttributes && !!geomAttributes._BATCHID) {
      return inter;
    }
  }
  return undefined;
}

/**
 * Retrieve all visible 3DTiles visible tiles (ie. those that are currently
 * rendered in the scene). This function recursively explores the tileset to
 * find all tiles and return them in a flattened array.
 * 
 * @param {*} layer The 3DTiles layer.
 */
export function getVisibleTiles(layer) {
  let rootTile = layer.object3d.children[0];
  let tiles = [];
  let exploreTree = (node) => {
    if (!!node.batchTable) {
      // It's an actual tile
      tiles.push(node);
    };
    for (let childIndex = 0; childIndex < node.children.length; childIndex++) {
      let child = node.children[childIndex];
      if (child.type === 'Object3D') {
        //This child can be a tile or contain tiles so we explore it too
        exploreTree(child);
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
 */
export function getVisibleTileCount(layer) {
  return getVisibleTiles(layer).length;
}

/**
 * Finds the tile in the tileset with the specific ID.
 * 
 * @param {*} tileset The 3DTiles tileset.
 * @param {*} tileId The tile id.
 */
export function getTileInTileset(tileset, tileId) {
  let tile = tileset.children.find((tile) => {
    return tile.tileId === tileId;
  });
  return tile;
}

/**
 * Find the tile in the 3DTiles layer with the specifid ID.
 * 
 * @param {*} layer The 3DTiles layer.
 * @param {*} tileId The tile id.
 */
export function getTileInLayer(layer, tileId) {
  let rootTile = layer.object3d.children[0];
  let tile = getTileInTileset(rootTile, tileId);
  return tile;
}

/**
 * Changes the color of a tile, or specific vertices of the tile, using the
 * BufferGeometry.
 * 
 * @param {*} tile The 3DTiles tile object from THREE.js
 * @param {Array<Number>} newColor An array of RGB value between 0 and 1.
 * @param {Array<Number>} [indexArray] Optional. The indexes of vertices to
 * change the color. By default, all vertices has their color changed. The array
 * is assumed to be **sorted** and **contiguous**.
 */
export function setTileVerticesColor(tile, newColor, indexArray = null) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  //Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Cannot change vertices color';
  }

  //Create the new color array
  let indexCount = tile.geometry.attributes._BATCHID.count;
  let colors = new Float32Array(indexCount * 3);

  let lowerBound = indexArray[0];
  let upperBound = indexArray[indexArray.length - 1];
  for (let i = 0; i < indexCount; i++) {
    let vertexColor = newColor;
    if (!!indexArray && (lowerBound > i || upperBound < i)) {
      //If i is not one of the selected indexes, we keep the previous color
      let previousColor = (tile.geometry.attributes.color) ?
                          tile.geometry.attributes.color.array.slice(i * 3 , i * 3 + 3) :
                          tile.material.color.toArray();
      vertexColor = previousColor;
    }

    colors[i * 3     ] = vertexColor[0];
    colors[i * 3 + 1 ] = vertexColor[1];
    colors[i * 3 + 2 ] = vertexColor[2];
  }

  //We need to use the color of the vertices, not the material
  tile.material.vertexColors = THREE.VertexColors;

  if (!tile.geometry.attributes.color) {
    //If no vertex color is present, we need to add the BufferAttribute
    tile.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  } else {
    //Else we need to update the existing attribute
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
 * 
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
  let mesh = getMeshFromTile(tile);

  let defaultMaterial = Array.isArray(mesh.material) ?
                        mesh.material[0] :
                        mesh.material;

  // Reset the materials
  mesh.material = [ defaultMaterial ];

  // Material index table (index in materialProps -> index in mesh.material)
  let materialIndexTable = {};

  // Create the materials
  for (let materialIndex = 0; materialIndex < materialsProps.length; materialIndex++) {
    let props = materialsProps[materialIndex];
    if (props.transparent === undefined) {
      props.transparent = true;
    }
    materialIndexTable[materialIndex] = mesh.material.length;
    mesh.material.push(new THREE.MeshLambertMaterial(props));
  }

  // Clear the existing groups
  mesh.geometry.groups = [];

  // Total of vertices in the tile
  let total = mesh.geometry.attributes._BATCHID.count;

  if (ranges.length > 0) {
    // Sort the ranges by increasing start index
    ranges.sort((a, b) => {
      return a.start - b.start;
    });
    
    // Merge consecutive ranges with the same material
    let mergedRanges = [];
    for (let index = 0; index < ranges.length; index++) {
      let range = ranges[index];
      if (index === 0) {
        mergedRanges.push(range);
      } else {
        let currentMergingRange = mergedRanges[mergedRanges.length - 1];
        if (currentMergingRange.start + currentMergingRange.count === range.start
            && currentMergingRange.material === range.material) {
          currentMergingRange.count += range.count;
        } else {
          mergedRanges.push(range);
        }
      }
    }
    ranges = mergedRanges;

    // Add the new groups
    for (let rangeIndex = 0; rangeIndex < ranges.length; rangeIndex++) {
      let range = ranges[rangeIndex];
      mesh.geometry.addGroup(range.start, range.count, materialIndexTable[range.material]);
    }

    // Fill the "blanks" between the ranges with the default material
    if (ranges[0].start > 0) {
      mesh.geometry.addGroup(0, ranges[0].start, 0);
    }
    for (let i = 0; i < ranges.length - 1; ++i) {
      let start = ranges[i].start + ranges[i].count;
      let count = ranges[i+1].start - start;
      if (count > 0) {
        mesh.geometry.addGroup(start, count, 0);
      }
    }
    if (ranges[ranges.length - 1].start + ranges[ranges.length - 1].count < total) {
      let start = ranges[ranges.length - 1].start + ranges[ranges.length - 1].count;
      mesh.geometry.addGroup(start, total - start, 0);
    }
  } else {
    // If no ranges array is specified, just add a group containing all vertices
    mesh.geometry.addGroup(0, total, 0);
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
 * 
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
  let materials = [];
  let ranges = [];

  let mesh = getMeshFromTile(tile);

  // Create an array we can loop on to search all batchIDs, plus a stucture
  // to associate batchIDs with their material
  let batchIDs = [];
  let materialIndexTable = {};
  for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
    let group = groups[groupIndex];

    // Check if a similar material has been added
    let materialIndex = materials.findIndex((mat) => {
      return objectEquals(mat, group.material);
    });
    if (materialIndex < 0) {
      // If the material is new, push it
      materialIndex = materials.length;
      materials.push(group.material)
    }

    // Push the batch IDs and remember their material
    for (let batchIDIndex = 0; batchIDIndex < group.batchIDs.length; batchIDIndex++) {
      let batchID = group.batchIDs[batchIDIndex];
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
    material: materialIndexTable[searchingBatchID]
  };

  // Loop once over all vertices to find the ranges
  for (let index = 0, total = mesh.geometry.attributes._BATCHID.count; index < total; index++) {
    let batchID = mesh.geometry.attributes._BATCHID.array[index];

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
        material: materialIndexTable[searchingBatchID]
      };
    }

    // If we find the correct batch ID, store the start index
    if (batchID === searchingBatchID && !addingRange.start) {
      addingRange.start = index;
    }

    if (index === mesh.geometry.attributes._BATCHID.count - 1
        && !!addingRange.start && !addingRange.count) {
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

  //Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Cannot change vertices color';
  }

  //Remove color attribute
  tile.geometry.removeAttribute('color');

  //We go back to the color of the material
  tile.material.vertexColors = THREE.NoColors;
}

/**
 * Tells the iTowns view to update the scene. If you made changes to some colors
 * for example, you need to call this function to actually see the changes.
 * 
 * @param {*} view The iTowns view.
 */
export function updateITownsView(view, layer) {
  try {
    view.mainLoop.gfxEngine.renderViewToBuffer({
      scene: layer.object3d,
      camera: view.camera
    }, { x: 0, y: 0, width: 0, height: 0 });
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
 * 
 * @returns {THREE.Vector3} The centroid of the vertices.
 */
export function getVerticesCentroid(tile, indexArray) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  //Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Cannot change vertices color';
  }

  let vertexSum = new THREE.Vector3(0, 0, 0);
  let positionArray = tile.geometry.attributes.position.array;
  for (let i = indexArray[0]; i <= indexArray[indexArray.length - 1]; ++i) {
    vertexSum.x += positionArray[i * 3    ];
    vertexSum.y += positionArray[i * 3 + 1];
    vertexSum.z += positionArray[i * 3 + 2];
  }
  let vertexCount = indexArray.length;
  let vertexCentroid = vertexSum.divideScalar(vertexCount).applyMatrix4(tile.matrixWorld);
  return vertexCentroid;
}

export function getMeshFromTile(tile) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  //Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry.attributes._BATCHID) {
    throw 'Invalid tile';
  }

  if (tile.geometry.type !== 'BufferGeometry') {
    throw 'Tile has no buffer geometry';
  }

  return tile;
}

export function getObject3DFromTile(tile) {
  if (!tile) {
    throw 'Tile not loaded in view';
  }

  //Find the 'Object3D' part of the tile
  while (!!tile.parent && !(tile.type === 'Object3D')) {
    tile = tile.parent;
  }

  if (!tile.batchTable) {
    throw 'Invalid tile : no batch table';
  }

  return tile;
}
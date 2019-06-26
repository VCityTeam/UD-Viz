import * as THREE from '../../../node_modules/three/src/Three.js';

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
 * Gets an object's batch ID from an intersection. This methods takes one of the
 * 3 points of the intersections' triangle and retrieves the corresponding batch
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
 * Counts the number of 3DTiles tiles displayed by the view.
 * 
 * @param {*} layer The 3DTiles layer.
 */
export function getVisibleTileCount(layer) {
  let tsroot = layer.object3d.children[0];
  return Object.keys(tsroot.children).length;
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
  let tsroot = layer.object3d.children[0];
  let tile = getTileInTileset(tsroot, tileId);
  return tile;
}

/**
 * Changes the color of a tile, or specific vertices of the tile, using the
 * BufferGeometry.
 * 
 * @param {*} tile The 3DTiles tile object from THREE.js
 * @param {Array<Number>} newColor An array of RGB value between 0 and 1.
 * @param {Array<Number>} [indexArray] Optional. The indexes of vertices to
 * change the color. By default, all vertices has their color changed.
 */
export function setTileVerticesColor(tile, newColor, indexArray = null) {
  //Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry) {
    throw 'Tile not loaded in view';
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

  for (let i = 0; i < indexCount; i++) {
    let vertexColor = newColor;
    if (!!indexArray && !indexArray.includes(i)) {
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
 * Removes vertex-specific colors of the tile and switch back to the material's
 * color.
 * 
 * @param {*} tile The 3DTiles tile.
 */
export function removeTileVerticesColor(tile) {
  //Find the 'Mesh' part of the tile
  while (!!tile.children[0] && !(tile.type === 'Mesh')) {
    tile = tile.children[0];
  }

  if (!tile.geometry) {
    throw 'Tile not loaded in view';
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

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
 * Gets a building ID from an intersection. The intersection's object must
 * be a "Mesh" object with a batch id.
 * 
 * @param {*} inter An intersection
 */
export function getBuildingIdFromIntersection(inter) {
  let table = getBatchTableFromTile(inter.object);
  let bid = getBatchIdFromIntersection(inter);
  return table.content['cityobject.database_id'][bid];
}

/**
 * Get the first intersection object where the target is a 3D object with
 * a batch id.
 * 
 * @param {Array<any>} intersects The array of intersections, provided by
 * itowns.View.pickObjectsAt
 */
export function getFirst3dObjectIntersection(intersects) {
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
 * Creates a Tile Building Info (TBI) dictionnary from a 3DTiles Layer.
 * The TBI is an object containing associations between Building Ids and
 * building-specific elements (mainly, the associated tile and the set of
 * batch array indexes).
 * 
 * @param {*} layer The 3DTiles layer.
 * @param {*} tbi An existing TBI for this layer. Tiles that are currently
 * loaded in the layer will be added to the TBI if they're not already present.
 * If no TBI is provided, a brand new one will be instantiated with currently
 * loaded tiles.
 * 
 * @example
 * let layer = view.getLayerById('3d-tiles-layer');
 * //Fetch the TBI
 * let tbi = getTilesBuildingInfo(layer);
 * //Get a building ID from the mouse position
 * let intersections = view.pickObjectsAt(mouseEvent, 5);
 * let buildingId = getBuildingIdFromIntersection(
 *                   getFirst3dObjectIntersection(intersections));
 * //Display the building's infos
 * console.log(tbi.buildings[buildingId]);
 * 
 * @example
 * let layer = view.getLayerById('3d-tiles-layer');
 * //Initialize the TBI
 * let tbi = getTilesBuildingInfo(layer);
 * //When the visible tiles change, update the TBI
 * tbi = getTilesBuildingInfo(layer, tbi);
 */
export function getTilesBuildingInfo(layer, tbi = null) {
  // Instantiate the TBI if it does not exist
  if (!tbi) {
    tbi = {};
    tbi.totalTileCount = 0;
    tbi.loadedTileCount = 0;
    tbi.loadedTiles = {};
    tbi.buildings = {};
  }
  let tileIndex = layer.tileIndex;
  let tileCount = tileIndex.index['1'].children.length;
  tbi.totalTileCount = tileCount;
  let tsroot = layer.object3d.children[0];
  for (let tile of tsroot.children) {
    let tileId = tile.tileId;
    if (!tbi.loadedTiles[tileId]) {
      let batchTable = tile.batchTable;
      let attributes = tile.children[0].children[0].geometry.attributes;
      attributes._BATCHID.array.forEach((batchId, arrayIndex) => {
        let buildingId = batchTable.content['cityobject.database_id'][batchId];
        if (!tbi.buildings[buildingId]) {
          tbi.buildings[buildingId] = {};
          tbi.buildings[buildingId].arrayIndexes = [];
          tbi.buildings[buildingId].tile = tile;
        }
        tbi.buildings[buildingId].arrayIndexes.push(arrayIndex);
      });
      tbi.loadedTiles[tileId] = tile;
      tbi.loadedTileCount += 1;
    }
  }
  return tbi;
}

/**
 * Searches buiding information in the 3DTiles layer, from a building ID.
 * This function searches for all batch attributes in the layer that matches
 * the building ID. The search is done tile by tile, and once a matching
 * building ID is found, the search stops after the current tile.
 * 
 * This function is extremely unefficient. You may prefer using a TBI to
 * store building information and using it when needed. See
 * `getTilesBuildingInfo`.
 * 
 * @param {*} layer The 3DTiles layer.
 * @param {*} buildingId The building ID.
 */
export function searchBuildingInfo(layer, buildingId) {
  let buildingInfo = undefined;
  let tsroot = layer.object3d.children[0];
  for (let tile of tsroot.children) {
    let batchTable = tile.batchTable;
    let attributes = tile.children[0].children[0].geometry.attributes;
    attributes._BATCHID.array.forEach((batchId, arrayIndex) => {
      let bId = batchTable.content['cityobject.database_id'][batchId];
      if (buildingId === bId) {
        if (!buildingInfo) {
          buildingInfo = {};
          buildingInfo.arrayIndexes = [];
          buildingInfo.tile = tile;
        }
        buildingInfo.arrayIndexes.push(arrayIndex);
      }
    });
    // A building is only present in one tile
    if (!!buildingInfo && !!buildingInfo.tile) {
      return buildingInfo;
    }
  }
  return buildingInfo;
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
 * 
 * 
 * @param {*} tile 
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

export function colorBuilding(buildingInfo, color) {
  setTileVerticesColor(buildingInfo.tile, color, buildingInfo.arrayIndexes);
}
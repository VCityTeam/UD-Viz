import * as THREE from '../../../node_modules/three/src/Three.js';

export function getBatchTableFrom3dObject(obj) {
  if (!!obj.batchTable) {
    return obj.batchTable;
  } else if (!!obj.parent) {
    return getBatchTableFrom3dObject(obj.parent);
  }
  return undefined;
}

export function getBatchIdFromIntersection(inter) {
  let index = inter.face.a;
  return inter.object.geometry.attributes._BATCHID.array[index];
}

export function getBuildingIdFromIntersection(inter) {
  let table = getBatchTableFrom3dObject(inter.object);
  let bid = getBatchIdFromIntersection(inter);
  return table.content['cityobject.database_id'][bid];
}

export function getFirst3dObjectIntersection(intersects) {
  for (let inter of intersects) {
    let geomAttributes = inter.object.geometry.attributes;
    if (!!geomAttributes && !!geomAttributes._BATCHID) {
      return inter;
    }
  }
  return undefined;
}

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

  //We go back to the color of the material
  tile.material.vertexColors = THREE.NoColors;
}

export function colorBuilding(buildingInfo, color) {
  setTileVerticesColor(buildingInfo.tile, color, buildingInfo.arrayIndexes);
}
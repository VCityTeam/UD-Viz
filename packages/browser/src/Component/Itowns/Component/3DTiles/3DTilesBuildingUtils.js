import {
  setTileVerticesColor,
  getBatchIdFromIntersection,
  getBatchTableFromTile,
  getTileInLayer,
} from './3DTilesUtils';

/**
 * Gets a building ID from an intersection. The intersecting object must
 * be a "Mesh" object with a batch id.
 *
 * @param {*} inter An intersection
 */
export function getBuildingIdFromIntersection(inter) {
  const table = getBatchTableFromTile(inter.object);
  const bid = getBatchIdFromIntersection(inter);
  return table.content['cityobject.database_id'][bid];
}

/**
 *
 * @param tilesInfo
 * @param buildingId
 */
export function getBuildingInfoFromBuildingId(tilesInfo, buildingId) {
  for (const tileId of Object.keys(tilesInfo.tiles)) {
    const tile = tilesInfo.tiles[tileId];
    for (const batchId of Object.keys(tile)) {
      const buildingInfo = tile[batchId];
      if (buildingInfo.props['cityobject.database_id'] === buildingId) {
        return buildingInfo;
      }
    }
  }
}

/**
 * Sets the color of one building in the scene.
 *
 * @param {*} layer The 3DTiles layer.
 * @param {*} buildingInfo The building info.
 * @param {Array<number>} color The color.
 */
export function colorBuilding(layer, buildingInfo, color) {
  const tile = getTileInLayer(layer, buildingInfo.tileId);
  if (!tile) {
    throw 'Building not in the view - tile is not loaded';
  }
  setTileVerticesColor(tile, color, buildingInfo.arrayIndexes);
}

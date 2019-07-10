import { setTileVerticesColor, getBatchIdFromIntersection,
  getBatchTableFromTile, 
  getTileInLayer} from "./3DTilesUtils";

/**
 * Gets a building ID from an intersection. The intersecting object must
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
 * Sets the color of one building in the scene.
 * 
 * @param {*} layer The 3DTiles layer.
 * @param {*} buildingInfo The building info.
 * @param {Array<number>} color The color.
 */
export function colorBuilding(layer, buildingInfo, color) {
  let tile = getTileInLayer(layer, buildingInfo.tileId);
  if (!tile) {
    throw 'Building not in the view - tile is not loaded';
  }
  setTileVerticesColor(tile, color, buildingInfo.arrayIndexes);
}
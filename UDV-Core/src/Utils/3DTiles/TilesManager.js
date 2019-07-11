import { TileWrapper } from "./Model/TileWrapper";
import { getVisibleTiles, createTileGroups, updateITownsView, createTileGroupsFromBatchIDs } from "./3DTilesUtils";
import { CityObjectID, CityObject } from "./Model/CityObject";
import { CityObjectStyle } from "./Model/CityObjectStyle";

/**
 * Manages the tiles and the style for city objects.
 */
export class TilesManager {
  /**
   * Creates a new TilesManager from an iTowns view and the 3DTiles layer.
   * 
   * @param {*} view The iTowns view.
   * @param {*} layer The 3DTiles layer.
   */
  constructor(view, layer) {
    /**
     * The iTowns view.
     */
    this.view = view;

    /**
     * The 3DTiles layer.
     */
    this.layer = layer;

    /**
     * The set of tile wrappers that have been loaded.
     * 
     * @type {Array<TileWrapper>}
     */
    this.tiles = [];

    /**
     * The number of tiles currently loaded by the tile manager. If this number
     * is equal to `totalTileCount`, no more `update` is necessary.
     * 
     * @type {number}
     */
    this.loadedTileCount = 0;

    /**
     * The total number of tiles in the scene.
     * 
     * @type {number}
     */
    this.totalTileCount = 0;

    if (this.layer.tileIndex !== undefined) {
      this.totalTileCount = Object.keys(this.layer.tileIndex.index).length - 1;
    }

    ///// STYLE
    ///////////

    /**
     * Stores the style associated to city objects in the view.
     * 
     * @type {Object.<number, Object.<number, CityObjectStyle>>}
     */
    this.cityObjectStyle = {};

    /**
     * Keep tracks of the update of tiles. Associate each tile with the UUID of
     * their Object3D during the last update.
     * 
     * @type {Object.<number, string>}
     */
    this.upToDateTileIds = {};
  }

  update() {
    if (this.totalTileCount === 0) {
      this.totalTileCount = Object.keys(this.layer.tileIndex.index).length - 1;
    }

    if (this.loadedTileCount === this.totalTileCount) {
      // Every tile has been loaded, no more need to update.
      return;
    }

    let tiles = getVisibleTiles(this.layer);
    for (let tile of tiles) {
      if (this.tiles[tile.tileId] === undefined) {
        this.tiles[tile.tileId] = new TileWrapper(this.layer, tile.tileId);
        this.tiles[tile.tileId].loadParts();
        this.loadedTileCount += 1;
      }
    }
  }

  /**
   * Returns the city object, if the tile is loaded.
   * 
   * @param {CityObjectID} cityObjectId The city object identifier.
   */
  getCityObject(cityObjectId) {
    if (this.tiles[cityObjectId.tileId] === undefined) {
      return undefined;
    }

    return this.tiles[cityObjectId.tileId].cityObjects[cityObjectId.batchId];
  }

  /**
   * Sets the style of a particular city object.
   * 
   * @param {CityObjectID} cityObjectId The city object identifier.
   * @param {CityObjectStyle} style The desired style.
   */
  setStyle(cityObjectId, style) {
    if (this.cityObjectStyle[cityObjectId.tileId] === undefined) {
      this.cityObjectStyle[cityObjectId.tileId] = {};
    }
    this.cityObjectStyle[cityObjectId.tileId][cityObjectId.batchId] = style;
    this.markTileToUpdate(this.tiles[cityObjectId.tileId]);
  }

  /**
   * Removes the style of a particular city object.
   * 
   * @param {CityObjectID} cityObjectId The city object identifier.
   */
  removeStyle(cityObjectId) {
    if (this.cityObjectStyle[cityObjectId.tileId] === undefined) {
      return;
    }
    this.cityObjectStyle[cityObjectId.tileId][cityObjectId.batchId] = undefined;
    this.markTileToUpdate(this.tiles[cityObjectId.tileId]);
  }

  /**
   * Applies the current styles added with `setStyle` or `addStyle`.
   */
  applyStyles() {
    for (let tile of this.tiles) {
      if (tile === undefined) {
        continue;
      }

      if (this.shouldTileBeUpdated(tile)) {
        console.log('Time to update tile ' + tile.tileId);

        if (this.cityObjectStyle[tile.tileId] !== undefined) {
          let groups = [];
          for (let batchId of Object.keys(this.cityObjectStyle[tile.tileId])) {
            let style = this.cityObjectStyle[tile.tileId][batchId];
            if (style !== undefined) { // If the style has been removed, it is
                                       // undefined
              groups.push({
                material: style.materialProps,
                batchIDs: [ Number(batchId) ]
              });
            }
          }
          if (groups.length > 0) {
            createTileGroupsFromBatchIDs(tile.getObject3D(), groups);
          }
        } else {
          // Clear the tile
          createTileGroups(tile.getMesh(), [], []);
        }

        this.markTileAsUpdated(tile);
      }
    }
    updateITownsView(this.view, this.layer);
  }

  /**
   * Sets the saved UUID of the tile, so that it should be updated in the next
   * `applyStyles` call.
   * 
   * @param {TileWrapper} tile The tile to update.
   */
  markTileToUpdate(tile) {
    this.upToDateTileIds[tile.tileId] = undefined;
    console.log('Tile ' + tile.tileId + ' should be updated.');
  }

  /**
   * Updates the saved UUID of the tile.
   * 
   * @param {TileWrapper} tile The tile to mark.
   */
  markTileAsUpdated(tile) {
    let object3d = tile.getObject3D();
    if (object3d === undefined) {
      throw 'The tile is not currently loaded and cannot be marked as updated.';
    }

    let uuid = object3d.uuid;
    this.upToDateTileIds[tile.tileId] = uuid;
    console.log('Tile ' + tile.tileId + ' has been updated.');
  }

  /**
   * Checks if the style of the tile should be updated.
   * 
   * @param {TileWrapper} tile The tile.
   */
  shouldTileBeUpdated(tile) {
    let object3d = tile.getObject3D();
    if (object3d === undefined) {
      // Tile is not visible, cannot be updated
      return false;
    }

    if (this.upToDateTileIds[tile.tileId] === undefined) {
      // Tile has not been updated yet, or has been marked to update
      return true;
    }

    let uuid = object3d.uuid;
    // If the current UUID is the same as the saved one, it means that the tile
    // has not been reloaded.
    return this.upToDateTileIds[tile.tileId] !== uuid;
  }
}
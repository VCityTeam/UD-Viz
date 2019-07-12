import { Tile } from "./Model/Tile";
import { getVisibleTiles, createTileGroups, updateITownsView, createTileGroupsFromBatchIDs } from "./3DTilesUtils";
import { CityObjectID, CityObject, createCityObjectID } from "./Model/CityObject";
import { CityObjectStyle } from "./Model/CityObjectStyle";
import { StyleManager } from "./StyleManager";

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
     * @type {Array<Tile>}
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
     * Manages the styles of the city objects.
     * 
     * @type {StyleManager}
     */
    this.styleManager = new StyleManager();

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
        this.tiles[tile.tileId] = new Tile(this.layer, tile.tileId);
        this.tiles[tile.tileId].loadParts();
        this.loadedTileCount += 1;
      }
    }
  }

  /**
   * Returns the city object, if the tile is loaded.
   * 
   * @param {CityObjectID} cityObjectId The city object identifier. If multiple
   * city objects are identified, the first one is returned.
   * 
   * @return {CityObject}
   */
  getCityObject(cityObjectId) {
    if (this.tiles[cityObjectId.tileId] === undefined) {
      return undefined;
    }

    if (! (cityObjectId instanceof CityObjectID)) {
      cityObjectId = createCityObjectID(cityObjectId);
    }

    let batchId = cityObjectId.isSingleCityObject() ?
      cityObjectId.batchId :
      cityObjectId.batchId[0];

    return this.tiles[cityObjectId.tileId].cityObjects[batchId];
  }

  /**
   * Sets the style of a particular city object.
   * 
   * @param {CityObjectID} cityObjectId The city object identifier.
   * @param {CityObjectStyle | string} style The desired style.
   */
  setStyle(cityObjectId, style) {
    if (! (cityObjectId instanceof CityObjectID)) {
      cityObjectId = createCityObjectID(cityObjectId);
    }
    this.styleManager.setStyle(cityObjectId, style);
    this.markTileToUpdate(this.tiles[cityObjectId.tileId]);
  }

  registerStyle(name, style) {
    let needUpdate = this.styleManager.registerStyle(name, style);
    if (needUpdate) {
      let usage = this.styleManager.getStyleUsage(name);
      for (let tileId of Object.keys(usage)) {
        this.markTileToUpdate(this.tiles[tileId]);
      }
    }
  }

  /**
   * Removes the style of a particular city object.
   * 
   * @param {CityObjectID} cityObjectId The city object identifier.
   */
  removeStyle(cityObjectId) {
    if (! (cityObjectId instanceof CityObjectID)) {
      cityObjectId = createCityObjectID(cityObjectId);
    }
    this.styleManager.removeStyle(cityObjectId);
    this.markTileToUpdate(this.tiles[cityObjectId.tileId]);
  }

  /**
   * Removes all styles for the given tile.
   * 
   * @param {number} tileId The tile ID.
   */
  removeStyleFromTile(tileId) {
    this.styleManager.removeStyleFromTile(tileId);
    this.markTileToUpdate(this.tiles[tileId]);
  }

  /**
   * Removes all styles currently registered.
   */
  removeAllStyles() {
    let tileIds = this.styleManager.getStyledTiles();
    this.styleManager.removeAllStyles();
    for (let tileId of tileIds) {
      this.markTileToUpdate(this.tiles[tileId]);
    }
  }

  /**
   * Gets the style applied to a given object ID.
   * 
   * @param {CityObjectID} cityObjectId The city object ID.
   * 
   * @returns {CityObjectStyle}
   */
  getStyleAppliedTo(cityObjectId) {
    if (! (cityObjectId instanceof CityObjectID)) {
      cityObjectId = createCityObjectID(cityObjectId);
    }
    return this.styleManager.getStyleAppliedTo(cityObjectId);
  }

  /**
   * Applies the current styles added with `setStyle` or `addStyle`.
   */
  applyStyles() {
    for (let tile of this.tiles) {
      if (tile === undefined) {
        continue;
      }

      // Set to false so we update the view only once
      this.applyStyleToTile(tile, false);
    }
    updateITownsView(this.view, this.layer);
  }

  /**
   * Apply the saved style to the tile given in parameter.
   * 
   * @param {Tile} tile The tile to apply the style to.
   * @param {boolean} updateView If true, will call `updateITownsView` after
   * applying the style.
   */
  applyStyleToTile(tile, updateView = true) {
    if (this.shouldTileBeUpdated(tile)) {
      console.log('Time to update tile ' + tile.tileId);

      this.styleManager.applyToTile(tile);
      this.markTileAsUpdated(tile);

      if (updateView) {
        updateITownsView(this.view, this.layer);
      }
    }
  }

  /**
   * Sets the saved UUID of the tile, so that it should be updated in the next
   * `applyStyles` call.
   * 
   * @param {Tile} tile The tile to update.
   */
  markTileToUpdate(tile) {
    this.upToDateTileIds[tile.tileId] = undefined;
    console.log('Tile ' + tile.tileId + ' should be updated.');
  }

  /**
   * Updates the saved UUID of the tile.
   * 
   * @param {Tile} tile The tile to mark.
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
   * @param {Tile} tile The tile.
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
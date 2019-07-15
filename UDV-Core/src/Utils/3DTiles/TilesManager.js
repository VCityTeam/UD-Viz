import { Tile } from "./Model/Tile.js";
import { getVisibleTiles, updateITownsView, getFirstTileIntersection, getBatchIdFromIntersection, getObject3DFromTile } from "./3DTilesUtils.js";
import { CityObjectID, CityObject, createCityObjectID } from "./Model/CityObject.js";
import { CityObjectStyle } from "./Model/CityObjectStyle.js";
import { StyleManager } from "./StyleManager.js";

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

  /**
   * Constructs the tiles that have not been loaded yet. This function should be
   * called before accessing or modifying city objects to be sure that they have
   * been loaded once. In the future, this function should be replaced by
   * listeners to events of the 3DTiles layer (tile loading / unloading).
   */
  update() {
    if (this.layer.tileIndex === undefined) {
      // Cannot update yet because the layer is not fully loaded.
      return;
    }

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
        this.tiles[tile.tileId].loadCityObjects();
        this.loadedTileCount += 1;
      }
    }
  }

  /**
   * Returns the city object under the mouse cursor.
   *
   * @param {MouseEvent} event The mouse event.
   *
   * @returns {CityObject | undefined}
   */
  pickCityObject(event) {
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      this.update();
      // Get the intersecting objects where our mouse pointer is
      let intersections = this.view.pickObjectsAt(event, 5);
      // Get the first intersecting tile
      let firstInter = getFirstTileIntersection(intersections);
      if (!!firstInter) {
        let batchId = getBatchIdFromIntersection(firstInter);
        let tileId = getObject3DFromTile(firstInter.object).tileId;

        if (this.tiles[tileId] !== undefined) {
          return this.tiles[tileId].cityObjects[batchId];
        }
      }
    }

    return undefined;
  }

  /**
   * Returns the city object, if the tile is loaded.
   *
   * @param {CityObjectID} cityObjectId The city object identifier.
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

    this.update();
    return this.tiles[cityObjectId.tileId].cityObjects[cityObjectId.batchId];
  }

  /**
   * Sets the style of a particular city object.
   *
   * @param {CityObjectID | Array<CityObjectID>} cityObjectId The city object
   * identifier.
   * @param {CityObjectStyle | string} style The desired style.
   */
  setStyle(cityObjectId, style) {
    let tilesToUpdate = new Set();
    if (Array.isArray(cityObjectId)) {
      for (let i = 0; i < cityObjectId.length; i++) {
        if (! (cityObjectId[i] instanceof CityObjectID)) {
          cityObjectId[i] = createCityObjectID(cityObjectId[i]);
        }
        tilesToUpdate.add(cityObjectId[i].tileId);
      }
    } else {
      if (! (cityObjectId instanceof CityObjectID)) {
        cityObjectId = createCityObjectID(cityObjectId);
      }
      tilesToUpdate.add(cityObjectId.tileId);
    }
    this.styleManager.setStyle(cityObjectId, style);
    for (let tileId of tilesToUpdate) {
      this._markTileToUpdate(tileId);
    }
  }

  /**
   * Register a new or modify an existing registered style.
   *
   * @param {string} name A name to identify the style.
   * @param {CityObjectStyle} style The style to register.
   */
  registerStyle(name, style) {
    if (! (style instanceof CityObjectStyle)) {
      style = new CityObjectStyle(style);
    }
    let needUpdate = this.styleManager.registerStyle(name, style);
    if (needUpdate) {
      let usage = this.styleManager.getStyleUsage(name);
      for (let tileId of Object.keys(usage)) {
        this._markTileToUpdate(tileId);
      }
    }
  }

  /**
   * Removes the style of a particular city object.
   *
   * @param {CityObjectID | Array<CityObjectID>} cityObjectId The city object
   * identifier.
   */
  removeStyle(cityObjectId) {
    let tilesToUpdate = new Set();

    if (Array.isArray(cityObjectId)) {
      for (let i = 0; i < cityObjectId.length; i++) {
        if (! (cityObjectId[i] instanceof CityObjectID)) {
          cityObjectId[i] = createCityObjectID(cityObjectId[i]);
        }
        tilesToUpdate.add(cityObjectId[i].tileId);
      }
    } else {
      if (! (cityObjectId instanceof CityObjectID)) {
        cityObjectId = createCityObjectID(cityObjectId);
      }
      tilesToUpdate.add(cityObjectId.tileId);
    }

    this.styleManager.removeStyle(cityObjectId);
    for (let tileId of tilesToUpdate) {
      this._markTileToUpdate(tileId);
    }
  }

  /**
   * Removes all styles for the given tile.
   *
   * @param {number} tileId The tile ID.
   */
  removeStyleFromTile(tileId) {
    this.styleManager.removeStyleFromTile(tileId);
    this._markTileToUpdate(tileId);
  }

  /**
   * Removes all styles currently registered.
   */
  removeAllStyles() {
    let tileIds = this.styleManager.getStyledTiles();
    this.styleManager.removeAllStyles();
    for (let tileId of tileIds) {
      this._markTileToUpdate(tileId);
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
   *
   * @param {object} options Options of the method.
   * @param {() => any} [options.updateFunction] The function used to update the
   * view. Default is `udpateITownsView(view, layer)`.
   */
  applyStyles(options = {}) {
    this.update();
    let updateFunction = options.updateFunction || (() => {
      this.view.notifyChange();
    });
    for (let tile of this.tiles) {
      if (tile === undefined) {
        continue;
      }

      // Set to false so we update the view only once
      this.applyStyleToTile(tile.tileId, {updateView: false});
    }
    updateFunction();
  }

  /**
   * Apply the saved style to the tile given in parameter.
   *
   * @param {number} tileId The ID of the tile to apply the style to.
   * @param {object} options Options of the apply function.
   * @param {boolean} [options.updateView] Whether the view should update at the
   * end of the method. Default value is `true`.
   * @param {() => any} [options.updateFunction] The function used to update the
   * view. Default is `udpateITownsView(view, layer)`.
   */
  applyStyleToTile(tileId, options = {}) {
    this.update();
    let updateView = (options.updateView !== undefined) ?
      options.updateView : true;
    let updateFunction = options.updateFunction || (() => {
      updateITownsView(this.view, this.layer);
    });

    let tile = this.tiles[tileId];
    if (tile === undefined) return;
    if (this._shouldTileBeUpdated(tile)) {
      this.styleManager.applyToTile(tile);
      this._markTileAsUpdated(tile);

      if (updateView) {
        updateFunction();
      }
    }
  }

  /**
   * Sets the saved UUID of the tile, so that it should be updated in the next
   * `applyStyles` call.
   *
   * @private
   *
   * @param {number} tileId The ID of the tile to update.
   */
  _markTileToUpdate(tileId) {
    this.upToDateTileIds[tileId] = undefined;
  }

  /**
   * Updates the saved UUID of the tile.
   *
   * @private
   *
   * @param {Tile} tile The tile to mark.
   */
  _markTileAsUpdated(tile) {
    let object3d = tile.getObject3D();
    if (object3d === undefined) {
      throw 'The tile is not currently loaded and cannot be marked as updated.';
    }

    let uuid = object3d.uuid;
    this.upToDateTileIds[tile.tileId] = uuid;
  }

  /**
   * Checks if the style of the tile should be updated.
   *
   * @private
   *
   * @param {Tile} tile The tile.
   */
  _shouldTileBeUpdated(tile) {
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

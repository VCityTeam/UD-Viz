import {
  getFirstTileIntersection,
  getBatchIdFromIntersection,
  getTileFromMesh,
  getVisibleTileCount,
} from '../3DTiles/3DTilesUtils';
import { TilesManager } from '../3DTiles/TilesManager';
import * as itowns from 'itowns';

/** @class */
export class LayerManager {
  /**
   * Creates a new TilesManager from an iTowns view and the 3DTiles layer.
   *
   * @param {*} view The iTowns view.
   */
  constructor(view) {
    /**
     * The iTowns view.
     */
    this.view = view;

    /**
     * The set of tiles Manager that have been loaded.
     *
     * @type {Array<TilesManager>}
     */
    this.tilesManagers = [];
  }

  /**
   * Register a new or modify an existing registered style for all tilesManager.
   *
   * @param {string} name A name to identify the style.
   * @param {import("../3DTiles/Model/CityObjectStyle").CityObjectStyle} style The style to register.
   */
  registerStyle(name, style) {
    this.tilesManagers.forEach(function (tilesManager) {
      tilesManager.registerStyle(name, style);
    });
  }

  /**
   * Register a new or modify an existing registered style for all tilesManager.
   *
   * @param {import("../3DTiles/Model/CityObjectStyle").CityObjectStyle} style The style to register.
   */
  setStyle(style) {
    this.tilesManagers.forEach(function (tilesManager) {
      tilesManager.setStyleToTileset(style);
      tilesManager.applyStyles();
    });
  }

  /**
   * Removes all styles currently registered.
   */
  removeAll3DTilesStyles() {
    this.tilesManagers.forEach(function (tilesManager) {
      tilesManager.removeAllStyles();
    });
  }

  /**
   * Applies the current styles added with `setStyle` or `addStyle`.
   *
   * @param {object} options Options of the method.
   * @param {Function} [options.updateFunction] The function used to update the. () => any.
   * view. Default is `udpateITownsView(view, layer)`.
   */
  applyAll3DTilesStyles(options = {}) {
    this.tilesManagers.forEach(function (tilesManager) {
      tilesManager.applyStyles(options);
    });
  }

  /**
   * Check if at least one 3DTiles layer is visible
   *
   * @returns {boolean} True if at least one layer is visble
   */
  isOneLayerVisible() {
    for (let i = 0; i < this.tilesManagers.length; i++) {
      if (this.tilesManagers[i].layer.visible) {
        return true;
      }
    }
    return false;
  }

  /**
   * Change the visibilty of all 3DTiles layers
   *
   * @param {boolean} bool The value to set layer visibility
   */
  changeVisibility(bool) {
    this.tilesManagers.forEach(function (tilesManager) {
      tilesManager.layer.visible = bool;
    });
    this.notifyChange();
  }

  /**
   * Update the scale of the given layer
   *
   * @param {itowns.Layer} layer one layer loaded.
   * @param {number} scale Value of the new scale
   */
  updateScale(layer, scale) {
    layer.scale = scale;
    this.notifyChange();
  }

  /**
   * Update the opacity of the given layer
   *
   * @param {itowns.Layer} layer one layer loaded.
   * @param {number} opacity Value of the new scale
   */
  updateOpacity(layer, opacity) {
    layer.opacity = opacity;
    this.notifyChange();
  }
  /**
   * Update the view when called. Must be called when a change have been made
   * The view.camera.camera3D is passed to actualize all of the layer, but the
   * the documentation of notifyChange says taht it should not be needed
   */
  notifyChange() {
    this.view.notifyChange(this.view.camera.camera3D);
  }

  /**
   * Returns the city object under the mouse cursor.
   *
   * @param {MouseEvent} event The mouse event.
   * @returns {import("../3DTiles/Model/CityObject").CityObject | null} The picked CityObject
   */
  pickCityObject(event) {
    // Get the intersecting objects where our mouse pointer is
    let intersections = [];
    // As the current pickObjectsAt on all layer is not working, we need
    // to call pickObjectsAt() for each layer.
    for (let i = 0; i < this.tilesManagers.length; i++) {
      intersections = intersections.concat(
        this.view.pickObjectsAt(event, 5, this.tilesManagers[i].layer)
      );
    }
    const firstInter = getFirstTileIntersection(intersections);
    if (firstInter) {
      const tilesManager = this.getTilesManagerByLayerID(firstInter.layer.id);
      const batchId = getBatchIdFromIntersection(firstInter);
      const tileId = getTileFromMesh(firstInter.object).tileId;
      return tilesManager.tiles[tileId].cityObjects[batchId];
    }
    return null;
  }

  /**
   * Returns the first city object which corresponds to a key,value pair in a tilesManager's
   * batch table.
   *
   * @param {string} batchTableKey The batch table key to search by.
   * @param {string} batchTableValue The batch table value to search for.
   * @returns {import("../3DTiles/Model/CityObject").CityObject | undefined} The picked CItyObject
   */
  pickCityObjectByBatchTable(batchTableKey, batchTableValue) {
    for (const tilesManager of this.tilesManagers) {
      if (!tilesManager.tiles) {
        continue;
      }
      for (const tile of tilesManager.tiles) {
        if (
          !tile ||
          !tile.cityObjects ||
          !tile.batchTable ||
          !tile.batchTable.content[batchTableKey] ||
          !tile.batchTable.content[batchTableKey].includes(batchTableValue)
        ) {
          continue;
        }
        return tile.cityObjects[
          tile.batchTable.content[batchTableKey].indexOf(batchTableValue)
        ];
      }
    }
    console.warn(
      'WARNING: cityObject not found with key, value pair: ' +
        batchTableKey +
        ', ' +
        batchTableValue
    );
    return undefined;
  }

  /**
   * Returns the city objects which corresponds to a key,value pair in any tilesManager's
   * batch table.
   *
   * @param {string} batchTableKey The batch table key to search by.
   * @param {string} batchTableValue The batch table value to search for.
   * @returns {Array<import("../3DTiles/Model/CityObject").CityObject>} An array of picked CityObject
   */
  pickCityObjectsByBatchTable(batchTableKey, batchTableValue) {
    const cityObjects = [];
    for (const tilesManager of this.tilesManagers) {
      if (!tilesManager.tiles) {
        continue;
      }
      for (const tile of tilesManager.tiles) {
        if (
          !tile ||
          !tile.cityObjects ||
          !tile.batchTable ||
          !tile.batchTable.content[batchTableKey] ||
          !tile.batchTable.content[batchTableKey].includes(batchTableValue)
        ) {
          continue;
        }
        cityObjects.push(
          tile.cityObjects[
            tile.batchTable.content[batchTableKey].indexOf(batchTableValue)
          ]
        );
      }
    }
    if (cityObjects.length == 0) {
      console.warn(
        'WARNING: cityObjects not found with key, value pair: ' +
          batchTableKey +
          ', ' +
          batchTableValue
      );
    }
    return cityObjects;
  }

  /**
   * Returns a tilesManager given a layer ID.
   *
   * @param {string} id the layer ID.
   * @returns {TilesManager} The TilesManager handling the layer
   */
  getTilesManagerByLayerID(id) {
    for (let i = 0; i < this.tilesManagers.length; i++) {
      if (this.tilesManagers[i].layer.id === id) return this.tilesManagers[i];
    }
    return undefined;
  }

  /**
   * Remove a a layer and its tilesManager given a layer ID.
   *
   * @param {string} id the layer ID.
   */
  remove3DTilesLayerByLayerID(id) {
    for (let i = 0; i < this.tilesManagers.length; i++) {
      if (this.tilesManagers[i].layer.id === id) {
        this.view.removeLayer(id);
        this.tilesManagers.splice(i, 1);
        break;
      }
    }
  }
  /**
   * Get all Layers loaded in the view.
   *
   * @returns {Array<itowns.Layer>} An array of iTowns layers
   */
  getLayers() {
    return this.view.getLayers();
  }

  /**
   * Get the number of tiles that have been loaded, across all the tileset that
   * have been loaded
   *
   * @returns {number} The number of loaded tiles
   */
  getLoaded3DTilesTileCount() {
    let loadedTileCount = 0;
    for (let i = 0; i < this.tilesManagers.length; i++) {
      loadedTileCount += this.tilesManagers[i].loadedTileCount;
    }
    return loadedTileCount;
  }

  /**
   * Get the number of tiles across all the tileset
   *
   * @returns {number} The number of tiles in all layers
   */
  getTotal3DTilesTileCount() {
    let totalTileCount = 0;
    for (let i = 0; i < this.tilesManagers.length; i++) {
      totalTileCount += this.tilesManagers[i].totalTileCount;
    }
    return totalTileCount;
  }

  /**
   * Get the number of tiles visible, across all the tileset that
   * have been loaded
   *
   * @returns {number} The number of visible tiles
   */
  getVisible3DTilesTileCountFromLayers() {
    let visibleTileCount = 0;
    for (let i = 0; i < this.tilesManagers.length; i++) {
      visibleTileCount += getVisibleTileCount(this.tilesManagers[i].layer);
    }
    return visibleTileCount;
  }

  /**
   * Get Color layers in the view
   *
   * @returns {Array<itowns.ColorLayer>} An array of all ColorLayers
   */
  getColorLayers() {
    return this.view.getLayers((layer) => layer.isColorLayer);
  }

  /**
   * Get Elevation layers in the view
   *
   * @returns {Array<itowns.ElevationLayer>} An array of all ElevationLayers
   */
  getElevationLayers() {
    return this.view.getLayers((layer) => layer.isElevationLayer);
  }

  /**
   * Get Geometry layers in the view
   *
   * @returns {Array<itowns.GeometryLayer>} An array of all GeometryLayers
   */
  getGeometryLayers() {
    return this.view.getLayers((layer) => layer.isGeometryLayer);
  }

  /**
   * Get Geometry layers in the view, without the planar one
   *
   * @returns {Array<itowns.GeometryLayer>} An array of all GeometryLayers, except the planar
   */
  getGeometryLayersWithoutPlanar() {
    return this.view.getLayers(
      (layer) => layer.id !== 'planar' && layer.isGeometryLayer
    );
  }
}

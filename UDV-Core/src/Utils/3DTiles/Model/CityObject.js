import { Tile } from "./Tile";
import * as THREE from 'three';

/**
 * Represents a city object.
 */
export class CityObject {
  /**
   * Constructs a city object from the given parameters.
   * 
   * @param {Tile} tileWrapper Tile wrapper for the parent tile.
   * @param {number} batchId Batch ID of the city object in the parent tile.
   * @param {number} indexStart Start index of the vertex array in the parent
   * tile.
   * @param {number} [indexCount] Number of vertices corresponding to this batch
   * ID in the parent tile.
   * @param {THREE.Vector3} [centroid] Centroid of the geometry.
   * @param {Object} [props] Properties from the batch table.
   */
  constructor(tileWrapper, batchId, indexStart, indexCount, centroid, props) {
    /**
     * Tile wrapper for the parent tile.
     * 
     * @type {Tile}
     */
    this.tileWrapper = tileWrapper;

    /**
     * Batch ID of the city object in the parent tile.
     * 
     * @type {number}
     */
    this.batchId = batchId;

    /**
     * The city object ID.
     * 
     * @type {CityObjectID}
     */
    this.cityObjectId = new CityObjectID(this.tileWrapper.tileId, this.batchId);

    /**
     * Start index of the vertex array in the parent tile.
     * 
     * @type {number}
     */
    this.indexStart = indexStart;

    /**
     * Number of vertices corresponding to this batch ID in the parent tile.
     * 
     * @type {number}
     */
    this.indexCount = indexCount || 0;

    /**
     * Centroid of the geometry.
     * 
     * @type {THREE.Vector3}
     */
    this.centroid = centroid;

    /**
     * Properties from the batch table.
     * 
     * @type {Object}
     */
    this.props = props || {};
  }

  /**
   * Last index of the vertex array.
   */
  get indexEnd() {
    return this.indexStart + this.indexCount - 1;
  }
}

/**
 * Represents a unique identifier for a city object.
 */
export class CityObjectID {
  /**
   * Constructs a city object ID.
   * 
   * @param {number} tileId The parent tile ID.
   * @param {number} batchId The batch ID in the tile.
   */
  constructor(tileId, batchId) {
    /**
     * The parent tile ID.
     * 
     * @type {number}
     */
    this.tileId = tileId;

    /**
     * The batch ID in the parent tile.
     * 
     * @type {number}
     */
    this.batchId = batchId;
  }

  /**
   * Converts the city object ID into a string, making the class usable as
   * a dictionnary key.
   * 
   * @returns {string}
   */
  toString() {
    return `CityObject-${this.tileId}-${this.batchId}`;
  }
}
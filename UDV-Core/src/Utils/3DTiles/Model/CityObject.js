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
 * Creates a CityObjectID from an anonymous object.
 * 
 * @param {{tileId: number, batchId: number | Array<number>}} object A
 * dictionnary with two keys, `tileId` and `batchId`.
 * 
 * @returns {CityObjectID}
 */
export function createCityObjectID(object) {
  if (object === undefined || typeof(object.tileId) !== 'number'
    || (typeof(object.batchId) !== 'number' && !Array.isArray(object.batchId))) {
    throw 'A city object must have a tileId and a batchId';
  }

  return new CityObjectID(object.tileId, object.batchId);
}

/**
 * Represents an identifier for one or more city objects. This class can be used
 * to represent :
 * 
 * - a single city object.
 * - a set of city objects in a same tile.
 */
export class CityObjectID {
  /**
   * Constructs a city object ID.
   * 
   * @param {number} tileId The parent tile ID.
   * @param {number | Array<number>} batchId The batch ID in the tile.
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
   * Checks wether the city object ID identifies a single city object.
   */
  isSingleCityObject() {
    return typeof(this.batchId) === 'number';
  }

  /**
   * Checks wether the city object ID identifies an array of city objects in a
   * tile.
   */
  isMultipleCityObjects() {
    return Array.isArray(this.batchId);
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
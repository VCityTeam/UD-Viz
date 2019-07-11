import { CityObjectStyle } from "./Model/CityObjectStyle";
import { CityObjectID } from "./Model/CityObject";
import { objectEquals } from "../DataProcessing/DataProcessing";
import { createTileGroupsFromBatchIDs, createTileGroups } from "./3DTilesUtils";
import { Tile } from "./Model/Tile";

/**
 * Class used to manage the styles of city objects.
 */
export class StyleManager {
  constructor() {
    /**
     * A dictionnary of styles identified by a string.
     * 
     * @type {Object.<string, CityObjectStyle>}
     */
    this.registeredStyles = {};

    /**
     * An array of anonymous styles.
     * 
     * @type {Array<CityObjectStyle>}
     */
    this.anonymousStyles = [];

    /**
     * Stores which city objects use which registered style. It maps the style
     * identifier with an array of tile IDs, mapped to arrays of batch IDs.
     * 
     * @type {Object.<string, Array<Object.<number, Array<number>>}
     */
    this.registeredStyleUsage = {};

    /**
     * Stores which city objects use which anonymous style. It maps the style
     * identifier with an array of tile IDs, mapped to arrays of batch IDs.
     * 
     * @type {Object.<number, Array<Object.<number, Array<number>>}
     */
    this.anonymousStyleUsage = {};

    /**
     * The association between city objects and their respective styles.
     * 
     * @type {Object.<number, Object.<number, number | string>>}
     */
    this.styleTable = {};
  }

  /**
   * Register a style.
   * 
   * @param {string} name Name to register the style.
   * @param {CityObjectStyle} style The style to register.
   * 
   * @returns {boolean} A value representing wether an existing style has been
   * overwritten by this function. If this is the case, styles should be
   * re-applied.
   */
  registerStyle(name, style) {
    let existing = this.registeredStyles[name] !== undefined;
    this.registeredStyles[name] = style;
    return existing;
  }

  /**
   * Get the style, either registered or anonymous.
   * 
   * @param {string|number} identifier The name (if registered) or ID of the
   * style (if anonymous).
   * 
   * @returns {CityObjectStyle}
   */
  getStyle(identifier) {
    if (typeof(identifier) === "string") {
      return this.registeredStyles[identifier];
    } else if (typeof(identifier) === "number") {
      return this.anonymousStyles[identifier];
    }
    throw 'Identifier must be a string or a number';
  }

  /**
   * Sets the style of the given city object.
   * 
   * @param {CityObjectID} cityObjectId The ID of the city object.
   * @param {CityObjectStyle | string} style The style to apply. Can be a
   * `CityObjectStyle` or a `string` refering a registered style.
   */
  setStyle(cityObjectId, style) {
    if (typeof(style) === 'string') {
      if (this.registeredStyles[style] === undefined) {
        throw `The style ${style} has not been registered.`;
      }

      if (this.styleTable[cityObjectId.tileId] === undefined) {
        this.styleTable[cityObjectId.tileId] = {};
      }
      this.styleTable[cityObjectId.tileId][cityObjectId.batchId] = style;
      this.registerUsage(style, cityObjectId);
    } else {
      if (! (style instanceof CityObjectStyle)) {
        try {
          style = new CityObjectStyle(style);
        } catch(_) {
          throw 'Style must be a string or a CityObjectStyle.';
        }
      }

      let styleId = null;
      for (let [anonIndex, anonStyle] of this.anonymousStyles.entries()) {
        if (anonStyle.equals(style)) {
          styleId = anonIndex;
          break;
        }
      }
      if (styleId === null) {
        styleId = this.anonymousStyles.length;
        this.anonymousStyles.push(style);
      }
      
      if (this.styleTable[cityObjectId.tileId] === undefined) {
        this.styleTable[cityObjectId.tileId] = {};
      }
      this.styleTable[cityObjectId.tileId][cityObjectId.batchId] = styleId;
      this.registerUsage(styleId, cityObjectId);
    }
  }

  /**
   * Removes the style associated with this city object.
   * 
   * @param {CityObjectID} cityObjectId The city object ID.
   */
  removeStyle(cityObjectId) {
    if (this.styleTable[cityObjectId.tileId] === undefined) {
      return;
    }
    this.removeUsage(this.styleTable[cityObjectId.tileId][cityObjectId.batchId],
      cityObjectId);
    delete this.styleTable[cityObjectId.tileId][cityObjectId.batchId];
  }

  /**
   * Applies current saved styles to the tile.
   * 
   * @param {Tile} tile The tile.
   */
  applyToTile(tile) {
    if (this.styleTable[tile.tileId] !== undefined) {
      let groups = [];
      for (let batchId of Object.keys(this.styleTable[tile.tileId])) {
        console.log('APPLY for ' + batchId);
        let styleIdentifier = this.styleTable[tile.tileId][batchId];
        let style = this.getStyle(styleIdentifier);

        groups.push({
          material: style.materialProps,
          batchIDs: [ Number(batchId) ]
        });
      }
      
      createTileGroupsFromBatchIDs(tile.getObject3D(), groups);
    } else {
      console.log('CLEAR');
      // Clear the tile
      createTileGroups(tile.getMesh(), [], []);
    }
  }

  /**
   * Retrieves the list of objects that uses a given style.
   * 
   * @param {string | number} styleIdentifier The style identifier.
   * 
   * @returns {Object.<number, Array<number>>}
   */
  getStyleUsage(styleIdentifier) {
    if (typeof(styleIdentifier) === 'string') {
      return this.registeredStyleUsage[styleIdentifier];
    } else if (typeof(styleIdentifier) === 'number') {
      return this.anonymousStyleUsage[styleIdentifier];
    } else {
      throw 'A style identifier must be a string or a number.';
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
    if (this.styleTable[cityObjectId.tileId] === undefined) {
      return undefined;
    }

    return this.getStyle(
      this.styleTable[cityObjectId.tileId][cityObjectId.batchId]);
  }

  /**
   * Keeps track of the style usage.
   * 
   * @private
   * 
   * @param {string | number} styleIdentifier The style identifier.
   * @param {CityObjectID} cityObjectId The city object ID.
   */
  registerUsage(styleIdentifier, cityObjectId) {
    const tileId = cityObjectId.tileId;
    const batchId = cityObjectId.batchId;

    if (typeof(styleIdentifier) === 'string') {
      if (this.registeredStyleUsage[styleIdentifier] === undefined) {
        this.registeredStyleUsage[styleIdentifier] = {};
      }
      if (this.registeredStyleUsage[styleIdentifier][tileId] === undefined) {
        this.registeredStyleUsage[styleIdentifier][tileId] = [];
      }
      this.registeredStyleUsage[styleIdentifier][tileId].push(batchId);
    } else if (typeof(styleIdentifier) === 'number') {
      if (this.anonymousStyleUsage[styleIdentifier] === undefined) {
        this.anonymousStyleUsage[styleIdentifier] = {};
      }
      if (this.anonymousStyleUsage[styleIdentifier][tileId] === undefined) {
        this.anonymousStyleUsage[styleIdentifier][tileId] = [];
      }
      this.anonymousStyleUsage[styleIdentifier][tileId].push(batchId);
    } else {
      throw 'A style identifier must be a string or a number.';
    }
  }
  
  /**
   * Removes the track of the style usage.
   * 
   * @private
   * 
   * @param {string | number} styleIdentifier The style identifier.
   * @param {CityObjectID} cityObjectId The city object ID.
   */
  removeUsage(styleIdentifier, cityObjectId) {
    const tileId = cityObjectId.tileId;
    const batchId = cityObjectId.batchId;

    if (typeof(styleIdentifier) === 'string') {
      let index = this.registeredStyleUsage[styleIdentifier][tileId].findIndex(
        bId => bId === batchId);
      this.registeredStyleUsage[styleIdentifier][tileId].splice(index, 1);
      if (this.registeredStyleUsage[styleIdentifier][tileId].length === 0) {
        delete this.registeredStyleUsage[styleIdentifier][tileId];

        if (Object.keys(this.registeredStyleUsage[styleIdentifier])
          .length === 0) {
          delete this.registeredStyleUsage[styleIdentifier];
        }
      }
    } else if (typeof(styleIdentifier) === 'number') {
      let index = this.anonymousStyleUsage[styleIdentifier][tileId].findIndex(
        bId => bId === batchId);
      this.anonymousStyleUsage[styleIdentifier][tileId].splice(index, 1);
      if (this.anonymousStyleUsage[styleIdentifier][tileId].length === 0) {
        delete this.anonymousStyleUsage[styleIdentifier][tileId];

        if (Object.keys(this.anonymousStyleUsage[styleIdentifier])
          .length === 0) {
          delete this.anonymousStyleUsage[styleIdentifier];
        }
      }
    } else {
      throw 'A style identifier must be a string or a number.';
    }
  }
}
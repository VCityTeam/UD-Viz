import { $3DTemporalTileset } from './3DTILES_temporal/3DTemporalTileset.js';
import { $3DTemporalBoundingVolume } from './3DTILES_temporal/3DTemporalBoundingVolume.js';
import { $3DTemporalBatchTable } from './3DTILES_temporal/3DTemporalBatchTable.js';
import { EVENT_TILE_LOADED } from '../../../Utils/3DTiles/TilesManager.js'

/**
 * @module TemporalExtension
 */
export class $3DTemporalExtension {
    constructor() {
        this.extensionName = "3DTILES_temporal";
        /**
         * The temporal extension part of the tileset that will be filled
         * when it has been parsed by the $3DTemporalTileset class.
         */
        this.temporalTileset = {};

        /**
         * The temporal extension part of the batch tables mapped to the tile
         * IDs (keys of the map). 
         */
        this.temporalBatchTables = new Map();

        /**
         * The temporal extension part of the bounding volumes part mapped to 
         * the tile IDs (keys of the map).
         */
        this.temporalBoundingVolumes = new Map();

        // Events
        // $3DTemporalTileset triggers an event when it is loaded
        window.addEventListener(
            $3DTemporalTileset.TEMPORAL_TILESET_LOADED, 
            this.temporalTilesetLoaded.bind(this));

        // Another strategy is used for the batch table part and
        // for the bounding volume part of the temporal extension
        // since we need to know to which tile this batch table 
        // extension belongs to (that is not stored in the batch
        // table extension part). Therefore, we use the
        // TilesManager.EVENT_TILE_LOADED instead which is fired
        // by the 3D Tiles itowns layer when a tile has been
        // loaded. To avoid creating a dependency between this class
        // and the tilesManager, we add this event listener in the 
        // TemporalModule which knows both this model and the tilesManager.
        // This is not ideal but improving this would asks for more
        // modifications in itowns, which is currently not possible.
    }

    temporalTilesetLoaded(event) {
        if (this.temporalTileset) {
            console.warn("Mmhhh, the temporal tileset has already been loaded" 
            + " and it should only be loaded one time... Keeping the newest" + 
            " one");
        }
        this.temporalTileset = event.detail.temporalTileset;
    }

    updateTileExtensionModel(tile) {
        // Get the bounding volume temporal extension
        this.temporalBoundingVolumes[tile.tileId] = 
        tile.boundingVolume.extensions[this.extensionName];

        // Get the batch table temporal extension
        // The batch table is not mandatory (e.g. the root tile
        // has no batch table)
        if (tile.batchTable) {
            this.temporalBatchTables[tile.tileId] =
            tile.batchTable.extensions[this.extensionName];
            for (let i = 0; i < this.temporalBatchTables[tile.tileId].featureIds.length; i++) {
                const featureId = this.temporalBatchTables[tile.tileId].featureIds[i];
                // TODO: access to featuresTransactions might be better managed
                this.temporalBatchTables[tile.tileId].featuresTransacs[featureId] = this.temporalTileset.transactionManager.featuresTransactions[featureId];
            }
        }
    }

    /**
     * Parses a
     * 3DTiles temporal extension and returns a declined TemporalExtension
     * object.
     * @param {Object} json - json holding the extension
     * @param {Object} context - Object calling the parser. An extension can
     * be implemented in different 3D Tiles classes (e.g. Tileset, Batch
     * table, b3dm, etc.). Each class will call this parser if it detects
     * the name associated to this extension. Therefore, the parser needs to
     * know the context in which it has been invoked to call the right
     * parser.
     * @return {Object} - a TemporalExtensioon declined object.
     */
    // eslint-disable-next-line class-methods-use-this
    parse(json, context) {
        if (json.transactions) {
            this.temporalTileset = new $3DTemporalTileset(json);
            return this.temporalTileset;
        } else if (json.featureIds) {
            const temporal_batchTable = new $3DTemporalBatchTable(json);
            // Fill this.temporal_batchTable.featuresTransactions which is
            // then used for optimization later on (e.g. in culling).
            for (let i = 0; i < temporal_batchTable.featureIds.length; i++) {
                const featureId = temporal_batchTable.featureIds[i];
                // TODO: access to featuresTransactions might be better managed
                temporal_batchTable.featuresTransacs[featureId] = this.temporalTileset.transactionManager.featuresTransactions[featureId];
            }
            return temporal_batchTable;
        } else if (context.box) {
            return new $3DTemporalBoundingVolume(json);
        } else {
            return undefined;
        }
    }
}

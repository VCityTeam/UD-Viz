import { $3DTemporalTileset } from './3DTemporalTileset.js';

/**
 * Entrypoint of the temporal module model. 
 * It stores all parts of the 3D Tiles temporal extension model
 */
export class $3DTemporalExtension {
    constructor() {
        this.extensionName = "3DTILES_temporal";

        /**
         * TODO: update comment and comment the next one...
         * A map of map with transactions as values and organized 
         * per tiles and per features. This structure is used for
         * optimizing the temporal culling (to decide which features
         * should be displayed and with which style depending on the time,
         * see TemporalProvider.js for more information). It is structured 
         * as follows:
         * { tileId : featureID : {
         *     asSource: transaction;
         *     asDestination: transaction;
         *   }
         * }
         *  Note that currently only the first transaction where the feature
         *  is a source or where the feature is a destination is kept.
         *  NORMALLY a feature shouldn't be the source (reps. the
         *  destination) of multiple transaction, since in this case one
         *  should create aggregates. Otherwise it might represent
         *  concurrent evolutions which are not managed in this
         *  implementation. However, in practical terms there is cases where
         *  a feature is the source (resp. destination) of multiple
         *  transactions. These cases might need to be investigated in more
         *  depth....
         * @type {Map}
         */
        this.transactionsPerFeature = new Map();

        this.transactionsPerTile = new Map();

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
        // TemporalCntroler which knows both this model and the tilesManager.
        // This is not ideal but improving this would asks for more
        // modifications in itowns, which is currently not possible.
    }

    temporalTilesetLoaded(event) {
        const allTransactions = event.detail.temporalTileset.transactions;

        for (let i = 0; i < allTransactions.length; i++) {
            const transaction = allTransactions[i];
            for (let j = 0; j < transaction.source.length; j++) {
                const source = transaction.source[j];
                if (this.transactionsPerFeature.get(source) === undefined) {
                    this.transactionsPerFeature.set(source, {});
                }
                if (this.transactionsPerFeature.get(source).asSource ===
                    undefined) {
                    this.transactionsPerFeature.get(source).asSource =
                        transaction;
                }
            }
            for (let j = 0; j < transaction.destination.length; j++) {
                const destination = transaction.destination[j];
                if (this.transactionsPerFeature.get(destination) === undefined) {
                    this.transactionsPerFeature.set(destination, {});
                }
                if (this.transactionsPerFeature.get(destination).asDestination ===
                    undefined) {
                    this.transactionsPerFeature.get(destination).asDestination =
                        transaction;
                }
            }
        }
    }

    updateTileExtensionModel(tile) {
        // Get the bounding volume temporal extension
        this.temporalBoundingVolumes.set(tile.tileId,  
        tile.boundingVolume.extensions[this.extensionName]);

        // Get the batch table temporal extension
        // The batch table is not mandatory (e.g. the root tile
        // has no batch table)
        if (tile.batchTable) {
            this.temporalBatchTables.set(tile.tileId,
            tile.batchTable.extensions[this.extensionName]);
            if (! this.transactionsPerTile.has(tile.tileId)) {
                this.transactionsPerTile.set(tile.tileId, new Map());
            }
            for (let i = 0; i < this.temporalBatchTables.get(tile.tileId).featureIds.length; i++) {
                const featureId = this.temporalBatchTables.get(tile.tileId).featureIds[i];
                this.transactionsPerTile.get(tile.tileId).set(featureId, this.transactionsPerFeature.get(featureId));
            }
        }
    }
}

import { $3DTemporalExtension } from '../Model/3DTemporalExtension.js';
import { TemporalGraphWindow } from '../View/TemporalGraphWindow.js';
import { TemporalSliderWindow } from '../View/TemporalSliderWindow.js';
import { CityObjectStyle } from '../../../Utils/3DTiles/Model/CityObjectStyle.js';
import { CityObjectID } from '../../../Utils/3DTiles/Model/CityObject.js';
import { getVisibleTiles } from '../../../Utils/3DTiles/3DTilesUtils.js';
import { EnumTemporalWindow } from '../View/EnumWindows.js';
import { TilesManager } from '../../../Utils/3DTiles/TilesManager.js';

/**
 * Entrypoint of the temporal module (that can be instanciated in the demos)
 * and controller of the temporal module (triggers view updates when the model
 * changes).
 */
export class TemporalController {
    /**
     * Constructs a new temporal module.
     *
     * @param {TilesManager} tilesManager - The tiles manager associated with
     * the 3D Tiles layer with temporal extension.
     * @param {Object} temporalOptions - options for initializing the temporal
     * module.
     * @param {Number} temporalOptions.minTime - start time of the slider
     * @param {Number} temporalOptions.maxTime - end time of the slider
     * @param {Number} temporalOptions.currentTime - initTime of the slider and
     * current time of the scene
     * @param {Number} temporalOptions.timeStep - step in time when moving
     * the slider
    };
     */
    constructor(tilesManager, temporalOptions) {
        this.tilesManager = tilesManager;
        // Initialize the styles affected to transactions. Will be 
        // used to update the 3D view.
        this.initTransactionsStyles();

        // Initialize the model. One part of this model is filled when the
        // temporal extension is loaded by iTowns; an other part is filled 
        // with the event declared below (when a tile is loaded).
        // See the comment at the end of the $3DTemporalExtension constructor
        // for more details.
        this.temporalExtensionModel = new $3DTemporalExtension();
        this.tilesManager.addEventListener(
            TilesManager.EVENT_TILE_LOADED,
            this.temporalExtensionModel.updateTileExtensionModel.bind(this.temporalExtensionModel));
            
        // When a tile is loaded, we compute the state of its features (e.g.
        // should they be displayed or not and in which color, etc.)
        this.tilesManager.addEventListener(
            TilesManager.EVENT_TILE_LOADED, 
            this.applyTileState.bind(this));

        // ******* Temporal window
        // Declare a callback to update this.currentTime when it is changed
        // by the user in the temporalWindow
        this.currentTime = temporalOptions.currentTime;

        function currentTimeUpdated(newDate) {
            this.currentTime = Number(newDate);
            this.applyVisibleTilesStates(newDate, this.tileManager);
        }
        const refreshCallback = currentTimeUpdated.bind(this);

        // Callback to get data asynchronously from the tileset.jsonS
        // TODO: remove this "asynchronous" part of the code and just 
        // parse the version and version transition and only use them 
        // when the graph window is chosen in the config... That should 
        // remove the this.temporalExtension from here.
        function getAsynchronousData(){
                let versions = this.temporalExtension.temporal_tileset.temporalVersions.versions;
                let versionTransitions = this.temporalExtension.temporal_tileset.versionTransitions;
                return [versions, versionTransitions]
            }

        // Select the window type:
        switch (temporalOptions.view) {
                    case EnumTemporalWindow.SLIDERWINDOW :
                        this.temporalWindow = new TemporalSliderWindow(refreshCallback, temporalOptions);
                        break;
                    // TODO: virer le piggy back de getAsynchronousData et
                    // verifier qu'il sert à quelque chose...
                    case EnumTemporalWindow.GRAPHWINDOW :
                        temporalOptions.getAsynchronousData = getAsynchronousData.bind(this);
                        this.temporalWindow = new TemporalGraphWindow(refreshCallback, temporalOptions);
                        break;
            }

    }

    initTransactionsStyles() {
        // Set styles
        this.tilesManager.registerStyle('noTransaction', new CityObjectStyle({
            materialProps: { opacity: 1.0, color: 0xffffff } })); // white

        this.tilesManager.registerStyle('creation', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0x009900 } })); // green

        this.tilesManager.registerStyle('demolition', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0xff0000 } })); // red

        this.tilesManager.registerStyle('modification', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0xFFD700 } })); // yellow

        this.tilesManager.registerStyle('hide', new CityObjectStyle({
            materialProps: { opacity: 0, color: 0xffffff, alphaTest: 0.3 } })); // hidden
    }

    // tile is tilecontent here
    computeTileState(tile) {
        const featuresStates = this.computeFeaturesStates(tile, this.currentTime);
        let featureStyleName;
        for (let i = 0; i < featuresStates.length; i++) {
            featureStyleName = featuresStates[i];
            if(this.tilesManager.isStyleRegistered(featureStyleName)) {
                this.tilesManager.setStyle(new CityObjectID(tile.tileId, i), 
                featureStyleName);
            } else {
                console.warn("Style " +  featureStyleName + " is not " + 
                "registered. Defaulting to style noTransaction.")
                this.tilesManager.setStyle(new CityObjectID(tile.tileId, i), 
                'noTransaction');
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    computeFeaturesStates(tileContent, currentTime) {
        let featuresDisplayStates = {};
        if (tileContent.batchTable && tileContent.batchTable.extensions &&
            tileContent.batchTable.extensions['3DTILES_temporal']) {
            const BT_ext = tileContent.batchTable.extensions['3DTILES_temporal'];
            // TODO: sortir cette intelligence de la batch table extension
            //  et la mettre ici. BT_ext devrait seulement avoir des
            //  fonctions pour qu'on récupère son contenu ou une partie de
            //  son contenu
            featuresDisplayStates = BT_ext.culling(currentTime);
        }
        return featuresDisplayStates;
    }

    applyTileState(tile) {
        this.computeTileState(tile);
        this.tilesManager.applyStyleToTile(tile.tileId, { updateView: false });
    }

    applyVisibleTilesStates() {
        const tiles = getVisibleTiles(this.tilesManager.layer);
        for (let i = 0; i < tiles.length; i++) {
            this.computeTileState(tiles[i]);
        }
        this.tilesManager.applyStyles();
    }
}

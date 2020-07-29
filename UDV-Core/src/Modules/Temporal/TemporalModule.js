import * as THREE from 'three';
import * as itowns from 'itowns';

import { $3DTemporalExtension } from './3DTILES_temporal/3DTemporalExtension';
import { TemporalGraphWindow } from './views/TemporalGraphWindow';
import { TemporalWindow } from './views/TemporalWindow';
import { TilesManager } from '../../Utils/3DTiles/TilesManager';
import { CityObjectStyle } from '../../Utils/3DTiles/Model/CityObjectStyle';
import { CityObjectID } from '../../Utils/3DTiles/Model/CityObject';
import { getVisibleTiles } from '../../Utils/3DTiles/3DTilesUtils';
import { NetworkManagerSingleton } from './viz';

/**
 * This module is used to manage the update, deletion and creation of documents.
 * It holds two windows that extend the document module, and creates a button
 * for the document deletion.
 */
export class TemporalModule {
    /**
     * Constructs a new temporal module.
     *
     * @param {Object} $3DTilesTemporalLayer - 3D Tiles layer with temporal
     * extension
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
    constructor(layerConfig, itownsView, temporalOptions) {
        // Current time at which the scene is displayed
        this.currentTime = temporalOptions.currentTime;

        // ******* iTowns 3D Tiles layer with temporal extension
        this.layer = new itowns.GeometryLayer(
            layerConfig.id, new THREE.Group());
        this.layer.name = '3DTiles-temporal';
        this.layer.url = layerConfig.url;
        this.layer.protocol = '3d-tiles';

        // Register temporal extension and add it to the layer
        // using defineLayerProperty method
        const extensions = new itowns.$3DTExtensions();
        this.temporalExtension = new $3DTemporalExtension();
        extensions.registerExtension('3DTILES_temporal',
            this.temporalExtension);
        this.layer.defineLayerProperty('registeredExtensions', extensions);

        itowns.View.prototype.addLayer.call(itownsView, this.layer);

        // ******* Tiles manager
        this.tilesManager = new TilesManager(itownsView, this.layer);
        this.initTransactionsStyles();
        // When a tile is loaded, we compute the state of its features (e.g.
        // should they be displayed or not and in which color, etc.)
        this.tilesManager.onTileLoaded = this.applyTileState.bind(this);

        // Request itowns view redraw
        itownsView.notifyChange();

        // ******* Temporal window
        // Declare a callback to update this.currentTime when it is changed
        // by the user in the temporalWindow
        function currentTimeUpdated(newDate) {
            this.currentTime = Number(newDate);
            this.applyVisibleTilesStates(newDate, this.tileManager);
        }
        const refreshCallback = currentTimeUpdated.bind(this);

        // Instantiate the temporal window
        // TODO: make it active by default

        // load options from baseconfig
        let n = new NetworkManagerSingleton();
        n.option = temporalOptions.graphOption;


        // Choose the window type you want
        // For time slider :
        //this.temporalWindow = new TemporalWindow(refreshCallback, // Change for switching with window mode
        //                temporalOptions);
        // For graph navigator
        this.temporalWindow = new TemporalGraphWindow(refreshCallback,
                        temporalOptions);

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

        /*        this.tilesManager.registerStyle('subdivision', new CityObjectStyle({
                    materialProps: { opacity: 0.6, color: 0x0000ff } })); // dark blue

                this.tilesManager.registerStyle('fusion', new CityObjectStyle({
                    materialProps: { opacity: 0.6, color: 0x0000ff } })); // dark blue */

        this.tilesManager.registerStyle('hide', new CityObjectStyle({
            materialProps: { opacity: 0, color: 0xffffff, alphaTest: 0.3 } })); // hidden
    }

    // tile is tilecontent here
    computeTileState(tile) {
        const featuresStates = this.temporalExtension.computeFeaturesStates(tile, this.currentTime);
        for (let i = 0; i < featuresStates.length; i++) {
            this.tilesManager.setStyle(new CityObjectID(tile.tileId, i), featuresStates[i]);
        }
    }

    applyTileState(tile) {
        this.computeTileState(tile);
        this.tilesManager.applyStyleToTile(tile.tileId, { updateView: false });
    }

    applyVisibleTilesStates() {
        const tiles = getVisibleTiles(this.layer);
        for (let i = 0; i < tiles.length; i++) {
            this.computeTileState(tiles[i]);
        }
        this.tilesManager.applyStyles();
    }
}

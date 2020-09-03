import { TilesManager } from "../3DTiles/TilesManager.js";
import { getVisibleTiles, updateITownsView, getFirstTileIntersection, getBatchIdFromIntersection, getObject3DFromTile, getVisibleTileCount } from "../3DTiles/3DTilesUtils.js";


export class LayerManager {

    /**
       * Creates a new TilesManager from an iTowns view and the 3DTiles layer.
       * 
       * @param {*} view The iTowns view.
       * @param {*} layer The 3DTiles layer.
       */
    constructor(view) {
        /**
         * The iTowns view.
         */
        this.view = view;

        /**
         * The set of tile wrappers that have been loaded.
         * @type {Array<TilesManager>}
         */
        this.tilesManagers = [];
    }

    isOneLayerVisible(){
        for (let i = 0; i < this.tilesManagers.length; i++) {
            if(this.tilesManagers[i].layer.visible){
                return true;
            }
        }
        return false;
    }
    
    changeVisibility(bool) {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            this.tilesManagers[i].layer.visible = bool;
        }
    }

    registerStyle(name, style) {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            this.tilesManagers[i].registerStyle(name, style);
        }
    }


    removeAll3DTilesStyles() {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            this.tilesManagers[i].removeAllStyles();
        }
    }

    apply3DTilesStyles() {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            this.tilesManagers[i].applyStyles();
        }
    }

    update3DTiles() {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            this.tilesManagers[i].update();
        }
    }

    getTilesManagerByLayerID(id) {
        for (let i = 0; i < this.tilesManagers.length; i++) {
            if (this.tilesManagers[i].layer.id === id)
                return this.tilesManagers[i];
        }
    }

    getLayers() {
        return this.view.getLayers();
    }

    getLoadedTileCount(){
        let loadedTileCount = 0;
        for (let i = 0; i < this.tilesManagers.length; i++) {
            loadedTileCount += this.tilesManagers[i].loadedTileCount;
        }
        return loadedTileCount;
    }

    getTotalTileCount(){
        let totalTileCount = 0;
        for (let i = 0; i < this.tilesManagers.length; i++) {
            totalTileCount += this.tilesManagers[i].totalTileCount;
        }
        return totalTileCount;
    }

    getVisibleTileCountFromLayers() {
        let nb = 0;
        for (let i = 0; i < this.tilesManagers.length; i++) {
            nb += getVisibleTileCount(this.tilesManagers[i].layer);
        }
        return nb;
    }

    getColorLayers() {
        return this.view.getLayers(layer => layer.isColorLayer);
    }

    getElevationLayers() {
        return this.view.getLayers(layer => layer.isElevationLayer);
    }

    getGeometryLayers() {
        return this.view.getLayers(layer => layer.isGeometryLayer);
    }

    getGeometryLayersWithoutPlanar() {
        return this.view.getLayers(layer => layer.id !== "planar" && layer.isGeometryLayer);
    }

    updateScale(layer, scale) {
        layer.scale = scale;
        this.notifyChange();
    }

    updateOpacity(layer, opacity) {
        layer.opacity = opacity;
        this.notifyChange();
    }

    notifyChange() {
        this.view.notifyChange();
    }

    pickCityObject(event) {
        if (event.target.nodeName.toUpperCase() === 'CANVAS') {
            this.update3DTiles();
            // Get the intersecting objects where our mouse pointer is
            let intersections = [];
            for (let i = 0; i < this.tilesManagers.length; i++) {
                intersections = intersections.concat(this.view.pickObjectsAt(event, 5, this.tilesManagers[i].layer));
            }
            let firstInter = getFirstTileIntersection(intersections);
            if (!!firstInter) {
                let tilesManager = this.getTilesManagerByLayerID(firstInter.layer.id);
                let batchId = getBatchIdFromIntersection(firstInter);
                let tileId = getObject3DFromTile(firstInter.object).tileId;
                return tilesManager.tiles[tileId].cityObjects[batchId];
            }
        }
        return undefined;
    }
}

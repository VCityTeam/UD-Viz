import { $3DTAbstractExtension } from 'itowns';
import { CityObjectStyle } from '../../../Utils/3DTiles/Model/CityObjectStyle';
import { CityObjectID } from '../../../Utils/3DTiles/Model/CityObject';
import { $3DTemporalTileset } from './3DTemporalTileset';
import { $3DTemporalBoundingVolume } from './3DTemporalBoundingVolume';
import { $3DTemporalBatchTable } from './3DTemporalBatchTable';

/**
 * @module TemporalExtension
 */
// TODO: ajouter un attribut extensionName
export class $3DTemporalExtension extends $3DTAbstractExtension {
    // we only store the temporal_tileset because we need to access it (more
    // precisely, we need to access the transactions) for culling
    constructor() {
        super();
        this.temporal_tileset = {};
        this.tilesManager = {};
    }

    // TODO: chicken egg (on doit instancier l'extension pour instancier le
    //  layer et instancier le layer pour instancier le tileManager).
    initTilesManager(tilesManager) {
        this.tilesManager = tilesManager;

        // Set styles
        this.tilesManager.registerStyle('noTransaction', new CityObjectStyle({
            materialProps: { opacity: 1.0, color: 0xffffff } })); // white

        this.tilesManager.registerStyle('creation', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0x009900 } })); // green

        this.tilesManager.registerStyle('demolition', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0xff0000 } })); // red

        this.tilesManager.registerStyle('modified', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0xFFD700 } })); // yellow

/*        this.tilesManager.registerStyle('subdivision', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0x0000ff } })); // dark blue

        this.tilesManager.registerStyle('fusion', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0x0000ff } })); // dark blue */

        this.tilesManager.registerStyle('hide', new CityObjectStyle({
            materialProps: { opacity: 0, color: 0xffffff, alphaTest: 0.3 } })); // hidden
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
            this.temporal_tileset = new $3DTemporalTileset(json);
            return this.temporal_tileset;
        } else if (json.featureIds) {
            const temporal_batchTable = new $3DTemporalBatchTable(json);
            // Fill this.temporal_batchTable.oldFeaturesTransaction which is
            // then used for optimization later on (e.g. in culling).
            for (let i = 0; i < temporal_batchTable.featureIds.length; i++) {
                const featureId = temporal_batchTable.featureIds[i];
                temporal_batchTable.featuresTransacs[featureId] = this.temporal_tileset.FeaturesTransactions[featureId];
            }
            return temporal_batchTable;
        } else if (context.box) {
            return new $3DTemporalBoundingVolume(json);
        } else {
            return undefined;
        }
    }

    // TODO: si on avait une 3DTilesbaseclass on pourrait mettre une
    //  fonction hasExtension dedans qui ferait le check si un obj a
    //  extensions et si il a l'extension courante et qui retourne l'ext de
    //  l'obj
    // eslint-disable-next-line class-methods-use-this
    culling(layer, node) {
        // TODO: la displaydate pourrait plutot etre stockée dans l'extension
        //  temporelle ?
        if (!('currentTime' in layer)) {
            throw new Error(`You must define a property named
            currentTime in the 3D Tiles layer with time_evolving_cities
            extension to use this extension. To do so, use
            layer.defineProperty(). currentTime must store the current date of
            display of the scene.`);
        }
        // TODO: Quand on parse les oldFeatureTransactions, on pourrait
        //  aller changer les dates dans le bounding volume temporel de la
        //  tuile si on trouve des oldFeatureTransactions
        /*
        if (node.boundingVolume && node.boundingVolume.extensions && node.boundingVolume.extensions['3DTILES_temporal']) {
            console.log('Temporal bounding volume culling for node :');
            console.log(node);
            const BV_ext = node.boundingVolume.extensions['3DTILES_temporal'];
            if (BV_ext.culling(layer.currentTime)) {
                // if the display date is outside the temporal bounding volume
                // of the tile; we don't cull the tile directly. This is
                // because we need to display the features of the tile that
                // have a transaction with other features from the next
                // timestamp in time. Hence, we need to verify the dates of
                // each object of the tile first
                console.log('Bounding volume culling = true');
                return true;
            }
            console.log('Bounding volume culling = false');
        }
        */
        if (node.batchTable && node.batchTable.extensions &&
            node.batchTable.extensions['3DTILES_temporal']) {
            const BT_ext = node.batchTable.extensions['3DTILES_temporal'];
            const featuresDisplayStates = BT_ext.culling(layer.currentTime);

            for (let i = 0; i < featuresDisplayStates.length; i++) {
                this.tilesManager.setStyle(new CityObjectID(node.tileId, i), featuresDisplayStates[i]);
            }

            /* this.tilesManager.applyStyleToTile(node.tileId,
                { updateView: true, updateFunction:
                 this.tilesManager.view.notifyChange(this.tilesManager.layer) }); */

            // Calling this method outside of the culling would be better.
            // For instance we might would want to call it before rendering.
            // However, there is no event in iTowns allowing to call it just
            // before rendering for instance (i.e. when the culling is
            // done). Trying to add it as a callback to the node with
            // THREEJS' Object3D.OnBeforeRender
            // (https://threejs.org/docs/index.html#api/en/core/Object3D.onBeforeRender)
            // doesn't work either because of the following issue: https://github.com/mrdoob/three.js/issues/11306
            // Adding it as a callback to the mesh however works but slows
            // down a lot the rendering.
            // createTileGroupsFromBatchIDs(node, featuresDisplayStates);
        }
        return false;
    }

    // TODO: plutôt passer la batch table (faire comme dans culling de
    //  temporalextension)
    // eslint-disable-next-line class-methods-use-this
    getPickingInfo(extObject, featureId) {
        if (extObject instanceof $3DTemporalBatchTable) {
            return extObject.getPickingInfo(featureId);
        } else {
            return {};
        }
    }
}

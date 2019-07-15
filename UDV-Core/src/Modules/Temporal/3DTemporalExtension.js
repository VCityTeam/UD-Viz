import { $3DTAbstractExtension } from 'itowns';
import { CityObjectStyle } from '../../Utils/3DTiles/Model/CityObjectStyle';
import { CityObjectID } from '../../Utils/3DTiles/Model/CityObject';

// TODO: Complex transactions ? Et en particulier les
//  subdivision/fusion+modified
const transactionsColors = {
    noTransaction: 0xffffff, // white
    creation: 0x009900, // green
    demolition: 0xff0000, // red
    modified: 0xFFD700, // yellow
    subdivision: 0x0000ff, // dark blue
    fusion: 0x0000ff, // dark blue
};

const opacities = {
    certain: 1.0,
    uncertain: 0.6,
    hide: 0,
};

class TemporalExtension_Tileset {
    constructor(json) {
        // TODO: pour l'instant les dates sont des années, les gérer ensuite
        //  avec moment
        this.startDate = json.startDate;
        this.endDate = json.endDate;

        this.versions = json.versions;
        this.versionTransitions = json.versionTransitions;
        this.transactions = json.transactions;

        this.FeaturesTransactions = this.findFeaturesTransactions();
    }

    // TODO: on prend ici seulement la prmeière transaction. Il devrait
    //  normalement en avoir qu'une. Faire des cas en fonction des types
    //  de transactions ?
    findFeaturesTransactions() {
        const featuresTransactions = {};
        for (let i = 0; i < this.transactions.length; i++) {
            const transaction = this.transactions[i];
            for (let j = 0; j < transaction.oldFeatures.length; j++) {
                const oldFeature = transaction.oldFeatures[j];
                if (featuresTransactions[oldFeature] === undefined) {
                    featuresTransactions[oldFeature] = {};
                }
                if (featuresTransactions[oldFeature].transactionsAsOldFeature === undefined) {
                    featuresTransactions[oldFeature].transactionsAsOldFeature = transaction;
                }
            }
            for (let j = 0; j < transaction.newFeatures.length; j++) {
                const newFeature = transaction.newFeatures[j];
                if (featuresTransactions[newFeature] === undefined) {
                    featuresTransactions[newFeature] = {};
                }
                if (featuresTransactions[newFeature].transactionsAsNewFeature === undefined) {
                    featuresTransactions[newFeature].transactionsAsNewFeature = transaction;
                }
            }
        }
        return featuresTransactions;
    }
}

class TemporalExtension_BoundingVolume {
    constructor(json) {
        this.startDate = json.startDate;
        this.endDate = json.endDate;
    }

    culling(currentTime) {
        // Bounding volume culling
        if (this.startDate > currentTime || this.endDate < currentTime) {
            return true;
        }
    }
}

// TODO: store the current display state of the tile ? (i.e.
//  featuresDisplayStates from culling function)
class TemporalExtension_BatchTable {
    constructor(json) {
        this.startDates = json.startDates;
        this.endDates = json.endDates;
        this.featureIds = json.featureIds;
        // Create a table which will hold for each features the transaction
        // for which the current feature is an oldFeature (i.e. the source of
        // the transaction) if it exists. This array is filled in the parse
        // method of the TemporalExtension class
        this.featuresTransacs = [];
        // Store the displayStates of Features of this tile depending on the
        // date once it has been computed. Its an object structured as follows:
        // { date: { featureDisplayStates } }
        this.datedDisplayStates = {};
    }

    // Should not exist if the implementation followed the current version of
    // the extension + for demonstration purposes if there is two
    // tags (fusion + modification or subdivision + modification) we display
    // the features in grey. These cases are indeed mostly between 2012 and 2015
    // and are due to the data
    static getDisplayStateFromTags(tags) {
        if (tags.length === 1) {
            return tags[0];
        } else {
            return 'noTransaction';
        }
    }


    /* *** Culling with transactions and colors management     */
    // Rules for culling:
    //   * If the feature exists at the currentTime we display it in
    //   * If there is a transaction between the feature and another
    //   feature at the currentTime:
    //      * the displayed geometry is the one of the old feature for the
    //      first half duration of the transaction
    //      * the displayed geometry is the one of the new feature for the
    //      second half of the duration
    //      * the opacity is set to 0.5
    //      * the color is set depending on the transaction type (defined in
    //      transactionsColors)
    //   * else we hide the feature.
    // TODO: it seems weird to do the culling here, it might be done in the
    //  extension using the information of the batch table for more clarity ?
    culling(currentTime) {
        // featuresMaterial is an array of object that will be used to color
        // and change the opacity of features according to their batchIDs by
        // using the function createTileGroupsFromBatchIDs() from 3DTilesUtils.
        // Its structure is as follow:
        //   [{
        //     material: {color: 0xff0000, opacity: 0.8},
        //     batchIDs: [64, 67]
        //   },
        //   {
        //     material: {color: 0xff000f, opacity: 0},
        //     batchIDs: [66]
        //   }]
        // If it has already been computed, don't do it again
        if (this.datedDisplayStates[currentTime]) {
            return this.datedDisplayStates[currentTime];
        }

        const featuresDisplayStates = [];
        for (let i = 0; i < this.featureIds.length; i++) {
            const featureId = this.featureIds[i];
            if (currentTime >= this.startDates[i] && currentTime <=
                this.endDates[i]) {
                // ** FEATURE EXISTS
                featuresDisplayStates.push('noTransaction');
            } else if (this.featuresTransacs[featureId]) {
                // ** TRANSACTION CASE
                let hasTransac = false;
                const oldTransac = this.featuresTransacs[featureId].transactionsAsOldFeature;
                if (oldTransac) {
                    const oldTransacHalfDuration = (oldTransac.endDate -
                        oldTransac.startDate) / 2;
                    if (currentTime > oldTransac.startDate  && currentTime <=
                        oldTransac.startDate + oldTransacHalfDuration) {
                        hasTransac = true;
                        const displayState = TemporalExtension_BatchTable.getDisplayStateFromTags(
                            oldTransac.tags);
                        featuresDisplayStates.push(displayState);
                    }
                }
                const newTransac = this.featuresTransacs[featureId].transactionsAsNewFeature;
                if (newTransac) {
                    const newTransacHalfDuration = (newTransac.endDate -
                        newTransac.startDate) / 2;
                    if (currentTime > newTransac.startDate +
                        newTransacHalfDuration && currentTime <=
                        newTransac.endDate) {
                        hasTransac = true;
                        const displayState = TemporalExtension_BatchTable.getDisplayStateFromTags(
                            newTransac.tags);
                        featuresDisplayStates.push(displayState);
                    }
                }

                if (!hasTransac) {
                    // ** TRANSACTION NOT AT THE RIGHT DATE
                    featuresDisplayStates.push('hide');
                }
            } else {
                // ** FEATURE DOES NOT EXIST AND THERE IS NO TRANSACTION

                // ** MANAGE CREATIONS AND DEMOLITIONS (this step must be
                // done because the creation and demolitions transactions
                // are currently not in the tileset. However, the tileset
                // should have them later on.
                const halfVintage = 1.5;

                if (currentTime + halfVintage >= this.startDates[i] &&
                    currentTime < this.startDates[i]) {
                    // ** CREATION
                    featuresDisplayStates.push('creation');
                } else if (currentTime - halfVintage < this.endDates[i] &&
                    currentTime > this.endDates[i]) {
                    // ** DEMOLITION
                    featuresDisplayStates.push('demolition');
                } else {
                    // ** FEATURE DOES NOT EXIST
                    featuresDisplayStates.push('hide');
                }
            }
        }

        // store displayState to avoid computing it again
        this.datedDisplayStates[currentTime] = featuresDisplayStates;
        return this.datedDisplayStates[currentTime];
    }

    getPickingInfo(featureId) {
        const pickingInfo = {};
        // TODO: this could be a function as we do the same thing 3 times.
        if (this.featureIds && this.featureIds[featureId]) {
            pickingInfo.featureId = this.featureIds[featureId];
        }
        if (this.startDates && this.startDates[featureId]) {
            pickingInfo.startDate = this.startDates[featureId];
        }
        if (this.endDates && this.endDates[featureId]) {
            pickingInfo.endDate = this.endDates[featureId];
        }
        return pickingInfo;
    }
}

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

        this.tilesManager.registerStyle('subdivision', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0x0000ff } })); // dark blue

        this.tilesManager.registerStyle('fusion', new CityObjectStyle({
            materialProps: { opacity: 0.6, color: 0x0000ff } })); // dark blue

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
            this.temporal_tileset = new TemporalExtension_Tileset(json);
            return this.temporal_tileset;
        } else if (json.featureIds) {
            const temporal_batchTable = new TemporalExtension_BatchTable(json);
            // Fill this.temporal_batchTable.oldFeaturesTransaction which is
            // then used for optimization later on (e.g. in culling).
            // TODO : This could be simplified so we directly store the
            //  featureTransacs instead of having two arrays.
            for (let i = 0; i < temporal_batchTable.featureIds.length; i++) {
                const featureId = temporal_batchTable.featureIds[i];
                temporal_batchTable.featuresTransacs[featureId] = this.temporal_tileset.FeaturesTransactions[featureId];
            }
            return temporal_batchTable;
        } else if (context.box) {
            return new TemporalExtension_BoundingVolume(json);
        } else {
            return undefined;
        }
    }
    /*    parse(json, context) {
        if (context instanceof $3DTileset) {
            this.temporal_tileset = new TemporalExtension_Tileset(json);
            return this.temporal_tileset;
        } else if (context instanceof $3DTBatchTable) {
            const temporal_batchTable = new TemporalExtension_BatchTable(json);
            // Fill this.temporal_batchTable.oldFeaturesTransaction which is
            // then used for optimization later on (e.g. in culling).
            // TODO : This could be simplified so we directly store the
            //  featureTransacs instead of having two arrays.
            for (let i = 0; i < temporal_batchTable.featureIds.length; i++) {
                const featureId = temporal_batchTable.featureIds[i];
                if (this.temporal_tileset.FeaturesTransactions[featureId] !== undefined) {
                    const featureTransacs = this.temporal_tileset.FeaturesTransactions[featureId];
                    temporal_batchTable.oldFeaturesTransaction[i] = featureTransacs.transactionsAsOldFeature;
                    temporal_batchTable.newFeaturesTransaction[i] = featureTransacs.transactionsAsNewFeature;
                } else {
                    temporal_batchTable.oldFeaturesTransaction[i] = {};
                    temporal_batchTable.newFeaturesTransaction[i] = {};
                }
            }
            return temporal_batchTable;
        } else if (context instanceof $3DTBoundingVolume) {
            return new TemporalExtension_BoundingVolume(json);
        } else {
            return undefined;
        }
    } */

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

            for (let i = 0; i < featuresDisplayStates.length ; i++) {
                this.tilesManager.setStyle(new CityObjectID(node.tileId, i), featuresDisplayStates[i]);
            }

            if (node.tileId === 208) {
                const featureId = BT_ext.featureIds[8]
                console.log(featureId);
                console.log(BT_ext.featuresTransacs);
                console.log(featuresDisplayStates[8]);
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
        if (extObject instanceof TemporalExtension_BatchTable) {
            return extObject.getPickingInfo(featureId);
        } else {
            return {};
        }
    }
}

import {
    $3DTAbstractExtension,
    $3DTBatchTable,
    $3DTBoundingVolume,
    $3DTileset,
} from 'itowns';
import * as THREE from 'three';
import { createTileGroupsFromBatchIDs } from '../../Utils/3DTiles/3DTilesUtils';

// TODO: Complex transactions ? Et en particulier les
//  subdivision/fusion+modified
const transactionsColors = {
    noTransaction: new THREE.Color(0xffffff), // white
    creation: new THREE.Color(0x009900), // green
    demolition: new THREE.Color(0xff0000), // red
    modified: new THREE.Color(0xFFD700), // yellow
    subdivision: new THREE.Color(0x0000ff), // dark blue
    fusion: new THREE.Color(0x0000ff), // dark blue
};

const opacities = {
    certain: 1.0,
    uncertain: 0.5,
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

        // TODO: this.FeaturesTransactions = this.findFeaturesTransactions
        // + Découper en petites taches pour eviter de freeze l'interface ?
        this.FeaturesTransactions = {};
        this.findFeaturesTransactions();
    }

    // TODO: on prend ici seulement la prmeière transaction. Il devrait
    //  normalement en avoir qu'une. Faire des cas en fonction des types
    //  de transactions ?
    findFeaturesTransactions() {
        for (let i = 0; i < this.transactions.length; i++) {
            const transaction = this.transactions[i];
            for (let j = 0; j < transaction.oldFeatures.length; j++) {
                const oldFeature = transaction.oldFeatures[j];
                if (this.FeaturesTransactions[oldFeature] === undefined) {
                    this.FeaturesTransactions[oldFeature] = {};
                }
                if (this.FeaturesTransactions[oldFeature].transactionsAsOldFeature === undefined) {
                    this.FeaturesTransactions[oldFeature].transactionsAsOldFeature = transaction;
                }
            }
            for (let j = 0; j < transaction.newFeatures.length; j++) {
                const newFeature = transaction.newFeatures[j];
                if (this.FeaturesTransactions[newFeature] === undefined) {
                    this.FeaturesTransactions[newFeature] = {};
                }
                if (this.FeaturesTransactions[newFeature].transactionsAsNewFeature === undefined) {
                    this.FeaturesTransactions[newFeature].transactionsAsNewFeature = transaction;
                }
            }
        }
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
        this.oldFeaturesTransaction = [];
        this.newFeaturesTransaction = [];
    }

    pushFeatureDisplayState(featuresDisplayStates, opacity, color, featureID) {
        if (!featuresDisplayStates[opacity]) {
            featuresDisplayStates[opacity] = color;
        }
        if (!featuresDisplayStates[opacity][color]) {
            featuresDisplayStates[opacity][color] = [featureID];
        } else {
            featuresDisplayStates[opacity][color].push(featureID);
        }
    }

    // Should be there if the implementation followed the current version of
    // the extension + for demonstration purposes if there is two
    // tags (fusion + modification or subdivision + modification) we display
    // the features in grey. These cases are indeed mostly between 2012 and 2015
    // and are due to the data
    getDisplayStateFromTags(tags) {
        const displayState = {};
        if (tags.length === 1) {
            displayState.opacity = opacities.uncertain;
            const transactionTag = tags[0];
            if (transactionsColors[transactionTag]) {
                displayState.color = transactionsColors[transactionTag];
            } else {
                console.warn(
                    `Temporal transaction tag ${transactionTag} unknown, defaulting color to white.`);
                displayState.color = transactionsColors.noTransaction;
            }
        } else {
            displayState.opacity = opacities.certain;
            displayState.color = transactionsColors.noTransaction;
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
    culling(currentTime) {
        // featuresMaterial is an array of object that will be used to color
        // and change the opacity of features according to their batchIDs.
        // Its structure is as follow:
        // { <opacity> : { <color> : [batchIds] } }
        const featuresDisplayStates = [];
        for (let i = 0; i < this.featureIds.length; i++) {
            if (currentTime >= this.startDates[i] && currentTime <=
                this.endDates[i]) {
                // ** FEATURE EXISTS
                this.pushFeatureDisplayState(featuresDisplayStates,
                    opacities.certain, transactionsColors.noTransaction, i);
            } else {
                // ** TRANSACTION OR FEATURE DOESN'T EXISTS
                const newTransac = this.newFeaturesTransaction[i];
                let hasTransac = false;
                if (newTransac) {
                    const newTransacHalfDuration = (newTransac.endDate -
                        newTransac.startDate) / 2;
                    if (currentTime > newTransac.startDate && currentTime <=
                        newTransac.startDate + newTransacHalfDuration) {
                        hasTransac = true;
                        const displayState = this.getDisplayStateFromTags(
                            newTransac.tags);
                        this.pushFeatureDisplayState(featuresDisplayStates,
                            displayState.opacity, displayState.color, i);
                    }
                }
                const oldTransac = this.oldFeaturesTransaction[i];
                if (oldTransac) {
                    hasTransac = true;
                    const oldTransacHalfDuration = (oldTransac.endDate -
                        oldTransac.startDate) / 2;
                    if (currentTime > oldTransac.startDate +
                        oldTransacHalfDuration && currentTime <
                        oldTransac.endDate) {
                        const displayState = this.getDisplayStateFromTags(
                            oldTransac.tags);
                        this.pushFeatureDisplayState(featuresDisplayStates,
                            displayState.opacity, displayState.color, i);
                    }
                }

                if (!hasTransac) {
                    this.pushFeatureDisplayState(featuresDisplayStates,
                        opacities.hide, transactionsColors.noTransaction, i);
                }
            }
        }

        return featuresDisplayStates;
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
// TODO: ajouter un constructeur et un attribut extensionName
export class $3DTemporalExtension extends $3DTAbstractExtension {
    // we only store the temporal_tileset because we need to access it (more
    // precisely, we need to access the transactions) for culling
    constructor() {
        super();
        this.temporal_tileset = {};
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

            // Flatten Object
            // code taken from https://gist.github.com/penguinboy/762197
            const flattenObject = function(ob) {
                let toReturn = {};

                for (let i in ob) {
                    if (!ob.hasOwnProperty(i)) continue;

                    if ((typeof ob[i]) == 'object') {
                        let flatObject = flattenObject(ob[i]);
                        for (let x in flatObject) {
                            if (!flatObject.hasOwnProperty(x)) continue;

                            toReturn[i + '.' + x] = flatObject[x];
                        }
                    } else {
                        toReturn[i] = ob[i];
                    }
                }
                return toReturn;
            };
            flattenObject(featuresDisplayStates);

            // TODO: call VRI function to update node display state
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

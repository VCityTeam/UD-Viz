import { $3DTAbstractExtension } from 'itowns';
import { CityObjectStyle } from '../../../Utils/3DTiles/Model/CityObjectStyle';
import { CityObjectID } from '../../../Utils/3DTiles/Model/CityObject';
import { $3DTemporalTileset } from './3DTemporalTileset';
import { $3DTemporalBoundingVolume } from './3DTemporalBoundingVolume';
import { $3DTemporalBatchTable } from './3DTemporalBatchTable';
import { $3DTemporalPrimaryTransaction } from './3DTemporalPrimaryTransaction';
import {$3DTemporalTransactionAggregate} from "./3DTemporalTransactionAggregate";
import {$3DTemporalVersion} from "./3DTemporalVersion";
import {$3DTemporalVersionTransition} from "./3DTemporalVersionTransition";
import { NetworkManagerSingleton } from "../viz";


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
    // TCH Observation : We pass by this parser 17times before doing something useful (seen with next log)
        if (json.versions) {
            let n = new NetworkManagerSingleton();

            for(let i = 0; i < json.versions.length; i++) {
                json.versions[i].label = json.versions[i].name;
                json.versions[i].level = i;
                json.versions[i].group = "consensusScenario";
                json.versions[i].title = json.versions[i].description;

            };
            n.data.nodes = json.versions;
            n.data.groups = {
            "id":0,
            "label":"consensusScenario"};
        }
        if (json.versionTransitions){
            let n = new NetworkManagerSingleton();
                n.data.edges = json.versionTransitions;
        }
        if (json.transactions) {
            this.temporal_tileset = new $3DTemporalTileset(json);
            return this.temporal_tileset;
        } else if (json.featureIds) {
            const temporal_batchTable = new $3DTemporalBatchTable(json);
            // Fill this.temporal_batchTable.featuresTransactions which is
            // then used for optimization later on (e.g. in culling).
            for (let i = 0; i < temporal_batchTable.featureIds.length; i++) {
                const featureId = temporal_batchTable.featureIds[i];
                // TODO: access to featuresTransactions might be better managed
                temporal_batchTable.featuresTransacs[featureId] = this.temporal_tileset.transactionManager.featuresTransactions[featureId];
            }
            return temporal_batchTable;
        } else if (context.box) {
            return new $3DTemporalBoundingVolume(json);
        } else {
            return undefined;
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

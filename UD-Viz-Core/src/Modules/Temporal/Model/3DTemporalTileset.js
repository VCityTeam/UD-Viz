import { TransactionsManager } from '../Utils/TransactionsManager.js';
import { $3DTemporalVersion } from './3DTemporalVersion.js';

export class $3DTemporalTileset {
    constructor(json) {
        this.startDate = json.startDate;
        this.endDate = json.endDate;

        this.temporalVersions = new $3DTemporalVersion(json.versions);
        this.versionTransitions = json.versionTransitions;
        this.transactionManager = new TransactionsManager(json.transactions);

        // Trapped by 3DTemporalExtension.js that stores this instance of 
        // $3DTemporalTileset
        window.dispatchEvent(new CustomEvent(
            $3DTemporalTileset.TEMPORAL_TILESET_LOADED, 
            {detail: { temporalTileset: this}}));
    }

    static get TEMPORAL_TILESET_LOADED() {
        return 'TEMPORAL_TILESET_LOADED';
      }
}

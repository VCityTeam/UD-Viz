import { TransactionsManager } from '../Utils/TransactionsManager.js';
import { $3DTemporalVersion } from './3DTemporalVersion.js';

export class $3DTemporalTileset {
    constructor(json) {
        // TODO: pour l'instant les dates sont des années, les gérer ensuite
        //  avec moment
        this.startDate = json.startDate;
        this.endDate = json.endDate;

        this.temporalVersions = new $3DTemporalVersion(json.versions);
        this.versionTransitions = json.versionTransitions;
        this.transactionManager = new TransactionsManager(json.transactions);
    }

}

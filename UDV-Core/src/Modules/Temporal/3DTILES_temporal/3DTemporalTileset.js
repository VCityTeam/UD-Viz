import { TransactionsManager } from '../Utils/TransactionsManager';

export class $3DTemporalTileset {
    constructor(json) {
        // TODO: pour l'instant les dates sont des années, les gérer ensuite
        //  avec moment
        this.startDate = json.startDate;
        this.endDate = json.endDate;

        this.versions = json.versions;
        this.versionTransitions = json.versionTransitions;
        this.transactionManager = new TransactionsManager(json.transactions);
    }

}

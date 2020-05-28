import { TransactionsManager } from '../Utils/TransactionsManager';
import { VersionsManager } from '../Utils/VersionsManager';
import { VersionTransitionsManager } from '../Utils/VersionTransitionsManager';

export class $3DTemporalTileset {
    constructor(json) {
        // TODO: pour l'instant les dates sont des années, les gérer ensuite
        //  avec moment
        this.startDate = json.startDate;
        this.endDate = json.endDate;
        this.graph_data = json.graphData;
        this.graph_option = json.graphOption;
        this.versionsManager = new VersionsManager(json.versions);
        this.versionTransitionsManager = new VersionTransitionsManager(json.versionTransitions);
        this.transactionManager = new TransactionsManager(json.transactions);

    }

}

import { $3DTemporalPrimaryTransaction } from '../Model/3DTemporalPrimaryTransaction.js';
import { $3DTemporalTransactionAggregate } from '../Model/3DTemporalTransactionAggregate.js';
import { $3DTemporalVersion } from './3DTemporalVersion.js';

export class $3DTemporalTileset {
    constructor(json) {
        this.startDate = json.startDate;
        this.endDate = json.endDate;

        this.transactions = [];
        // Fill this.transactions
        this.parseTransactions(json.transactions); 

        this.temporalVersions = new $3DTemporalVersion(json.versions);
        this.versionTransitions = json.versionTransitions;
        
        // Trapped by 3DTemporalExtension.js that stores this instance of 
        // $3DTemporalTileset
        window.dispatchEvent(new CustomEvent(
            $3DTemporalTileset.TEMPORAL_TILESET_LOADED, 
            {detail: { temporalTileset: this}}));
    }

    parseTransactions(transactions) {
        for (let i = 0; i < transactions.length; i++) {
            let parsedTransac;
            // **** Create Primary Transactions and Transactions Aggregates
            if (transactions[i].type) {
                // it is a PrimaryTransaction
                parsedTransac = new $3DTemporalPrimaryTransaction(transactions[i]);
            } else if (transactions[i].transactions) {
                // it is a TransactionAggregate
                // We create a TransactionAggregate and parse its aggregated
                // transactions
                parsedTransac = new $3DTemporalTransactionAggregate(transactions[i]);
                parsedTransac.transactions = this.parseTransactions(transactions[i].transactions);
            }
            this.transactions.push(parsedTransac);
        }
    }

    static get TEMPORAL_TILESET_LOADED() {
        return 'TEMPORAL_TILESET_LOADED';
      }
}

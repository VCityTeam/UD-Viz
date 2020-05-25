import { $3DTemporalPrimaryTransaction } from '../3DTILES_temporal/3DTemporalPrimaryTransaction';
import { $3DTemporalTransactionAggregate } from '../3DTILES_temporal/3DTemporalTransactionAggregate';

export class TransactionsManager {
    constructor(transactions) {

        /**
         * An array of parsed transactions (i.e. PrimaryTransactions and/or
         * TransactionAggregates).
         * @type {Array}
         */
        this.transactions = this.parseTransactions(transactions);

        /**
         * A dictionary of transactions organized per feature, used for
         * optimisation and structured as follows:
         * featureID : {
         *     asSource: transaction;
         *     asDestination: transaction;
         * }
         *  Note that currently only the first transaction where the feature
         *  is a source or where the feature is a destination is kept.
         *  NORMALLY a feature shouldn't be the source (reps. the
         *  destination) of multiple transaction, since in this case one
         *  should create aggregates. Otherwise it might represent
         *  concurrent evolutions which are not managed in this
         *  implementation. However, in practical terms there is cases where
         *  a feature is the source (resp. destination) of multiple
         *  transactions. These cases might need to be investigated in more
         *  depth....
         * @type {Object}
         */
        this.featuresTransactions = {};
        // TODO: peut etre rentré dans parseTransactions pour éviter deux boucles
        this.findFeaturesTransactions();
        console.log("TransactionManager.js constructed :");
        console.log(this);
    }

    /**
     * Fills this.transactions
     * @param transactions
     * @returns {[]}
     */
    parseTransactions(transactions) {
        const parsedTransactions = [];
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
            parsedTransactions.push(parsedTransac);
        }
        return parsedTransactions;
    }

    // TODO: duplicated code
    findFeaturesTransactions() {
        for (let i = 0; i < this.transactions.length; i++) {
            const transaction = this.transactions[i];
            for (let j = 0; j < transaction.source.length; j++) {
                const source = transaction.source[j];
                if (this.featuresTransactions[source] === undefined) {
                    this.featuresTransactions[source] = {};
                }
                if (this.featuresTransactions[source].asSource ===
                    undefined) {
                    this.featuresTransactions[source].asSource =
                        transaction;
                }
            }
            for (let j = 0; j < transaction.destination.length; j++) {
                const destination = transaction.destination[j];
                if (this.featuresTransactions[destination] === undefined) {
                    this.featuresTransactions[destination] = {};
                }
                if (this.featuresTransactions[destination].asDestination ===
                    undefined) {
                    this.featuresTransactions[destination].asDestination =
                        transaction;
                }
            }
        }
    }

}


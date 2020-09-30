import { $3DTemporalTransaction } from "./3DTemporalTransaction.js";

// TODO: store the current display state of the tile ? (i.e. featuresDisplayStates from culling function)
export class $3DTemporalBatchTable {
    constructor(json) {
        this.startDates = json.startDates;
        this.endDates = json.endDates;
        this.featureIds = json.featureIds;
        // Create a table which will hold for each features the transaction
        // for which the current feature is a source or a destination if it
        // exists. This array is filled in the parse method of the
        // TemporalExtension class
        this.featuresTransacs = [];
        // Store the displayStates of Features of this tile depending on the
        // date once it has been computed. Its an object structured as follows:
        // { date: { featureDisplayStates } }
        this.datedDisplayStates = {};
    }

    // TODO: probablement à faire directement au parsing des transactions 
    // et mettre ça dans un attribut 'styleName'. A voir au moment où je 
    // virerai le transactionManager.
    /**
     * Generates the style name of a transaction. This method is recursive
     * for aggregated transactions that may have multiple nested transactions. 
     * The style name correspond to the one created in the 
     * initTransactionsStyles method).
     * 
     * @param {$3DTemporalTransaction} transaction The transaction 
     * to generate the style name from.
     * 
     * @returns {string} If the transaction is a primary transaction, 
     * returns its type. If it is an aggregated transaction, it returns a
     * concatenation of the primary transactions types aggregated in 
     * transaction, prefixed by 'aggregate'. Currently, no style are 
     * declared for transactions aggregates for a simpler visual 
     * rendering. We could also generate styles with random colors
     * and add them to a legend and provide a user the possibility to
     * update these colors and / or to disable them from the GUI.
     */
    getTransactionStyleName(transaction, styleName) {
        if (transaction.isPrimary) return transaction.type;
        else if (transaction.isAggregate) {
            if (styleName === '') styleName = 'aggregate'; // prefix
            for (let i = 0 ; i < transaction.transactions.length ; i++) {
                styleName = styleName + '-' + this.getTransactionStyleName(
                    transaction.transactions[i], styleName);
            }
            return styleName
        } else {
            console.warn('Transaction which is not a primary nor an aggregate.')
        }
    }

    /* *** Culling with transactions and colors management     */
    // Rules for culling:
    //   * If the feature exists at the currentTime we display it in gray
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
                const transacAsSource = this.featuresTransacs[featureId].asSource;
                if (transacAsSource) {
                    const transacAsSourceHalfDuration = (transacAsSource.endDate -
                        transacAsSource.startDate) / 2;
                    if (currentTime > transacAsSource.startDate && currentTime <=
                        transacAsSource.startDate + transacAsSourceHalfDuration) {
                        hasTransac = true;
                        featuresDisplayStates.push(
                            this.getTransactionStyleName(transacAsSource, ''));
                    }
                }
                const transacAsDest = this.featuresTransacs[featureId].asDestination;
                if (transacAsDest) {
                    const transacAsDestHalfDuration = (transacAsDest.endDate -
                        transacAsDest.startDate) / 2;
                    if (currentTime > transacAsDest.startDate +
                        transacAsDestHalfDuration && currentTime <=
                        transacAsDest.endDate) {
                        hasTransac = true;
                        featuresDisplayStates.push(
                            this.getTransactionStyleName(transacAsDest, ''));
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
                // should have them later on).
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

    getInfoById(featureId) {
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
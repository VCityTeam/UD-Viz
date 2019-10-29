export class $3DTemporalTileset {
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
                if (featuresTransactions[oldFeature].transactionsAsOldFeature ===
                    undefined) {
                    featuresTransactions[oldFeature].transactionsAsOldFeature =
                        transaction;
                }
            }
            for (let j = 0; j < transaction.newFeatures.length; j++) {
                const newFeature = transaction.newFeatures[j];
                if (featuresTransactions[newFeature] === undefined) {
                    featuresTransactions[newFeature] = {};
                }
                if (featuresTransactions[newFeature].transactionsAsNewFeature ===
                    undefined) {
                    featuresTransactions[newFeature].transactionsAsNewFeature =
                        transaction;
                }
            }
        }
        return featuresTransactions;
    }
}

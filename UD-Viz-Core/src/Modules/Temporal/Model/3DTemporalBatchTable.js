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
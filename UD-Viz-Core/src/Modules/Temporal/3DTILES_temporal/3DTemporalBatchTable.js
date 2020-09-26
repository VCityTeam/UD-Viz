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

    // Should not exist if the implementation followed the current version of
    // the extension + for demonstration purposes if there is two
    // tags (fusion + modification or subdivision + modification) we display
    // the features in grey. These cases are indeed mostly between 2012 and 2015
    // and are due to the data
    /*
    static getDisplayStateFromTags(currentTime, tags) {
        if (tags.length === 1) {
            return tags[0];
        } else if (currentTime > 2012 && currentTime < 2015) {
            return 'noTransaction';
        } else {
            return 'modification';
        }
    }
    */

    // We do not manage all type of transactions and don't display some
    // wrongly detected transactions for demonstration purposes.
    static computeDisplayState(currentTime, transaction) {
        if (transaction.isAggregate) {
            if (currentTime > 2012 && currentTime < 2015) {
                return 'noTransaction';
            } else {
                return 'modification';
            }
        } else if (transaction.type === 'union' || transaction.type === 'division') {
            return 'noTransaction';
        } else {
            return transaction.type;
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
        // featuresMaterial is an array of object that will be used to color
        // and change the opacity of features according to their batchIDs by
        // using the function createTileGroupsFromBatchIDs() from 3DTilesUtils.
        // Its structure is as follow:
        //   [{
        //     material: {color: 0xff0000, opacity: 0.8},
        //     batchIDs: [64, 67]
        //   },
        //   {
        //     material: {color: 0xff000f, opacity: 0},
        //     batchIDs: [66]
        //   }]
        // If it has already been computed, don't do it again
        if (this.datedDisplayStates[currentTime]) {
            return this.datedDisplayStates[currentTime];
        }

        const featuresDisplayStates = [];
        for (let i = 0; i < this.featureIds.length; i++) {
            const featureId = this.featureIds[i];
            bigScaleDemoModifs(featureId, i, this.startDates, this.endDates);
            if (confluenceDemoModifs(featureId, featuresDisplayStates,
                currentTime)) continue;
            if (TourIncity(featureId, featuresDisplayStates,
                currentTime)) continue;
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
                        featuresDisplayStates.push($3DTemporalBatchTable.computeDisplayState(
                            currentTime, transacAsSource));
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
                        featuresDisplayStates.push($3DTemporalBatchTable.computeDisplayState(
                            currentTime, transacAsDest));
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

    getPickingInfo(featureId) {
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

function bigScaleDemoModifs(featureId, i, startDates, endDates) {
    // *** Corrections of wrongly detected transactions for demo
    // purposes
    // Centre commercial part dieu (tile 208, batchID 8)
    if (featureId === '2009::LYON_3_00433_4') {
        endDates[i] = 2015;
    }
    // Tour crayon (tile 208, batchID 137)
    if (featureId === '2015::BU_69383AR8') {
        startDates[i] = 2009;
    }
    // Cite internationale (tile 222, batchID 144)
    if (featureId === '2015::BU_69386AB36') {
        startDates[i] = 2009;
    }
    // Beaux arts (tile 105, batchID 128)
    if (featureId === '2015::BU_69381AT70') {
        startDates[i] = 2009;
    }
    // Hotel de ville (tile 108, batchID 48)
    if (featureId === '2015::BU_69381AS18') {
        startDates[i] = 2009;
    }
    // Opera (tile 108, batchID 51)
    if (featureId === '2015::BU_69381AS19') {
        startDates[i] = 2009;
    }
    // Saint nizier (tile 64, batchID 141)
    if (featureId === '2015::BU_69382AB18') {
        startDates[i] = 2009;
    }
    // Cordeliers' bati remarquable (tile 64, batchID 141)
    if (featureId === '2015::BU_69382AC58') {
        startDates[i] = 2009;
    }
    // Cordeliers' bati remarquable (tile 64, batchID 104)
    if (featureId === '2015::BU_69382AD83') {
        startDates[i] = 2009;
    }
    // Cordeliers' bati remarquable (tile 64, batchID 113)
    if (featureId === '2015::BU_69382AD82') {
        startDates[i] = 2009;
    }
    // Hotel Dieu (tile 63, batchID 23)
    if (featureId === '2015::BU_69382AL5') {
        startDates[i] = 2009;
    }
    // Bellecour est bati remarquable (tile 60, batchID 68)
    if (featureId === '2015::BU_69382AR66') {
        startDates[i] = 2009;
    }
    // Univ Lyon 2 (tile 59, batchID 52)
    if (featureId === '2015::BU_69387AR1') {
        startDates[i] = 2009;
    }
    // ? (tile 59, batchID 51)
    if (featureId === '2015::BU_69387AP17') {
        startDates[i] = 2009;
    }
    // ? (tile 59, batchID 19)
    if (featureId === '2015::BU_69387AS52') {
        startDates[i] = 2009;
    }
    // ? (tile 46, batchID 127)
    if (featureId === '2015::BU_69387AS90') {
        startDates[i] = 2009;
    }
    // Palais de justice (tile 55, batchID 127)
    if (featureId === '2015::BU_69385AH128') {
        startDates[i] = 2009;
    }
    // Palais de justice (tile 55, batchID 127)
    if (featureId === '2015::BU_69385AH128') {
        startDates[i] = 2009;
    }
    // Saint Jean (tile 55, batchID 102)
    if (featureId === '2015::BU_69385AI76') {
        startDates[i] = 2009;
    }
    // ? (tile 53, batchID 41)
    if (featureId === '2015::BU_69385AK128') {
        startDates[i] = 2009;
    }
    // ? (tile 52, batchID 15)
    if (featureId === '2015::BU_69382AT41') {
        startDates[i] = 2009;
    }
    // Perrache (tile 40, batchID 140)
    if (featureId === '2015::BU_69382PUBLIC11') {
        startDates[i] = 2009;
    }
    // Perrache 2 (tile 40, batchID 136)
    if (featureId === '2015::BU_69382AY97') {
        startDates[i] = 2009;
    }
    // ? (tile 33, batchID 131)
    if (featureId === '2015::BU_69387BZ166') {
        startDates[i] = 2009;
    }
    // ? (tile 35, batchID 104)
    if (featureId === '2015::BU_69387CK10') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 114)
    if (featureId === '2015::BU_69382BC177') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 116)
    if (featureId === '2015::BU_69382BC164') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 117)
    if (featureId === '2015::BU_69382BC166') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 120)
    if (featureId === '2015::BU_69382BC162') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 113)
    if (featureId === '2015::BU_69382BD210') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 98)
    if (featureId === '2015::BU_69382BP62') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 102)
    if (featureId === '2015::BU_69382BP11') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 103)
    if (featureId === '2015::BU_69382BP25') {
        startDates[i] = 2009;
    }
    // Confluence (tile 11, batchID 106)
    if (featureId === '2015::BU_69382BP46') {
        startDates[i] = 2009;
    }
    // Confluence (tile 38, batchID 55)
    if (featureId === '2015::BU_69382BD13') {
        startDates[i] = 2009;
    }
}

function TourIncity(featureId, featuresDisplayStates, currentTime) {
    // Part dieu : tour incity (tileId 217, batchID 35)
    if (featureId === "2015::BU_69383AD5") {
        if (currentTime === 2011) {
            featuresDisplayStates.push('modification');
            return true;
        } else if (currentTime === 2012 || currentTime === 2013 ||
            currentTime === 2014) {
            featuresDisplayStates.push('noTransaction');
            return true;
        }
    }
    // Tour Incity en construction (2009) tileID = 217, batchID = 0
    if (featureId === "2009::LYON_3_00316_1" && currentTime === 2010) {
        featuresDisplayStates.push('modification');
        return true;
    }
    return false;
}

function confluenceDemoModifs(featureId, featuresDisplayStates, currentTime) {
    // 2009 -> 2012 inconsistencies
    // Confluence (tile 37, batchID 6)
    if (featureId === '2009::LYON_2_00161_25') {
        featuresDisplayStates.push('hide');
        return true;
    }
    // Confluence (tile 37, batchID 8)
    if (featureId === '2009::LYON_2_00161_22') {
        featuresDisplayStates.push('hide');
        return true;
    }
    // Confluence (tile 37, batchID 66)
    if (featureId === '2015::BU_69382BD209') {
        featuresDisplayStates.push('noTransaction');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 11, batchID 59)
    if (featureId === '2012::LYON_2EME_00232_6' && currentTime === 2013) {
        featuresDisplayStates.push('demolition');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 26)
    if (featureId === '2012::LYON_2EME_00232_20' && currentTime === 2013) {
        featuresDisplayStates.push('demolition');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 30)
    if (featureId === '2012::LYON_2EME_00232_16' && currentTime === 2013) {
        featuresDisplayStates.push('demolition');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 29)
    if (featureId === '2012::LYON_2EME_00232_17' && currentTime === 2013) {
        featuresDisplayStates.push('demolition');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 11, batchID 60)
    if (featureId === '2012::LYON_2EME_00232_4' && currentTime === 2013) {
        featuresDisplayStates.push('modification');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 11, batchID 101)
    if (featureId === '2015::BU_69382BE71' && currentTime === 2014) {
        featuresDisplayStates.push('modification');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 42)
    if (featureId === '2012::LYON_2EME_00232_13' && currentTime === 2013) {
        featuresDisplayStates.push('modification');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 79)
    if (featureId === '2015::BU_69382BD95' && currentTime === 2014) {
        featuresDisplayStates.push('modification');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 80)
    if (featureId === '2015::BU_69382BD93' && currentTime === 2014) {
        featuresDisplayStates.push('modification');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 82)
    if (featureId === '2015::BU_69382BD92' && currentTime === 2014) {
        featuresDisplayStates.push('modification');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 32)
    if (featureId === '2012::LYON_2EME_00232_0' && currentTime === 2013) {
        featuresDisplayStates.push('noTransaction');
        return true;
    }
    // 2012 -> 2015 inconsistencies
    // Confluence (tile 37, batchID 68)
    if (featureId === '2015::BU_69382BD205' && currentTime === 2014) {
        featuresDisplayStates.push('noTransaction');
        return true;
    }
    return false;
}

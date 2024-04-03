import { C3DTTemporalBatchTable } from './model/C3DTTemporalBatchTable';
import { C3DTTemporalBoundingVolume } from './model/C3DTTemporalBoundingVolume';
import { C3DTTemporalTileset } from './model/C3DTTemporalTileset';
import * as itowns from 'itowns';
import { arrayPushOnce } from '@ud-viz/utils_shared';

export {
  C3DTTemporalBatchTable,
  C3DTTemporalBoundingVolume,
  C3DTTemporalTileset,
};

export * from './SpaceTimeCube';

export { STSCircle } from './STSCircle';

export const ID = '3DTILES_temporal';

const TEMPORAL_COLOR_OPACITY = {
  noTransaction: {
    color: 'white',
    opacity: 1,
  },
  invisible: {
    color: 'blue',
    opacity: 0,
  },
  debug: {
    color: 'brown',
    opacity: 0.2,
  },
  creation: {
    color: 'green',
    opacity: 0.6,
  },
  demolition: {
    color: 'red',
    opacity: 0.6,
  },
  modification: {
    color: 'yellow',
    opacity: 0.6,
  },
};

/* The `Temporal3DTilesLayerWrapper` class is a wrapper for a temporal 3D Tiles layer
 * using the `3DTILES_temporal` extension, providing methods to compute and update the
 * style of the layer based on temporal data. */
export class Temporal3DTilesLayerWrapper {
  /**
   * A constructor that initializes a temporal style for a C3DTilesLayer by
   * computing tile maps based on the `3DTILES_temporal` batch table hierarchy content found in
   * the tile content.
   *
   * @param {itowns.C3DTilesLayer} temporalC3DTilesLayer - An instance of the `itowns.C3DTilesLayer` class. It
   * represents a layer that displays 3D tiles with temporal data.
   */
  constructor(temporalC3DTilesLayer) {
    /**
     * the layer wrapped
     *
      @type {itowns.C3DTilesLayer} */
    this.temporalC3DTilesLayer = temporalC3DTilesLayer;

    /**
     * all date possible to update style with (ascending order)
     *
      @type {Array<number>} */
    this.knownDatesForAllTiles = [];

    /**
     * date selected TODO: use a Date Object
     *
      @type {number} */
    this._styleDate = null;

    const computedTileIds = [];

    const tileMaps = new Map();

    // compute tileMaps base on the batchTable found in tileContent
    temporalC3DTilesLayer.addEventListener(
      itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
      ({ tileContent }) => {
        // avoid to recompute map for a tile already loaded
        if (!arrayPushOnce(computedTileIds, tileContent.tileId)) return;

        console.debug(
          'compute init data temporal style ',
          tileContent.tileId,
          temporalC3DTilesLayer.id
        );

        const possibleDates = [];

        /** @type {Map<string,object>} */
        tileMaps.set(tileContent.tileId, new Map());

        temporalC3DTilesLayer.tileset.extensions[
          '3DTILES_temporal'
        ].transactions.forEach((transaction) => {
          // add possibleDate
          const transactionDuration =
            transaction.endDate - transaction.startDate;

          const firstHalfDate = transaction.startDate + transactionDuration / 3;
          const secondHalfDate = transaction.endDate - transactionDuration / 3;

          arrayPushOnce(possibleDates, firstHalfDate);
          arrayPushOnce(possibleDates, secondHalfDate);
          arrayPushOnce(possibleDates, transaction.startDate);
          arrayPushOnce(possibleDates, transaction.endDate);

          transaction.source.forEach((fId) => {
            if (transaction.type == 'modification') {
              tileMaps
                .get(tileContent.tileId)
                .set(fId + firstHalfDate, TEMPORAL_COLOR_OPACITY.modification);
              tileMaps
                .get(tileContent.tileId)
                .set(fId + secondHalfDate, TEMPORAL_COLOR_OPACITY.invisible);
            } else {
              // all other transaction
              tileMaps
                .get(tileContent.tileId)
                .set(fId + firstHalfDate, TEMPORAL_COLOR_OPACITY.noTransaction);
              tileMaps
                .get(tileContent.tileId)
                .set(
                  fId + secondHalfDate,
                  TEMPORAL_COLOR_OPACITY.noTransaction
                );
            }
          });

          transaction.destination.forEach((fId) => {
            if (transaction.type == 'modification') {
              tileMaps
                .get(tileContent.tileId)
                .set(fId + firstHalfDate, TEMPORAL_COLOR_OPACITY.invisible);
              tileMaps
                .get(tileContent.tileId)
                .set(fId + secondHalfDate, TEMPORAL_COLOR_OPACITY.modification);
            } else {
              // all other transaction
              tileMaps
                .get(tileContent.tileId)
                .set(fId + firstHalfDate, TEMPORAL_COLOR_OPACITY.noTransaction);
              tileMaps
                .get(tileContent.tileId)
                .set(
                  fId + secondHalfDate,
                  TEMPORAL_COLOR_OPACITY.noTransaction
                );
            }
          });
        });

        // handle demolition/creation which are not in batchTable/extension
        possibleDates.sort((a, b) => a - b);
        for (const [
          // eslint-disable-next-line no-unused-vars
          tileId,
          tileC3DTileFeatures,
        ] of temporalC3DTilesLayer.tilesC3DTileFeatures) {
          // eslint-disable-next-line no-unused-vars
          for (const [batchId, c3DTileFeature] of tileC3DTileFeatures) {
            const temporalExtension =
              c3DTileFeature.getInfo().extensions['3DTILES_temporal'];

            for (let index = 0; index < possibleDates.length - 1; index++) {
              const date = possibleDates[index];
              const nextDate = possibleDates[index + 1];

              if (temporalExtension.endDate == date) {
                // if no transaction next index should demolition (no modification)
                const featureDateID = temporalExtension.featureId + nextDate;
                if (!tileMaps.get(tileContent.tileId).has(featureDateID)) {
                  tileMaps
                    .get(tileContent.tileId)
                    .set(featureDateID, TEMPORAL_COLOR_OPACITY.demolition);
                }
              }

              if (temporalExtension.startDate == nextDate) {
                // if no transaction previous index should creation (no modification)
                const featureDateID = temporalExtension.featureId + date;
                if (!tileMaps.get(tileContent.tileId).has(featureDateID)) {
                  tileMaps
                    .get(tileContent.tileId)
                    .set(featureDateID, TEMPORAL_COLOR_OPACITY.creation);
                }
              }
            }
          }
        }

        possibleDates.forEach((date) =>
          arrayPushOnce(this.knownDatesForAllTiles, date)
        );
        this.knownDatesForAllTiles.sort((a, b) => a - b); // sort

        if (this._styleDate == null)
          this.styleDate = this.knownDatesForAllTiles[0]; // init with a default value
      }
    );

    const computeColorOpacity = (c3DTileFeature) => {
      const temporalExtension =
        c3DTileFeature.getInfo().extensions['3DTILES_temporal'];

      if (
        temporalExtension.startDate <= this._styleDate &&
        temporalExtension.endDate >= this._styleDate
      ) {
        // no transaction
        return TEMPORAL_COLOR_OPACITY.noTransaction;
      }
      // check if color opacity associated to featureDateID
      const featureDateID = temporalExtension.featureId + this._styleDate;
      if (
        tileMaps.has(c3DTileFeature.tileId) &&
        tileMaps.get(c3DTileFeature.tileId).has(featureDateID)
      ) {
        return tileMaps.get(c3DTileFeature.tileId).get(featureDateID);
      }

      return TEMPORAL_COLOR_OPACITY.invisible;
    };

    temporalC3DTilesLayer.style = new itowns.Style({
      fill: {
        color: (feature) => {
          const colorOpacity = computeColorOpacity(feature);
          return colorOpacity.color;
        },
        opacity: (feature) => {
          const colorOpacity = computeColorOpacity(feature);
          return colorOpacity.opacity;
        },
      },
    });
  }

  magnetizeDate(date) {
    if (!this.knownDatesForAllTiles.includes(date)) {
      // take the date the more closer
      let lastDiff = Infinity;
      for (let index = 0; index < this.knownDatesForAllTiles.length; index++) {
        const knownDate = this.knownDatesForAllTiles[index];
        const diff = Math.abs(date - knownDate);
        if (diff < lastDiff) {
          lastDiff = diff;
          continue;
        } else {
          date = this.knownDatesForAllTiles[index - 1];
          break;
        }
      }
    }

    return date;
  }

  /**
   * Update temporal 3DTiles layer style with a date
   *
   * @param {number} date - year to update style with
   */
  set styleDate(date) {
    this._styleDate = this.magnetizeDate(date);
    this.temporalC3DTilesLayer.updateStyle();
  }
}

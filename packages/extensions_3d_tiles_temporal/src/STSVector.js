import { arrayPushOnce } from '@ud-viz/utils_shared';
import { STShape } from './STShape';

const TEMPORAL_COLOR_OPACITY = {
  noTransaction: {
    color: 'white',
    opacity: 1,
    priority: 0.5,
  },
  invisible: {
    color: 'blue',
    opacity: 0,
    priority: 0,
  },
  debug: {
    color: 'brown',
    opacity: 0.2,
    priority: 1,
  },
  creation: {
    color: 'green',
    opacity: 0.6,
    priority: 1,
  },
  demolition: {
    color: 'red',
    opacity: 0.6,
    priority: 1,
  },
  modification: {
    color: 'yellow',
    opacity: 0.6,
    priority: 1,
  },
};

export class STSVector extends STShape {
  constructor(stLayer, options = {}) {
    super(stLayer);

    /** @type {Map<string,object>} */
    this.featureDateID2ColorOpacity = new Map();

    /** @type {Array<number>} */
    this.possibleDates = [];
  }

  display() {
    super.display();
    this.stLayer.versions.forEach((version) => {
      version.c3DTLayer.tileset.extensions[
        '3DTILES_temporal'
      ].transactions.forEach((transaction) => {
        const transactionDuration = transaction.endDate - transaction.startDate;

        const firstHalfDate = transaction.startDate + transactionDuration / 3;
        const secondHalfDate = transaction.endDate - transactionDuration / 3;
        arrayPushOnce(this.possibleDates, transaction.startDate);
        arrayPushOnce(this.possibleDates, transaction.endDate);

        arrayPushOnce(this.possibleDates, firstHalfDate);
        arrayPushOnce(this.possibleDates, secondHalfDate);

        transaction.source.forEach((fId) => {
          if (transaction.type == 'modification') {
            this.featureDateID2ColorOpacity.set(
              fId + firstHalfDate,
              TEMPORAL_COLOR_OPACITY.modification
            );
            this.featureDateID2ColorOpacity.set(
              fId + secondHalfDate,
              TEMPORAL_COLOR_OPACITY.invisible
            );
          } else {
            // all other transaction
            this.featureDateID2ColorOpacity.set(
              fId + firstHalfDate,
              TEMPORAL_COLOR_OPACITY.noTransaction
            );
            this.featureDateID2ColorOpacity.set(
              fId + secondHalfDate,
              TEMPORAL_COLOR_OPACITY.noTransaction
            );
          }
        });
        transaction.destination.forEach((fId) => {
          if (transaction.type == 'modification') {
            this.featureDateID2ColorOpacity.set(
              fId + firstHalfDate,
              TEMPORAL_COLOR_OPACITY.invisible
            );
            this.featureDateID2ColorOpacity.set(
              fId + secondHalfDate,
              TEMPORAL_COLOR_OPACITY.modification
            );
          } else {
            // all other transaction
            this.featureDateID2ColorOpacity.set(
              fId + firstHalfDate,
              TEMPORAL_COLOR_OPACITY.noTransaction
            );
            this.featureDateID2ColorOpacity.set(
              fId + secondHalfDate,
              TEMPORAL_COLOR_OPACITY.noTransaction
            );
          }
        });
      });
    });
  }

  update() {}

  dispose() {
    super.dispose();
  }
}

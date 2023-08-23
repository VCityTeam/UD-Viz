import { $3DTemporalBatchTable } from './Model/3DTemporalBatchTable';
import { $3DTemporalBoundingVolume } from './Model/3DTemporalBoundingVolume';
import { $3DTemporalTileset } from './Model/3DTemporalTileset';
import * as itownsWidget from 'itowns/widgets';
import * as itowns from 'itowns';
import { Data } from '@ud-viz/shared';

/**
 *
 * @param {object} extensionsConfig - config
 * @returns {itowns.C3DTExtensions} - extensions
 * @todo document how works extension what is define in config in model class where data is stored
 * @todo what is the purpose of these json schema if they are not parse/read
 */
function create3DTilesTemporalExtension(extensionsConfig) {
  const extensions = new itowns.C3DTExtensions();
  for (let i = 0; i < extensionsConfig.length; i++) {
    if (extensionsConfig[i] === '3DTILES_temporal') {
      extensions.registerExtension('3DTILES_temporal', {
        [itowns.C3DTilesTypes.batchtable]: $3DTemporalBatchTable,
        [itowns.C3DTilesTypes.boundingVolume]: $3DTemporalBoundingVolume,
        [itowns.C3DTilesTypes.tileset]: $3DTemporalTileset,
      });
    } else if (extensionsConfig[i] === '3DTILES_batch_table_hierarchy') {
      extensions.registerExtension('3DTILES_batch_table_hierarchy', {
        [itowns.C3DTilesTypes.batchtable]:
          itowns.C3DTBatchTableHierarchyExtension,
      });
    } else {
      console.warn(
        'The 3D Tiles extension ' +
          extensionsConfig[i] +
          ' specified in 3D_tiles_layers is not supported ' +
          'by @ud-viz/browser yet. Only 3DTILES_temporal and ' +
          '3DTILES_batch_table_hierarchy are supported.'
      );
    }
  }

  return extensions;
}

/**
 *
 * @param {object} config - cofig
 * @param {itowns.View} itownsView - itowns view
 * @todo document config needed difference with classic 3DTiles ?
 */
export function add3DTilesTemporalFromConfig(config, itownsView) {
  // Positional arguments verification
  if (!config) {
    console.warn('no 3DTilesLayers config');
    return;
  }

  for (const layer of config) {
    const extensions = create3DTilesTemporalExtension(layer['extensions']);
    itowns.View.prototype.addLayer.call(
      itownsView,
      new itowns.C3DTilesLayer(
        layer['id'],
        {
          name: layer['id'],
          source: new itowns.C3DTilesSource({
            url: layer['url'],
          }),
          registeredExtensions: extensions,
        },
        itownsView
      )
    );
  }
}

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

export class Temporal3DTilesLayerWrapper {
  constructor(temporalC3DTilesLayer) {
    const computedTileIds = [];

    const tileMaps = new Map();

    const knownDatesForAllTiles = [];

    // compute tileMaps base on the batchTable found in tileContent
    temporalC3DTilesLayer.addEventListener(
      itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
      ({ tileContent }) => {
        // avoid to recompute map for a tile already loaded
        if (!Data.arrayPushOnce(computedTileIds, tileContent.tileId)) return;

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

          Data.arrayPushOnce(possibleDates, firstHalfDate);
          Data.arrayPushOnce(possibleDates, secondHalfDate);
          Data.arrayPushOnce(possibleDates, transaction.startDate);
          Data.arrayPushOnce(possibleDates, transaction.endDate);

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
          Data.arrayPushOnce(knownDatesForAllTiles, date)
        );

        if (this.styleDate == null) this.styleDate = knownDatesForAllTiles[0]; // init with a default value
        // TODO: because onTileContentLoaded of C3DTilesLayer is doing initFeature/updateStyle/dispatchEvent so this is called after updateStyle
        this.temporalC3DTilesLayer.updateStyle([tileContent.tileId]);
      }
    );

    this.styleDate = null; // default value
    const computeColorOpacity = (c3DTileFeature) => {
      console.log('compute style ', this.styleDate);
      const temporalExtension =
        c3DTileFeature.getInfo().extensions['3DTILES_temporal'];

      if (
        temporalExtension.startDate <= this.styleDate &&
        temporalExtension.endDate >= this.styleDate
      ) {
        // no transaction
        return TEMPORAL_COLOR_OPACITY.noTransaction;
      }
      // check if color opacity associated to featureDateID
      const featureDateID = temporalExtension.featureId + this.styleDate;
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

    /** @type {Array<number>} - all date possible to update style with (ascending order) */
    this.knownDatesForAllTiles = knownDatesForAllTiles.sort((a, b) => a - b);

    /** @type {itowns.C3DTilesLayer} - the layer wrapped */
    this.temporalC3DTilesLayer = temporalC3DTilesLayer;
  }

  /**
   * Update temporal 3DTiles layer style with a date
   *
   * @param {number} date - year to update style with
   */
  update(date) {
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

    this.styleDate = date;
    this.temporalC3DTilesLayer.updateStyle();
  }
}

const DEFAULT_OPTIONS = {
  position: 'bottom-left',
  width: '400px',
};

export class DateSelector extends itownsWidget.Widget {
  constructor(itownsView, options) {
    super(itownsView, options, DEFAULT_OPTIONS);

    // create select of the C3DTilesLayers
    const selectC3DTilesLayer = document.createElement('select');
    this.domElement.appendChild(selectC3DTilesLayer);

    /** @type {Map<HTMLElement,HTMLElement>} */
    const selectOptionLayerContent = new Map();

    const updateSelectedLayer = () => {
      for (const [sO, lC] of selectOptionLayerContent) {
        lC.hidden = sO !== selectC3DTilesLayer.selectedOptions[0];
      }
    };
    selectC3DTilesLayer.onchange = updateSelectedLayer;

    itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer === true)
      .forEach((c3DTilesLayer) => {
        const selectC3DTilesLayerOption = document.createElement('option');
        selectC3DTilesLayerOption.innerText = c3DTilesLayer.name;
        selectC3DTilesLayer.add(selectC3DTilesLayerOption);

        const layerContent = document.createElement('div');
        this.domElement.appendChild(layerContent);

        // link select option to layer content
        selectOptionLayerContent.set(selectC3DTilesLayerOption, layerContent);

        const temporalWrapper = new Temporal3DTilesLayerWrapper(c3DTilesLayer);

        c3DTilesLayer.addEventListener(
          itowns.C3DTILES_LAYER_EVENTS.ON_TILE_CONTENT_LOADED,
          () => {
            // reset
            while (layerContent.firstChild) {
              layerContent.firstChild.remove();
            }
            // create ui
            const selectDates = document.createElement('select');
            layerContent.appendChild(selectDates);
            temporalWrapper.knownDatesForAllTiles.forEach((year) => {
              const optionDate = document.createElement('option');
              optionDate.value = year;
              optionDate.innerText = year;
              selectDates.add(optionDate);
            });

            temporalWrapper.update(selectDates.selectedOptions[0].value);
            selectDates.onchange = () => {
              temporalWrapper.update(selectDates.selectedOptions[0].value);
              itownsView.notifyChange();
            };
          }
        );
      });

    updateSelectedLayer();
  }
}

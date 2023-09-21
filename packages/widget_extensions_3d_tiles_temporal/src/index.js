import * as itownsWidget from 'itowns/widgets';
import * as itowns from 'itowns';
import { Temporal3DTilesLayerWrapper } from '@ud-viz/extensions_3d_tiles_temporal';

const DEFAULT_OPTIONS = {
  position: 'bottom-left',
  width: '400px',
};

/** 
 * The `DateSelector` class allows users to select a C3DTilesLayer and
choose a date from a dropdown menu. 
 * 
 */
export class DateSelector extends itownsWidget.Widget {
  /**
   * @param {itowns.View} itownsView - an object that represents the view of the iTowns canvas.
   * @param {object} options - an object that contains additional configuration options
   * for the constructor. It is used to customize the behavior of the `constructor` function.
   */
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

            temporalWrapper.styleDate = selectDates.selectedOptions[0].value;
            selectDates.onchange = () => {
              temporalWrapper.styleDate = selectDates.selectedOptions[0].value;
              itownsView.notifyChange();
            };
          }
        );
      });

    updateSelectedLayer();
  }
}

const THREE = require('three');
import { CityObjectStyle } from '../../../Itowns/3DTiles/Model/CityObjectStyle';
import { CityObjectID } from '../../../Itowns/3DTiles/Model/CityObject';
import { TilesManager } from '../../../Itowns/3DTiles/TilesManager';
import { LayerManager } from '../../../Itowns/Itowns';
import { findChildByID } from '../../../HTMLUtil';

/** @class */
export class Debug3DTilesView {
  /**
   * Creates the debug window.
   *
   * @param {LayerManager} layerManager The layer manager.
   */
  constructor(layerManager) {
    /**
     * The layer manager.
     *
     * @type {LayerManager}
     */
    this.layerManager = layerManager;
    // Selection
    this.layerManager.registerStyle(
      'debug_selected',
      new CityObjectStyle({
        materialProps: { color: 0x00ff00 },
      })
    );
    this.selectedCityObject = null;
    this.selectedTilesManager = null;

    this.clickListener = this.onMouseClick.bind(this);
    this.moveListener = this.onMouseMove.bind(this);

    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    // CALLBACKS
    this.logTBIButtonElement.onclick = () => {
      this.logLayerManager();
    };
    // Sets the number of loaded tiles and add an event for dynamic change of this value.
    this.updateTBIInfoParagraphElement();
    for (let i = 0; i < this.layerManager.tilesManagers.length; i++) {
      this.layerManager.tilesManagers[i].addEventListener(
        TilesManager.EVENT_TILE_LOADED,
        (tile) => this.updateTBIInfoParagraphElement(tile)
      );
    }
    this.groupColorOpacityInputElement.oninput = () => {
      this.groupColorOpacitySpanElement.innerText =
        this.groupColorOpacityInputElement.value;
    };
    this.groupColorFormElement.onsubmit = () => {
      this.submitStyleForm();
      return false;
    };
  }

  /**
   * remove root html from dom + unselect city object
   */
  dispose() {
    this.rootHtml.remove();
    if (this.selectedCityObject !== null) {
      this.selectedTilesManager.setStyle(
        this.selectedCityObject.cityObjectId,
        this.selectedStyle
      );
      this.selectedTilesManager.applyStyles();
      this.selectedCityObject = null;
      this.selectedTilesManager = null;
      this.selectedStyle = null;
    }
  }

  /**
   *
   * @param {HTMLElement} div - html element to add event listener
   */
  addListenerTo(div) {
    div.addEventListener('mousedown', this.clickListener);
    div.addEventListener('mousemove', this.moveListener);
  }

  /**
   *
   * @param {HTMLElement} div - html to remove event listener from
   */
  removeListenerFrom(div) {
    div.removeEventListener('mousedown', this.clickListener);
    div.removeEventListener('mousemove', this.moveListener);
  }

  /**
   *
   * @returns {HTMLElement} - root html
   */
  html() {
    return this.rootHtml;
  }

  get innerContentHtml() {
    return /* html*/ `
      <button id="${this.logTBIButtonId}">Log LayerManager in console</button>
      <p id="${this.TBIInfoParagraphId}">0 / ? tiles loaded.</p>
      <p id="${this.visibleTilesParagraphId}">0 tiles visible.</p>
      <h3>Selected building</h3>
      <div id="${this.clickDivId}">
        No building.
      </div>
      <h3>Style</h3>
      <div>
        <form id="${this.groupColorFormId}">
          <label for="${this.groupColorTileInputId}">Tile ID</label><br>
          <input id="${this.groupColorTileInputId}" type="text"><br>
          <label for="${this.groupColorBatchInputId}">Batch IDs
            (separated by comas)</label><br>
          <input id="${this.groupColorBatchInputId}" type="text"><br>
          <label for="${this.groupColorColorInputId}">Color</label><br>
          <input id="${this.groupColorColorInputId}" type="color"><br>
          <label for="${this.groupColorOpacityInputId}">Opacity :
            <span id="${this.groupColorOpacitySpanId}">1</span></label><br>
          <input type="range" min="0" max="1" value="1" step="0.01"
            id="${this.groupColorOpacityInputId}"><br>
          <input type="submit" value="Apply style">
        </form>
      </div>
      <h3>About this tool</h3>
      <div>
        This debug window uses the 3DTilesUtils methods. Use it to find
        information about buildings and city objects.<br>
        See the <a href="../docs/3DTilesDebug.md">documentation
        of the tool</a> and the <a href="../../../Utils/Itowns/3DTiles/3DTilesUtils.md">documentation about utility
        functions for 3DTiles and buildings</a>.
      </div>
    `;
  }

  /**
   * Updates the number of loaded 3D Tiles tiles.
   */
  updateTBIInfoParagraphElement() {
    if (this.TBIInfoParagraphElement)
      this.TBIInfoParagraphElement.innerText = `${this.layerManager.getLoaded3DTilesTileCount()} / ${this.layerManager.getTotal3DTilesTileCount()} tiles loaded. (first tile is the root tile which has no geometry)`;
  }

  /**
   * Logs the TBI in the console.
   */
  logLayerManager() {
    console.log(this.layerManager);
  }

  /**
   * If the user is currently hovering a building, fetches the building ID and
   * displays it in the window.
   *
   * @param {MouseEvent} event The mouse event.
   */
  // eslint-disable-next-line no-unused-vars
  onMouseMove(event) {
    // Update the current visible tile count
    const visibleTileCount =
      this.layerManager.getVisible3DTilesTileCountFromLayers();
    this.visibleTilesParagraphElement.innerText = `${visibleTileCount} tiles visible.`;
  }

  /**
   * If the user is currently hovering a building, fetches the building info
   * and colors the building. If a building was already selected, it returns to
   * its original coloring.
   *
   * @param {MouseEvent} event The mouse event.
   */
  onMouseClick(event) {
    const cityObject = this.layerManager.pickCityObject(event);

    if (cityObject) {
      if (cityObject != this.selectedCityObject) {
        for (const [key, value] of Object.entries(cityObject.props)) {
          this.clickDivElement.innerHTML += `<br>${key} : ${value}`;
        }

        if (this.selectedCityObject) {
          this.selectedTilesManager.setStyle(
            this.selectedCityObject.cityObjectId,
            this.selectedStyle
          );
          this.selectedTilesManager.applyStyles();
        }

        this.selectedCityObject = cityObject;
        this.selectedTilesManager = this.layerManager.getTilesManagerByLayerID(
          this.selectedCityObject.tile.layer.id
        );
        this.selectedStyle =
          this.selectedTilesManager.styleManager.getStyleIdentifierAppliedTo(
            this.selectedCityObject.cityObjectId
          );
        this.selectedTilesManager.setStyle(
          this.selectedCityObject.cityObjectId,
          'debug_selected'
        );
        this.selectedTilesManager.applyStyles({
          updateFunction: this.selectedTilesManager.view.notifyChange.bind(
            this.selectedTilesManager.view
          ),
        });

        this.clickDivElement.innerHTML = /* html*/ `
           3D Tiles : ${this.selectedTilesManager.layer.name}<br>
           Vertex indexes : ${cityObject.indexStart} to ${cityObject.indexEnd}
            (${cityObject.indexCount})<br>
           Batch ID : ${cityObject.batchId}<br>
           Tile ID : ${cityObject.tile.tileId}
         `;
      }
    }
  }

  /**
   * Creates the new style.
   */
  submitStyleForm() {
    try {
      const tileId = Number.parseInt(this.groupColorTileInputElement.value);
      const batchIds = JSON.parse(
        '[' + this.groupColorBatchInputElement.value + ']'
      );
      const color = new THREE.Color(this.groupColorColorInputElement.value);
      const opacity = Number.parseFloat(
        this.groupColorOpacityInputElement.value
      );
      this.layerManager.tilesManagers[0].setStyle(
        new CityObjectID(tileId, batchIds),
        { materialProps: { color: color, opacity: opacity } }
      );
      this.layerManager.tilesManagers[0].applyStyles();
    } catch (e) {
      alert(e);
    }
  }

  // //// GETTERS

  get clickDivId() {
    return `3D_tiles_widget_view_click_info`;
  }

  get clickDivElement() {
    return findChildByID(this.rootHtml, this.clickDivId);
  }

  get logTBIButtonId() {
    return `3D_tiles_widget_view_log_button`;
  }

  get logTBIButtonElement() {
    return findChildByID(this.rootHtml, this.logTBIButtonId);
  }

  get TBIInfoParagraphId() {
    return `3D_tiles_widget_view_tbi_p`;
  }

  get TBIInfoParagraphElement() {
    return findChildByID(this.rootHtml, this.TBIInfoParagraphId);
  }

  get visibleTilesParagraphId() {
    return `3D_tiles_widget_view_visible_tiles_p`;
  }

  get visibleTilesParagraphElement() {
    return findChildByID(this.rootHtml, this.visibleTilesParagraphId);
  }

  get groupColorFormId() {
    return `3D_tiles_widget_view_form_groups`;
  }

  get groupColorFormElement() {
    return findChildByID(this.rootHtml, this.groupColorFormId);
  }

  get groupColorTileInputId() {
    return `3D_tiles_widget_view_form_groups_tileid`;
  }

  get groupColorTileInputElement() {
    return findChildByID(this.rootHtml, this.groupColorTileInputId);
  }

  get groupColorBatchInputId() {
    return `3D_tiles_widget_view_form_groups_batchid`;
  }

  get groupColorBatchInputElement() {
    return findChildByID(this.rootHtml, this.groupColorBatchInputId);
  }

  get groupColorColorInputId() {
    return `3D_tiles_widget_view_form_groups_color`;
  }

  get groupColorColorInputElement() {
    return findChildByID(this.rootHtml, this.groupColorColorInputId);
  }

  get groupColorOpacityInputId() {
    return `3D_tiles_widget_view_form_groups_opacity`;
  }

  get groupColorOpacityInputElement() {
    return findChildByID(this.rootHtml, this.groupColorOpacityInputId);
  }

  get groupColorOpacitySpanId() {
    return `3D_tiles_widget_view_form_groups_opacity_span`;
  }

  get groupColorOpacitySpanElement() {
    return findChildByID(this.rootHtml, this.groupColorOpacitySpanId);
  }
}

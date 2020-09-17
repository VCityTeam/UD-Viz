import { Window } from "../../../Utils/GUI/js/Window";
import { getTilesInfo, getFirstTileIntersection, getBatchTableFromTile, getBatchIdFromIntersection, getVisibleTileCount, removeTileVerticesColor, getTileInTileset, getTileInLayer, updateITownsView, getObject3DFromTile, createTileGroupsFromBatchIDs } from '../../../Utils/3DTiles/3DTilesUtils';
import { colorBuilding } from '../../../Utils/3DTiles/3DTilesBuildingUtils';
import { TilesManager } from "../../../Utils/3DTiles/TilesManager";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";
import { CityObjectID } from "../../../Utils/3DTiles/Model/CityObject";

export class Debug3DTilesWindow extends Window {
  /**
   * Creates the debug window.
   * 
   * @param {layer} layerManager The tiles manager.
   */
  constructor(layerManager) {
    super('3d_tiles_debug', '3DTiles Debug', false);

    /**
     * The tiles manager.
     * 
     * @type {layerManager}
     */
    this.layerManager = layerManager;

    // Selection
    this.layerManager.registerStyle('selected', new CityObjectStyle({
      materialProps: { color: 0x00ff00 }
    }));
    this.selectedCityObject = undefined;
    this.selectedTilesManager = undefined;

    let clickListener = (event) => {
      this.onMouseClick(event);
    };
    let moveListener = (event) => {
      this.onMouseMove(event);
    };
    this.addEventListener(Window.EVENT_ENABLED, () => {
      window.addEventListener('mousedown', clickListener);
      window.addEventListener('mousemove', moveListener);
    });
    this.addEventListener(Window.EVENT_DISABLED, () => {
      window.removeEventListener('mousedown', clickListener);
      window.removeEventListener('mousemove', moveListener);

      if (this.selectedCityObject !== undefined) {
        this.selectedCityObject = undefined;
      }
      this.layerManager.removeAll3DTilesStyles();
      this.layerManager.applyAll3DTilesStyles();
    });
  }

  get innerContentHtml() {
    return /*html*/`
      <button id="${this.loadTBIButtonId}">Update Tiles Manager</button>
      <button id="${this.logTBIButtonId}">Log Tiles Manager</button>
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
        of the tool</a> and the <a href="../../../Utils/3DTiles/3DTilesUtils.md">documentation about utility
        functions for 3DTiles and buildings</a>.
      </div>
    `;
  }

  windowCreated() {
    this.window.style.width = '300px';
    this.loadTBIButtonElement.onclick = () => {
      this.updateTilesManager();
    };
    this.logTBIButtonElement.onclick = () => {
      this.logTilesManager();
    };
    this.groupColorOpacityInputElement.oninput = () => {
      this.groupColorOpacitySpanElement.innerText =
        this.groupColorOpacityInputElement.value;
    };
    this.groupColorFormElement.onsubmit = () => {
      this.submitStyleForm();
      return false;
    };
    this.updateTilesManager();
  }

  /**
   * Updates the TBI.
   */
  updateTilesManager() {
    this.layerManager.update3DTiles();
    this.TBIInfoParagraphElement.innerText = `${this.layerManager.getLoaded3DTilesTileCount()} / ${this.layerManager.getTotal3DTilesTileCount()} tiles loaded.`;
  }

  /**
   * Logs the TBI in the console.
   */
  logTilesManager() {
    console.log(this.layerManager.tilesManagers);
  }

  /**
   * If the user is currently hovering a building, fetches the building ID and
   * displays it in the window.
   * 
   * @param {MouseEvent} event The mouse event.
   */
  onMouseMove(event) {
    // Update the current visible tile count
    let visibleTileCount = this.layerManager.getVisible3DTilesTileCountFromLayers();
    this.visibleTilesParagraphElement.innerText = `${visibleTileCount} tiles visible.`
  }

  /**
   * If the user is currently hovering a building, fetches the building info
   * and colors the building. If a building was already selected, it returns to
   * its original coloring.
   * 
   * @param {MouseEvent} event The mouse event.
   */
  onMouseClick(event) {
    let cityObject = this.layerManager.pickCityObject(event);
    if (cityObject !== undefined) {

      for (let [key, value] of Object.entries(cityObject.props)) {
        this.clickDivElement.innerHTML += `<br>${key} : ${value}`;
      }

      if (!!this.selectedCityObject) {
        this.selectedTilesManager.removeStyle(this.selectedCityObject.cityObjectId);
        this.selectedTilesManager.applyStyles();
      }

      this.selectedCityObject = cityObject;
      this.selectedTilesManager = this.layerManager.getTilesManagerByLayerID(this.selectedCityObject.tile.layer.id);
      this.selectedTilesManager.setStyle(this.selectedCityObject.cityObjectId, 'selected');
      this.selectedTilesManager.applyStyles({
        updateFunction:
          this.selectedTilesManager.view.notifyChange.bind(this.selectedTilesManager.view)
      });
      this.clickDivElement.innerHTML = /*html*/`
           3D Tiles : ${this.selectedTilesManager.layer.name}<br>
           Vertex indexes : ${cityObject.indexStart} to ${cityObject.indexEnd}
            (${cityObject.indexCount})<br>
           Batch ID : ${cityObject.batchId}<br>
           Tile ID : ${cityObject.tile.tileId}
         `;
    }
  }

  /**
   * Creates the new style.
   */
  submitStyleForm() {
    try {
      let tileId = Number.parseInt(this.groupColorTileInputElement.value);
      let batchIds = JSON.parse('[' + this.groupColorBatchInputElement.value + ']');
      let cityObjectIds = [];
      for (let batchId of batchIds) {
        cityObjectIds.push(new CityObjectID(tileId, batchId));
      }
      let color = new THREE.Color(this.groupColorColorInputElement.value);
      let opacity = Number.parseFloat(this.groupColorOpacityInputElement.value);
      this.layerManager.tilesManagers[0].setStyle(cityObjectIds,
        { materialProps: { color, opacity } });
      this.layerManager.tilesManagers[0].applyStyles();
    } catch (e) {
      alert(e);
    }
  }

  ////// GETTERS

  get clickDivId() {
    return `${this.windowId}_click_info`;
  }

  get clickDivElement() {
    return document.getElementById(this.clickDivId);
  }

  get loadTBIButtonId() {
    return `${this.windowId}_load_button`;
  }

  get loadTBIButtonElement() {
    return document.getElementById(this.loadTBIButtonId);
  }

  get logTBIButtonId() {
    return `${this.windowId}_log_button`;
  }

  get logTBIButtonElement() {
    return document.getElementById(this.logTBIButtonId);
  }

  get TBIInfoParagraphId() {
    return `${this.windowId}_tbi_p`;
  }

  get TBIInfoParagraphElement() {
    return document.getElementById(this.TBIInfoParagraphId);
  }

  get visibleTilesParagraphId() {
    return `${this.windowId}_visible_tiles_p`;
  }

  get visibleTilesParagraphElement() {
    return document.getElementById(this.visibleTilesParagraphId);
  }

  get groupColorFormId() {
    return `${this.windowId}_form_groups`;
  }

  get groupColorFormElement() {
    return document.getElementById(this.groupColorFormId);
  }

  get groupColorTileInputId() {
    return `${this.windowId}_form_groups_tileid`;
  }

  get groupColorTileInputElement() {
    return document.getElementById(this.groupColorTileInputId);
  }

  get groupColorBatchInputId() {
    return `${this.windowId}_form_groups_batchid`;
  }

  get groupColorBatchInputElement() {
    return document.getElementById(this.groupColorBatchInputId);
  }

  get groupColorColorInputId() {
    return `${this.windowId}_form_groups_color`;
  }

  get groupColorColorInputElement() {
    return document.getElementById(this.groupColorColorInputId);
  }

  get groupColorOpacityInputId() {
    return `${this.windowId}_form_groups_opacity`;
  }

  get groupColorOpacityInputElement() {
    return document.getElementById(this.groupColorOpacityInputId);
  }

  get groupColorOpacitySpanId() {
    return `${this.windowId}_form_groups_opacity_span`;
  }

  get groupColorOpacitySpanElement() {
    return document.getElementById(this.groupColorOpacitySpanId);
  }
}
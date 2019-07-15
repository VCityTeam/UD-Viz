import { Window } from "../../../Utils/GUI/js/Window";
import { getTilesInfo, getFirstTileIntersection, getBatchTableFromTile, getBatchIdFromIntersection, getVisibleTileCount, removeTileVerticesColor, getTileInTileset, getTileInLayer, updateITownsView, getObject3DFromTile, createTileGroupsFromBatchIDs } from '../../../Utils/3DTiles/3DTilesUtils';
import { colorBuilding } from '../../../Utils/3DTiles/3DTilesBuildingUtils';
import { TilesManager } from "../../../Utils/3DTiles/TilesManager";
import { CityObjectStyle } from "../../../Utils/3DTiles/Model/CityObjectStyle";
import { CityObjectID } from "../../../Utils/3DTiles/Model/CityObject";

export class Debug3DTilesWindow extends Window {
  constructor(itownsView, config) {
    super('3d_tiles_debug', '3DTiles Debug', false);

    this.itownsView = itownsView;
    this.layer = itownsView.getLayerById(config['3DTilesLayerID']);
    // Tiles Manager
    this.tilesManager = new TilesManager(this.itownsView, this.layer)

    // Selection
    this.tilesManager.registerStyle('selected', new CityObjectStyle({
      materialProps: { color: 0x00ff00 } }));
    this.selectedCityObject = undefined;

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
      this.tilesManager.removeAllStyles();
      this.tilesManager.applyStyles();
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
    this.tilesManager.update();
    this.TBIInfoParagraphElement.innerText = `${this.tilesManager.loadedTileCount} / ${this.tilesManager.totalTileCount} tiles loaded.`;
  }

  /**
   * Logs the TBI in the console.
   */
  logTilesManager() {
    console.log(this.tilesManager);
  }

  /**
   * If the user is currently hovering a building, fetches the building ID and
   * displays it in the window.
   * 
   * @param {MouseEvent} event The mouse event.
   */
  onMouseMove(event) {
    // Update the current visible tile count
    let visibleTileCount = getVisibleTileCount(this.layer);
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
    this.tilesManager.update();
    let cityObject = this.tilesManager.pickCityObject(event);
    if (cityObject !== undefined) {
      this.clickDivElement.innerHTML = /*html*/`
        Vertex indexes : ${cityObject.indexStart} to ${cityObject.indexEnd}
         (${cityObject.indexCount})<br>
        Batch ID : ${cityObject.batchId}<br>
        Tile ID : ${cityObject.tile.tileId}
      `;
      for (let [key, value] of Object.entries(cityObject.props)) {
        this.clickDivElement.innerHTML += `<br>${key} : ${value}`;
      }

      if (!!this.selectedCityObject) {
        this.tilesManager.removeStyle(this.selectedCityObject.cityObjectId);
      }

      this.selectedCityObject = cityObject;
      this.tilesManager.setStyle(this.selectedCityObject.cityObjectId, 'selected');
      this.tilesManager.applyStyles();
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
      this.tilesManager.setStyle(cityObjectIds, 
        {materialProps: {color, opacity}});
      this.tilesManager.applyStyles();
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
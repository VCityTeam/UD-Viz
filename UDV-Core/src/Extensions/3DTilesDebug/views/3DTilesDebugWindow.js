import { Window } from "../../../Utils/GUI/js/Window";
import { getTilesInfo, getFirstTileIntersection, getBatchTableFromTile, getBatchIdFromIntersection, getVisibleTileCount, removeTileVerticesColor, getTileInTileset, getTileInLayer, updateITownsView, getObject3DFromTile, createTileGroupsFromBatchIDs } from '../../../Utils/3DTiles/3DTilesUtils';
import { colorBuilding } from '../../../Utils/3DTiles/3DTilesBuildingUtils';
import { TilesManager } from "../../../Utils/3DTiles/TilesManager";

export class Debug3DTilesWindow extends Window {
  constructor(itownsView, config) {
    super('3d_tiles_debug', '3DTiles Debug', false);

    this.itownsView = itownsView;
    this.layer = itownsView.getLayerById(config['3DTilesLayerID']);
    // Tiles Manager
    this.tilesManager = new TilesManager(this.itownsView, this.layer)
    this.selectedColor = [1, 0, 0];
    /**
     * Building info of the selected building.
     */
    this.selectedBuildingInfo;
    /**
     * Id of the hovered building.
     */
    this.hoveredTileId;
    this.hoveredBatchId;

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
      if (!!this.selectedBuildingInfo) {
        let tile = getTileInLayer(this.layer, this.selectedBuildingInfo.tileId);
        removeTileVerticesColor(tile);
        updateITownsView(this.itownsView, this.layer);
      }
    });
  }

  get innerContentHtml() {
    return /*html*/`
      <button id="${this.loadTBIButtonId}">Update TI</button>
      <button id="${this.logTBIButtonId}">Log TI</button>
      <p id="${this.TBIInfoParagraphId}">0 / ? tiles loaded.</p>
      <p id="${this.visibleTilesParagraphId}">0 tiles visible.</p>
      <h3>Building under mouse</h3>
      <div id="${this.hoverDivId}">
        No building.
      </div>
      <h3>Selected building</h3>
      <div id="${this.clickDivId}">
        No building.
      </div>
      <h3>Color groups</h3>
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
          <input type="submit" value="Color">
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
      this.updateTI();
    };
    this.logTBIButtonElement.onclick = () => {
      this.logTI();
    };
    this.groupColorOpacityInputElement.oninput = () => {
      this.groupColorOpacitySpanElement.innerText =
        this.groupColorOpacityInputElement.value;
    };
    this.groupColorFormElement.onsubmit = () => {
      this.submitGroupColor();
      return false;
    };
    this.updateTI();
  }

  /**
   * Updates the TBI.
   */
  updateTI() {
    this.tilesManager.update();
    this.TBIInfoParagraphElement.innerText = `${this.tilesManager.loadedTileCount} / ${this.tilesManager.totalTileCount} tiles loaded.`;
  }

  /**
   * Logs the TBI in the console.
   */
  logTI() {
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
    this.visibleTilesParagraphElement.innerText = `${visibleTileCount} tiles visible.`/*
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      // Get the intersecting objects where our mouse pointer is
      let intersections = this.itownsView.pickObjectsAt(event, 5);
      // Get the first intersecting tile
      let firstInter = getFirstTileIntersection(intersections);
      if (!!firstInter) {
        // Find the building ID we clicked on
        let table = getBatchTableFromTile(firstInter.object);
        let batchId = getBatchIdFromIntersection(firstInter);
        let tileId = getObject3DFromTile(firstInter.object).tileId;

        this.hoveredTileId = tileId;
        this.hoveredBatchId = batchId;
        this.hoverDivElement.innerHTML = `Batch ID : ${batchId}<br>
                                          Tile ID : ${tileId}`;
      } else {
        this.hoveredTileId = null;
        this.hoveredBatchId = null;
        this.hoverDivElement.innerText = 'No building';
      }
    }*/
  }

  /**
   * If the user is currently hovering a building, fetches the building info
   * and colors the building. If a building was already selected, it returns to
   * its original coloring.
   * 
   * @param {MouseEvent} event The mouse event.
   */
  onMouseClick(event) {
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      this.updateTI();

      // The building ID was retrieved by the `onMouseMove` method
      let tileId = this.hoveredTileId;
      let batchId = this.hoveredBatchId;
      if (!!batchId) {
        // If we have a building ID, we check if the building has associated
        // info
        let buildingInfo = this.tilesInfo.tiles[tileId][batchId];
        if (!!buildingInfo) {
          // Log the building info in the console to debug
          console.log(buildingInfo);
          // Fill a div with the info
          this.clickDivElement.innerHTML = /*html*/`
            ${buildingInfo.arrayIndexes.length} array indexes<br>
            Batch ID : ${buildingInfo.batchId}<br>
            Tile ID : ${buildingInfo.tileId}
          `;
          for (let [key, value] of Object.entries(buildingInfo.props)) {
            this.clickDivElement.innerHTML += `<br>${key} : ${value}`;
          }
          // If a building was already selected, un-color its tile
          if (!!this.selectedBuildingInfo) {
            let tile = getTileInTileset(this.tilesInfo.tileset,
                                        this.selectedBuildingInfo.tileId);
            try {
              removeTileVerticesColor(tile);
            } catch (_) {
              // Tile not loaded in the view, cannot change its color
              // For the moment, no problem because when a tile unloads the
              // color data of the vertices is lost (same effect as removing the
              // color).
            }
          }
          // We can color our building and notify the view
          colorBuilding(this.layer, buildingInfo, this.selectedColor);
          updateITownsView(this.itownsView, this.layer);
          this.selectedBuildingInfo = buildingInfo;
        } else {
          this.clickDivElement.innerText = 'No building info';
        }
      }
    }
  }

  submitGroupColor() {
    try {
      let tileId = Number.parseInt(this.groupColorTileInputElement.value);
      let batchIds = JSON.parse('[' + this.groupColorBatchInputElement.value + ']');
      let color = new THREE.Color(this.groupColorColorInputElement.value);
      let opacity = Number.parseFloat(this.groupColorOpacityInputElement.value);
      createTileGroupsFromBatchIDs(getTileInLayer(this.layer, tileId), [{
          material: {color, opacity},
          batchIDs: batchIds
      }]);
      updateITownsView(this.itownsView, this.layer);
    } catch (e) {
      alert(e);
    }
  }

  ////// GETTERS

  get hoverDivId() {
    return `${this.windowId}_hover_info`;
  }

  get hoverDivElement() {
    return document.getElementById(this.hoverDivId);
  }

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
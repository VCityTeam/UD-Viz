import { Window } from "../../../Utils/GUI/js/Window";
import { getFirstTileIntersection, getVisibleTileCount, removeTileVerticesColor, getTileInTileset, getTileInLayer } from '../../../Utils/3DTiles/3DTilesUtils';
import { colorBuilding, getBuildingIdFromIntersection, getTilesBuildingInfo} from '../../../Utils/3DTiles/3DTilesBuildingUtils';

export class Debug3DTilesWindow extends Window {
  constructor(itownsView) {
    super('3d_tiles_debug', '3DTiles Debug', false);

    this.itownsView = itownsView;
    this.layer = itownsView.getLayerById('3d-tiles-layer');
    this.tbi = null;
    this.selectedColor = [1, 0, 0];
    /**
     * Building info of the selected building.
     */
    this.selectedBuildingInfo;
    /**
     * Building id of the hovered building.
     */
    this.hoveredBuildingId;

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
        this.itownsView.notifyChange();
      }
    });
  }

  get innerContentHtml() {
    return /*html*/`
      <button id="${this.loadTBIButtonId}">Update TBI</button>
      <button id="${this.logTBIButtonId}">Log TBI</button>
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
      this.updateTBI();
    };
    this.logTBIButtonElement.onclick = () => {
      this.logTBI();
    };
    this.tbi = null;
    this.updateTBI();
  }

  updateTBI() {
    this.tbi = getTilesBuildingInfo(this.layer, this.tbi);
    this.TBIInfoParagraphElement.innerText = `${this.tbi.loadedTileCount} / ${this.tbi.totalTileCount} tiles loaded.`;
  }

  logTBI() {
    console.log(this.tbi);
  }

  onMouseMove(event) {
    let visibleTileCount = getVisibleTileCount(this.layer);
    this.visibleTilesParagraphElement.innerText = `${visibleTileCount} tiles visible.`
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      let intersections = this.itownsView.pickObjectsAt(event, 5);
      let firstInter = getFirstTileIntersection(intersections);
      if (!!firstInter) {
        let buildingId = getBuildingIdFromIntersection(firstInter);
        this.hoveredBuildingId = buildingId;
        this.hoverDivElement.innerText = `Building ID : ${buildingId}`;
      } else {
        this.hoveredBuildingId = null;
        this.hoverDivElement.innerText = 'No building';
      }
    }
  }

  /**
   * 
   * @param {MouseEvent} event 
   */
  onMouseClick(event) {
    if (event.target.nodeName.toUpperCase() === 'CANVAS') {
      if (!this.tbi) {
        return;
      }

      let buildingId = this.hoveredBuildingId;
      if (!!buildingId) {
        let buildingInfo = this.tbi.buildings[buildingId];
        if (!!buildingInfo) {
          console.log(buildingInfo);
          this.clickDivElement.innerHTML = /*html*/`
            Building ID : ${buildingId}<br>
            ${buildingInfo.arrayIndexes.length} array indexes<br>
            Tile ID : ${buildingInfo.tileId}
          `;
          if (!!this.selectedBuildingInfo) {
            let tile = getTileInTileset(this.tbi.tileset,
                                        this.selectedBuildingInfo.tileId);
            removeTileVerticesColor(tile);
          }
          colorBuilding(this.layer, buildingInfo, this.selectedColor);
          this.itownsView.notifyChange();
          this.selectedBuildingInfo = buildingInfo;
        } else {
          this.clickDivElement.innerText = 'No building info (maybe update TBI ?)';
        }
      }
    }
  }

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
}
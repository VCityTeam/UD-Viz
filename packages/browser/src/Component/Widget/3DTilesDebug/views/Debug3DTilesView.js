const THREE = require('three');
import { findChildByID } from '../../../HTMLUtil';
import * as itowns from 'itowns';
import { findTileID } from '../../../ItownsUtil';

/** @class */
export class Debug3DTilesView {
  /**
   * Creates the debug window.
   *
   * @param {itowns.PlanarView} itownsView - itowns view.
   */
  constructor(itownsView) {
    /**
     *  itowns view
     *
     * @type {itowns.PlanarView}
     */
    this.itownsView = itownsView;

    /** @type {itowns.Style} */
    this.selectionStyle = new itowns.Style({
      fill: {
        color: 'green',
      },
      stroke: { color: 'red', opacity: 0.3 },
    });

    /** @type {itowns.BatchElement} */
    this.selectedBatchElement = null;

    // listeners
    this.clickListener = this.onMouseClick.bind(this);
    this.moveListener = this.onMouseMove.bind(this);
    this.htmlElementListened = null;

    /** @type {HTMLElement} */
    this.rootHtml = document.createElement('div');
    this.rootHtml.innerHTML = this.innerContentHtml;

    // CALLBACKS
    this.logTBIButtonElement.onclick = () => {
      this.logLayerManager();
    };
    // Sets the number of loaded tiles and add an event for dynamic change of this value.
    this.updateTBIInfoParagraphElement();
    const c3DTilesLayers = this.itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer == true);

    this.totalTilesCount = -1;
    c3DTilesLayers.forEach((layer) => {
      layer.addEventListener(
        itowns.C3DTilesLayer.EVENT_TILE_CONTENT_LOADED,
        () => {
          // total tiles count (very not optimized but readbale and this is a debug tool)
          this.totalTilesCount = 0;
          c3DTilesLayers.forEach((l) => {
            if (!l.tileset) return; // tileset not loaded i guess
            this.totalTilesCount += l.tileset.tiles.length;
          });

          this.updateTBIInfoParagraphElement();
        }
      );
    });

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
    if (this.selectedBatchElement) {
      this.setSelectedBatchElement(null);
    }

    this.removeListener();
  }

  /**
   *
   * @param {HTMLElement} div - html element to add event listener
   */
  addListenerTo(div) {
    div.addEventListener('mousedown', this.clickListener);
    div.addEventListener('mousemove', this.moveListener);

    this.htmlElementListened = div;
  }

  /**
   *
   * remove event listener from html listened
   */
  removeListener() {
    if (this.htmlElementListened) {
      this.htmlElementListened.removeEventListener(
        'mousedown',
        this.clickListener
      );
      this.htmlElementListened.removeEventListener(
        'mousemove',
        this.moveListenertotalTileCount
      );
    }
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
    const countTileWithBatchTable = () => {
      let result = 0;
      const c3DTilesLayers = this.itownsView
        .getLayers()
        .filter((el) => el.isC3DTilesLayer == true);
      c3DTilesLayers.forEach((layer) => {
        if (!layer.root) return;
        layer.root.traverse((childLayer) => {
          if (childLayer.batchTable) result++;
        });
      });

      return result;
    };

    if (this.TBIInfoParagraphElement)
      this.TBIInfoParagraphElement.innerText = `${countTileWithBatchTable()} - ${
        this.totalTilesCount
      } tiles loaded. (first tile is the root tile which has no geometry)`;
  }

  /**
   * Logs the C3DTileslayer in the console.
   */
  logC3DTilesLayer() {
    console.log(
      this.itownsView.getLayers().filter((el) => el.isC3DTilesLayer === true)
    );
  }

  /**
   * If the user is currently hovering a building, fetches the building ID and
   * displays it in the window.
   *
   * @param {MouseEvent} event The mouse event.
   */
  // eslint-disable-next-line no-unused-vars
  onMouseMove(event) {
    const c3DTilesLayers = this.itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer == true);
    let tileWithBatchTableCount = 0;
    c3DTilesLayers.forEach((layer) => {
      if (!layer.root) return;
      layer.root.traverse((child) => {
        if (child.batchTable) tileWithBatchTableCount++;
      });
    });
    this.visibleTilesParagraphElement.innerText = `${tileWithBatchTableCount} node with batchTable.`;
  }

  setSelectedBatchElement(value) {
    if (this.selectedBatchElement) {
      if (!this.selectedBatchElement == value) {
        this.selectedBatchElement.setUserData('selected', false);
        this.itownsView.notifyChange();
      } else {
        return; // nothing to do
      }
    }

    this.selectedBatchElement = value;

    if (this.selectedBatchElement) {
      this.selectedBatchElement.setUserData('selected', true);
      this.itownsView.notifyChange();
    }
  }

  /**
   * If the user is currently hovering a building, fetches the building info
   * and colors the building. If a building was already selected, it returns to
   * its original coloring.
   *
   * @param {MouseEvent} event The mouse event.
   */
  onMouseClick(event) {
    // pick result from C3DTilesLayers
    const intersects = this.itownsView.pickObjectsAt(
      event,
      5,
      this.itownsView.getLayers().filter((el) => el.isC3DTilesLayer == true)
    );

    if (intersects.length) {
      const clickedLayer = intersects[0].layer;
      const batchElement =
        clickedLayer.getBatchElementFromIntersectsArray(intersects); // pass all array since style object can be clicked see how to deal with that

      if (batchElement) {
        // if a style object is clicked no batch info are associated to it todo create an object in itowns reserved as style object3D ?

        // display batchTable
        for (const [key, value] of Object.entries(batchInfo.info.batchTable)) {
          this.clickDivElement.innerHTML = `<br>${key} : ${value}`;
        }
        this.clickDivElement.innerHTML += /* html*/ `
            <br>Layer Name : ${clickedLayer.name}<br>
            Batch ID : ${batchElement.batchId}<br>
            Tile ID : ${findTileID(intersects[0].object)}
          `;
        this.setSelectedBatchElement(batchElement);
      } else {
        this.setSelectedBatchElement(null);
      }
    }
  }

  /**
   * Creates the new style.
   *
   * @todo possiblity to select a C3DTilesLayer
   */
  submitStyleForm() {
    const tileId = Number.parseInt(this.groupColorTileInputElement.value);
    const batchIds = JSON.parse(
      '[' + this.groupColorBatchInputElement.value + ']'
    );
    const styleInForm = new itowns.Style({
      fill: {
        color: new THREE.Color(this.groupColorColorInputElement.value),
        opacity: Number.parseFloat(this.groupColorOpacityInputElement.value),
      },
    });

    // apply for all C3DTileLayers
    console.time();
    this.itownsView
      .getLayers()
      .filter((el) => el.isC3DTilesLayer)
      .forEach((layer) => {

        layer.batchElementsArray().forEach((be)=>{
          
        })

        batchIds.forEach((bid) => {
          layer.applyStyle(
            new itowns.C3DTilesLayerTileBatchID(layer.id, tileId, bid),
            styleInForm
          );
        });
      });
    console.log('apply styles');
    console.timeEnd();
    this.itownsView.notifyChange(this.itownsView.camera.camera3D); // itowns bug looks to not update materials
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

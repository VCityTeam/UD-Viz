import { TilesManager } from '../../../Utils/3DTiles/TilesManager.js'
import { getVisibleTiles } from '../../../Utils/3DTiles/3DTilesUtils.js';
import { CityObjectStyle } from '../../../Utils/3DTiles/Model/CityObjectStyle.js';
import { CityObjectID } from '../../../Utils/3DTiles/Model/CityObject.js';

export class TemporalProvider {
  constructor(temporalExtensionModel, tilesManager, currentTime) {
    this.temporalExtensionModel = temporalExtensionModel;

    this.tilesManager = tilesManager;

    this.currentTime = currentTime;

    // Initialize the styles affected to transactions. Will be 
    // used to update the 3D view.
    // TODO: could be passed as a config of the module and if not 
    // defined, we could initialize default styles.
    this.initTransactionsStyles();

    // Initialize the model. One part of this model is filled when the
    // temporal extension is loaded by iTowns; an other part is filled 
    // with the event declared below (when a tile is loaded).
    // See the comment at the end of the $3DTemporalExtension constructor
    // for more details
    this.tilesManager.addEventListener(
      TilesManager.EVENT_TILE_LOADED,
      this.temporalExtensionModel.updateTileExtensionModel.bind(
        this.temporalExtensionModel));

    // When a tile is loaded, we compute the state of its features (e.g.
    // should they be displayed or not and in which color, etc.)
    this.tilesManager.addEventListener(
      TilesManager.EVENT_TILE_LOADED, 
      this.applyTileState.bind(this));
  }

  initTransactionsStyles() {
    // Set styles
    this.tilesManager.registerStyle('noTransaction', new CityObjectStyle({
        materialProps: { opacity: 1.0, color: 0xffffff } })); // white

    this.tilesManager.registerStyle('creation', new CityObjectStyle({
        materialProps: { opacity: 0.6, color: 0x009900 } })); // green

    this.tilesManager.registerStyle('demolition', new CityObjectStyle({
        materialProps: { opacity: 0.6, color: 0xff0000 } })); // red

    this.tilesManager.registerStyle('modification', new CityObjectStyle({
        materialProps: { opacity: 0.6, color: 0xFFD700 } })); // yellow

    this.tilesManager.registerStyle('hide', new CityObjectStyle({
        materialProps: { opacity: 0, color: 0xffffff, alphaTest: 0.3 } })); // hidden
  }

    // tile is tilecontent here
    computeTileState(tile) {
      const featuresStates = this.computeFeaturesStates(tile, this.currentTime);
      let featureStyleName;
      for (let i = 0; i < featuresStates.length; i++) {
          featureStyleName = featuresStates[i];
          if(this.tilesManager.isStyleRegistered(featureStyleName)) {
              this.tilesManager.setStyle(new CityObjectID(tile.tileId, i), 
              featureStyleName);
          } else {
              console.warn("Style " +  featureStyleName + " is not " + 
              "registered. Defaulting to style noTransaction.")
              this.tilesManager.setStyle(new CityObjectID(tile.tileId, i), 
              'noTransaction');
          }
      }
  }

  // eslint-disable-next-line class-methods-use-this
  computeFeaturesStates(tileContent, currentTime) {
      let featuresDisplayStates = {};
      if (tileContent.batchTable && tileContent.batchTable.extensions &&
          tileContent.batchTable.extensions['3DTILES_temporal']) {
          const BT_ext = tileContent.batchTable.extensions['3DTILES_temporal'];
          // TODO: sortir cette intelligence de la batch table extension
          //  et la mettre ici. BT_ext devrait seulement avoir des
          //  fonctions pour qu'on récupère son contenu ou une partie de
          //  son contenu
          featuresDisplayStates = BT_ext.culling(currentTime);
      }
      return featuresDisplayStates;
  }

  applyTileState(tile) {
      this.computeTileState(tile);
      this.tilesManager.applyStyleToTile(tile.tileId, { updateView: false });
  }

  applyVisibleTilesStates() {
      const tiles = getVisibleTiles(this.tilesManager.layer);
      for (let i = 0; i < tiles.length; i++) {
          this.computeTileState(tiles[i]);
      }
      this.tilesManager.applyStyles();
  }

}
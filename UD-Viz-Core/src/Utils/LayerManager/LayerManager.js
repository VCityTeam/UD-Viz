import { TilesManager } from "../3DTiles/TilesManager.js";


export class LayerManager {

/**
   * Creates a new TilesManager from an iTowns view and the 3DTiles layer.
   * 
   * @param {*} view The iTowns view.
   * @param {*} layer The 3DTiles layer.
   */
  constructor(view) {
    /**
     * The iTowns view.
     */
    this.view = view;

    /**
     * The set of tile wrappers that have been loaded.
     * 
     * @type {Array<TilesManager>}
     */
    this.tilesManagers = [];

  }

  registerStyle(name, style){
    for(let i = 0; i < this.tilesManagers.length; i++){
        this.tilesManagers[i].registerStyle(name, style);
        }
  } 


  removeAll3DTilesStyles(){
    for(let i = 0; i < this.tilesManagers.length; i++){
        this.tilesManagers[i].removeAllStyles();
        }
  }

  apply3DTilesStyles(){
    for(let i = 0; i < this.tilesManagers.length; i++){
        this.tilesManagers[i].applyStyles();
        }
  }

  update3DTiles(){
    for(let i = 0; i < this.tilesManagers.length; i++){
      this.tilesManagers[i].update();

    }
  }

  getLayers(){
    return this.view.getLayers();
  }

  getColorLayers(){
    return this.view.getLayers(layer => layer.isColorLayer);
  }

  getElevationLayers(){
    return this.view.getLayers(layer => layer.isElevationLayer);
  }

  getGeometryLayers(){
    return this.view.getLayers(layer => layer.isGeometryLayer);
  }

  updateScale(layer,scale){
    layer.scale = scale;
    this.notifyChange();
  }

  updateOpacity(layer,opacity){
    layer.opacity = opacity;
    this.notifyChange();
  }

  notifyChange(){
    this.view.notifyChange();
  }
}

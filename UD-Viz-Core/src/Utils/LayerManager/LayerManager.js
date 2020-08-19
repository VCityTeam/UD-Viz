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
}

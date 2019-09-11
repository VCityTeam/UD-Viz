import { ModuleView } from '../../Utils/ModuleView/ModuleView'; //relative path if we're in a src/Category/ModuleName folder
import { GuiTools } from './GuiTools.js'

export class LayerControls extends ModuleView {
    constructor(view, itowns) {
        super() // calling super() is mandatory for subclasses
        this.view = view;
        this.itowns = itowns
    }

    // How to display the view ?
    enableView() {
        this.layersMenu = new GuiTools('menuDiv', this.view, document.getElementById('viewerDiv'), this.itowns); //calls a method that creates the DOM elements
         for (var layer of this.view.getLayers()) {

                 layer.whenReady.then(  (layer) => {
                   if (layer.visible != undefined)
                   {
                     var gui = debug.GeometryDebug.createGeometryDebugUI(this.layersMenu.gui, this.view, layer);
                  }
                 });
             }
          }

    // How to close the view ?
    disableView() {
        if (this.layersMenu !== undefined)
          {
            this.layersMenu.gui.destroy()
          }; //This methods destroys the DOM elements
    }
}

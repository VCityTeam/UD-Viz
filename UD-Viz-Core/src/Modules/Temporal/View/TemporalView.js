import { TemporalGraphWindow } from './TemporalGraphWindow.js';
import { TemporalSliderWindow } from './TemporalSliderWindow.js';
import { EnumTemporalWindow } from './EnumWindows.js'; // TODO: assert this import is useful ?
import { ModuleView } from '../../../Utils/ModuleView/ModuleView.js';

// TODO: choisir la stratégie avec les windows ici: est-ce qu'o naffiche par
// defaut les deux ? Est-ce qu'on en affiche qu'une ? Si plusieurs windows en
// même temps, faire comme dans DocumentView pour gérer toutes ces fenetres
export class TemporalView extends ModuleView {
  constructor(provider, temporalOptions) {
    super();

    this.provider = provider;

    // ******* Temporal window
    // Declare a callback to update this.currentTime when it is changed
    // by the user in the temporalWindow
    this.currentTime = temporalOptions.currentTime;

    function currentTimeUpdated(newDate) {
        this.currentTime = Number(newDate);
        this.provider.currentTime = this.currentTime; // TODO: verify that the 
        // flow is good with MVVM 
        this.provider.changeVisibleTilesStates();
    }
    const refreshCallback = currentTimeUpdated.bind(this);

    // Callback to get data asynchronously from the tileset.jsonS
    // TODO: remove this "asynchronous" part of the code and just 
    // parse the version and version transition and only use them 
    // when the graph window is chosen in the config... That should 
    // remove the this.temporalExtension from here.
    function getAsynchronousData(){
            let versions = this.temporalExtension.temporal_tileset.temporalVersions.versions;
            let versionTransitions = this.temporalExtension.temporal_tileset.versionTransitions;
            return [versions, versionTransitions]
        }

    // Select the window type:
    switch (temporalOptions.view) {
      case EnumTemporalWindow.SLIDERWINDOW :
          this.temporalWindow = new TemporalSliderWindow(refreshCallback, temporalOptions);
          break;
      // TODO: virer le piggy back de getAsynchronousData et
      // verifier qu'il sert à quelque chose...
      case EnumTemporalWindow.GRAPHWINDOW :
          temporalOptions.getAsynchronousData = getAsynchronousData.bind(this);
          this.temporalWindow = new TemporalGraphWindow(refreshCallback, temporalOptions);
          break;
      }
  }

  /////////////////
  ///// MODULE VIEW
  enableView() {
    this.temporalWindow.appendTo(this.parentElement);
  }

  disableView() {
    this.temporalWindow.dispose();
  }
}
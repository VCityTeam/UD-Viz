import { $3DTemporalExtension } from './Model/3DTemporalExtension.js';
import { TemporalProvider } from './ViewModel/TemporalProvider.js';
import { TemporalView } from './View/TemporalView.js'

/**
 * Entrypoint of the temporal module (that can be instanciated in the demos)
 */
export class TemporalModule {
    /**
     * Constructs a new temporal module.
     *
     * @param {TilesManager} tilesManager - The tiles manager associated with
     * the 3D Tiles layer with temporal extension.
     * @param {Object} temporalOptions - options for initializing the temporal
     * module.
     * @param {Number} temporalOptions.minTime - start time of the slider
     * @param {Number} temporalOptions.maxTime - end time of the slider
     * @param {Number} temporalOptions.currentTime - initTime of the slider and
     * current time of the scene
     * @param {Number} temporalOptions.timeStep - step in time when moving
     * the slider
    };
     */
    constructor(tilesManager, temporalOptions) {

        this.model = new $3DTemporalExtension();

        this.provider = new TemporalProvider(this.model, tilesManager, 
            temporalOptions.currentTime);

        this.view = new TemporalView(this.provider, temporalOptions);
    }
}
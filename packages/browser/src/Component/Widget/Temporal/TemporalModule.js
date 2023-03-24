import { $3DTemporalExtension } from '../../Itowns/TemporalModel/3DTemporalExtension';
import { TemporalProvider } from './ViewModel/TemporalProvider.js';
import { TemporalView } from './View/TemporalView.js';
import { TilesManager } from '../../Itowns/3DTiles/TilesManager.js';

/**
 * @typedef {object} TemporalOptions - options for initializing the temporal module.
 * @property {number} currentTime - Current year
 * @property {string} view - window type {@link EnumWindows}
 * @property {number} minTime - Minimum year
 * @property {number} maxTime - Maximum year
 * @property {number} timeStep - Step of the temporal slider
 * @property {Function} getAsynchronousData - DON'T USE should be removed, only use like a variable
 */

/**
 * Entrypoint of the temporal module (that can be instanciated in the demos)
 */
export class TemporalModule {
  /**
   * Constructs a new temporal module.
   *
   * @param {TilesManager} tilesManager - The tiles manager associated with
   * the 3D Tiles layer with temporal extension.
   * @param {TemporalOptions} temporalOptions - options for initializing the temporal
   * module.
    };
   */
  constructor(tilesManager, temporalOptions) {
    this.model = new $3DTemporalExtension();

    this.provider = new TemporalProvider(
      this.model,
      tilesManager,
      temporalOptions.currentTime
    );

    this.view = new TemporalView(this.provider, temporalOptions);
  }
}

import { $3DTemporalExtension } from './Model/3DTemporalExtension.js';
import { TemporalProvider } from './ViewModel/TemporalProvider.js';
import { TemporalView } from './View/TemporalView.js';
import { setup3DTilesLayer } from '../../ItownsUtil';

// extension
import { $3DTemporalBatchTable } from './Model/3DTemporalBatchTable';
import { $3DTemporalBoundingVolume } from './Model/3DTemporalBoundingVolume';
import { $3DTemporalTileset } from './Model/3DTemporalTileset';

import * as itowns from 'itowns';

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
   * @param {itowns.PlanarView} itownsView - view
   * @param {TemporalOptions} temporalOptions - options for initializing the temporal
   * module.
    };
   */
  constructor(itownsView, temporalOptions) {
    this.model = new $3DTemporalExtension();

    this.provider = new TemporalProvider(
      this.model,
      itownsView,
      temporalOptions.currentTime
    );

    this.view = new TemporalView(this.provider, temporalOptions);
  }

  static register3DTilesTemporalExtension(extensionsConfig) {
    const extensions = new itowns.C3DTExtensions();
    for (let i = 0; i < extensionsConfig.length; i++) {
      if (extensionsConfig[i] === '3DTILES_temporal') {
        extensions.registerExtension('3DTILES_temporal', {
          [itowns.C3DTilesTypes.batchtable]: $3DTemporalBatchTable,
          [itowns.C3DTilesTypes.boundingVolume]: $3DTemporalBoundingVolume,
          [itowns.C3DTilesTypes.tileset]: $3DTemporalTileset,
        });
      } else if (extensionsConfig[i] === '3DTILES_batch_table_hierarchy') {
        extensions.registerExtension('3DTILES_batch_table_hierarchy', {
          [itowns.C3DTilesTypes.batchtable]:
            itowns.C3DTBatchTableHierarchyExtension,
        });
      } else {
        console.warn(
          'The 3D Tiles extension ' +
            extensionsConfig[i] +
            ' specified in 3D_tiles_layers is not supported ' +
            'by @ud-viz/browser yet. Only 3DTILES_temporal and ' +
            '3DTILES_batch_table_hierarchy are supported.'
        );
      }
    }

    return extensions;
  }

  static add3DTilesTemporalFromConfig(config, itownsView) {
    // Positional arguments verification
    if (!config) {
      console.warn('no 3DTilesLayers config');
      return null;
    }
    const layers = {};
    for (const layer of config) {
      const extensions = this.register3DTilesTemporalExtension(
        layer['extensions']
      );
      layers[layer.id] = setup3DTilesLayer(layer, itownsView, extensions);
      itowns.View.prototype.addLayer.call(itownsView, layers[layer.id]);
    }
  }
}

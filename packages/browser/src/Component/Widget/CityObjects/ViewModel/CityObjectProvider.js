import { EventSender } from '@ud-viz/shared';
import {
  focusCameraOn,
  findTileID,
  findMeshFromTileID,
} from '../../../ItownsUtil';
import { CityObjectFilter } from './CityObjectFilter';
import * as itowns from 'itowns';
import * as THREE from 'three';

/**
 * The city object provider manages the city object by organizing them in two
 * categories : the _layer_ and the _selected city object_. The layer
 * represents a set of city objects to highlight, determined by a specific
 * filter.
 */
export class CityObjectProvider extends EventSender {
  constructor(itownsView) {
    super();

    this.itownsView = itownsView;

    /**
     * The available filters.
     *
     * @type {Object<string, CityObjectFilter>}
     */
    this.filters = {};

    /**
     * The current filter used. all filter are record in this.filters and can be found with thei label
     * @todo do that with an uid
     *
     * @type {string}
     */
    this.currentFilterLabel = null;

    /**
     * The style applied to the selected city object.
     *
     * @type {itowns.Style}
     */
    this.selectionStyle = new itowns.Style({
      fill: {
        color: 'purple',
      },
      stroke: {
        color: 'red',
        opacity: 0.5,
      },
    });

    /** @type {itowns.Style} */
    this.layerSelectionStyle = new itowns.Style({
      fill: {
        color: 'green',
      },
    });

    /** @type {itowns.C3DTilesLayerTileBatchID} */
    this.selectedID = null;

    // Event registration
    this.registerEvent(CityObjectProvider.EVENT_FILTERS_UPDATED);
    this.registerEvent(CityObjectProvider.EVENT_LAYER_CHANGED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_SELECTED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_UNSELECTED);
    this.registerEvent(CityObjectProvider.EVENT_CITY_OBJECT_CHANGED);
  }

  selectFromMouseEvent(event) {
    const intersects = this.itownsView.pickObjectsAt(
      event,
      5,
      this.itownsView.getLayers().filter((el) => el.isC3DTilesLayer == true)
    );

    if (intersects.length) {
      const clickedLayer = intersects[0].layer;
      const batchInfo = clickedLayer.getInfoFromIntersectObject(intersects); // pass all array since style object can be clicked see how to deal with that

      const tileID = findTileID(intersects[0].object);
      if (!tileID) throw new Error('no tileID in object');

      this.setSelectedID(
        new itowns.C3DTilesLayerTileBatchID(
          clickedLayer.id,
          tileID,
          batchInfo.batchID
        )
      );
    }
  }

  /**
   *
   * @param {itowns.C3DTilesLayerTileBatchID} value - new selected id
   */
  setSelectedID(value) {
    if (this.selectedID) {
      if (!this.selectedID.equals(value)) {
        // unselect old selected ID could be a view methods ??? or C3DTilesLayer method ??
        const layerOfOldSelection = this.itownsView.getLayerById(
          this.selectedID.layerID
        );
        layerOfOldSelection.applyStyle(this.selectedID); // will apply default style
        this.itownsView.notifyChange();
      } else {
        return; // nothing to do
      }
    }

    this.selectedID = value;

    if (this.selectedID) {
      this.itownsView
        .getLayerById(this.selectedID.layerID)
        .applyStyle(this.selectedID, this.selectionStyle);

      this.itownsView.notifyChange();
    }
  }

  setCurrentFilterLabel(filterLabel) {
    // update style
    const updateStyleFromFilter = (style, filter) => {
      this.itownsView
        .getLayers()
        .filter((el) => el.isC3DTilesLayer == true)
        .forEach((c3DTilesLayer) => {
          const tileObject3D = c3DTilesLayer.root.getObjectByProperty(
            'tileId',
            filter.tileId
          );

          // such a pain to find this batchtable should be more easy
          let batchTable = null;
          tileObject3D.traverse((child) => {
            batchTable = child.batchTable || batchTable;
          });

          const info = batchTable.getInfoById(filter.batchId);
          let equals = true;
          for (const key in filter.props) {
            if (info[key] !== filter.props[key]) {
              equals = false;
              break;
            }
          }
          // for now apply style just according tile id and batch id but for the futur equals should be used
          if (true) {
            c3DTilesLayer.applyStyle(
              new itowns.C3DTilesLayerTileBatchID(
                c3DTilesLayer.id,
                filter.tileId,
                filter.batchId
              ),
              style
            );
          }
        });
    };

    if (this.currentFilterLabel) {
      // unapply style
      const oldFilter = this.filters[this.currentFilterLabel];
      updateStyleFromFilter(null, oldFilter);
    }

    this.currentFilterLabel = filterLabel;

    const newFilter = this.filters[this.currentFilterLabel];

    this.sendEvent(CityObjectProvider.EVENT_LAYER_CHANGED, newFilter);
    if (newFilter) {
      updateStyleFromFilter(this.layerSelectionStyle, newFilter);
    }

    this.itownsView.notifyChange();
  }

  focusSelection() {
    if (!this.selectedID) return;

    const layer = this.itownsView.getLayerById(this.selectedID.layerID);

    const mesh = findMeshFromTileID(layer, this.selectedID.tileID);
    const infoBatchID = itowns.computeInfoFromAttributes(
      mesh,
      '_BATCHID',
      this.selectedID.batchID
    );

    /** @type {THREE.Box3} */
    const box3 = infoBatchID.box3; // in local referential
    const target = box3
      .applyMatrix4(mesh.matrixWorld)
      .getCenter(new THREE.Vector3());

    focusCameraOn(this.itownsView, this.itownsView.controls, target, {
      verticalDistance: 200,
      horizontalDistance: 200,
    });
  }

  // // ///////////
  // // /// FILTERS

  /**
   * Adds a filter to the dictionnary of available filters. The key shall be
   * the `label` attribute of the filter. After that, the
   * `EVENT_FILTERS_UPDATED` event is sent.
   *
   * @param {CityObjectFilter} cityObjectFilter The filter to add.
   */
  addFilter(cityObjectFilter) {
    const label = cityObjectFilter.label;

    if (this.filters[label] !== undefined) {
      throw 'A filter with this label already exists : ' + label;
    }

    this.filters[label] = cityObjectFilter;

    this.sendEvent(CityObjectProvider.EVENT_FILTERS_UPDATED, this.filters);
  }

  // //////////
  // /// EVENTS

  static get EVENT_FILTERS_UPDATED() {
    return 'EVENT_FILTERS_UPDATED';
  }

  static get EVENT_LAYER_CHANGED() {
    return 'EVENT_LAYER_CHANGED';
  }

  static get EVENT_CITY_OBJECT_SELECTED() {
    return 'EVENT_CITY_OBJECT_SELECTED';
  }

  static get EVENT_CITY_OBJECT_UNSELECTED() {
    return 'EVENT_CITY_OBJECT_UNSELECTED';
  }

  static get EVENT_CITY_OBJECT_CHANGED() {
    return 'EVENT_CITY_OBJECT_CHANGED';
  }
}

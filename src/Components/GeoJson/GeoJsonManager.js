export class GeoJsonManager {
  /**
   * Creates a new GeoJsonManager from an iTowns view and the GeoJson layer.
   *
   * @param {*} view The iTowns view.
   * @param {*} layer The GeoJson layer.
   */
  constructor(view, layer) {
    super();
    /**
     * The iTowns view.
     */
    this.view = view;

    /**
     * The GeoJson layer.
     */
    this.layer = layer;
  }
}
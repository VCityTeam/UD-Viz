() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetGeocoding = window.widgetGeocoding;

    const crs = 'EPSG:3857';

    const instance = new widgetGeocoding.GeocodingView(
      new widgetGeocoding.GeocodingService(
        new widgetGeocoding.RequestService(),
        new widgetGeocoding.itowns.Extent(crs, 0, 1, 0, 1),
        { result: {} }
      ),
      new widgetGeocoding.itowns.View(crs, document.createElement('div'))
    );

    console.log(instance);

    resolve();
  });
};

() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../../../bin/indexExamples") }
     */
    const udviz = window.udviz;

    const crs = 'EPSG:3857';

    const instance = new udviz.widgetGeocoding.GeocodingView(
      new udviz.widgetGeocoding.GeocodingService(
        new udviz.RequestService(),
        new udviz.itowns.Extent(crs, 0, 1, 0, 1),
        { result: {} }
      ),
      new udviz.itowns.View(crs, document.createElement('div')),
      crs
    );

    console.log(instance);

    resolve();
  });
};

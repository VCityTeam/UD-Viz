() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetExtensionsC3dTilesTemporal =
      window.widgetExtensionsC3dTilesTemporal;

    const crs = 'EPSG:3857';

    const instance = new widgetExtensionsC3dTilesTemporal.DateSelector(
      new widgetExtensionsC3dTilesTemporal.itowns.View(
        crs,
        document.createElement('div')
      )
    );

    console.log(instance);

    resolve();
  });
};

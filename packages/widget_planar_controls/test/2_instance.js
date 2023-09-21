() => {
  return new Promise((resolve) => {
    /**
     * @type {typeof import("../src/indexBundle") }
     */
    const widgetPlanarControls = window.widgetPlanarControls;

    const crs = 'EPSG:3857';

    // TODO renommer les noms des class dans les widget par exemple widgetPlanarControls.Template1()
    const instance = new widgetPlanarControls.PlanarControls(
      new widgetPlanarControls.itowns.PlanarView(
        document.createElement('div'),
        new widgetPlanarControls.itowns.Extent(crs, 0, 1, 0, 1)
      )
    );

    console.log(instance);

    resolve();
  });
};
